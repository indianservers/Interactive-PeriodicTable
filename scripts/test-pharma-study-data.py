"""Verify reproducibility and source boundaries of the study preset registry."""
import importlib.util, json, unittest, hashlib
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('study',BASE/'scripts/extract-pharma-study-presets.py')
study=importlib.util.module_from_spec(spec); spec.loader.exec_module(study)

class StudyData(unittest.TestCase):
    def test_reproducible_primary_transcription(self):
        actual=json.loads((study.DATA/'studyModelPresets.json').read_text(encoding='utf8'))
        self.assertEqual(study.extract(),actual)
        self.assertEqual(sum(map(len,actual.values())),21)

    def test_release_archive_hash_and_full_measurement_count(self):
        data=study.extract()
        digest=hashlib.sha256((study.ARCHIVE/'PMC8076289.xml').read_bytes()).hexdigest()
        for p in data['dissolution']+data['dosage']:
            self.assertEqual(p['sources'][0]['sourceSha256'],digest)
            self.assertEqual([v['x'] for v in p['observations']],[2,5,10,20,30])
            self.assertTrue(all(v['sd'] is not None for v in p['observations']))

    def test_manual_source_provenance_is_explicit(self):
        manual=study.read(study.ARCHIVE/'study-preset-transcriptions.json')
        self.assertIn('not a raw publisher archive',manual['transcriptionMethod'])
        self.assertEqual(manual['qc']['rows'][2],[1000,'1004.93 ± 1.59919'])
        for lab in ['adme','qc','hplc']:
            self.assertTrue(manual[lab]['sources'][0]['sourceUrl'].startswith('https://'))

if __name__=='__main__': unittest.main()
