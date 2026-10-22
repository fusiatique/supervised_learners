import React from 'react';
import {C, HumanCharacter, Label} from './components';
import {curvePoint, draw, ease, mix, progress} from './motion';
import {CueSymbol, SimpleNeuron} from './reward-components';
import {RewardSymbol, type SymbolPlacement} from './risk-components';
import {anatomyToScreen,BRAIN_REGIONS,type BrainCamera} from './BrainAnatomy';

export type FiringMode='baseline'|'burst'|'dip';
/** Synthetic event times, not experimental recordings. A dip removes events. */
export const getSpikeTimes=(mode:FiringMode,eventTime=.65):number[]=>{
  const baseline=Array.from({length:14},(_,i)=>.025+i*.07);
  if(mode==='baseline')return baseline;
  const end=eventTime+(mode==='dip'?.18:.1);
  const sparse=baseline.filter(t=>t<eventTime-.012||t>end);
  return mode==='dip'?sparse:[...sparse,...Array.from({length:7},(_,i)=>eventTime+i*.014).filter(t=>t<=.98)].sort((a,b)=>a-b);
};
export const DopamineSpikeTrain:React.FC<SymbolPlacement&{width?:number;mode?:FiringMode;eventTime?:number;reveal?:number;cursor?:boolean;caption?:boolean;spikeTimes?:readonly number[]}>=({x=0,y=0,scale=1,opacity=1,amount=1,width=1100,mode='baseline',eventTime=.65,reveal=1,cursor=false,caption=false,spikeTimes})=>{
  const active=progress(reveal,eventTime-.05,eventTime+.02);
  return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    {mode!=='baseline'&&<rect x={eventTime*width-7} y={-66} width={(mode==='dip'?.18:.105)*width+14} height={82} rx={8} fill={mode==='dip'?C.red:C.yellow} opacity={active*.08}/>}
    <path d={`M0 0H${width}l-12 -8M${width} 0l-12 8`} fill="none" stroke={C.gray} strokeWidth={2} {...draw(amount)}/>
    {(spikeTimes??getSpikeTimes(mode,eventTime)).map(t=><path key={t} d={`M${t*width} 0V-42`} fill="none" stroke={C.yellow} strokeWidth={3} strokeLinecap="round" opacity={progress(reveal,t,t+.006)}/>) }
    {cursor&&<path d={`M${reveal*width} -70V20`} stroke={C.white} strokeWidth={1.5} strokeDasharray="3 7" opacity={.45}/>}
    {caption&&<Label x={width/2} y={58} size={23} color={C.gray}>Illustrative firing pattern · time →</Label>}
  </g>;
};

export const DopamineNeuron:React.FC<SymbolPlacement&{frame:number;activity?:number;color?:string}>=({x=0,y=0,scale=1,amount=1,opacity=1,frame,activity=.4,color=C.yellow})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <circle r={75} fill={color} opacity={activity*.06}/>
  <SimpleNeuron amount={amount} color={color}/>
  <circle r={24} fill={color} opacity={activity*.18}/>
  {[0,1].map(i=>{
    const phase=((frame+i*35)%100)/100;
    const [px,py]=curvePoint(phase,[[61,1],[160,-18],[210,23],[300,2]]);
    return <circle key={i} cx={px} cy={py} r={4} fill={color} opacity={activity*amount}/>;
  })}
</g>;

export const RewardPredictionError:React.FC<SymbolPlacement&{expected:number;actual:number;width?:number;showDifference?:number}>=({x=0,y=0,scale=1,amount=1,opacity=1,expected,actual,width=650,showDifference=1})=>{
  const e=Math.max(0,Math.min(1,expected)),a=Math.max(0,Math.min(1,actual));
  const color=a>e?C.yellow:a<e?C.red:C.gray;
  return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <Label x={-45} y={15} anchor="end" size={27} color={C.gray}>EXPECTED REWARD</Label>
    <Label x={-45} y={135} anchor="end" size={27} color={C.gray}>ACTUAL REWARD</Label>
    <path d={`M0 38H${width}M0 158H${width}`} stroke={C.gray} opacity={.25} strokeWidth={2}/>
    <rect x={0} y={-18} width={width*e*amount} height={42} rx={7} fill={C.blue} opacity={.65}/>
    <rect x={0} y={102} width={width*a*amount} height={42} rx={7} fill={C.green} opacity={.65}/>
    <rect x={Math.min(e,a)*width} y={95} width={Math.abs(a-e)*width*showDifference} height={56} rx={5} fill={color} opacity={.2}/>
    <path d={`M${e*width} 70V175M${a*width} 70V175`} stroke={color} opacity={showDifference*.7} strokeDasharray="4 7" strokeWidth={2}/>
  </g>;
};

export const FOOD_TRIALS=[
  {start:1200,end:1290,cue:null,reward:1255,learned:false},
  {start:1290,end:1380,cue:1308,reward:1356,learned:false},
  {start:1380,end:1470,cue:1395,reward:1449,learned:true},
] as const;
export const getFoodEvents=(frame:number)=>{
  const trial=frame<1290?FOOD_TRIALS[0]:frame<1380?FOOD_TRIALS[1]:FOOD_TRIALS[2];
  const omitted=frame>=1560;
  const start=omitted?1560:trial.start,end=omitted?1800:trial.end;
  const cue=omitted?1588:trial.cue,reward=omitted?1660:trial.reward;
  return {trial,start,end,cue,reward,omitted,reveal:progress(frame,start,end),eventTime:(reward-start)/(end-start),burstTime:trial.learned&&cue!==null?(cue-start)/(end-start):(reward-start)/(end-start)};
};
export const getFoodSpikeTimes=(frame:number)=>{
  const s=getFoodEvents(frame);
  if(!s.omitted)return getSpikeTimes('burst',s.burstTime);
  const cueTime=(s.cue!-s.start)/(s.end-s.start);
  const base=getSpikeTimes('dip',s.eventTime).filter(t=>t<cueTime-.012||t>cueTime+.1);
  return [...base,...Array.from({length:7},(_,i)=>cueTime+i*.014)].sort((a,b)=>a-b);
};
export const FoodDeliveryExample:React.FC<{frame:number;opacity?:number}>=({frame,opacity=1})=>{
  const s=getFoodEvents(frame);
  const ring=s.cue===null?0:progress(frame,s.cue,s.cue+24)*(1-progress(frame,s.cue+24,s.cue+25));
  const bag=s.omitted?0:progress(frame,s.reward,s.reward+8)*(1-progress(frame,s.end-10,s.end));
  const dissatisfied=s.omitted&&frame>=1660;
  return <g opacity={opacity}>
    <g stroke={C.gray} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M470 700H1630M1360 700V350H1560V700" {...draw(progress(frame,1200,1230))}/>
      <circle cx={1525} cy={535} r={5}/>
      <path d="M850 530H1130M875 530V650M1105 530V650M745 580H835M760 580V660M820 580V660" {...draw(progress(frame,1200,1230))}/>
    </g>
    <HumanCharacter x={780} y={550} frame={frame} seated look={(s.cue!==null&&frame>=s.cue)||frame>=s.reward?5:0} expression={dissatisfied?'disappointed':bag>.4?'satisfied':s.trial.learned&&s.cue!==null&&frame>=s.cue?'recognition':'curious'}/>
    <CueSymbol x={1260} y={305} scale={.65} ring={ring} opacity={s.cue!==null?progress(frame,s.cue-8,s.cue):0}/>
    <g transform={`translate(1450 ${mix(655,625,ease(frame,s.reward,s.reward+10))})`} opacity={bag} stroke={C.white} fill={C.bg} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M-42 -30H42L50 45H-50Z M-20 -30V-48Q0 -70 20 -48V-30"/>
      <RewardSymbol scale={.35} y={5}/>
    </g>
    {!s.omitted&&s.cue!==null&&<path d="M1270 350Q1310 430 1430 540" stroke={C.yellow} opacity={progress(frame,1320,1450)*.6} fill="none" strokeWidth={3} {...draw(progress(frame,1320,1450))}/>}
    {s.omitted&&<g opacity={progress(frame,1640,1665)}><Label x={870} y={340} size={42} color={C.yellow}>?</Label><path d="M1420 600l40 40M1460 600l-40 40" stroke={C.red} opacity={progress(frame,1660,1680)} strokeWidth={3}/></g>}
  </g>;
};

export const CueRewardTimeline:React.FC<{x?:number;y:number;mode:'reward'|'cue'|'dip';reveal?:number;width?:number;label?:string}>=({x=470,y,mode,reveal=1,width=1100,label})=><g>
  <DopamineSpikeTrain x={x} y={y} width={width} mode={mode==='dip'?'dip':'burst'} eventTime={mode==='cue'?.25:.7} reveal={reveal}/>
  <path d={`M${x+.25*width} ${y-65}V${y+12}M${x+.7*width} ${y-65}V${y+12}`} stroke={C.gray} strokeWidth={1.5} strokeDasharray="3 8" opacity={.4}/>
  <Label x={x+.25*width} y={y+42} size={21} color={C.gray}>CUE</Label><Label x={x+.7*width} y={y+42} size={21} color={C.gray}>{mode==='dip'?'EXPECTED REWARD':'REWARD'}</Label>
  {label&&<Label x={x-35} y={y-18} anchor="end" size={23}>{label}</Label>}
</g>;

export const RodentExperimentIllustration:React.FC<{frame:number}>=({frame})=>{
  const inhibition=frame>=1980;
  const approach=ease(frame,1930,1970)*(1-ease(frame,1980,2010));
  const x=mix(650,890,approach);
  return <g>
    <path d="M380 700H1540" stroke={C.gray} strokeWidth={2} opacity={.4}/>
    <g transform={`translate(${x} 610)`} stroke={C.white} strokeWidth={3.5} fill={C.bg} strokeLinecap="round" strokeLinejoin="round">
      <ellipse rx={80} ry={45}/><path d="M55 -25Q92 -67 132 -18L158 7 121 26 70 28M-76 15C-166 -65 -194 40 -120 56M-40 39L-53 67H-23M72 27L80 66H108"/>
      <circle cx={96} cy={-37} r={22}/><circle cx={126} cy={-8} r={3} fill={C.white}/><path d="M149 5l27 -9M147 12l28 9" strokeWidth={2}/>
    </g>
    <g transform="translate(1120 415)" stroke={C.yellow} strokeWidth={3} fill="none"><circle r={27} fill={C.yellow} fillOpacity={inhibition?.04:.14}/><path d="M-12 28V45H12V28M0 -43V-55M-40 -20L-53 -28M40 -20L53 -28"/></g>
    <circle cx={1440} cy={395} r={110} stroke={inhibition?C.red:C.yellow} fill={C.bg} strokeWidth={2}/>
    <DopamineNeuron x={1415} y={395} scale={.42} frame={frame} activity={inhibition?.08:.9}/>
    <path d={`M${x+100} 555L1360 490`} stroke={C.gray} strokeWidth={1.5} opacity={.6}/>
    <DopamineSpikeTrain x={1170} y={765} width={470} mode={inhibition?'dip':'burst'} eventTime={.55}/>
    <Label x={960} y={925} size={23} color={C.gray}>Schematic experiment</Label>
  </g>;
};

export const NAc_INPUTS={
  PFC:[BRAIN_REGIONS.PFC.center,[240,355],[330,375],BRAIN_REGIONS.NAc.center],
  vHPC:[BRAIN_REGIONS.vHPC.center,[520,390],[460,390],BRAIN_REGIONS.NAc.center],
  BLA:[BRAIN_REGIONS.BLA.center,[440,428],[420,425],BRAIN_REGIONS.NAc.center],
} as const;
export type InputRegion=keyof typeof NAc_INPUTS;
export const NeuralInputPathway:React.FC<{region:InputRegion;camera:BrainCamera;amount:number;frame:number;activity?:number}>=({region,camera,amount,frame,activity=1})=>{
  const p=NAc_INPUTS[region].map(point=>anatomyToScreen(point,camera));
  const d=`M${p[0].join(' ')}C${p.slice(1).map(v=>v.join(' ')).join(' ')}`;
  const t=((Math.max(0,frame)+(region==='PFC'?0:region==='vHPC'?35:70))%120)/120;
  const [x,y]=curvePoint(t,p);
  return <g><path d={d} stroke={C.blue} strokeWidth={3} fill="none" opacity={.75} {...draw(amount)}/><circle cx={x} cy={y} r={4} fill={C.blue} opacity={activity*amount}/></g>;
};
export const MotivationalValueIndicator:React.FC<SymbolPlacement&{value:number}>=({x=0,y=0,scale=1,opacity=1,value})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <rect x={-22} y={-125} width={44} height={250} rx={12} fill="none" stroke={C.gray} strokeWidth={2}/>
  <rect x={-15} y={125-Math.max(0,Math.min(1,value))*236-7} width={30} height={Math.max(0,Math.min(1,value))*236} rx={6} fill={C.yellow} opacity={.65}/>
  <Label x={0} y={176} size={22} color={C.gray}>Conceptual value</Label>
</g>;
