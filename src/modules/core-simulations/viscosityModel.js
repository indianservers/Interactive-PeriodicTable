export const R = 8.314462618;
export const OSTWALD_K = 0.08325; // mm² s⁻²; η[mPa·s] = K ρ[g mL⁻¹] t[s]
export const TEMPERATURES = [20, 25, 30, 35, 40, 45];

export function glycerolDensity(tempC) {
  return 1.156 - 0.00118 * (tempC - 25);
}

export function arrheniusViscosity(tempC, eta25 = 8.15, activationKJ = 23.4) {
  const t = tempC + 273.15;
  return eta25 * Math.exp((activationKJ * 1000 / R) * (1 / t - 1 / 298.15));
}

export function ostwaldTime(eta, density, k = OSTWALD_K) {
  return eta / (k * density);
}

export function temperatureStudy() {
  return TEMPERATURES.map((temp, row) => {
    const density = glycerolDensity(temp);
    const eta = arrheniusViscosity(temp);
    const mean = ostwaldTime(eta, density);
    const offsets = [-0.0035, 0.0012, 0.0023];
    const runs = offsets.map((x, i) => mean * (1 + x + (row % 2 ? (i - 1) * 0.0004 : 0)));
    const avg = runs.reduce((a, b) => a + b, 0) / runs.length;
    const sd = Math.sqrt(runs.reduce((s, x) => s + (x - avg) ** 2, 0) / (runs.length - 1));
    return { temp, density, eta, runs, mean: avg, rsd: 100 * sd / avg };
  });
}

export function linearRegression(xs, ys) {
  const n = xs.length, sx = xs.reduce((a,b)=>a+b,0), sy = ys.reduce((a,b)=>a+b,0);
  const sxx = xs.reduce((a,x)=>a+x*x,0), sxy = xs.reduce((a,x,i)=>a+x*ys[i],0);
  const slope = (n*sxy-sx*sy)/(n*sxx-sx*sx), intercept=(sy-slope*sx)/n;
  const mean=sy/n, ssTot=ys.reduce((a,y)=>a+(y-mean)**2,0), ssRes=ys.reduce((a,y,i)=>a+(y-(intercept+slope*xs[i]))**2,0);
  return {slope,intercept,r2:1-ssRes/ssTot};
}

export function fitArrhenius(rows = temperatureStudy()) {
  const fit = linearRegression(rows.map(d=>1/(d.temp+273.15)), rows.map(d=>Math.log(d.eta)));
  return {...fit, activationKJ: fit.slope * R / 1000};
}

export function poiseuille({deltaP=1250,radiusMm=.5,lengthMm=100,etaMPas=8.15,density=1156}={}) {
  const r=radiusMm/1000,L=lengthMm/1000,eta=etaMPas/1000;
  const q=Math.PI*deltaP*r**4/(8*eta*L), area=Math.PI*r*r, velocity=q/area;
  return {q,velocity,reynolds:density*velocity*(2*r)/eta, profile:"parabolic"};
}

export const POLYMER = {t0:52.31,K:6.31e-4,a:.80,intrinsic:.82,huggins:.72};
export function polymerStudy() {
  return [0,.1,.2,.3,.4,.5].map((c,i)=>{
    const reduced=c===0?POLYMER.intrinsic:POLYMER.intrinsic+POLYMER.huggins*c;
    const relative=c===0?1:1+c*reduced;
    const mean=POLYMER.t0*relative;
    const runs=[mean*.997,mean*1.001,mean*1.002];
    return {c,mean,runs,relative,specific:relative-1,reduced};
  });
}
export function polymerAnalysis(rows=polymerStudy()) {
  const points=rows.filter(d=>d.c>0),fit=linearRegression(points.map(d=>d.c),points.map(d=>d.reduced));
  const molecularWeight=(fit.intercept/POLYMER.K)**(1/POLYMER.a);
  return {...fit,intrinsic:fit.intercept,molecularWeight};
}
