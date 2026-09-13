export const C={R:8.314462618,kB:1.380649e-23,h:6.62607015e-34,NA:6.02214076e23};
export const MOLECULES={
  N2:{name:"Nitrogen",formula:"N₂",mass:28.0134,bond:1.098,thetaRot:2.88,thetaVib:3390,sigma:2},
  H2:{name:"Hydrogen",formula:"H₂",mass:2.01588,bond:.7414,thetaRot:85.4,thetaVib:6338,sigma:2},
  CO:{name:"Carbon monoxide",formula:"CO",mass:28.0101,bond:1.128,thetaRot:2.77,thetaVib:3122,sigma:1},
  NO:{name:"Nitric oxide",formula:"NO",mass:30.0061,bond:1.151,thetaRot:2.45,thetaVib:2740,sigma:1},
};
export function factorial(n){let v=1;for(let i=2;i<=n;i++)v*=i;return v}
export function combination(n,r){if(r<0||r>n)return 0;r=Math.min(r,n-r);let v=1;for(let i=1;i<=r;i++)v=v*(n-r+i)/i;return Math.round(v)}
export function multiplicities(n){return Array.from({length:n+1},(_,q)=>({q,omega:combination(n,q),probability:combination(n,q)/2**n}))}
export function twoLevel(delta=5,T=300,N=1000){const x=delta*1000/(C.R*T),w=Math.exp(-x),q=1+w,p1=w/q,p0=1/q;return{x,w,q,p0,p1,n0:Math.round(N*p0),n1:Math.round(N*p1),U:delta*p1,Cv:C.R*x*x*w/(1+w)**2}}
export function molecularPartition(id="N2",T=300,V=1,zeroPoint=true){const m=MOLECULES[id],kg=m.mass/1000/C.NA,qTrans=(2*Math.PI*kg*C.kB*T/(C.h*C.h))**1.5*V,qRot=T/(m.sigma*m.thetaRot),den=1-Math.exp(-m.thetaVib/T),qVib=1/den,qElec=1,zeroPointFactor=zeroPoint?Math.exp(-m.thetaVib/(2*T)):1;return{qTrans,qRot,qVib,qElec,zeroPointFactor,total:qTrans*qRot*qVib*qElec}}
export function thermoProperties(id="N2",T=300,pressureBar=1,zeroPoint=false){const m=MOLECULES[id],x=m.thetaVib/T,ex=Math.exp(x),Utrans=1.5*C.R*T,Urot=C.R*T,Uvib=C.R*m.thetaVib/(ex-1)+(zeroPoint?.5*C.R*m.thetaVib:0),CvTrans=1.5*C.R,CvRot=C.R,CvVib=C.R*x*x*ex/(ex-1)**2,kg=m.mass/1000/C.NA,P=pressureBar*1e5,qt=(2*Math.PI*kg*C.kB*T/C.h**2)**1.5*(C.kB*T/P),Strans=C.R*(Math.log(qt)+2.5),Srot=C.R*(Math.log(T/(m.sigma*m.thetaRot))+1),Svib=C.R*(x/(ex-1)-Math.log(1-Math.exp(-x))),U=(Utrans+Urot+Uvib)/1000,Cv=CvTrans+CvRot+CvVib,S=Strans+Srot+Svib,H=U+C.R*T/1000,A=U-T*S/1000;return{U,Cv,S,H,A,parts:{translation:Utrans/1000,rotation:Urot/1000,vibration:Uvib/1000,electronic:0},cvParts:{translation:CvTrans/C.R,rotation:CvRot/C.R,vibration:CvVib/C.R,electronic:0}}}
