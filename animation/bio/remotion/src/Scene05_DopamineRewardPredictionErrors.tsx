import React from 'react';
import {AbsoluteFill,Sequence,useCurrentFrame} from 'remotion';
import {anatomyToScreen,BrainAnatomy,BRAIN_REGIONS,BrainRegionLabel,DopaminePathway,type BrainCamera} from './BrainAnatomy';
import {getScene04Camera,MesocorticolimbicArtwork} from './Scene04_MesocorticolimbicIntroduction';
import {AnimatedArrow,C,Label,ProcessorIllustration,SourceCitation} from './components';
import {curvePoint,draw,ease,fade,mix,pop,progress} from './motion';
import {CueSymbol,RewardPulse} from './reward-components';
import {RewardSymbol} from './risk-components';
import {CueRewardTimeline,DopamineNeuron,DopamineSpikeTrain,FoodDeliveryExample,getFoodEvents,getFoodSpikeTimes,getSpikeTimes,MotivationalValueIndicator,NAc_INPUTS,NeuralInputPathway,RewardPredictionError,RodentExperimentIllustration} from './dopamine-learning-components';

export const SCENE05={width:1920,height:1080,fps:30,durationInFrames:2400} as const;
export const T05={vta:0,inset:90,dopamineCells:180,accumbens:300,projection:390,pathActivity:480,tonic:600,phasic:690,splitFiring:780,predictionError:900,equation:990,positiveBurst:1080,food:1200,paired:1290,learned:1380,comparison:1470,omission:1560,dip:1660,negative:1740,update:1800,stimulation:1890,inhibition:1980,inputs:2070,otherInputs:2160,inputSignals:2250,learnedValue:2340,hold:2370,end:2400} as const;
export const CITATIONS05=[
  {from:0,to:390,source:'Cooper et al., 2017'},
  {from:390,to:600,source:'Cooper et al., 2017; Volkow et al., 2019'},
  {from:600,to:1050,source:'Piantadosi et al., 2021; Alkam et al., 2025'},
  {from:1050,to:1470,source:'Volkow et al., 2019'},
  {from:1470,to:1890,source:'Piantadosi et al., 2021; Alkam et al., 2025'},
  {from:1890,to:2070,source:'Piantadosi et al., 2021'},
  {from:2070,to:2400,source:'Cooper et al., 2017'},
] as const;
const opacityFor=(f:number,start:number,end:number)=>progress(f,start,start+30)*(1-progress(f,end,end+30));
const header=(text:string,y=130,color:string=C.white,size=37)=><Label x={960} y={y} size={size} color={color}>{text}</Label>;

export const getScene05IntroCamera=(f:number):BrainCamera=>{
  const previous=getScene04Camera(900);
  const previousVta=anatomyToScreen(BRAIN_REGIONS.VTA.center,previous);
  const zoom=ease(f,0,180),back=ease(f,300,390);
  const scale=mix(previous.scale,2.05,zoom);
  const vx=mix(previousVta[0],700,zoom),vy=mix(previousVta[1],650,zoom);
  return {x:mix(vx+12*scale,900,back),y:mix(vy-137*scale,505,back),scale:mix(scale,1.45,back),anteriorRight:true};
};

const AnatomicalIntroduction:React.FC=()=>{
  const f=useCurrentFrame();
  const camera=getScene05IntroCamera(f);
  const [vx,vy]=anatomyToScreen(BRAIN_REGIONS.VTA.center,camera);
  const inset=progress(f,90,135)*(1-progress(f,300,390));
  const insetReturn=ease(f,300,390);
  const ix=mix(1370,vx,insetReturn),iy=mix(420,vy,insetReturn);
  const ss=mix(1,.06,insetReturn);
  return <g opacity={1-progress(f,600,660)}>
    <BrainAnatomy {...camera} cortexOpacity={mix(.65,.32,ease(f,0,180))} frame={540+f}
      highlights={{VTA:1,NAc:mix(mix(1,.6,ease(f,0,180)),1,ease(f,300,390)),PFC:mix(1,.15,ease(f,0,90))}}
      pathwayProgress={{mesolimbic:1,mesocortical:1}} pathwayOpacity={{mesolimbic:mix(1,.3,ease(f,300,390)),mesocortical:mix(.4,.15,ease(f,0,90))}}
      activity={{mesolimbic:f<300?mix(1,.5,ease(f,0,90)):progress(f,480,510),mesocortical:mix(.22,.1,ease(f,0,90))}}/>
    <g opacity={1-progress(f,0,65)}><MesocorticolimbicArtwork frame={900+f} showBrain={false}/></g>
    <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale}) translate(-500 -330) translate(1000 0) scale(-1 1)`}>
      <DopaminePathway pathway="mesolimbic" amount={progress(f,390,480)} opacity={progress(f,390,420)} frame={Math.max(0,f-480)} activity={progress(f,480,510)}/>
    </g>
    <g opacity={fade(f,30,60,300)}>{header('VENTRAL TEGMENTAL AREA (VTA)',100)}<path d={`M${vx} ${vy}L650 175H590`} stroke={C.gray} strokeWidth={1.5} fill="none"/></g>
    <g opacity={inset}>
      <path d={`M${vx} ${vy}L${ix-180*ss} ${iy+115*ss}`} stroke={C.gray} strokeWidth={2}/>
      <g transform={`translate(${ix} ${iy}) scale(${ss})`}>
        <circle r={210} fill={C.bg} stroke={C.gray} strokeWidth={2}/>
        {[[-95,-60],[45,-45],[-85,70],[65,85],[0,-145]].map(([x,y],i)=><DopamineNeuron key={i} x={x} y={y} scale={.25} frame={f+i*20} color={i<3?C.yellow:C.gray} activity={i<3?progress(f,180,225):.08} opacity={i<3?1:.45} amount={progress(f,110+i*5,175)}/>) }
        <Label x={0} y={264} size={27} color={C.yellow}>DOPAMINE NEURONS</Label>
        <Label x={0} y={300} size={24} color={C.gray}>among other VTA cell types</Label>
        <Label x={0} y={-235} size={23} color={C.gray}>Conceptual magnification</Label>
      </g>
    </g>
    <g opacity={fade(f,315,355,590)}>{header('NUCLEUS ACCUMBENS (NAc)',110)}</g>
    <BrainRegionLabel region="NAc" camera={camera} x={1400} y={305} opacity={progress(f,330,370)}/>
    <g opacity={fade(f,390,425,590)}>{header('MESOLIMBIC DOPAMINE PATHWAY',905,C.yellow,29)}</g>
    <g opacity={fade(f,540,565,600)}>{header('REWARD-RELATED MOTIVATION',965,C.white,27)}</g>
  </g>;
};

const NeuronalLearning:React.FC=()=>{
  const f=useCurrentFrame()+600;
  const bars=ease(f,900,975);
  const reveal=progress(f,630,780);
  const spikes=getSpikeTimes('burst',.68);
  const flash=spikes.some(t=>Math.abs(f-(630+t*150))<4)?1:.2;
  const dot=ease(f,1080,1140);
  const [dx,dy]=curvePoint(dot,[[1160,450],[1260,580],[1141,720],[1141,830]]);
  return <g opacity={opacityFor(f,600,1200)}>
    <DopamineNeuron x={mix(700,1600,bars)} y={mix(350,365,bars)} scale={mix(1.15,.6,bars)} frame={f} amount={progress(f,600,665)} activity={f<900?flash:f>=1080&&f<1150?.9:.2}/>
    <DopamineSpikeTrain x={400} y={mix(720,850,bars)} width={1140} mode="burst" eventTime={.68} reveal={reveal} cursor={f<780} caption/>
    <g opacity={fade(f,610,640,690)}>{header('TONIC ACTIVITY')}</g>
    <g opacity={fade(f,700,725,780)}>{header('PHASIC BURST',130,C.yellow)}</g>
    <g opacity={fade(f,785,810,900)}><Label x={670} y={800} size={28} color={C.gray}>BASELINE FIRING</Label><Label x={1310} y={800} size={28} color={C.yellow}>BURST FIRING</Label></g>
    <RewardPredictionError x={690} y={320} expected={.25} actual={.75} amount={progress(f,910,975)} opacity={progress(f,900,945)} showDifference={progress(f,990,1040)}/>
    <g opacity={progress(f,990,1020)}>{header('REWARD PREDICTION ERROR',140,C.yellow)}<Label x={960} y={640} size={33}>Prediction Error = Outcome − Expectation</Label></g>
    <circle cx={dx} cy={dy} r={9} fill={C.yellow} opacity={Math.sin(dot*Math.PI)}/>
    <g opacity={progress(f,1095,1125)}>{header('BETTER THAN EXPECTED → BURST',745,C.yellow,29)}</g>
  </g>;
};

const FoodLearning:React.FC=()=>{
  const f=useCurrentFrame()+1200;
  const events=getFoodEvents(f);
  const compare=progress(f,1470,1500)*(1-progress(f,1560,1590));
  const roomOpacity=mix(1,.38,compare);
  const dip=events.omitted;
  return <g opacity={opacityFor(f,1200,1800)}>
    <FoodDeliveryExample frame={f} opacity={roomOpacity}/>
    <g opacity={1-compare}>
      <DopamineSpikeTrain x={400} y={850} width={1140} mode={dip?'dip':'burst'} eventTime={dip?events.eventTime:events.burstTime} spikeTimes={getFoodSpikeTimes(f)} reveal={events.reveal} cursor={f<1470||dip} caption/>
    </g>
    <g opacity={compare}>
      <CueRewardTimeline x={530} y={790} width={1050} mode="reward" label="Unexpected reward"/>
      <CueRewardTimeline x={530} y={925} width={1050} mode="cue" label="Learned cue"/>
    </g>
    <g opacity={fade(f,1220,1240,1290)}>{header('UNEXPECTED REWARD',140)}</g>
    <g opacity={fade(f,1390,1410,1560)}>{header('PREDICTIVE CUE',140)}</g>
    {!dip&&<RewardPulse x={1450} y={470} age={f-events.reward} opacity={f>=events.reward?1-progress(f,events.reward+25,events.reward+40):0} scale={Math.min(1,pop(f,events.reward))}/>}
    <g opacity={fade(f,1660,1690,1740)}>{header('WORSE THAN EXPECTED',140,C.red)}</g>
    <g opacity={progress(f,1740,1765)}>{header('NEGATIVE PREDICTION ERROR',140,C.red)}</g>
  </g>;
};

const UpdatingAndExperiments:React.FC=()=>{
  const f=useCurrentFrame()+1800;
  const updateOpacity=1-progress(f,1890,1920);
  const p=curvePoint(progress(f,1825,1880),[[1460,400],[1420,200],[1050,200],[960,360]]);
  return <g opacity={opacityFor(f,1800,2070)}>
    <g opacity={updateOpacity}>
      {header('UPDATE EXPECTATIONS')}
      <CueSymbol x={420} y={445}/><RewardSymbol x={960} y={445} scale={mix(.65,.38,ease(f,1820,1880))}/><RewardSymbol x={1500} y={445} opacity={.25}/>
      <AnimatedArrow x={530} y={445} length={310} amount={progress(f,1800,1830)}/><AnimatedArrow x={1070} y={445} length={310} amount={progress(f,1800,1830)}/>
      <path d="M1460 400C1420 200 1050 200 960 360l-2 -25M960 360l23 -12" fill="none" stroke={C.yellow} strokeWidth={3} {...draw(progress(f,1825,1880))}/>
      <circle cx={p[0]} cy={p[1]} r={6} fill={C.yellow} opacity={progress(f,1825,1830)}/>
      <Label x={420} y={560} size={26} color={C.gray}>CUE</Label><Label x={960} y={560} size={26} color={C.gray}>EXPECTATION</Label><Label x={1500} y={560} size={26} color={C.gray}>OUTCOME</Label>
      <DopamineNeuron x={650} y={770} scale={.42} frame={f}/><AnimatedArrow x={850} y={770} length={300} amount={progress(f,1830,1880)} color={C.blue}/><ProcessorIllustration x={1270} y={770} scale={.42} frame={f} signal={.7}/>
      <Label x={960} y={955} size={28} color={C.blue}>BIOLOGICAL LEARNING ↔ COMPUTATIONAL LEARNING</Label>
    </g>
    <g opacity={progress(f,1890,1920)}>
      <RodentExperimentIllustration frame={f}/>
      {f<1980?header('NEURAL STIMULATION CAN SUPPORT LEARNING',150,C.white,32):header('INHIBITION CAN MIMIC A NEGATIVE SIGNAL',150,C.red,32)}
    </g>
  </g>;
};

export const ENDING_CAMERA05:BrainCamera={x:820,y:480,scale:1.25,anteriorRight:true};
export const getLearnedValue05=(frame:number)=>mix(mix(.35,.78,ease(frame,2250,2340)),.5,ease(frame,2340,2370));
/** Reuse frame 2370 for the next scene's first frame. */
export const AccumbensInputsArtwork:React.FC<{frame:number}>=({frame})=>{
  const f=Math.min(frame,T05.hold);
  const inputs=progress(f,2160,2250),surround=mix(1,.35,ease(f,2340,2370));
  const [nx,ny]=anatomyToScreen(BRAIN_REGIONS.NAc.center,ENDING_CAMERA05);
  const callouts=[{region:'PFC' as const,x:1440,y:270,label:'PREFRONTAL CORTEX (PFC)'},{region:'vHPC' as const,x:365,y:900,label:'VENTRAL HIPPOCAMPUS'},{region:'BLA' as const,x:1350,y:875,label:'BASOLATERAL AMYGDALA'}];
  return <g>
    <BrainAnatomy {...ENDING_CAMERA05} cortexOpacity={.65} frame={f} highlights={{VTA:1,NAc:1,PFC:inputs*surround,vHPC:inputs*surround,BLA:inputs*surround}} pathwayProgress={{mesolimbic:1,mesocortical:.15}} pathwayOpacity={{mesolimbic:1,mesocortical:.15}} activity={{mesolimbic:.45}}/>
    {Object.keys(NAc_INPUTS).map((region,i)=><NeuralInputPathway key={region} region={region as keyof typeof NAc_INPUTS} camera={ENDING_CAMERA05} frame={f-2250} amount={progress(f,2160+i*15,2220+i*15)} activity={progress(f,2250,2280)*surround}/>) }
    {callouts.map(({region,x,y,label},i)=>{
      const [rx,ry]=anatomyToScreen(BRAIN_REGIONS[region].center,ENDING_CAMERA05);
      return <g key={region} opacity={progress(f,2160+i*15,2190+i*15)}><path d={`M${rx} ${ry}L${x} ${region==='PFC'?y+18:y-27}`} stroke={C.gray} strokeWidth={1.5} fill="none"/><Label x={x} y={y} size={25} color={C.blue}>{label}</Label></g>;
    })}
    <BrainRegionLabel region="VTA" camera={ENDING_CAMERA05} x={700} y={835}/>
    <g opacity={progress(f,2250,2280)}><ellipse cx={nx-4} cy={ny} rx={10} ry={7} fill={C.yellow} opacity={.35}/><path d={`M${nx} ${ny}L1080 660`} stroke={C.gray} strokeWidth={1.5}/><Label x={1120} y={700} size={25}>NAc core</Label></g>
    <g opacity={1-progress(f,2340,2360)}>{header('NUCLEUS ACCUMBENS (NAc)',110)}</g>
    <g opacity={progress(f,2340,2370)}>{header('LEARNED VALUE CAN CHANGE',110)}</g>
    <g opacity={progress(f,2250,2280)}>
      <CueSymbol x={1670} y={280} scale={.6}/>
      <Label x={1670} y={410} size={25} color={C.yellow}>MOTIVATIONAL</Label><Label x={1670} y={445} size={25} color={C.yellow}>VALUE</Label>
      <MotivationalValueIndicator x={1670} y={620} value={getLearnedValue05(f)}/>
    </g>
  </g>;
};
const InputsEnding:React.FC=()=>{
  const f=useCurrentFrame()+2070;
  return <g opacity={progress(f,2070,2100)}><AccumbensInputsArtwork frame={f}/></g>;
};

export const Scene05_DopamineRewardPredictionErrors:React.FC=()=>{
  const f=useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor:C.bg}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="VTA projections to nucleus accumbens, illustrative tonic and phasic dopamine firing, reward prediction errors, food-delivery cue learning, omitted-reward firing pauses, schematic rodent manipulations, and multiple inputs that shape learned motivational value.">
      <Sequence from={0} durationInFrames={660} layout="none"><AnatomicalIntroduction/></Sequence>
      <Sequence from={600} durationInFrames={630} layout="none"><NeuronalLearning/></Sequence>
      <Sequence from={1200} durationInFrames={630} layout="none"><FoodLearning/></Sequence>
      <Sequence from={1800} durationInFrames={300} layout="none"><UpdatingAndExperiments/></Sequence>
      <Sequence from={2070} durationInFrames={330} layout="none"><InputsEnding/></Sequence>
      {CITATIONS05.map(({from,to,source})=><g key={from} opacity={progress(f,from,from+12)*(1-progress(f,to-12,to))}><SourceCitation frame={f} source={source}/></g>)}
    </svg>
  </AbsoluteFill>;
};
