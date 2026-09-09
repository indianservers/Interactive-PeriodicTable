export default function AdvancedNmrTree({levels,px}) {
  const y=level=>32+level*23;
  return <g className="avc-nmr-tree" aria-label="Successive equivalent-spin splitting">
    <text x="70" y="15">Splitting tree · schematic spacing · node numbers count spin configurations</text>
    {levels.map(({level,nodes,edges})=><g key={level} data-tree-level={level}>
      <text x="70" y={y(level)+4}>{level===0?'Unsplit':`${level} neighbour${level===1?'':'s'}`}</text>
      {edges.map(({parent,child},i)=><path key={i}
        d={`M${px(levels[level-1].nodes[parent].ppm)} ${y(level-1)+6}L${px(nodes[child].ppm)} ${y(level)-7}`}
        fill="none" stroke="#748eb5" strokeWidth="1.5"/>
      )}
      {nodes.map((node,i)=><g key={i} data-tree-node={i}>
        <circle cx={px(node.ppm)} cy={y(level)} r="8" fill="#123d54" stroke="#5fdcff"/>
        <text x={px(node.ppm)} y={y(level)+3.5} textAnchor="middle" style={{fontSize:10}}>{node.intensity}</text>
      </g>)}
    </g>)}
  </g>;
}
