export const FE_PROFILE=[[0,.12],[.4,.12],[1.3,.8],[3.1,.8],[3.5,.45]];
export function feProfileIntegral(y){let a=0;for(let i=1;i<FE_PROFILE.length;i++){const [lo,r]=FE_PROFILE[i-1],[hi,rh]=FE_PROFILE[i],d=Math.max(0,Math.min(y,hi)-lo),k=(rh-r)/(hi-lo);a+=r*r*d+r*k*d*d+k*k*d*d*d/3;}return a;}
export function feFillHeight(ml){const target=feProfileIntegral(3.5)*Math.max(0,Math.min(100,ml))/100;let lo=0,hi=3.5;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(feProfileIntegral(m)<target)lo=m;else hi=m;}return (lo+hi)/2;}

export const feReceiverCapacity=(values,index)=>index===0?50:values.organic/values.stages<=15?15:values.organic/values.stages<=30?30:50;
