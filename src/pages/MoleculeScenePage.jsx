import { MoleculeScene } from '../components/visualizers/MoleculeScene.jsx';

export const MoleculeScenePage = () => (
  <div className="p-4 md:p-6 max-w-7xl mx-auto">
    <MoleculeScene autoRotate={true} height={560} />
  </div>
);

export default MoleculeScenePage;
