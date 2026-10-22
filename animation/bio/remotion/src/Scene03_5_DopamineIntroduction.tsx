import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {AnimatedArrow, C, HumanCharacter, Label, SourceCitation} from './components';
import {draw, ease, fade, mix, pop, progress} from './motion';
import {RewardSymbol, WarningSymbol} from './risk-components';
import {RewardPulse, SimpleNeuron} from './reward-components';
import {DopamineHandoff} from './Scene03_AddictionAndRewardLearning';
import {CocaineContainer, Cookie, CookiePlate, DopamineCircuitBridge, DopamineMessenger, Pair, ShoppingBag, Smile} from './dopamine-introduction-components';

export const SCENE03_5={width:1920,height:1080,fps:30,durationInFrames:1950} as const;
// Hold at 32 seconds for three extra seconds; cut the original 42–47s tail
// (45–50s after the hold), jumping directly into learning and motivation.
// At 52 seconds, skip another five seconds to the expected/actual reward scene.
// Hold the completed comparison for two extra seconds before the neuron handoff.
export const cocaineTimelineFrame=(frame:number)=>frame<960?frame:frame<1050?960:frame<1350?frame-90:frame<1560?frame+60:frame<1800?frame+210:frame<1860?2010:frame+150;
export const T035={bridge:0,messenger:150,everyday:360,cookie:630,cocaine:810,hold:960,resume:1050,beyondPleasure:1080,notQuite:1170,complex:1260,motivation:1350,seek:1440,avoid:1530,prediction:1560,actual:1650,error:1680,formula:1740,handoff:1890,brain:1920,end:1950} as const;
export const getDopamineIntroductionState=(frame:number)=>({
  pleasureVisible:frame>=T035.beyondPleasure&&frame<T035.motivation,
  predictionVisible:frame>=T035.prediction&&frame<T035.handoff+30,
  citation:frame>=T035.beyondPleasure&&frame<T035.motivation?'Volkow et al., 2011':frame>=T035.motivation&&frame<T035.prediction?'Bromberg-Martin et al., 2010':null,
});
const stage=(f:number,start:number,end:number)=> (start===0?1:progress(f,start,start+20))*(1-progress(f,end,end+20));
const Title:React.FC<{f:number;start:number;text:string;y?:number;color?:string}>=({f,start,text,y=170,color=C.white})=><g opacity={progress(f,start,start+24)} transform={`translate(0 ${15*(1-ease(f,start,start+24))})`}><Label x={960} y={y} size={38} color={color}>{text}</Label></g>;

const Bridge:React.FC<{f:number}>=({f})=><g opacity={stage(f,0,150)}>
  <DopamineHandoff frame={1680+f} neuronOpacity={mix(1,2.8,ease(f,40,110))} particleTransform={`translate(${-40*ease(f,0,120)} 0)`}/>
  <g transform={`translate(0 ${-30*ease(f,60,120)})`}>
    {['WHAT','HAPPENS','INSIDE','THE','BRAIN?'].map((w,i)=><g key={w} opacity={progress(f,i*9,i*9+20)}><Label x={[490,655,935,1150,1280][i]} y={230} anchor="start" size={38} color={i===4?C.yellow:C.white}>{w}</Label></g>)}
  </g>
  <DopamineMessenger x={1120} y={500} frame={f} scale={mix(.1,1,ease(f,110,145))} amount={progress(f,110,140)}/>
  <g opacity={progress(f,120,145)}><Label x={1250} y={510} anchor="start" color={C.yellow} size={32}>DOPAMINE</Label></g>
</g>;

export const NeurotransmitterIllustration:React.FC<{f:number}>=({f})=>{
  const zoom=ease(f,150,210);
  return <g opacity={stage(f,150,360)}>
    <defs><clipPath id="dopamine-left-neuron"><path d="M0 0H860V1080H0Z"/></clipPath><clipPath id="dopamine-right-neuron"><path d="M1060 0H1920V1080H1060Z"/></clipPath></defs>
    <g clipPath="url(#dopamine-left-neuron)"><g transform={`translate(${mix(0,-90,zoom)} 0)`}>
      <SimpleNeuron x={mix(880,520,zoom)} y={540} scale={mix(1.3,1.65,zoom)} amount={mix(.72,1,zoom)} opacity={.8}/>
    </g></g>
      <g clipPath="url(#dopamine-right-neuron)"><g transform="translate(1920 0) scale(-1 1)"><SimpleNeuron x={520} y={540} scale={1.65} amount={progress(f,170,230)} opacity={.8}/></g>
    </g>
    <g opacity={progress(f,210,240)} fill="none" stroke={C.blue} strokeWidth={5} strokeLinecap="round"><path d="M860 390Q935 540 860 690M1060 390Q985 540 1060 690" {...draw(progress(f,200,240))}/></g>
    {Array.from({length:7},(_,i)=>{const t=((Math.max(0,f-210)+i*13)%90)/90;return <g key={i} opacity={progress(f,210+i*3,230+i*3)}><circle cx={mix(888,1032,t)} cy={455+i*28+Math.sin(t*Math.PI*2+i)*9} r={12} fill={C.yellow} opacity={.08}/><circle cx={mix(888,1032,t)} cy={455+i*28+Math.sin(t*Math.PI*2+i)*9} r={5} fill={C.yellow}/></g>;})}
    <Title f={f} start={155} text="DOPAMINE" color={C.yellow}/>
    <Title f={f} start={210} text="NEUROTRANSMITTER" y={820}/><Title f={f} start={270} text="CHEMICAL MESSENGER" y={880} color={C.gray}/>
  </g>;
};

export const EverydayRewardExamples:React.FC<{f:number}>=({f})=>{
  const focus=ease(f,465,525),cookieX=mix(1450,1200,focus),cookieY=mix(520,565,focus);
  return <g opacity={stage(f,360,T035.cookie)}>
    {[470,960,1450].map((x,i)=>{const a=progress(f,360+i*10,395+i*10);const start=420+i*15;const hi=progress(f,start,start+5)*(1-progress(f,start+10,start+15));return <g key={i} opacity={a*(i<2?1-focus:1)} transform={`translate(${i===2?cookieX:x} ${i===2?cookieY:520}) scale(${i===2?mix(1,1.3,focus):1-.12*focus})`}>
      <circle r={170} stroke={C.white} strokeWidth={2} fill={C.yellow} fillOpacity={.04*hi} opacity={.35}/><circle r={175} stroke={C.yellow} strokeWidth={2} fill="none" opacity={hi*.5}/>
      {i===0?<Pair frame={f} amount={a}/>:i===1?<ShoppingBag amount={a}/>:<CookiePlate amount={a} frame={f}/>}
      {[0,1,2,3].map(j=><circle key={j} cx={Math.cos(j*1.8+i)*142} cy={Math.sin(j*1.8+i)*142-7*Math.sin(f*.04+j)} r={4+j%2} fill={C.yellow} opacity={hi}/>)}
    </g>;})}
    <HumanCharacter x={760} y={730} scale={.85} frame={f} amount={progress(f,600,T035.cookie)} naturalMotion expression="curious" look={5}/>
  </g>;
};

export const CookieReinforcementExample:React.FC<{f:number}>=({f:frame})=>{
  // Start at 21 seconds and retain the 27-second handoff to cocaine.
  const f=frame<810?600+(frame-T035.cookie)*(210/(810-T035.cookie)):frame;
  const first=ease(f,610,638)*(1-ease(f,655,672));
  const second=ease(f,722,742)*(1-ease(f,758,775));
  const reach=Math.max(first,second);
  const personX=mix(760,1030,ease(f,600,630));
  const eating=Math.max(fade(f,638,645,657),fade(f,742,750,762));
  return <g opacity={stage(frame,T035.cookie,810)}>
    <HumanCharacter x={personX} y={730} scale={.85} frame={f} naturalMotion rightHand={{x:(mix(1160,personX+10,reach)-personX)/.85,y:(mix(570,628,eating)-730)/.85}} expression={f>640?'satisfied':'curious'} look={5}/>
    <CookiePlate x={1200} y={565} scale={1.3} frame={f}/>
    <g opacity={progress(f,610,625)*(1-progress(f,780,800))}>
      <Cookie x={mix(1160,personX+10,reach)} y={mix(570,628,eating)} scale={.52} opacity={1-eating*.85}/>
    </g>
    <RewardPulse x={810} y={485} age={f-645}/><RewardPulse x={810} y={485} age={f-750}/>
    <path d="M820 770Q1000 880 1190 680" fill="none" stroke={C.yellow} strokeWidth={mix(2,5,ease(f,660,780))} {...draw(progress(f,660,720))}/>
    <AnimatedArrow x={940} y={750} length={150} color={C.yellow} amount={progress(f,690,730)}/>
    <Title f={f} start={660} text="POSITIVE REINFORCEMENT" color={C.yellow}/>
    <Title f={f} start={780} text="REWARD → REPEAT BEHAVIOR" y={920} color={C.yellow}/>
  </g>;
};

/** Sparse lightning accents and drifting clouds, behind the cocaine illustration. */
export const CocaineStorm:React.FC<{f:number}>=({f})=>{
  const amount=progress(f,810,835)*(1-progress(f,1080,1100));
  const strikes=[{at:826,path:'M310 0L270 100 325 92 252 225 277 141 225 150 260 0'}, {at:900,path:'M1660 0L1610 125 1670 110 1580 285 1615 171 1565 185 1605 0'}, {at:955,path:'M310 0L270 100 325 92 252 225 277 141 225 150 260 0'}, {at:1010,path:'M1660 0L1610 125 1670 110 1580 285 1615 171 1565 185 1605 0'}, {at:1062,path:'M310 0L270 100 325 92 252 225 277 141 225 150 260 0'}];
  return <g opacity={amount} aria-label="Dark storm clouds and lightning">
    <defs><radialGradient id="cocaine-storm-vignette"><stop offset="0%" stopColor="#101827" stopOpacity=".1"/><stop offset="100%" stopColor="#02040b" stopOpacity=".95"/></radialGradient></defs>
    <rect width="1920" height="1080" fill="#050811" opacity=".75"/>
    <rect width="1920" height="1080" fill="url(#cocaine-storm-vignette)"/>
    {[180,570,980,1390,1770].map((x,i)=><ellipse key={i} cx={x+12*Math.sin(f*.008+i)} cy={30+i%2*30} rx={290} ry={115} fill="#20293d" opacity=".38"/>)}
    {strikes.map(({at,path})=>{
      const flash=progress(f,at,at+3)*(1-progress(f,at+6,at+18));
      return <g key={at} opacity={flash}>
        <ellipse cx={960} cy={80} rx={1050} ry={380} fill="#a8badf" opacity=".06"/>
        <path d={path} fill="#7295cf" stroke="#7295cf" strokeWidth={14} opacity=".12"/>
        <path d={path} fill="#d6e5ff" opacity=".85"/>
      </g>;
    })}
  </g>;
};

// The strike is already fully visible at frame 840 (exactly 28 seconds).
export const largeLightningOpacity=(frame:number)=>frame<840?0:1-progress(frame,840,858);
export const ScreenLightning:React.FC<{f:number}>=({f})=><g opacity={largeLightningOpacity(f)} aria-label="Large lightning strike at 28 seconds" pointerEvents="none">
  <rect width="1920" height="1080" fill="#d6e5ff" opacity=".14"/>
  <path d="M160 0L650 235 565 310 1130 545 980 635 1700 1080M1130 545L1450 465 1370 575 1870 710M650 235L340 420 405 505 75 690" fill="none" stroke="#7295cf" strokeWidth={44} opacity=".25"/>
  <path d="M160 0L650 235 565 310 1130 545 980 635 1700 1080M1130 545L1450 465 1370 575 1870 710M650 235L340 420 405 505 75 690" fill="none" stroke="#e9f3ff" strokeWidth={9} strokeLinejoin="miter"/>
</g>;

export const CocaineReinforcementExample:React.FC<{f:number}>=({f})=>{
  const shift=ease(f,810,870),association=progress(f,870,950);
  return <g opacity={stage(f,810,990)}>
    <CookiePlate x={mix(1200,440,shift)} y={mix(565,540,shift)} scale={mix(1.3,.8,shift)} frame={f}/>
    <HumanCharacter x={mix(760,960,shift)} y={730} scale={.85} frame={f} naturalMotion expression="conflicted" look={5}/>
    <CocaineContainer x={1480} y={535} amount={progress(f,820,870)} opacity={progress(f,820,845)}/>
    <g opacity={progress(f,840,860)}><Label x={1480} y={720} size={30} color={C.red}>COCAINE</Label></g>
    <path d="M1000 770Q1280 850 1450 660" fill="none" stroke={C.yellow} strokeWidth={5} {...draw(association)}/><path d="M1000 770Q1280 850 1450 660" fill="none" stroke={C.yellow} strokeWidth={18} opacity={.08*association} {...draw(association)}/>
    <RewardPulse x={1440} y={510} age={f-880} strength={1.5}/><WarningSymbol x={1640} y={520} scale={.7} amount={progress(f,890,920)} opacity={progress(f,890,910)}/>
    <Title f={f} start={930} text="POWERFUL REINFORCEMENT" color={C.yellow}/>
    <g opacity={progress(f,930,960)}><Label x={960} y={240} size={32}>CAN CONTRIBUTE TO <tspan fill={C.red}>ADDICTION</tspan></Label></g>
  </g>;
};

export const DopamineBeyondPleasure:React.FC<{f:number}>=({f})=>{
  const branching=progress(f,1290,1410);
  return <g opacity={stage(f,990,1410)}>
    <DopamineMessenger x={mix(790,960,ease(f,1170,1290))} y={500} scale={1.6} frame={f}/>
    <g opacity={1-progress(f,1170,1210)}>
      <Smile x={1200} y={500} scale={mix(1,.7,ease(f,1080,1170))}/>
      <path d="M900 500H1080" stroke={C.white} strokeWidth={3} {...draw(progress(f,1010,1060))}/>
      <path d="M900 560L1090 440" stroke={C.red} strokeWidth={6} strokeLinecap="round" {...draw(progress(f,1080,1135))}/>
      <Title f={f} start={990} text="THE PLEASURE MOLECULE?"/>
      <Title f={f} start={1080} text="NOT QUITE" y={770} color={C.red}/>
    </g>
    <g opacity={progress(f,1170,1200)}><Label x={960} y={180} size={36}><tspan fill={C.yellow}>MORE COMPLEX</tspan> THAN JUST REWARD</Label></g>
    {[-1,1].map(side=><path key={side} d={`M960 580Q960 680 ${960+side*470} 730`} stroke={C.yellow} strokeWidth={3} fill="none" {...draw(branching)}/>)}
  </g>;
};

export const RewardAvoidanceExample:React.FC<{f:number}>=({f})=>{
  const seek=ease(f,1500,1580),avoid=ease(f,1610,1680),both=ease(f,1680,1720);
  return <g opacity={stage(f,1410,1770)}>
    <DopamineMessenger x={960} y={300} frame={f} amount={progress(f,1410,1450)}/>
    <RewardSymbol x={390} y={590} scale={1.2} amount={progress(f,1410,1450)}/><WarningSymbol x={1530} y={590} scale={1.2} amount={progress(f,1410,1450)}/>
    <g opacity={1-progress(f,1590,1610)+both}>
      <HumanCharacter x={mix(860,570,seek)} y={750} scale={.78} frame={f} naturalMotion walking={Math.sin(seek*Math.PI)} expression="recognition" look={-5}/>
      <AnimatedArrow x={500} y={825} length={290} color={C.green} amount={seek}/>
      <g opacity={progress(f,1500,1530)}><Label x={630} y={900} color={C.green} size={30}>SEEK REWARD</Label></g>
    </g>
    <g opacity={progress(f,1590,1610)}>
      <HumanCharacter x={mix(1410,1150,avoid)} y={750} scale={.78} frame={f} naturalMotion walking={Math.sin(avoid*Math.PI)} expression="conflicted" look={mix(5,-5,avoid)}/>
      <g transform="translate(1440 825) scale(-1 1)"><AnimatedArrow x={0} y={0} length={290} color={C.red} amount={avoid}/></g>
      <Label x={1260} y={900} color={C.red} size={30}>AVOID HARM</Label>
    </g>
    {[-1,1].map(side=><path key={side} d={`M960 360Q960 450 ${960+side*400} 550`} stroke={C.yellow} strokeWidth={3} fill="none" {...draw(progress(f,1410,1470))}/>)}
    <RewardPulse x={570} y={550} age={f-1570}/><Title f={f} start={1680} text="LEARNING + MOTIVATION" color={C.yellow}/>
  </g>;
};

export const RewardPredictionErrorIntroduction:React.FC<{f:number}>=({f})=>{
  const actual=progress(f,1860,1910),amount=progress(f,1770,1810),out=1-progress(f,2040,2070);
  return <g>
    <g opacity={amount*out}>
      <HumanCharacter x={420} y={650} scale={.78} frame={f} expression={f<1860?'curious':'satisfied'} look={5}/>
      <g transform="translate(-180 160)"><path d="M550 270Q500 205 565 170Q645 110 740 165Q820 205 770 265Q700 310 620 275L590 310 600 278Z" stroke={C.white} strokeWidth={3} fill={C.bg} {...draw(amount)}/><Cookie x={665} y={225} scale={.65}/></g>
      <Cookie x={1230} y={430} scale={.8}/><Cookie x={1340} y={430} scale={.8} opacity={actual}/>
      <Label x={790} y={650} size={25} color={C.gray} anchor="end">EXPECTED REWARD</Label><Label x={790} y={745} size={25} color={C.gray} anchor="end">ACTUAL REWARD</Label>
      <path d="M840 635H1440M840 730H1440" stroke={C.white} opacity={.15} strokeWidth={2}/>
      <path d="M840 635H1090" stroke={C.blue} strokeWidth={24} {...draw(amount)}/><path d={`M840 730H${1090+250*actual}`} stroke={C.green} strokeWidth={24} {...draw(amount)}/>
      <path d="M1090 635V785H1340V730" fill="none" stroke={C.yellow} strokeWidth={3} {...draw(actual)}/>
      <Title f={f} start={1890} text="REWARD PREDICTION ERROR" color={C.yellow}/>
      <Title f={f} start={1950} text="ACTUAL OUTCOME − EXPECTED OUTCOME" y={905} color={C.gray}/>
      <RewardPulse x={1215} y={775} age={f-1950}/>
    </g>
    <g opacity={progress(f,2040,2070)}><DopamineCircuitBridge frame={Math.max(0,f-2070)}/></g>
  </g>;
};

// Playback ranges include short crossfades, except at the two requested cuts.
const sections=[
  {from:0,to:170,component:Bridge},
  {from:150,to:380,component:NeurotransmitterIllustration},
  {from:360,to:650,component:EverydayRewardExamples},
  {from:630,to:830,component:CookieReinforcementExample},
  {from:810,to:1100,component:CocaineReinforcementExample},
  {from:1080,to:1350,component:DopamineBeyondPleasure},
  {from:1350,to:1560,component:RewardAvoidanceExample},
  {from:1560,to:1950,component:RewardPredictionErrorIntroduction},
];
export const Scene03_5_DopamineIntroduction:React.FC=()=>{
  const frame=useCurrentFrame();const f=cocaineTimelineFrame(frame);const state=getDopamineIntroductionState(frame);
  return <AbsoluteFill style={{backgroundColor:C.bg}}><svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="Dopamine as a chemical messenger in reinforcement, learning and motivation; expected versus actual reward introduces reward prediction errors.">
    <CocaineStorm f={frame}/>
    {sections.map(({from,to,component:Part})=><Sequence key={from} from={from} durationInFrames={to-from} layout="none"><Part f={f}/></Sequence>)}
    <ScreenLightning f={frame}/>
    {state.citation&&<g opacity={state.citation.startsWith('Volkow')?fade(f,990,1020,1380):fade(f,1410,1440,1740)}><SourceCitation frame={f} source={state.citation}/></g>}
  </svg></AbsoluteFill>;
};
