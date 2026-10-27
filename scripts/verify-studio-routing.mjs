import assert from 'node:assert/strict';
import {resolveAppRoute,studioSection,appRouteUrl} from '../src/utils/studioRouting.js';
const aliases={'visuals/bio/nucleic-acids':'bio-nucleic-acids','visuals/bio/carbohydrates':'bio-carbohydrates','modules/physical':'physical-simulators','molecular-symmetry/operations':'symmetry-operations'};
aliases['visuals/pharma/lab']='pharma-studio';
aliases['lab/titration']='titration-lab';
let checks=0;
const check=(actual,expected)=>{assert.equal(actual,expected);checks++};
for(const [base,id,sections] of [
 ['visuals/bio/nucleic-acids','bio-nucleic-acids',['','molecules','nucleotide-builder','sequences','replication','transcription','comparative','gallery','learn','quizzes']],
 ['visuals/bio/carbohydrates','bio-carbohydrates',['','reactions','properties','biology','quizzes']],
 ['drug-discovery','drug-discovery',['home','workspace','targets','screening','design','adme','safety','analytics','notebooks','team']],
 ['modules/physical','physical-simulators',['molecular-dynamics','real-gas-laws','thermodynamics','statistical-thermodynamics','chemical-kinetics','chemical-equilibrium','phase-equilibrium','solutions-colligative-properties','electrochemistry','quantum-chemistry','molecular-spectroscopy','surface-chemistry','photochemistry','transport-phenomena']]
]) for(const section of sections) for(const prefix of ['#','#/']) {
 const url=new URL(`http://localhost/${prefix}${base}${section?'/'+section:''}?view=1`);
 check(resolveAppRoute(url,aliases),id);check(studioSection(url,id),section);
}
for(const [path,id,base] of [['nucleic-acid-explorer','bio-nucleic-acids','visuals/bio/nucleic-acids'],['carbohydrate-structure-studio','bio-carbohydrates','visuals/bio/carbohydrates'],['drug-discovery','drug-discovery','drug-discovery']]) {
 const old=new URL(`http://localhost/${path}/quizzes?screen=old&pdb=1BNA&q=dna`);
 check(resolveAppRoute(old,aliases),id);
 old.hash='/dashboard';check(resolveAppRoute(old,aliases),'dashboard');
 check(studioSection(old,id),'');
 old.hash='/';check(resolveAppRoute(old,aliases),'dashboard');check(studioSection(old,id),'');
 const next=appRouteUrl(old,'molecule');check(next.pathname,'/');check(next.hash,'#/molecule');check(next.search,'');
 const nested=appRouteUrl(old,`${base}/quizzes`);check(resolveAppRoute(nested,aliases),id);
}
check(resolveAppRoute(new URL('http://localhost/#/molecular-symmetry/operations'),aliases),'symmetry-operations');
check(resolveAppRoute(new URL('http://localhost/#/drug-discovery-impostor'),aliases),'drug-discovery-impostor');
check(resolveAppRoute(new URL('http://localhost/#/visuals/pharma/lab'),aliases),'pharma-studio');
check(resolveAppRoute(new URL('http://localhost/#/lab/titration'),aliases),'titration-lab');
console.log(`PASS: ${checks} studio route checks: 39 sections, legacy paths, query stripping, explicit exits and prefix boundaries.`);
