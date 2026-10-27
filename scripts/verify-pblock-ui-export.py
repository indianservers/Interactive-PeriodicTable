"""Check actual browser downloads, independently of the simulation implementation."""
import csv
import json
import math
from pathlib import Path

root = Path('docs/chemistry-91-audit')
book = json.loads((root / 'pblock-ui-notebook-final.json').read_text(encoding='utf8'))
with (root / 'pblock-ui-observations-final.csv').open(encoding='utf-8-sig', newline='') as f:
    rows = list(csv.DictReader(f))
assert len(rows) == len(book['records']) == 24
assert len({r['compound'] for r in rows}) == 10
assert book['notes'].startswith('UI audit:')
keys = {'AB_Angstrom': 'AB', 'BC_Angstrom': 'BC', 'AC_Angstrom': 'AC',
        'angle_deg': 'angle', 'valence_e': 'valence', 'MW_g_mol': 'MW', 'azimuth_deg': 'azimuth'}
valence = {'diborane': 12, 'borazine': 30, 'clf3': 28, 'brf5': 42, 'if7': 56,
           'xef2': 22, 'xef4': 36, 'xeo3': 26, 'sicl4': 32, 'siloxane': 56}
checks = 0
for row, record in zip(rows, book['records']):
    assert int(row['id']) == record['id']
    assert row['compound'] == record['values']['compound']
    assert float(row['valence_e']) == valence[row['compound']]
    assert (row['included'] == 'true') == record['included']
    a, b, c = (float(row[k]) for k in ('AB_Angstrom', 'BC_Angstrom', 'AC_Angstrom'))
    assert a > 0 and b > 0 and c > 0
    angle = math.degrees(math.acos(max(-1, min(1, (a*a+b*b-c*c)/(2*a*b)))))
    assert abs(angle - float(row['angle_deg'])) < 1e-5
    checks += 1
    for key, field in keys.items():
        assert abs(float(row[key]) - record['reading'][field]) < 1e-9
        checks += 1
    assert float(row['time_s']) == record['state']['time']
    checks += 1
assert rows[0]['included'] == 'false'
assert rows[-1]['id'] == '24'
assert abs(float(rows[-1]['angle_deg']) - math.degrees(2*math.asin(1.763/(2*1.32)))) < 1e-10
assert float(rows[-1]['AB_Angstrom']) == float(rows[-1]['BC_Angstrom']) == 1.32
result = f'PASS:24 actual UI records,10 compounds,{checks} numeric CSV/notebook and independent cosine-law checks; electron budgets, bridge reference, notes, inclusion and new-ID replay verified. Not experimental validation.'
(root / 'pblock-export-validation-final.txt').write_text(result+'\n', encoding='utf8')
print(result)
