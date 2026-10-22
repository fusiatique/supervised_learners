import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {AnimatedArrow, C, HumanCharacter, Label, SourceCitation} from './components';
import {curvePoint, draw, ease, fade, mix, pop, progress} from './motion';
import {CapsuleSymbol, CROSSROADS, CrossroadsPaths, RewardSymbol, WarningSymbol} from './risk-components';
import {BrokenHeart, CueSymbol, LearnedAssociation, RewardPulse, SimpleNeuron} from './reward-components';

export const SCENE03={width:1920,height:1080,fps:30,durationInFrames:2340,openingFrames:180,bridgeFrom:1050,bridgeFrames:240,addictionHold:60,reinforcementHold:60} as const;
export const scene03StoryFrame=(frame:number)=>{
  // Hold the fully visible addiction title at scene second 12 for two extra seconds.
  const reinforcementFrame=frame<540?frame:Math.max(540,frame-SCENE03.reinforcementHold);
  const f=reinforcementFrame<180?reinforcementFrame:Math.max(180,reinforcementFrame-SCENE03.addictionHold);
  return f<750?f:Math.max(750,f-SCENE03.bridgeFrames);
};
export const T03={
  addiction:0, initialReward:240, positiveReinforcement:420, repeatedLearning:480,
  diagramMorph:750, goneTooFar:810, climaxTitle:930, rewardLearning:990,
  naturalExampleEnd:1320, drugComparison:1380, strongerSignals:1470,
  particles:1560, neuron:1620, end:1680,
} as const;

export const getScene03Timing=(frame:number)=>({
  climaxOpacity:progress(frame,T03.climaxTitle,960)*(1-progress(frame,T03.rewardLearning,1050)),
  instructionOpacity:progress(frame,T03.rewardLearning,1050),
  citationOpacity:fade(frame,360,385,885),
  diagramOpacity:1-progress(frame,T03.neuron,1670),
});

const DRUG_TRIPS=[{back:0,start:60,end:96},{back:96,start:123,end:150},{back:240,start:300,end:345},{back:480,start:517,end:555},{back:570,start:609,end:648},{back:660,start:699,end:738}];

/** Each repeated choice retraces the same cubic route; no reset teleports. */
export const getAddictionPose=(frame:number)=>{
  const f=Math.max(0,frame);
  let t=1,walk=0;
  for(const trip of DRUG_TRIPS){
    if(f<trip.back)break;
    if(f<trip.start){t=1-ease(f,trip.back,trip.start);walk=Math.sin(progress(f,trip.back,trip.start)*Math.PI);}
    else if(f<trip.end){t=ease(f,trip.start,trip.end);walk=Math.sin(progress(f,trip.start,trip.end)*Math.PI);}
    else{t=1;walk=0;}
  }
  const [routeX,routeY]=curvePoint(t,CROSSROADS.uncertain);
  const morph=ease(f,T03.diagramMorph,T03.goneTooFar);
  const drawnToward=ease(f,870,927);
  return {x:mix(routeX,960-230*drawnToward,morph),footY:mix(routeY,780-65*drawnToward,morph),walking:walk*(1-morph)+Math.sin(drawnToward*Math.PI)*morph,t};
};

const AddictionStory: React.FC<{intro?:boolean}> = ({intro=false}) => {
  const frame=useCurrentFrame();
  // Retrace a complete choice during the question, returning to the original starting pose.
  const f=intro?frame*96/179:scene03StoryFrame(frame);
  const circleFrame=intro?f:f+96;
  const pose=getAddictionPose(f);
  const diagram=ease(f,T03.diagramMorph,T03.goneTooFar);
  const strength=progress(f,T03.repeatedLearning,T03.goneTooFar);
  const warningsDim=mix(1,.3,ease(f,240,285));
  const outcomeAge=f<570?f-555:f<660?f-648:f-738;
  const reward=pop(f,345);
  const dot=ease(f,360,420);
  const rewardX=mix(1550,1420,diagram);
  const rewardY=mix(mix(225,165,dot),610,diagram);
  const climax=ease(f,810,870);
  const pulseX=mix(rewardX,850,climax),pulseY=mix(rewardY,380,climax);
  const scale=mix(1,1.32,ease(f,810,870));
  return <g opacity={1-progress(f,T03.rewardLearning,T03.rewardLearning+60)}>
    <g opacity={1-diagram}>
      <g opacity={.88}><CrossroadsPaths amount={1} safeHighlight={1} riskyDim={1} drug={1} finalDim={1}/></g>
      <RewardSymbol x={375} y={350} opacity={.88*(1-.3*strength)}/>
      <CapsuleSymbol x={1550} y={350}/>
      <WarningSymbol x={1670} y={237} opacity={warningsDim}/>
      <g opacity={fade(f,150,190,240)}><WarningSymbol x={1560} y={530} scale={.7} amount={progress(f,150,178)}/><WarningSymbol x={1305} y={600} scale={.6} amount={progress(f,175,205)}/><BrokenHeart x={1710} y={590} scale={.7} amount={progress(f,172,215)} opacity={.65}/></g>
      <g opacity={fade(circleFrame,28,50,306)} stroke={C.yellow} strokeWidth={3} fill="none"><path d="M1058 418A45 45 0 1 1 1081 380M1080 363L1081 380 1064 379" {...draw(progress(circleFrame,28,65))}/></g>
      <g opacity={progress(f,360,405)}><LearnedAssociation d="M1550 305Q1635 240 1550 165" amount={progress(f,360,420)} strength={strength}/></g>
      {f>=480&&<RewardPulse x={1550} y={225} age={outcomeAge} opacity={outcomeAge>=0&&outcomeAge<=45?1:0} strength={1+.25*strength}/>}
    </g>
    <g opacity={diagram}>
      <CapsuleSymbol x={500} y={610} scale={scale}/>
      <RewardSymbol x={1420} y={mix(810,610,climax)} scale={.8} opacity={.5}/>
      <LearnedAssociation d={`M580 590Q${(580+pose.x-60)/2} 460 ${pose.x-60} 578`} amount={progress(f,750,800)} strength={strength}/>
      <LearnedAssociation d={`M${pose.x+60} 578Q${Math.max(pose.x+60,pulseX-42)+100} ${(578+pulseY)/2} ${pulseX-42} ${pulseY}`} amount={progress(f,770,810)} strength={strength}/>
      <WarningSymbol x={500} y={455} scale={.85} opacity={progress(f,870,895)}/>
      <path d={`M${pose.x-85} 561l25 17 -4 -29`} fill="none" stroke={C.yellow} strokeWidth={4} opacity={progress(f,795,810)} strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <g transform={`translate(${pose.x} ${pose.footY-64-Math.abs(Math.sin(f*.33))*3*pose.walking})`}>
      <HumanCharacter frame={f===0?660:f} naturalMotion walking={pose.walking} expression={f>=345&&f<385?'satisfied':f>=240&&f<345?'curious':'conflicted'} look={diagram>.9?-5:5}/>
    </g>
    <g opacity={progress(f,345,360)}>
      <RewardPulse x={pulseX} y={pulseY} scale={mix(reward,mix(.2,1,diagram),dot)} age={f-345} plus={dot<.9||diagram>.5} strength={1+.3*strength}/>
      <circle cx={pulseX} cy={pulseY} r={6} fill={C.yellow} opacity={dot*(1-diagram)}/>
    </g>
    <g opacity={fade(f,155,180,240)}><Label x={960} y={135} size={44}>ADDICTION</Label><text x={960} y={192} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={29} fill={C.white}>CONTINUED USE DESPITE <tspan fill={C.red}>HARM</tspan></text></g>
    <g opacity={fade(f,420,445,480)}><Label x={960} y={140} size={38}>POSITIVE REINFORCEMENT</Label><Label x={960} y={195} size={28} color={C.yellow}>REWARD → MORE LIKELY TO REPEAT</Label></g>
    <g opacity={progress(f,T03.climaxTitle,960)} transform={`translate(0 ${16*(1-ease(f,930,960))})`}>
      <text x={960} y={205} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={49} fill={C.white}>REWARD LEARNING <tspan fill={C.red}>GONE TOO FAR</tspan></text>
    </g>
    <g opacity={getScene03Timing(f).citationOpacity}><SourceCitation frame={f} source="Feltenstein et al., 2009"/></g>
  </g>;
};

const NATURAL_TRIALS=[{back:1050,go:1080,arrive:1130,ring:1055},{back:1140,go:1170,arrive:1215,ring:1150},{back:1230,go:1257,arrive:1293,ring:1245}];
export const getNaturalLearningPose=(frame:number)=>{
  let t=0,walking=0;
  for(let i=0;i<NATURAL_TRIALS.length;i++){
    const trip=NATURAL_TRIALS[i];
    if(frame<trip.back)break;
    if(frame<trip.go){t=i===0?0:1-ease(frame,trip.back,trip.go);walking=i===0?0:Math.sin(progress(frame,trip.back,trip.go)*Math.PI);}
    else if(frame<trip.arrive){t=ease(frame,trip.go,trip.arrive);walking=Math.sin(progress(frame,trip.go,trip.arrive)*Math.PI);}
    else{t=1;walking=0;}
  }
  const settle=ease(frame,1320,1380);
  return {x:mix(mix(960,1320,t),960,settle),footY:780,walking:walking*(1-settle),t};
};

const SignalPath: React.FC<{frame:number;drug?:boolean;y:number;amount:number;dim?:number;showCharacter?:boolean;showSymbols?:boolean;actionX?:number}> = ({frame,drug=false,y,amount,dim=1,showCharacter=true,showSymbols=true,actionX=960}) => {
  const start=drug?1498:1470;
  const t=progress(frame,start,start+65);
  const x=mix(430,1490,t);
  const a=progress(frame,start,start+8)*(1-progress(frame,start+65,start+80));
  return <g opacity={amount*dim}>
    {showSymbols&&(drug?<CapsuleSymbol x={420} y={y} scale={.78}/>:<CueSymbol x={420} y={y} scale={.9}/>)}
    {showCharacter&&<HumanCharacter x={960} y={y+85} scale={.72} frame={frame} look={5} expression={drug?'conflicted':'recognition'}/>}
    {showSymbols&&(drug?<><RewardPulse x={1500} y={y} strength={1.5} age={frame-1563}/><WarningSymbol x={1640} y={y} scale={.55}/></>:<RewardSymbol x={1500} y={y} scale={.85}/>)}
    <AnimatedArrow x={520} y={y} length={actionX-640} amount={amount} color={drug?C.red:C.green}/>
    <AnimatedArrow x={actionX+100} y={y} length={1290-actionX} amount={amount} color={C.yellow}/>
    <g opacity={a}><circle cx={x} cy={y} r={drug?38:15} fill={C.yellow} opacity={.09}/><circle cx={x} cy={y} r={drug?13:6} fill={C.yellow}/></g>
  </g>;
};

/** Reusable particle/neuron handoff for the following dopamine scene. */
export const DopamineHandoff: React.FC<{frame:number;neuronOpacity?:number;particleOpacity?:number;particleTransform?:string}> = ({frame,neuronOpacity=1,particleOpacity=1,particleTransform}) => {
  const appear=progress(frame,T03.particles,T03.particles+35);
  const organize=ease(frame,T03.neuron,T03.end);
  return <g opacity={appear}>
    <g opacity={particleOpacity} transform={particleTransform}>{Array.from({length:9},(_,i)=>{
      const angle=i*Math.PI*2/9;
      const x=mix(1490+Math.cos(angle)*60,880+Math.cos(angle)*165,organize)+Math.sin(frame*.035+i)*4;
      const y=mix(720+Math.sin(angle)*50,540+Math.sin(angle)*120,organize)+Math.cos(frame*.03+i)*4;
      return <g key={i}><circle cx={x} cy={y} r={16} fill={C.yellow} opacity={.065}/><circle cx={x} cy={y} r={5} fill={C.yellow}/></g>;
    })}</g>
    <SimpleNeuron x={880} y={540} scale={1.3} amount={progress(frame,T03.neuron,T03.end)*.72} opacity={.3*progress(frame,T03.neuron,T03.end)*neuronOpacity}/>
  </g>;
};

// Extend the two-character comparison by four seconds, preserving the neuron handoff.
export const scene03TimelineFrame=(frame:number)=>frame<1470?frame:frame<1680?1470+(frame-1470)*(90/210):frame-120;

const RewardLearning: React.FC = () => {
  const f=scene03TimelineFrame(useCurrentFrame()+T03.rewardLearning);
  const pose=getNaturalLearningPose(f);
  const layout=ease(f,1320,1380);
  const compare=ease(f,1380,1470);
  const rowY=mix(610,390,compare);
  const naturalOpacity=mix(1,.68,ease(f,1560,1615));
  const diagramsOpacity=getScene03Timing(f).diagramOpacity;
  const exampleOpacity=1-layout;
  const ring=NATURAL_TRIALS.reduce((v,trip)=>Math.max(v,progress(f,trip.ring,trip.ring+24)*(1-progress(f,trip.ring+24,trip.ring+25))),0);
  const trial=NATURAL_TRIALS.filter(trip=>f>=trip.arrive).length;
  const lastArrival=[1130,1215,1293].filter(v=>f>=v).at(-1);
  return <g opacity={getScene03Timing(f).instructionOpacity}>
    <g opacity={diagramsOpacity}>
      <g opacity={exampleOpacity}>
        <path d="M490 690H1400" stroke={C.white} strokeWidth={3} opacity={.2} fill="none" {...draw(progress(f,1010,1050))}/>
        <LearnedAssociation d="M470 570Q960 315 1450 570" amount={progress(f,1180,1293)} strength={trial/3}/>
        <g opacity={fade(f,1060,1072,1100)} transform={`translate(1050 510) scale(${pop(f,1060)})`}><Label x={0} y={0} size={40} color={C.yellow}>?</Label></g>
        {lastArrival!==undefined&&<RewardPulse x={1500} y={480} age={f-lastArrival} opacity={1-progress(f,lastArrival+35,lastArrival+50)}/>}
      </g>
      <g opacity={layout}>
        <SignalPath frame={f} y={rowY} amount={1} dim={naturalOpacity} showCharacter={false} showSymbols={false} actionX={pose.x}/>
        <g opacity={1-progress(f,1470,1510)}>
          <Label x={420} y={rowY+175} size={30} color={C.yellow}>CUE</Label><Label x={pose.x} y={rowY+175} size={30}>ACTION</Label><Label x={1500} y={rowY+175} size={30} color={C.green}>REWARD</Label>
        </g>
      </g>
      <g opacity={mix(1,naturalOpacity,layout)}>
        <CueSymbol x={420} y={rowY} scale={mix(1,.9,layout)} amount={progress(f,1000,1050)} ring={ring*(1-layout)}/>
        <RewardSymbol x={1500} y={rowY} scale={mix(1,.85,layout)} amount={progress(f,1010,1050)}/>
        <HumanCharacter x={pose.x} y={mix(pose.footY-64,rowY+85,layout)-Math.abs(Math.sin(f*.33))*3*pose.walking} scale={mix(1,.72,layout)} frame={f} walking={pose.walking} naturalMotion expression={layout>.5?'recognition':trial>0?'satisfied':'curious'} look={f<1080?-5:5}/>
      </g>
      <SignalPath frame={f} drug y={735} amount={progress(f,1380,1470)}/>
    </g>
    <DopamineHandoff frame={f}/>
  </g>;
};

const OpeningQuestion: React.FC = () => {
  const frame=useCurrentFrame();
  return <g opacity={progress(frame,0,12)*(1-progress(frame,160,180))}>
    <Label x={960} y={95} size={28} color={C.yellow}>This raises an important question:</Label>
    <Label x={960} y={155} size={42}>Why would someone continue making a choice,</Label>
    <Label x={960} y={215} size={42}>even when they know it causes harm?</Label>
  </g>;
};

const RewardLearningBridge: React.FC = () => {
  const f=useCurrentFrame();
  const signal=progress(f,55,170);
  return <g>
    <rect width={1920} height={1080} fill={C.bg}/>
    <g opacity={progress(f,0,15)*(1-progress(f,220,240))}>
      <Label x={960} y={250} size={34} color={C.yellow}>FROM REWARD TO ADDICTION</Label>
      <RewardSymbol x={540} y={510} scale={1.2} amount={progress(f,10,40)}/>
      <AnimatedArrow x={680} y={510} length={420} amount={progress(f,35,85)} color={C.yellow}/>
      <circle cx={mix(690,1090,signal)} cy={510} r={9} fill={C.yellow} opacity={Math.sin(signal*Math.PI)}/>
      <SimpleNeuron x={1330} y={510} scale={1.25} amount={progress(f,65,150)}/>
      <Label x={540} y={750} size={32} color={C.green}>REWARDING EXPERIENCE</Label>
      <Label x={1330} y={750} size={32} color={C.blue}>THE BRAIN LEARNS</Label>
      <Label x={960} y={880} size={28} color={C.gray}>How do rewards shape future choices?</Label>
    </g>
  </g>;
};

export const Scene03_AddictionAndRewardLearning: React.FC = () => <AbsoluteFill style={{backgroundColor:C.bg}}>
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="Persistent drug-seeking despite harm, positive reinforcement, and learned cue–action–reward associations. A conceptual illustration of one contributing mechanism, ending with particles and a forming neuron.">
    <Sequence from={0} durationInFrames={SCENE03.openingFrames} layout="none"><AddictionStory intro/><OpeningQuestion/></Sequence>
    <Sequence from={SCENE03.openingFrames} durationInFrames={1050+SCENE03.bridgeFrames+SCENE03.addictionHold+SCENE03.reinforcementHold} layout="none"><AddictionStory/></Sequence>
    <Sequence from={SCENE03.openingFrames+SCENE03.bridgeFrames+SCENE03.addictionHold+SCENE03.reinforcementHold+T03.rewardLearning} durationInFrames={SCENE03.durationInFrames-SCENE03.openingFrames-SCENE03.bridgeFrames-SCENE03.addictionHold-SCENE03.reinforcementHold-T03.rewardLearning} layout="none"><RewardLearning/></Sequence>
    <Sequence from={SCENE03.bridgeFrom} durationInFrames={SCENE03.bridgeFrames} layout="none"><RewardLearningBridge/></Sequence>
  </svg>
</AbsoluteFill>;
