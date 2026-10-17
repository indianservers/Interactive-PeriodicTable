// Study-local fits of published observations. No random or synthetic measurements.
const rmse = values => Math.sqrt(values.reduce((s,v)=>s+v*v,0)/values.length);

export function fitStudyModel(kind, points) {
  if (points.length < 3 || points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))) throw new Error('At least three finite observations required.');
  if (kind === 'linear' || kind === 'log-linear') {
    if (kind==='log-linear' && points.some(p=>p.y<=0)) throw new Error('Log fit requires positive measurements.');
    const n=points.length, mx=points.reduce((s,p)=>s+p.x,0)/n;
    const ys=points.map(p=>kind==='log-linear'?Math.log(p.y):p.y), my=ys.reduce((s,y)=>s+y,0)/n;
    const denominator=points.reduce((s,p)=>s+(p.x-mx)**2,0);
    if (!denominator) throw new Error('Distinct inputs required.');
    const slope=points.reduce((s,p,i)=>s+(p.x-mx)*(ys[i]-my),0)/denominator, intercept=my-slope*mx;
    return {parameters:{slope,intercept},predict:x=>kind==='log-linear'?Math.exp(intercept+slope*x):intercept+slope*x,method:kind==='linear'?'Unweighted ordinary least squares, y = intercept + slope × x.':'Unweighted least squares of natural log(IC50); displayed predictions back-transformed without a bias correction.'};
  }
  if (kind==='release') {
    const loss=k=>points.reduce((s,p)=>s+(100*(1-Math.exp(-k*p.x))-p.y)**2,0);
    let lo=0,hi=10;
    for(let i=0;i<100;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(loss(a)<loss(b))hi=b;else lo=a;}
    const k=(lo+hi)/2;
    return {parameters:{kPerMinute:k,plateauPercent:100},predict:x=>100*(1-Math.exp(-k*x)),method:'Unweighted nonlinear least squares; Q = 100(1 − exp(−kt)), 0 ≤ k ≤ 10 min⁻¹. Fixed plateau 100%; no clipping of measured values.'};
  }
  if(kind==='bateman') {
    const evaluate=(a,e)=>{
      const ka=Math.exp(a),ke=Math.exp(e);
      if(ka<=ke)return {loss:Infinity};
      const basis=points.map(p=>Math.exp(-ke*p.x)-Math.exp(-ka*p.x));
      const scale=Math.max(0,points.reduce((s,p,i)=>s+p.y*basis[i],0)/basis.reduce((s,v)=>s+v*v,0));
      return {loss:points.reduce((s,p,i)=>s+(scale*basis[i]-p.y)**2,0),ka,ke,scale,a,e};
    };
    let best={loss:Infinity};
    for(let a=Math.log(.2);a<=Math.log(100);a+=.24)for(let e=Math.log(.005);e<=Math.log(2);e+=.24){const f=evaluate(a,e);if(f.loss<best.loss)best=f;}
    for(let step=.12;step>1e-7;step/=2){let improved=true,iterations=0;while(improved && iterations++<100){improved=false;for(const [da,de] of [[step,0],[-step,0],[0,step],[0,-step]]){const a=best.a+da,e=best.e+de;if(a<Math.log(.2)||a>Math.log(100)||e<Math.log(.005)||e>Math.log(2))continue;const f=evaluate(a,e);if(f.loss<best.loss){best=f;improved=true;}}}}
    return {parameters:{kaPerHour:best.ka,kePerHour:best.ke,scaleNgMl:best.scale},predict:x=>best.scale*(Math.exp(-best.ke*x)-Math.exp(-best.ka*x)),method:'Unweighted nonlinear least squares, S(exp(−ke t)−exp(−ka t)); positive fitted S; 0.005 ≤ ke ≤ 2 h⁻¹, 0.2 ≤ ka ≤ 100 h⁻¹ and ka > ke. Log-grid search followed by coordinate refinement; S solved analytically at each step.'};
  }
  throw new Error('Unsupported study model.');
}

export function compareStudyPreset(preset) {
  const points=preset.observations;
  const fit=fitStudyModel(preset.model,points);
  const results=points.map((p,i)=>{
    const training=points.filter((_,j)=>j!==i), held=fitStudyModel(preset.model,training);
    const calculated=fit.predict(p.x), heldOut=held.predict(p.x);
    return {...p,calculated,difference:calculated-p.y,heldOut,heldOutDifference:heldOut-p.y,foldExtrapolation:p.x<Math.min(...training.map(v=>v.x))||p.x>Math.max(...training.map(v=>v.x))};
  }).sort((a,b)=>a.x-b.x);
  return {kind:'study-specific-fit',presetId:preset.id,independentValidation:false,n:points.length,parameters:fit.parameters,method:fit.method,trainingRmse:rmse(results.map(p=>p.difference)),leaveOneOutRmse:rmse(results.map(p=>p.heldOutDifference)),domain:[Math.min(...points.map(p=>p.x)),Math.max(...points.map(p=>p.x))],results};
}

export function predictWithinStudy(preset,x) {
  const xs=preset.observations.map(p=>p.x);
  if(!Number.isFinite(x)||x<Math.min(...xs)||x>Math.max(...xs)) throw new Error('Outside the published study input range.');
  return fitStudyModel(preset.model,preset.observations).predict(x);
}
