import hashlib
import importlib.util
import json
from pathlib import Path
import unittest

BASE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('extractor', BASE / 'scripts/extract-pharma-remaining-data.py')
extractor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extractor)

def normalized(value):
    return ' '.join(value.split())

class RemainingEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((BASE / 'src/modules/pharma-lab/data/remainingPublishedExperiments.json').read_text(encoding='utf-8'))

    def test_all_nine_remaining_labs_have_primary_evidence(self):
        self.assertEqual(set(self.data), {'adme','dosage','tablet-formulation','preformulation','qc','buffers','toxicology','api-synthesis','medicinal-chemistry'})
        self.assertEqual(self.data, extractor.extract())

    def test_source_hashes_dimensions_and_provenance(self):
        for lab, dataset in self.data.items():
            filename = dataset['pmcid'] + '.xml' if dataset.get('pmcid') else 'statin-assay-transcription.json'
            raw = (extractor.helper.ARCHIVE / filename).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(), dataset['sourceSha256'])
            for key in ['doi','authors','conditions','limitations','sourceUrl','license','tableId','transcriptionMethod']:
                self.assertTrue(dataset[key], (lab,key))
            for group in dataset['groups']:
                self.assertTrue(group['rows'])
                self.assertTrue(all(len(row) == len(group['headers']) for row in group['rows']), lab)

    def test_human_pk_has_six_summary_rows_and_discloses_source_discrepancy(self):
        rows = self.data['adme']['groups'][0]['rows']
        self.assertEqual(len(rows), 6)
        self.assertEqual(rows[1][:3], ['AUC(µg.h/ml)','Reference','12'])
        self.assertEqual(normalized(rows[1][3]), '27.29 ± 2.64')
        self.assertEqual(normalized(rows[-1][3]), '0.83 ± 0.25')
        self.assertIn('0.93', self.data['adme']['limitations'])

    def test_compression_rowspans_and_friable_results_are_preserved(self):
        rows = self.data['tablet-formulation']['groups'][0]['rows']
        self.assertEqual(len(rows), 8)
        self.assertEqual([row[0] for row in rows], ['20','20','30','30','40','40','50','50'])
        self.assertEqual(rows[-1][5], 'Friable')

    def test_measured_flow_buffer_and_qc_records(self):
        self.assertEqual(len(self.data['preformulation']['groups'][0]['rows']), 12)
        self.assertEqual(self.data['buffers']['groups'][0]['rows'][0], ['1','PBS s.f.','7.12'])
        self.assertIn('Luria–Bertani', self.data['buffers']['conditions'])
        self.assertIn('not measurements of the acetate calculator', self.data['buffers']['limitations'])
        self.assertEqual(len(self.data['qc']['groups'][0]['rows']), 15)

    def test_synthesis_and_enzyme_data_are_reported_not_model_predictions(self):
        self.assertEqual(self.data['api-synthesis']['groups'][0]['rows'][-1], ['Paracetamol (6)','6.6','0.99','99'])
        self.assertEqual(self.data['medicinal-chemistry']['groups'][0]['rows'][-1], ['Simvastatin acid','19.7 ± 2.0'])
        self.assertIn('manually transcribed', self.data['medicinal-chemistry']['transcriptionMethod'])

    def test_animal_data_has_true_license_units_and_no_human_extrapolation(self):
        data = self.data['toxicology']
        self.assertEqual(data['license'], 'CC BY-NC 4.0')
        self.assertEqual(len(data['groups'][0]['rows']), 6)
        self.assertEqual(data['groups'][0]['rows'][-1][1], '55.67 ± 7.2b')
        self.assertIn('Animal research only', data['limitations'])
        self.assertIn('single published control row', data['limitations'])

    def test_mode_switch_suspends_each_animated_workspace(self):
        for file in ['MedicinalChemistryPage.jsx','ApiSynthesisPage.jsx','PreformulationPage.jsx','TabletFormulationPage.jsx']:
            self.assertIn('onSuspend={() => setRunning(false)}', (BASE / 'src/modules/pharma-lab' / file).read_text(encoding='utf-8'))
        shell = (BASE / 'src/modules/pharma-lab/components/PharmaLabShell.jsx').read_text(encoding='utf-8')
        self.assertIn('onSuspend?.(); setEvidenceMode(value);', shell)

if __name__ == '__main__':
    unittest.main()
