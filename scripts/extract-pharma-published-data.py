"""Extract reported summaries from archived Europe PMC JATS, without fitting or filling values."""
from pathlib import Path
import xml.etree.ElementTree as E
import hashlib, json

BASE = Path(__file__).resolve().parents[1]
ARCHIVE = BASE / 'scripts/fixtures/pharma-published-sources'

def text(el):
    return ''.join(el.itertext()).strip()

def source(pmcid, table_id):
    raw = (ARCHIVE / (pmcid + '.xml')).read_bytes()
    root = E.fromstring(raw)
    table = root.find(".//table-wrap[@id='" + table_id + "']")
    meta = dict(pmcid=pmcid, title=text(root.find('.//article-title')),
        doi=next(text(x) for x in root.findall('.//article-id') if x.get('pub-id-type') == 'doi'),
        sourceUrl=f'https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/#{table_id}',
        xmlUrl=f'https://www.ebi.ac.uk/europepmc/webservices/rest/{pmcid}/fullTextXML',
        tableId=table_id, license='CC BY 4.0', licenseUrl='https://creativecommons.org/licenses/by/4.0/',
        retrievedOn='2026-10-17', sourceSha256=hashlib.sha256(raw).hexdigest(),
        authors=[text(a.find('.//surname')) + ' ' + text(a.find('.//given-names')) for a in root.findall('.//article-meta/contrib-group/contrib') if a.find('.//surname') is not None],
        year=text(root.find('.//article-meta/pub-date/year')), kind='Published experimental summaries')
    return meta, table

def rows(table):
    return [[text(c) for c in tr] for tr in table.findall('.//tbody/tr')]

def group(title, headers, values):
    return dict(title=title, headers=headers, rows=values)

def extract():
    meta, table = source('PMC9230883', 'pharmaceuticals-15-00755-t002')
    values = rows(table)
    hplc = dict(**meta, formulation='Paracetamol in milk-containing biorelevant dissolution samples',
        conditions='BDS Hypersil C18, 250 × 4.6 mm, 5 µm; 25 mM phosphate buffer pH 3:methanol 80:20; 1 mL/min; 30 °C; 10 µL injection; 243 nm; 12 min run. Three experiment series, five levels and three replicates per series.',
        limitations='Regression and validation summaries, not individual injections. Raw chromatographic signals are not included; no trace or calibration observations are reconstructed.',
        groups=[group('Daily calibration regressions', ['Day', 'Slope (×10³)', 'Intercept (×10³)', 'R²'], values[2:5]),
            group('Precision', ['Concentration (µg/mL)', 'Repeatability RSD (%)', 'Intermediate precision RSD (%)'], [r[:3] for r in values[7:12]]),
            group('Trueness', ['Concentration (µg/mL)', 'Relative bias (%)'], [r[:2] for r in values[14:19]])])
    meta, table = source('PMC10865243', 'tbl3')
    dissolution = dict(**meta, formulation='15 coded paracetamol tablet samples from Freetown; original study identifiers retained',
        conditions='Paddle apparatus; 900 mL phosphate buffer pH 5.8; 50 rpm; 37 ± 1 °C; 45-minute endpoint; UV analysis. S1: 6 tablets. S2: combined 12 tablets where reported.',
        limitations='One endpoint per sample, not a time course. Values above 100% are retained. Missing S2 results are not filled. Individual-vessel acceptance cannot be inferred from means. P012: the narrative quotes the S2 value; the S1 value here follows Table 3.',
        groups=[group('45-minute dissolution endpoints', ['Study sample', 'S1 release (%), mean ± SD', 'S2 release (%), mean ± SD'], [[r[0], r[1], r[3] or 'Not reported'] for r in rows(table)])])
    meta, table = source('PMC8950020', 'gels-08-00144-t004')
    grid, spans = [], {}
    for tr in table.findall('.//tbody/tr'):
        row = {j: v[0] for j, v in spans.items()}
        spans = {j: (v[0], v[1]-1) for j, v in spans.items() if v[1] > 1}
        j = 0
        for td in tr:
            while j in row:
                j += 1
            row[j] = text(td)
            if int(td.get('rowspan', '1')) > 1:
                spans[j] = (text(td), int(td.get('rowspan'))-1)
            j += 1
        grid.append([row[j] for j in range(7)])
    stability = dict(**meta, formulation='Paracetamol instant jelly for reconstitution; a different dosage form from the simulated tablet',
        conditions='Packaging 1: sealed plastic sachets. Packaging 2: sealed aluminium bags inside screw-capped amber glass bottles. Real-time: 30 °C/75% RH. Accelerated: 40 °C/75% RH. HPLC content determination; n = 3; mean ± SD.',
        limitations='The source has one shared baseline spanning all four groups, shown here as a shared reference, not four independent measurements. Percentages follow the paper’s reported content scale (section 2.6 describes % w/v); no unit reinterpretation, normalization or shelf-life extrapolation is applied.',
        groups=[group('Content during storage (reported %), mean ± SD', ['Packaging', 'Storage condition', 'Shared baseline', '2 weeks', '1 month', '2 months', '3 months'], grid)])
    return dict(hplc=hplc, dissolution=dissolution, stability=stability)

if __name__ == '__main__':
    (BASE / 'src/modules/pharma-lab/data/publishedExperiments.json').write_text(json.dumps(extract(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
