import React from 'react';
import {attentionMotion,type BrainAttention} from './brain-attention';
import {C, Label} from './components';
import {curvePoint, draw, progress} from './motion';

import {BRAIN_REGIONS,BRAIN_PATHWAYS,PATHWAY_TARGETS,STRUCTURE_PATHS,CORTEX_OUTLINE,CORTICAL_SULCI,FINE_SULCI,CEREBELLAR_FOLIA,type BrainRegion,type PathwayId} from './brain-anatomy-geometry';
export {BRAIN_REGIONS,BRAIN_PATHWAYS,PATHWAY_TARGETS,STRUCTURE_PATHS,type BrainRegion,type PathwayId} from './brain-anatomy-geometry';

export const BRAIN_CENTER=[500,330] as const;
export const BRAIN_BOUNDS={left:120,right:880,top:75,bottom:595};
export type BrainCamera={x:number;y:number;scale:number;anteriorRight?:boolean};
export const anatomyToScreen=(point:readonly number[],camera:BrainCamera):[number,number]=>[
  camera.x+((camera.anteriorRight===true?1000-point[0]:point[0])-BRAIN_CENTER[0])*camera.scale,
  camera.y+(point[1]-BRAIN_CENTER[1])*camera.scale,
];
const pathD=(p:number[][])=>`M${p[0].join(' ')}C${p.slice(1).map(v=>v.join(' ')).join(' ')}`;
const Stroke:React.FC<{d:string;amount:number;opacity?:number;width?:number;fill?:string}>=({d,amount,opacity=1,width=2.5,fill='none'})=><path d={d} fill={fill} stroke={C.gray} strokeWidth={width} opacity={opacity} strokeLinecap="round" strokeLinejoin="round" {...draw(amount)}/>;

export const BrainRegionHighlight:React.FC<{region:BrainRegion;amount?:number;activity?:number;opacity?:number;attention?:BrainAttention}>=({region,amount=1,activity=0,opacity=1,attention})=>{
  const color=region==='VTA'?C.yellow:C.blue;
  const focus=attention??{strength:0,age:0},motion=attentionMotion(focus);
  const [cx,cy]=BRAIN_REGIONS[region].center;
  return <g opacity={opacity*amount} data-highlight={region} transform={focus.strength>0?`translate(${cx} ${cy}) scale(${motion.scale}) translate(${-cx} ${-cy})`:undefined}>
    {focus.strength>0&&<g data-region-attention={region} opacity={focus.strength}>
      <path d={STRUCTURE_PATHS[region]} fill={focus.color??color} fillOpacity={.12+.12*motion.pulse} stroke={focus.color??color} strokeWidth={12+4*motion.pulse} strokeOpacity={.055+.055*motion.pulse} strokeLinejoin="round"/>
      <path d={STRUCTURE_PATHS[region]} fill="none" stroke={focus.color??color} strokeWidth={2.8+motion.pulse} strokeOpacity={.55+.4*motion.pulse} strokeLinejoin="round"/>
    </g>}
    <path d={STRUCTURE_PATHS[region]} fill={color} fillOpacity={.09+activity*.17} stroke={color} strokeWidth={region==='PFC'?2:2.3} strokeLinejoin="round" {...draw(amount)}/>
    {region==='VTA'&&<path d={STRUCTURE_PATHS.VTA} fill={C.yellow} opacity={activity*.18} stroke="none"/>}
  </g>;
};

export const DopamineParticle:React.FC<{pathway:PathwayId;phase:number;opacity?:number}>=({pathway,phase,opacity=1})=>{
  const [x,y]=curvePoint(Math.max(0,Math.min(1,phase)),BRAIN_PATHWAYS[pathway]);
  return <g opacity={opacity}><circle cx={x} cy={y} r={7} fill={C.yellow} opacity={.09}/><circle cx={x} cy={y} r={2.8} fill={C.yellow}/></g>;
};
export const DopaminePathway:React.FC<{pathway:PathwayId;amount?:number;opacity?:number;frame?:number;activity?:number;widthScale?:number;attention?:number}>=({pathway,amount=1,opacity=1,frame=0,activity=0,widthScale=1,attention=0})=><g opacity={opacity} data-projection={`VTA-to-${PATHWAY_TARGETS[pathway]}`}>
  <path d={pathD(BRAIN_PATHWAYS[pathway])} fill="none" stroke={C.yellow} strokeWidth={(pathway==='mesolimbic'?2.4:pathway==='mesocortical'?2:1.4)*widthScale} strokeLinecap="round" {...draw(amount)}/>
  {attention>0&&<g opacity={attention} data-pathway-attention={pathway}>
    <path d={pathD(BRAIN_PATHWAYS[pathway])} fill="none" stroke={pathway==='mesocortical'?C.blue:C.yellow} strokeWidth={13} strokeOpacity={.1} strokeLinecap="round" {...draw(amount)}/>
    <path d={pathD(BRAIN_PATHWAYS[pathway])} fill="none" stroke={pathway==='mesocortical'?C.blue:C.yellow} strokeWidth={3.2+.6*Math.sin(frame*Math.PI/27)} strokeLinecap="round" {...draw(amount)}/>
  </g>}
  {Array.from({length:pathway==='mesolimbic'||pathway==='mesocortical'?3:1},(_,i)=>{
    const phase=((Math.max(0,frame)+i*45)%135)/135;
    return <DopamineParticle key={i} pathway={pathway} phase={phase} opacity={activity*progress(frame,0,25)*amount*progress(phase,0,.07)*(1-progress(phase,.92,1))}/>;
  })}
</g>;

export const BrainRegionLabel:React.FC<{region:BrainRegion;camera:BrainCamera;x:number;y:number;opacity?:number;fullName?:boolean;mirrorPosition?:boolean}>=({region,camera,x:originalX,y,opacity=1,fullName=false,mirrorPosition=false})=>{
  const [tx,ty]=anatomyToScreen(BRAIN_REGIONS[region].center,camera);
  const x=mirrorPosition?Math.max(180,Math.min(1740,region==='VTA'?tx-100:2*camera.x-originalX)):originalX;
  const elbow=x+(x<tx?35:-35);
  return <g opacity={opacity}><path d={`M${tx} ${ty}L${elbow} ${y-20}H${x}`} fill="none" stroke={C.gray} strokeWidth={2}/><Label x={x} y={y+16} size={31} color={region==='VTA'?C.yellow:C.white}>{['VTA','NAc','PFC','vHPC','BLA'].includes(region)?region:BRAIN_REGIONS[region].name}</Label>{fullName&&<Label x={x} y={y+51} size={24} color={C.gray}>{BRAIN_REGIONS[region].name}</Label>}</g>;
};

export type BrainAnatomyProps=BrainCamera&{
  amount?:number;opacity?:number;cortexOpacity?:number;frame?:number;
  highlights?:Partial<Record<BrainRegion,number>>;
  regionOpacity?:Partial<Record<BrainRegion,number>>;
  labels?:Partial<Record<BrainRegion,boolean>>;
  pathwayProgress?:Partial<Record<PathwayId,number>>;
  pathwayOpacity?:Partial<Record<PathwayId,number>>;
  pathwayWidthScale?:Partial<Record<PathwayId,number>>;
  regionFocus?:Partial<Record<BrainRegion,BrainAttention>>;
  pathwayFocus?:Partial<Record<PathwayId,number>>;
  activity?:Partial<Record<PathwayId,number>>;
  /** 0–1; default increases with zoom. Fine sulci never replace the major anatomy. */
  detail?:number;
};
export const BrainAnatomy:React.FC<BrainAnatomyProps>=(props)=>{
  const {x,y,scale,anteriorRight=false,amount=1,opacity=1,cortexOpacity=1,frame=0,highlights={},regionOpacity={},labels={},pathwayProgress={},pathwayOpacity={},pathwayWidthScale={},regionFocus={},pathwayFocus={},activity={}}=props;
  const detail=Math.max(0,Math.min(1,props.detail??progress(scale,.7,1.6)));
  const regions=Object.keys(BRAIN_REGIONS) as BrainRegion[];
  const structural:BrainRegion[]=['midbrain','pons','medulla','cerebellum','corpusCallosum','thalamus','hypothalamus','vHPC','BLA','NAc'];
  const projected=new Set<BrainRegion>(['vHPC','BLA','NAc']);
  const pathwayIds=Object.keys(BRAIN_PATHWAYS) as PathwayId[];
  const targetActivity=(region:BrainRegion)=>pathwayIds.reduce((value,id)=>PATHWAY_TARGETS[id]===region?Math.max(value,(activity[id]??0)*(.35+.65*Math.cos((frame+(id==='mesocortical'?19:0))*Math.PI/45)**12)):value,region==='VTA'?(activity.mesolimbic??0)*.7:0);
  const limbic=pathwayProgress.mesolimbic??0;
  return <g opacity={opacity} data-brain-view="medial schematic with projected deep structures">
    <desc>Medial-view schematic with projected deep structures. The nucleus accumbens, amygdala and hippocampus are transparent overlays, not structures on one midsagittal cutting plane.</desc>
    <g transform={`translate(${x} ${y}) scale(${scale}) translate(-500 -330)`}>
      <g transform={anteriorRight?'translate(1000 0) scale(-1 1)':undefined}>
        <g opacity={cortexOpacity} data-anatomy="cerebral-cortex">
          <Stroke d={CORTEX_OUTLINE} amount={amount} fill={C.bg}/>
          <path d={CORTEX_OUTLINE} fill={C.gray} fillOpacity={.025*amount} stroke="none"/>
          {CORTICAL_SULCI.map(d=><Stroke key={d} d={d} amount={progress(amount,.2,1)} opacity={.4} width={1.5}/>)}
          <g opacity={detail*.6}>{FINE_SULCI.map(d=><Stroke key={d} d={d} amount={progress(amount,.5,1)} opacity={.5} width={1.1}/>)}</g>
        </g>
        {structural.map((region,i)=><g key={region} data-anatomy={region} opacity={(regionOpacity[region]??1)*cortexOpacity}>
          <path d={STRUCTURE_PATHS[region]} fill={C.gray} fillOpacity={(projected.has(region)?.045:region==='corpusCallosum'?.11:.055)*progress(amount,.2,1)} stroke="none"/>
          <Stroke d={STRUCTURE_PATHS[region]} amount={progress(amount,.15+Math.min(i*.018,.2),1)} opacity={projected.has(region)?.32:.65} width={region==='corpusCallosum'?2.3:1.7}/>
          {region==='cerebellum'&&CEREBELLAR_FOLIA.map(d=><Stroke key={d} d={d} amount={progress(amount,.3,1)} opacity={.5} width={1.3}/>)}
          {region==='thalamus'&&<ellipse cx={BRAIN_REGIONS.thalamus.center[0]} cy={BRAIN_REGIONS.thalamus.center[1]} rx={6} ry={4} fill={C.gray} opacity={detail*.2*amount}/>}
        </g>)}
        <g opacity={detail*cortexOpacity*.5} data-anatomy="fornix-and-hypothalamic-landmarks">
          <Stroke d="M369 346C398 324 445 311 496 312C544 312 593 325 613 348M443 395Q432 416 425 431M453 431L447 446Q449 455 457 453" amount={progress(amount,.5,1)} width={1.2}/>
        </g>
        {regions.map(region=><BrainRegionHighlight key={region} region={region} amount={highlights[region]??0} opacity={regionOpacity[region]??1} activity={targetActivity(region)} attention={regionFocus[region]}/>)}
        {pathwayIds.map(pathway=>{
          const branch=pathway==='mesoamygdala'||pathway==='mesohippocampal';
          const target=PATHWAY_TARGETS[pathway];
          const reveal=pathwayProgress[pathway]??(branch?limbic:0);
          const pathOpacity=pathwayOpacity[pathway]??(branch?(pathwayOpacity.mesolimbic??1)*(.28+.35*(highlights[target]??0)):1);
          return <DopaminePathway key={pathway} pathway={pathway} amount={reveal} opacity={pathOpacity} frame={frame} activity={activity[pathway]??0} widthScale={pathwayWidthScale[pathway]??1} attention={pathwayFocus[pathway]??0}/>;
        })}
      </g>
    </g>
    {regions.filter(region=>labels[region]).map(region=>{
      const [rx,ry]=anatomyToScreen(BRAIN_REGIONS[region].center,props);
      const positions:Partial<Record<BrainRegion,[number,number]>>={VTA:[1320,895],NAc:[1290,850],PFC:[1620,355]};
      const [lx,ly]=positions[region]??[rx+(rx>x?180:-180),ry+45];
      return <BrainRegionLabel key={region} region={region} camera={props} x={lx} y={ly} fullName={region==='VTA'}/>;
    })}
  </g>;
};
