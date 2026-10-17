// OpenStax Organic Chemistry §§25.5, 25.8: D-series Haworth conventions.
export const GLYCOSIDES = {
 Sucrose: {donor:'D-Glucose',acceptor:'D-Fructose',donorAnomer:'α',acceptorAnomer:'β',from:1,to:2},
 Lactose: {donor:'D-Galactose',acceptor:'D-Glucose',donorAnomer:'β',from:1,to:4},
 Maltose: {donor:'D-Glucose',acceptor:'D-Glucose',donorAnomer:'α',from:1,to:4},
 Cellobiose: {donor:'D-Glucose',acceptor:'D-Glucose',donorAnomer:'β',from:1,to:4},
 Trehalose: {donor:'D-Glucose',acceptor:'D-Glucose',donorAnomer:'α',acceptorAnomer:'α',from:1,to:1},
};
export function haworthModel(compound,anomer='α',linkedCarbon){
 const ketose=compound.name==='D-Fructose',five=compound.ringSize===5;
 const vertices=five?[[206,132],[170,202],[82,202],[46,132],[126,72]]:[[216,142],[172,208],[86,208],[42,142],[86,76],[172,76]];
 const oxygen=vertices.length-1,first=ketose?2:1,last=first+oxygen-1;
 const carbons=vertices.slice(0,oxygen).map(([x,y],index)=>{
  const carbon=first+index;let up,label='OH';
  if(carbon===first){up=anomer==='β';if(linkedCarbon===carbon)label='O–link';}
  else if(carbon===last){up=true;label=compound.name==='D-Xylose'?'H':`CH₂OH (C${carbon+1})`;}
  else{up=compound.fischer?.[carbon-2]==='left';if(linkedCarbon===carbon)label='O–link';}
  return {carbon,x,y,up,label};
 });
 return {vertices,oxygen,carbons,ketose,anomer};
}
