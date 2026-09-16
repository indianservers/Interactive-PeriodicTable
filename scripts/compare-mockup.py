import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageChops

reference_path, actual_path, output_base = map(Path, sys.argv[1:4])
reference = Image.open(reference_path).convert('RGB')
actual = Image.open(actual_path).convert('RGB')
if reference.size != actual.size:
    raise SystemExit(f'Image dimensions differ: {reference.size} != {actual.size}')
a = np.asarray(reference, dtype=np.float32)
b = np.asarray(actual, dtype=np.float32)
mae = float(np.abs(a - b).mean())
rmse = float(np.sqrt(np.square(a - b).mean()))
gray_a = np.asarray(reference.convert('L'), dtype=np.float32)
gray_b = np.asarray(actual.convert('L'), dtype=np.float32)
correlation = float(np.corrcoef(gray_a.ravel(), gray_b.ravel())[0, 1])
Image.blend(reference, actual, .5).save(f'{output_base}-overlay.png')
ImageChops.difference(reference, actual).point(lambda x: min(255, x * 3)).save(f'{output_base}-difference.png')
metrics = {'width': reference.width, 'height': reference.height, 'meanAbsoluteChannelError': mae, 'rootMeanSquaredChannelError': rmse, 'luminanceCorrelation': correlation, 'note': 'Diagnostic metrics only; review the generated overlay and amplified difference image.'}
Path(f'{output_base}-metrics.json').write_text(json.dumps(metrics, indent=2), encoding='utf-8')
print(json.dumps(metrics))
