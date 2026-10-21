import React from 'react';
import {C, Label} from './components';
import {curvePoint, draw, progress} from './motion';

/** Canonical medial cutaway: anterior LEFT. Rendering can mirror it for a right-facing head.
 * NAc is projected into this cutaway; it is lateral to the true midsagittal plane.
 * Coordinates adapt the existing bio-dopamine SVG, not an atlas segmentation.
 */
export const BRAIN_REGIONS={
  VTA:{center:[512,467],rx:14,ry:9,name:'Ventral Tegmental Area'},
  NAc:{center:[398,418],rx:21,ry:13,name:'Nucleus accumbens'},
  PFC:{center:[205,275],rx:32,ry:75,name:'Prefrontal cortex'},
  // Projected medial temporal locations; rodent ventral hippocampus corresponds
  // broadly to anterior hippocampus in humans. Not a midsagittal atlas section.
  vHPC:{center:[565,430],rx:27,ry:11,name:'Ventral hippocampus'},
  BLA:{center:[454,442],rx:13,ry:11,name:'Basolateral amygdala'},
} as const;
export type BrainRegion=keyof typeof BRAIN_REGIONS;
export const BRAIN_PATHWAYS={
  mesolimbic:[[512,467],[485,425],[448,405],[398,418]],
  mesocortical:[[512,467],[470,375],[270,410],[205,275]],
};
export type PathwayId=keyof typeof BRAIN_PATHWAYS;
export const BRAIN_CENTER=[500,330] as const;
export const BRAIN_BOUNDS={left:120,right:880,top:75,bottom:595};
export type BrainCamera={x:number;y:number;scale:number;anteriorRight?:boolean};
export const anatomyToScreen=(point:readonly number[],camera:BrainCamera):[number,number]=>[
  camera.x+((camera.anteriorRight===false?point[0]:1000-point[0])-BRAIN_CENTER[0])*camera.scale,
  camera.y+(point[1]-BRAIN_CENTER[1])*camera.scale,
];
const pathD=(p:number[][])=>`M${p[0].join(' ')}C${p.slice(1).map(v=>v.join(' ')).join(' ')}`;
const OUTLINE='M588 460C620 447 651 449 680 454C743 466 808 464 843 425C879 380 876 310 835 245C780 150 670 90 540 82C420 75 290 105 210 175C130 245 120 345 158 413C187 461 255 473 320 475C380 480 440 470 470 458';
const STEM='M470 458C461 482 461 502 470 523C476 540 488 554 496 580L538 580C534 553 543 527 553 506C568 484 580 471 588 460C553 450 511 451 470 458Z';
const CEREBELLUM='M603 477C649 459 723 465 783 487C825 505 821 549 781 569C730 593 659 581 611 555C581 538 579 492 603 477Z';
const PFC='M175 440C120 370 120 250 210 175C239 150 267 134 304 120C284 177 250 222 247 286C243 353 269 415 293 472C239 467 194 456 175 440Z';
const FOLDS=[
 'M300 330C300 230 420 175 540 175C640 175 710 210 740 260',
 'M560 85C555 110 572 130 560 160','M790 180C770 230 740 270 720 300',
 'M852 360C800 360 750 345 710 322','M262 150C272 180 252 210 266 240',
 'M440 86C446 112 430 135 440 158','M680 112C668 140 690 160 676 190',
 'M185 272Q220 280 226 318T205 382','M330 134Q350 164 324 194',
 'M360 401Q313 383 315 437','M758 403Q725 379 680 397T601 410',
 'M612 502C660 490 740 492 802 508','M604 526C660 516 740 518 808 532',
 'M615 550C670 546 735 549 792 556',
];
const Stroke:React.FC<{d:string;amount:number;opacity?:number;width?:number;fill?:string}>=({d,amount,opacity=1,width=2.5,fill='none'})=><path d={d} fill={fill} stroke={C.gray} strokeWidth={width} opacity={opacity} strokeLinecap="round" strokeLinejoin="round" {...draw(amount)}/>;

export const BrainRegionHighlight:React.FC<{region:BrainRegion;amount?:number;activity?:number;opacity?:number}>=({region,amount=1,activity=0,opacity=1})=>{
  const r=BRAIN_REGIONS[region];
  const color=region==='VTA'?C.yellow:C.blue;
  return <g opacity={opacity*amount}>
    {region==='PFC'?<path d={PFC} fill={color} fillOpacity={.08+activity*.12} stroke={color} strokeWidth={2} {...draw(amount)}/>:region==='vHPC'?<path d="M590 414Q570 399 550 420T525 440Q545 448 565 435T590 414Z" fill={color} fillOpacity={.14} stroke={color} strokeWidth={2} {...draw(amount)}/>:<>
      <ellipse cx={r.center[0]} cy={r.center[1]} rx={r.rx*1.8} ry={r.ry*2} fill={C.yellow} opacity={activity*.1}/>
      <ellipse cx={r.center[0]} cy={r.center[1]} rx={r.rx} ry={r.ry} fill={color} fillOpacity={.2+activity*.3} stroke={color} strokeWidth={2.5}/>
    </>}
  </g>;
};

export const DopamineParticle:React.FC<{pathway:PathwayId;phase:number;opacity?:number}>=({pathway,phase,opacity=1})=>{
  const [x,y]=curvePoint(Math.max(0,Math.min(1,phase)),BRAIN_PATHWAYS[pathway]);
  return <g opacity={opacity}><circle cx={x} cy={y} r={7} fill={C.yellow} opacity={.09}/><circle cx={x} cy={y} r={2.8} fill={C.yellow}/></g>;
};
export const DopaminePathway:React.FC<{pathway:PathwayId;amount?:number;opacity?:number;frame?:number;activity?:number}>=({pathway,amount=1,opacity=1,frame=0,activity=0})=><g opacity={opacity}>
  <path d={pathD(BRAIN_PATHWAYS[pathway])} fill="none" stroke={C.yellow} strokeWidth={2.4} strokeLinecap="round" {...draw(amount)}/>
  {Array.from({length:3},(_,i)=>{
    const phase=((Math.max(0,frame)+i*45)%135)/135;
    return <DopamineParticle key={i} pathway={pathway} phase={phase} opacity={activity*progress(frame,0,25)*amount}/>;
  })}
</g>;

export const BrainRegionLabel:React.FC<{region:BrainRegion;camera:BrainCamera;x:number;y:number;opacity?:number;fullName?:boolean}>=({region,camera,x,y,opacity=1,fullName=false})=>{
  const [tx,ty]=anatomyToScreen(BRAIN_REGIONS[region].center,camera);
  return <g opacity={opacity}><path d={`M${tx} ${ty}L${x+35} ${y-20}H${x}`} fill="none" stroke={C.gray} strokeWidth={2}/><Label x={x} y={y+16} size={31} color={region==='VTA'?C.yellow:C.white}>{region}</Label>{fullName&&<Label x={x} y={y+51} size={24} color={C.gray}>{BRAIN_REGIONS[region].name}</Label>}</g>;
};

export type BrainAnatomyProps=BrainCamera&{
  amount?:number;opacity?:number;cortexOpacity?:number;frame?:number;
  highlights?:Partial<Record<BrainRegion,number>>;
  regionOpacity?:Partial<Record<BrainRegion,number>>;
  labels?:Partial<Record<BrainRegion,boolean>>;
  pathwayProgress?:Partial<Record<PathwayId,number>>;
  pathwayOpacity?:Partial<Record<PathwayId,number>>;
  activity?:Partial<Record<PathwayId,number>>;
};
export const BrainAnatomy:React.FC<BrainAnatomyProps>=(props)=>{
  const {x,y,scale,anteriorRight=true,amount=1,opacity=1,cortexOpacity=1,frame=0,highlights={},regionOpacity={},labels={},pathwayProgress={},pathwayOpacity={},activity={}}=props;
  const nacActivity=(activity.mesolimbic??0)*(.35+.65*Math.cos(frame*Math.PI/45)**12);
  return <g opacity={opacity}>
    <g transform={`translate(${x} ${y}) scale(${scale}) translate(-500 -330)`}>
      <g transform={anteriorRight?'translate(1000 0) scale(-1 1)':undefined}>
        <g opacity={cortexOpacity}>
          <Stroke d={OUTLINE+'L588 460Z'} amount={amount} fill={C.bg}/>
          <Stroke d={STEM} amount={progress(amount,.12,1)} fill={C.bg}/>
          <Stroke d={CEREBELLUM} amount={progress(amount,.18,1)} fill={C.bg}/>
          <Stroke d="M370 350C335 340 322 300 345 268C390 222 470 212 540 215C620 218 680 250 692 292C698 315 680 322 668 310" amount={progress(amount,.3,1)} opacity={.65} width={5}/>
          <Stroke d="M463 365a52 32 0 1 0 104 0a52 32 0 1 0 -104 0" amount={progress(amount,.4,1)} opacity={.45} width={2}/>
          {FOLDS.map(d=><Stroke key={d} d={d} amount={progress(amount,.2,1)} opacity={.35} width={1.5}/>) }
        </g>
        {(['VTA','NAc','PFC','vHPC','BLA'] as const).map(region=><BrainRegionHighlight key={region} region={region} amount={highlights[region]??0} opacity={regionOpacity[region]??1} activity={region==='NAc'?nacActivity:(activity.mesolimbic??0)*.7}/>) }
        {(['mesolimbic','mesocortical'] as const).map(pathway=><DopaminePathway key={pathway} pathway={pathway} amount={pathwayProgress[pathway]??0} opacity={pathwayOpacity[pathway]??1} frame={frame} activity={activity[pathway]??0}/>) }
      </g>
    </g>
    {labels.VTA&&<BrainRegionLabel region="VTA" camera={props} x={1320} y={895} fullName/>}
    {labels.NAc&&<BrainRegionLabel region="NAc" camera={props} x={1290} y={850}/>}
    {labels.PFC&&<BrainRegionLabel region="PFC" camera={props} x={1620} y={355}/>}
  </g>;
};
