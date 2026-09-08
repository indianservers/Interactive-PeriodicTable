import * as THREE from 'three';

export function orbitalSurfaceMaterial(color, opacity) {
  const material = new THREE.MeshPhysicalMaterial({
    color, emissive: new THREE.Color(color).multiplyScalar(.12), roughness: .38, metalness: 0, clearcoat: .24,
    transparent: true, opacity, depthWrite: false, side: THREE.FrontSide,
  });
  // An isosurface is a mathematical boundary, not an opaque substance.
  // Emphasize its grazing-angle outline while keeping enclosed atoms visible.
  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
      float facing = abs(dot(normalize(normal), normalize(vViewPosition)));
      diffuseColor.a *= mix(0.55, 1.0, pow(1.0 - facing, 1.4));
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey = () => 'avc-translucent-isosurface-v1';
  return material;
}

export function createOrientationAxes() {
  const scene = new THREE.Scene(), root = new THREE.Group();
  scene.add(root);
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 20);
  for (const [label, direction, color] of [
    ['x', [1, 0, 0], '#ff677e'], ['y', [0, 1, 0], '#4be8b4'], ['z', [0, 0, 1], '#6d88ff'],
  ]) {
    const vector = new THREE.Vector3(...direction);
    root.add(new THREE.ArrowHelper(vector, new THREE.Vector3(), 1, color, .2, .09));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color; ctx.font = 'italic 44px Georgia';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 32, 32);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map, depthTest: false}));
    sprite.position.copy(vector.multiplyScalar(1.22)); sprite.scale.setScalar(.45); root.add(sprite);
  }
  const size = new THREE.Vector2();
  return {
    draw(renderer, viewCamera, controls, moleculeRoot) {
      renderer.getSize(size);
      const extent = Math.min(145, size.x / 3, size.y / 3);
      camera.up.copy(viewCamera.up);
      camera.position.copy(viewCamera.position).sub(controls.target).normalize().multiplyScalar(3.5);
      camera.lookAt(0, 0, 0); root.quaternion.copy(moleculeRoot.quaternion);
      renderer.autoClear = false; renderer.clearDepth();
      renderer.setViewport(10, 0, extent, extent); renderer.render(scene, camera);
      renderer.setViewport(0, 0, size.x, size.y); renderer.autoClear = true;
    },
    dispose() {
      scene.traverse(object => {
        object.geometry?.dispose(); object.material?.map?.dispose(); object.material?.dispose();
      });
    },
  };
}
