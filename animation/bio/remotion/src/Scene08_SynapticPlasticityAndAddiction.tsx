import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {anatomyToScreen,BrainAnatomy,BrainRegionLabel,BRAIN_REGIONS,type BrainCamera} from './BrainAnatomy';
import {C,HumanCharacter,Label,SourceCitation} from './components';
import {CocaineContainer,DopamineMessenger} from './dopamine-introduction-components';
import {CueSymbol} from './reward-components';
import {RewardSymbol} from './risk-components';
import {curvePoint,draw,ease,mix,progress} from './motion';
import {DRUG_STRENGTHS,REWARDED_STRENGTHS,LEARNED_STRENGTHS,NETWORK_EDGES,PlasticNeuralNetwork,PlasticSynapse,interpolateStrengths} from './plasticity-components';

export const SCENE08={width:1920,height:1080,fps:30,durationInFrames:2100} as const;
export const T08={network:0,pair:90,synapse:150,coactivity:240,ltp:450,ltd:660,stored:810,learnedBoundary:900,dopamine:901,expectation:990,modulation:1080,association:1170,drug:1350,adaptation:1440,anatomy:1530,cueComparison:1620,persistent:1830,timePasses:1890,craving:1950,final:2010,hold:2070,end:2100} as const;
const baseline=NETWORK_EDGES.map(()=>.45);
export const strengths08=(f:number)=>{
 const learned=interpolateStrengths(baseline,LEARNED_STRENGTHS,ease(f,810,870));
 const modulated=interpolateStrengths(learned,REWARDED_STRENGTHS,ease(f,1080,1170));
 return interpolateStrengths(modulated,DRUG_STRENGTHS,ease(f,1440,1530));
};
export const state08=(frame:number)=>{
 const f=Math.min(frame,T08.hold);
 return {frame:f,dopamine:f>T08.learnedBoundary&&f<T08.persistent,drug:f>=T08.drug&&f<T08.final,citation:f>=T08.drug?'Volkow et al., 2019':null,strengths:strengths08(f),freeze:frame>=T08.hold};
};
const section=(f:number,start:number,end:number,overlap=20)=>progress(f,start,start+overlap)*(1-progress(f,end,end+overlap));
const Text:React.FC<{f:number;start:number;end?:number;text:string;y?:number;color?:string;size?:number}>=({f,start,end=2200,text,y=130,color=C.white,size=35})=><g opacity={section(f,start,end)} transform={`translate(0 ${10*(1-ease(f,start,start+24))})`}><Label x={960} y={y} size={size} color={color}>{text}</Label></g>;

const LearningIntroduction:React.FC<{f:number}>=({f})=>{
 const zoom=ease(f,90,150),close=ease(f,150,210),out=1-progress(f,210,240);
 return <g opacity={out}>
  <g opacity={1-close} transform={`translate(960 540) scale(${mix(.95,1.8,zoom)}) translate(${340*zoom} ${185*zoom})`}>
   <PlasticNeuralNetwork frame={f} x={0} y={0} amount={progress(f,0,65)} focusPair={zoom} active={1} strengths={baseline}/>
  </g>
  <g opacity={close}><PlasticSynapse frame={f} testFrame={165} x={960} y={570} scale={.95} strength={.45}/></g>
  <Text f={f} start={0} end={115} text="WHERE DOES LEARNING HAPPEN?"/>
  <Text f={f} start={155} end={240} text="SYNAPTIC PLASTICITY" color={C.yellow}/>
  <Text f={f} start={185} end={240} text="CONNECTIONS CAN CHANGE" y={890} color={C.gray} size={29}/>
 </g>;
};
const CoordinatedActivity:React.FC<{f:number}>=({f})=>{
 const strength=mix(.45,.95,ease(f,270,420));
 return <g opacity={section(f,210,450,30)}>
  <PlasticSynapse frame={f} testFrame={245} training x={960} y={540} scale={1} strength={strength}/>
  <Text f={f} start={245} end={350} text="REPEATED, COORDINATED ACTIVITY" size={31}/>
  <Text f={f} start={360} end={450} text="NEURONS THAT FIRE TOGETHER, WIRE TOGETHER" color={C.yellow} size={35}/>
  <Label x={960} y={950} size={22} color={C.gray}>Simplified activity-dependent plasticity</Label>
 </g>;
};
const EfficacyComparison:React.FC<{f:number;depression?:boolean}>=({f,depression=false})=>{
 const start=depression?660:450,end=depression?810:660;
 const before=depression?.75:.45,after=mix(before,depression?.16:1,ease(f,start+(depression?45:75),start+(depression?100:120)));
 const test=start+(depression?105:130);
 return <g opacity={section(f,start,end)}>
  <Text f={f} start={start} end={end} text={depression?'LONG-TERM DEPRESSION (LTD)':'LONG-TERM POTENTIATION (LTP)'} color={depression?C.blue:C.green}/>
  <Label x={480} y={310} size={27} color={C.gray}>BEFORE</Label><Label x={1440} y={310} size={27} color={C.gray}>AFTER</Label>
  <path d="M960 290V805" stroke={C.gray} strokeWidth={1} opacity={.2}/>
  <PlasticSynapse frame={f} x={480} y={530} scale={.67} strength={before} testFrame={!depression&&f<start+120?start:test} training={!depression&&f<start+120}/>
  <PlasticSynapse frame={f} x={1440} y={530} scale={.67} strength={after} testFrame={!depression&&f<start+120?start:test} training={!depression&&f<start+120}/>
  <g opacity={progress(f,test,test+15)}><Label x={480} y={770} size={24} color={C.blue}>SAME TEST INPUT</Label><Label x={1440} y={770} size={24} color={C.blue}>SAME TEST INPUT</Label></g>
  <Text f={f} start={start+(depression?105:150)} end={end} text={depression?'WEAKENED CONNECTION':'STRENGTHENED CONNECTION'} y={890} size={29} color={depression?C.blue:C.green}/>
  <Label x={960} y={980} size={21} color={C.gray}>Line weight illustrates functional efficacy</Label>
 </g>;
};

const LearnedNetwork:React.FC<{f:number}>=({f})=>{
 const start=progress(f,810,850),end=1-progress(f,1530,1620),dopamine=f>900&&f<1350?progress(f,901,940):0;
 const modulation=progress(f,1080,1170);
 const anatomical=ease(f,1530,1620);
 const scale=mix(1.15,.82,ease(f,810,875))*mix(1,.83,ease(f,1170,1210))*mix(1,.2,anatomical);
 return <g opacity={start*end}>
  <PlasticNeuralNetwork frame={f} x={960} y={mix(585,470,anatomical)} scale={scale} strengths={strengths08(f)} amount={1} dopamine={dopamine*modulation} active={f>=890&&f<=905?0:1}/>
  <Text f={f} start={815} end={860} text="LEARNING CHANGES CONNECTION STRENGTHS" size={33}/>
  <Text f={f} start={865} end={935} text="A LASTING NETWORK PATTERN" color={C.green}/>
  {f>900&&<g opacity={section(f,901,1170)}>
   <DopamineMessenger x={1650} y={260} scale={.75} frame={f} amount={progress(f,901,935)}/>
   <g opacity={progress(f,910,940)}><Label x={1650} y={355} size={27} color={C.yellow}>DOPAMINE</Label></g>
   <path d="M1600 280Q1430 340 1200 465" fill="none" stroke={C.yellow} strokeWidth={3} {...draw(progress(f,930,985))}/>
   <circle cx={mix(1600,1200,ease(f,930,985))} cy={mix(280,465,ease(f,930,985))} r={7} fill={C.yellow} opacity={section(f,930,985,5)}/>
  </g>}
  <g opacity={section(f,990,1080)}>
   <g opacity={.75}><RewardSymbol x={540} y={235} scale={.45}/><Label x={540} y={315} size={24} color={C.gray}>EXPECTED</Label></g>
   <RewardSymbol x={1010} y={235} scale={.45}/><RewardSymbol x={1110} y={235} scale={.45}/><Label x={1060} y={315} size={24} color={C.gray}>ACTUAL</Label>
   <path d="M680 240H870M855 230L870 240 855 250" fill="none" stroke={C.yellow} strokeWidth={3} {...draw(progress(f,1005,1040))}/>
  </g>
  <Text f={f} start={995} end={1080} text="BETTER OR WORSE THAN EXPECTED" y={120} size={32}/>
  <Text f={f} start={1080} end={1170} text="MODULATING SYNAPTIC PLASTICITY" color={C.yellow} size={33}/>
  <g opacity={section(f,1170,1350)}>
   <CueSymbol x={210} y={390} scale={.8} ring={((f-1170)%90)/90} amount={progress(f,1170,1200)}/>
   <RewardSymbol x={1700} y={465} scale={.95} amount={progress(f,1170,1200)}/>
   <HumanCharacter x={mix(1560,1670,ease(f,1230,1270))} y={740} scale={.7} frame={f} walking={Math.sin(ease(f,1230,1270)*Math.PI)} naturalMotion expression="satisfied" look={5}/>
   <g opacity={section(f,1230,1290)}><DopamineMessenger x={1670} y={310} scale={.55} frame={f}/></g>
  </g>
  <Text f={f} start={1290} end={1350} text="LEARNED CUE–REWARD ASSOCIATION" size={33}/>
  <g opacity={section(f,1350,1530)}>
   <CocaineContainer x={1680} y={475} scale={.8} amount={progress(f,1350,1380)}/>
   {[1350,1380,1410].map(at=>{const t=progress(f,at,at+35);return <circle key={at} cx={1680} cy={475} r={65+70*t} fill="none" stroke={C.yellow} strokeWidth={2} opacity={Math.sin(t*Math.PI)*.5}/>;})}
  </g>
  <Text f={f} start={1350} end={1440} text="REPEATED DRUG EXPOSURE" color={C.yellow}/>
  <Text f={f} start={1440} end={1530} text="LASTING SYNAPTIC ADAPTATIONS" size={33}/>
 </g>;
};

export const CAMERA08:BrainCamera={x:960,y:470,scale:1.05,anteriorRight:true};
const AnatomyAndCueResponses:React.FC<{f:number}>=({f})=>{
 const amount=progress(f,1530,1590),out=1-progress(f,2010,2040),shrink=ease(f,1620,1680);
 const camera={...CAMERA08,y:mix(470,350,shrink),scale:mix(1.05,.8,shrink)};
 const nac=anatomyToScreen(BRAIN_REGIONS.NAc.center,camera),pfc=anatomyToScreen(BRAIN_REGIONS.PFC.center,camera);
 const insets=amount*(1-progress(f,1620,1650));
 return <g opacity={amount*out}>
  <BrainAnatomy {...camera} frame={0} amount={1} cortexOpacity={.65} highlights={{NAc:1,PFC:1}} pathwayOpacity={{mesolimbic:0,mesocortical:0}}/>
  <g opacity={1-progress(f,1620,1650)}>
   <BrainRegionLabel region="NAc" camera={camera} x={nac[0]-140} y={nac[1]+80} opacity={amount}/>
   <BrainRegionLabel region="PFC" camera={camera} x={pfc[0]+120} y={pfc[1]-80} opacity={amount}/>
  </g>
  <g opacity={insets}>
   {[[400,690,'NAc',nac],[1510,690,'PFC',pfc]].map(([x,y,name,target])=>{
    const tx=target as number[],cx=x as number,cy=y as number;
    return <g key={name as string}>
     <path d={`M${tx}Q${cx} ${tx[1]} ${cx} ${cy-175}`} fill="none" stroke={C.gray} strokeWidth={2} strokeDasharray="5 7"/>
     <circle cx={cx} cy={cy} r={185} fill={C.bg} stroke={C.gray} strokeWidth={2}/>
     <PlasticNeuralNetwork frame={f} x={cx} y={cy} scale={.25} strengths={DRUG_STRENGTHS} active={.4}/>
     <Label x={cx} y={cy+235} size={28} color={C.yellow}>{name as string}</Label>
    </g>;
   })}
  </g>
  <g opacity={section(f,1650,1830)}>
   <CueResponseLane f={f} y={730} drug/>
   <CueResponseLane f={f} y={915}/>
  </g>
 </g>;
};
const CueResponseLane:React.FC<{f:number;y:number;drug?:boolean}>=({f,y,drug=false})=>{
 const response=progress(f,1710,1750),strength=drug?1:.26;
 const t=((Math.max(0,f-1710))%75)/75;
 return <g>
  {drug?<CocaineContainer x={400} y={y} scale={.45}/>:<RewardSymbol x={400} y={y} scale={.65}/>}
  <path d={`M490 ${y}Q820 ${y-60} 1120 ${y}`} fill="none" stroke={drug?C.yellow:C.green} strokeWidth={drug?4:2} opacity={drug?.9:.45}/>
  <circle cx={mix(490,1120,t)} cy={y-35*Math.sin(t*Math.PI)} r={drug?6:4} fill={drug?C.yellow:C.green} opacity={response}/>
  <PlasticNeuralNetwork frame={f} x={1360} y={y-5} scale={.25} strengths={drug?DRUG_STRENGTHS:NETWORK_EDGES.map(()=>.2)} active={response*strength}/>
  <g opacity={progress(f,drug?1710:1770,drug?1740:1800)}><Label x={920} y={y+73} size={26} color={drug?C.yellow:C.gray}>{drug?'STRONGER DRUG-CUE RESPONSE':'WEAKER NATURAL-REWARD RESPONSE'}</Label></g>
 </g>;
};

const PersistenceAndEnding:React.FC<{f:number}>=({f})=>{
 const appear=progress(f,1830,1870),final=ease(f,2010,2050),cue=section(f,1920,2010);
 return <g opacity={appear}>
  <PlasticNeuralNetwork frame={f} x={960} y={mix(675,550,final)} scale={mix(.7,.88,final)} strengths={DRUG_STRENGTHS} active={f>=1950&&f<2010?1:0} freeze={f>=2070}/>
  <g opacity={1-progress(f,2010,2040)}>
   <path d="M600 950H1420M1405 940L1420 950 1405 960" stroke={C.gray} strokeWidth={2} fill="none" {...draw(progress(f,1830,1870))}/>
   <circle cx={mix(620,1380,ease(f,1830,1950))} cy={950} r={7} fill={C.yellow}/>
   <Label x={600} y={1005} size={23} color={C.gray}>DURING USE</Label><Label x={1340} y={1005} size={23} color={C.gray}>AFTER STOPPING</Label>
   <g opacity={cue}><CocaineContainer x={210} y={570} scale={.65}/><CueSymbol x={210} y={410} scale={.65} ring={progress(f,1920,1950)}/></g>
   <g opacity={section(f,1950,2010)}><HumanCharacter x={1720} y={790} scale={.8} frame={f} expression="conflicted" look={-5}/></g>
  </g>
  <Text f={f} start={1830} end={1890} text="CHANGES CAN PERSIST AFTER STOPPING" size={32}/>
  <Text f={f} start={1890} end={1950} text="TIME PASSES" color={C.gray}/>
  <Text f={f} start={1950} end={1980} text="CRAVING CAN RETURN" color={C.yellow}/>
  <Text f={f} start={1980} end={2010} text="RELAPSE RISK" color={C.yellow}/>
  <Text f={f} start={2040} text="ADDICTION IS NOT JUST A BAD HABIT" size={36}/>
  <g opacity={progress(f,2050,2070)}><Label x={960} y={885} size={33}>LEARNING PHYSICALLY</Label><Label x={960} y={945} size={42} color={C.yellow}>BUILT INTO THE BRAIN</Label></g>
 </g>;
};

export const Scene08Artwork:React.FC<{frame:number}>=({frame})=>{
 const s=state08(frame),f=s.frame;
 return <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="Synaptic plasticity, long-term potentiation and depression, dopamine modulation, and persistent addiction-related adaptations">
  {f<240&&<LearningIntroduction f={f}/>}
  {f>=210&&f<480&&<CoordinatedActivity f={f}/>}
  {f>=450&&f<680&&<EfficacyComparison f={f}/>}
  {f>=660&&f<830&&<EfficacyComparison f={f} depression/>}
  {f>=810&&f<1620&&<LearnedNetwork f={f}/>}
  {f>=1530&&f<2040&&<AnatomyAndCueResponses f={f}/>}
  {f>=1830&&<PersistenceAndEnding f={f}/>}
  {s.citation&&<SourceCitation frame={f} source={s.citation}/>}
 </svg>;
};
export const Scene08_SynapticPlasticityAndAddiction:React.FC=()=>{
 const frame=useCurrentFrame();
 return <AbsoluteFill style={{backgroundColor:C.bg}}><Scene08Artwork frame={frame}/></AbsoluteFill>;
};
