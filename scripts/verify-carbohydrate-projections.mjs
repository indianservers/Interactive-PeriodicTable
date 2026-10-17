import assert from 'node:assert/strict';
import {GLYCOSIDES,haworthModel} from '../src/modules/carbohydrate-studio/projectionModels.js';
import {CARBOHYDRATES} from '../src/modules/carbohydrate-studio/carbohydrateData.js';
for(const name of ['D-Glucose','D-Galactose','D-Mannose','D-Fructose','D-Ribose','D-Xylose']){
 const model=haworthModel(CARBOHYDRATES[name]);assert.equal(model.vertices.length,CARBOHYDRATES[name].ringSize);assert.equal(model.carbons.length,model.vertices.length-1);assert.deepEqual(model.carbons.map(c=>c.carbon), name==='D-Fructose'?[2,3,4,5]:name==='D-Ribose'?[1,2,3,4]:[1,2,3,4,5]);
}
const glucose=haworthModel(CARBOHYDRATES['D-Glucose']);assert.equal(glucose.carbons.find(c=>c.carbon===2).up,false);assert.equal(glucose.carbons.find(c=>c.carbon===3).up,true);assert.equal(glucose.carbons.find(c=>c.carbon===4).up,false);
assert.equal(GLYCOSIDES.Lactose.acceptor,'D-Glucose');assert.equal(GLYCOSIDES.Lactose.donor,'D-Galactose');assert.equal(GLYCOSIDES.Sucrose.to,2);assert.equal(GLYCOSIDES.Sucrose.acceptor,'D-Fructose');
const f=haworthModel(CARBOHYDRATES['D-Fructose'],'β',2);assert.equal(f.carbons[0].carbon,2);assert.equal(f.carbons[0].label,'O–link');
console.log('PASS: six Haworth ring topologies, glucose stereochemistry, sucrose and lactose constituents, glycosidic-site labels.');
