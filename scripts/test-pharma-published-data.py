import hashlib
import importlib.util
import json
from pathlib import Path
import unittest

BASE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('published', BASE / 'scripts/extract-pharma-published-data.py')
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)

class PublishedDataTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((BASE / 'src/modules/pharma-lab/data/publishedExperiments.json').read_text(encoding='utf-8'))

    def test_records_exactly_reproduce_archived_primary_source_tables(self):
        self.assertEqual(self.data, extractor.extract())

    def test_provenance_and_dimensions(self):
        for dataset in self.data.values():
            raw = (extractor.ARCHIVE / (dataset['pmcid'] + '.xml')).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(), dataset['sourceSha256'])
            self.assertIn(dataset['tableId'], dataset['sourceUrl'])
            self.assertTrue(dataset['doi'].startswith('10.'))
            self.assertTrue(dataset['authors'])
            for group in dataset['groups']:
                self.assertTrue(all(len(row) == len(group['headers']) for row in group['rows']))

    def test_hplc_regression_scale_and_precision(self):
        groups = self.data['hplc']['groups']
        self.assertEqual([len(g['rows']) for g in groups], [3, 5, 5])
        self.assertEqual(groups[0]['rows'][0], ['Day 1', '21.07', '−2.483', '0.9997'])
        self.assertEqual(groups[1]['rows'][-1], ['600', '1.4', '2.5'])

    def test_dissolution_retains_above_100_and_missing_s2_and_p012_stage_difference(self):
        rows = [[cell.replace('\u00a0', ' ') for cell in row] for row in self.data['dissolution']['groups'][0]['rows']]
        self.assertEqual(len(rows), 15)
        self.assertEqual(rows[3][1], '102.34 ± 1.63')
        self.assertEqual(rows[0][2], 'Not reported')
        self.assertEqual(rows[11][1:], ['19.22 ± 0.85', '21.22 ± 5.76'])

    def test_stability_preserves_shared_baseline_and_real_storage_groups(self):
        rows = self.data['stability']['groups'][0]['rows']
        self.assertEqual(len(rows), 4)
        self.assertEqual({r[2] for r in rows}, {'103.27 ± 0.08'})
        self.assertEqual(rows[1][-1], '89.44 ± 2.22')
        self.assertEqual(rows[3][-1], '102.08 ± 0.09')

    def test_simulations_are_separate_and_paused_on_mode_change(self):
        for file, lab in [('HplcPage.jsx','hplc'), ('DissolutionPage.jsx','dissolution'), ('StabilityPage.jsx','stability')]:
            source = (BASE / 'src/modules/pharma-lab' / file).read_text(encoding='utf-8')
            self.assertRegex(source, r'\[dataView, setDataView\] = useState\("(?:published|simulation)"\)')
            self.assertIn('setRunning(false); setDataView(value);', source)
            self.assertIn(f'dataView === "published" ? <PublishedExperiment key={{evidenceKey}} lab="{lab}"/>', source)

if __name__ == '__main__':
    unittest.main()
