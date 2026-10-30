import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {anatomyToScreen, BrainAnatomy, BRAIN_REGIONS, BrainRegionLabel, type BrainCamera, type BrainRegion} from './BrainAnatomy';
import {BrainIllustration, C, HumanCharacter, Label} from './components';
import {DopamineSpikeTrain, RewardPredictionError} from './dopamine-learning-components';
import {draw, ease, fade, mix, pop, progress} from './motion';
import {PlasticSynapse} from './plasticity-components';
import {BehavioralBrake} from './prefrontal-control-components';
import {CueSymbol} from './reward-components';
import {WarningSymbol} from './risk-components';
import {AGENT_RATIO, Burst, CellValue, DashedLink, Gauge, Glow, indicate, M, MathsAgent, MathsApple, MathsCapsule, occupancy, PolicyArrow, RewardStar, StateTrack, Title, TranslationBook, trackCells} from './intro-outro-components';

const SIZE={width:1920,height:1080,fps:30} as const;
const Frame:React.FC<{label:string;children:React.ReactNode}>=({label,children})=><AbsoluteFill style={{backgroundColor:C.bg}}>
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label={label}>{children}</svg>
</AbsoluteFill>;
const Divider:React.FC<{amount:number;opacity?:number}>=({amount,opacity=1})=><path d="M960 150V930" stroke={C.white} strokeWidth={3} fill="none" opacity={.18*opacity} {...draw(amount)}/>;
const BRAIN_CAM:BrainCamera={x:470,y:560,scale:.72};
const regionPoint=(region:BrainRegion,camera=BRAIN_CAM)=>anatomyToScreen(BRAIN_REGIONS[region].center,camera);
const RegionPulse:React.FC<{region:BrainRegion;amount:number;camera?:BrainCamera}>=({region,amount,camera=BRAIN_CAM})=>{
  const [x,y]=regionPoint(region,camera);
  return <Glow x={x} y={y} r={(region==='PFC'?55:32)*camera.scale/.72} color={C.yellow} opacity={.22*amount}/>;
};
/** Bottom-of-screen caption, one per spoken line. */
const Caption:React.FC<{f:number;from:number;until?:number;text:React.ReactNode;color?:string}>=({f,from,until,text,color=C.white})=><Title f={f} from={from} until={until} y={1000} size={32} color={color} text={text}/>;
/** A value written as an amber bar standing on top of a cell. */
const ValueBar:React.FC<{cx:number;top:number;size:number;value:number;opacity?:number;color?:string}>=({cx,top,size,value,opacity=1,color=M.dopamine})=>{
  const h=Math.max(0,value)*160;
  return <rect x={cx-.22*size} y={top-10-h} width={.44*size} height={h} rx={5} fill={color} opacity={.85*opacity}/>;
};
/** A short envelope that rises then falls between two frames: an outbound dash and its return. */
const dash=(f:number,s:number)=>ease(f,s,s+18)-ease(f,s+28,s+46);

// ---------- Outro 1: Bringing together (35 s) ----------

export const OUTRO1={...SIZE,durationInFrames:1050} as const;
// One beat per sentence of the voiceover.
const T1={
  sides:0,       // "Let's put the two halves of our story side by side."
  states:120,    // "Our agent lived in states; the brain lives in situations and cues."
  value:280,     // "Our agent learned a value function; the nucleus accumbens assigns value to cues."
  policy:445,    // "Our agent improved its policy by planning ahead; that's the prefrontal cortex."
  error:600,     // "And both learn from the same signal: the difference between what was expected and what actually happened."
  dopamine:820,  // "In the brain, that's the dopamine reward prediction error,"
  plasticity:930,// "written into our wiring through synaptic plasticity."
  end:1050,
} as const;
const R1={x:1440,y:600,size:150};
const cells1=trackCells(R1.x,5,R1.size);
const VALUE_GLOW=[.12,.2,.32,.48,.7];
const CUE=[470,250];
const RPE={x:1250,y:300,scale:.62,width:620};

export const Outro1_BringingTogether:React.FC=()=>{
  const f=useCurrentFrame();
  const brainIn=progress(f,0,40),agentIn=progress(f,30,80);
  // states ↔ cues: the agent's cells light one by one, then the cue rings
  const scan=progress(f,T1.states+10,T1.states+80);
  const outline=cells1.map((_,i)=>scan>0&&scan<1?Math.max(0,1-Math.abs(scan*5-.5-i)):0);
  const cue=progress(f,T1.states+40,T1.states+60)*(1-progress(f,T1.dopamine-10,T1.dopamine+20));
  // value ↔ accumbens: values fill the cells; a spark carries value from the cue to the NAc
  const values=progress(f,T1.value,T1.value+40);
  const spark=ease(f,T1.value+70,T1.value+120),cueValue=progress(f,T1.value+115,T1.value+135);
  // policy ↔ prefrontal cortex: arrows, then an imagined run ahead along an arc
  const arrows=progress(f,T1.policy,T1.policy+45);
  const plan=ease(f,T1.policy+50,T1.policy+110);
  // the shared signal: expected vs actual
  const walk=ease(f,T1.error+10,T1.error+60),home=ease(f,T1.dopamine+40,T1.dopamine+90);
  const actual=ease(f,T1.error+60,T1.error+80),difference=progress(f,T1.error+85,T1.error+110);
  const rpe=progress(f,T1.error+15,T1.error+35)*(1-progress(f,T1.dopamine+40,T1.dopamine+70));
  // dopamine and plasticity
  const dopamine=progress(f,T1.dopamine,T1.dopamine+20);
  const pulse=dopamine*(.5+.5*Math.sin(f*.2));
  const synapse=progress(f,T1.plasticity,T1.plasticity+20);
  const wired=ease(f,T1.plasticity+20,T1.plasticity+90);
  const ind=[indicate(f,T1.states+60),indicate(f,T1.value+60),indicate(f,T1.policy+70),indicate(f,T1.error+120)];
  const links=[ease(f,T1.states+80,T1.states+120),ease(f,T1.value+90,T1.value+130),ease(f,T1.policy+90,T1.policy+130),ease(f,T1.error+130,T1.error+170)];
  const agentX=mix(mix(cells1[0],cells1[4],walk),cells1[0],home);
  const edge=cells1[0]-R1.size/2;
  return <Frame label="Split screen: the brain on the left and the learning agent on the right, linked pair by pair: states and cues, value and nucleus accumbens, policy and prefrontal cortex, and the prediction error and dopamine, which is written into synapses by plasticity.">
    <Divider amount={brainIn}/>
    <Title f={f} from={20} x={480} y={110} size={34} color={C.yellow} text="THE BRAIN"/>
    <Title f={f} from={35} x={1440} y={110} size={34} color={M.model} text="THE AGENT"/>
    {/* brain side */}
    <BrainAnatomy {...BRAIN_CAM} amount={brainIn} frame={f} cortexOpacity={.75} highlights={{VTA:brainIn,NAc:brainIn,PFC:brainIn*.8}} pathwayProgress={{mesolimbic:brainIn,mesocortical:brainIn}} activity={{mesolimbic:pulse,mesocortical:pulse}}/>
    <g opacity={brainIn}><BrainRegionLabel region="VTA" camera={BRAIN_CAM} x={330} y={830}/><BrainRegionLabel region="NAc" camera={BRAIN_CAM} x={560} y={860}/><BrainRegionLabel region="PFC" camera={BRAIN_CAM} x={790} y={800}/></g>
    <RegionPulse region="NAc" amount={ind[1]}/><RegionPulse region="PFC" amount={ind[2]}/><RegionPulse region="VTA" amount={ind[3]+pulse}/>
    <g opacity={cue}>
      <Glow x={CUE[0]} y={CUE[1]} r={60} color={C.yellow} opacity={.12*cueValue}/>
      <CueSymbol x={CUE[0]} y={CUE[1]} scale={.55*(1+.15*ind[0])} ring={progress(f,T1.states+60,T1.states+100)}/>
      <Label x={CUE[0]} y={CUE[1]+70} size={22} color={C.gray}>CUE</Label>
    </g>
    {spark>0&&spark<1&&<Glow x={mix(CUE[0],regionPoint('NAc')[0],spark)} y={mix(CUE[1],regionPoint('NAc')[1],spark)} r={14} color={C.yellow} opacity={.8}/>}
    <DopamineSpikeTrain x={170} y={290} width={600} mode="burst" opacity={dopamine*(1-progress(f,T1.plasticity-10,T1.plasticity+15))} reveal={progress(f,T1.dopamine+5,T1.dopamine+95)}/>
    <PlasticSynapse frame={f} x={470} y={240} scale={.46} amount={synapse} strength={mix(.45,1,wired)} training testFrame={T1.plasticity} responseLabel={false}/>
    {/* agent side */}
    <StateTrack x={R1.x} y={R1.y} n={5} size={R1.size} amount={agentIn} current={occupancy(agentX,cells1,R1.size)} glow={VALUE_GLOW.map(v=>v*values*(1+.6*ind[1])*(1+.8*wired))} outline={outline}/>
    <g opacity={values}>{cells1.map(cx=><CellValue key={cx} cx={cx} cy={R1.y} size={R1.size} scale={1+.35*ind[1]}>V</CellValue>)}</g>
    <g opacity={arrows}>{cells1.slice(1,4).map(cx=><PolicyArrow key={cx} cx={cx} cy={R1.y} size={R1.size} amount={arrows} color={ind[2]>.3?M.dopamine:M.model}/>)}</g>
    <path d={`M${cells1[0]} ${R1.y-R1.size/2-10}Q${R1.x} ${R1.y-R1.size/2-190} ${cells1[4]} ${R1.y-R1.size/2-10}`} fill="none" stroke={M.model} strokeWidth={3} strokeDasharray="10 10" opacity={.7*(1-progress(f,T1.error,T1.error+20))} {...draw(plan)}/>
    {plan>0&&plan<1&&<MathsAgent x={mix(cells1[0],cells1[4],plan)} y={R1.y-R1.size/2-10-180*Math.sin(plan*Math.PI)*.5} r={AGENT_RATIO*R1.size*.8} opacity={.4} look={1}/>}
    <RewardStar x={cells1[4]} y={R1.y} scale={mix(30,52,actual)*(1+.15*indicate(f,T1.error+60,30))} opacity={progress(f,T1.policy+40,T1.policy+70)*mix(.35,1,actual)*(1-home)}/>
    <MathsAgent x={agentX} y={R1.y} r={AGENT_RATIO*R1.size*(1+.12*ind[3])} amount={agentIn} gold={Math.max(ind[3],pulse)} expression={actual>.5&&home<.5?'happy':'blank'} look={1}/>
    <Burst x={cells1[4]} y={R1.y} age={f-T1.error-60} color={M.dopamine} radius={80}/>
    <RewardPredictionError x={RPE.x} y={RPE.y} scale={RPE.scale} width={RPE.width} opacity={rpe} expected={.45} actual={.85*actual} showDifference={difference}/>
    <g opacity={rpe*difference}><Label x={RPE.x+RPE.width*RPE.scale+50} y={RPE.y+95} size={48} color={C.yellow}>δ</Label></g>
    {/* one dashed link per pair */}
    <g opacity={cue}><DashedLink a={[cells1[2],R1.y-R1.size/2]} b={[CUE[0]+50,CUE[1]]} amount={links[0]}/></g>
    <DashedLink a={[edge,R1.y+50]} b={regionPoint('NAc')} amount={links[1]}/>
    <DashedLink a={[edge,R1.y-50]} b={regionPoint('PFC')} amount={links[2]}/>
    <DashedLink a={[edge,R1.y]} b={regionPoint('VTA')} amount={links[3]}/>
    <Burst x={agentX} y={R1.y} age={f-T1.dopamine} color={M.dopamine} radius={75}/>
    <Caption f={f} from={30} until={T1.states-30} text="TWO HALVES OF ONE STORY"/>
    <Caption f={f} from={T1.states+30} until={T1.value-24} text={<><tspan fill={M.model}>STATES</tspan> ↔ <tspan fill={C.yellow}>SITUATIONS AND CUES</tspan></>}/>
    <Caption f={f} from={T1.value+20} until={T1.policy-24} text={<><tspan fill={M.model}>VALUE FUNCTION</tspan> ↔ <tspan fill={C.yellow}>NUCLEUS ACCUMBENS</tspan></>}/>
    <Caption f={f} from={T1.policy+15} until={T1.error-24} text={<><tspan fill={M.model}>POLICY · PLANNING AHEAD</tspan> ↔ <tspan fill={C.yellow}>PREFRONTAL CORTEX</tspan></>}/>
    <Caption f={f} from={T1.error+20} until={T1.dopamine-24} text="THE SAME SIGNAL: WHAT WAS EXPECTED vs WHAT HAPPENED"/>
    <Caption f={f} from={T1.dopamine} until={T1.plasticity-24} text={<><tspan fill={M.model}>PREDICTION ERROR</tspan> ↔ <tspan fill={C.yellow}>DOPAMINE</tspan></>}/>
    <Caption f={f} from={T1.plasticity} text={<>WRITTEN INTO OUR WIRING: <tspan fill={C.green}>SYNAPTIC PLASTICITY</tspan></>}/>
  </Frame>;
};

// ---------- Outro 2: Where it goes wrong (39 s) ----------

export const OUTRO2={...SIZE,durationInFrames:1170} as const;
const T2={
  book:10,      // "Now let's translate addiction into robot language."
  open:35,glasses:50,leave:80,
  track:95,     // "The value signal gets hijacked: drugs boost dopamine directly,
  boost:140,
  low:240,      //  so drug-related states are valued too highly and natural rewards seem worth less."
  policy:344,   // "The policy gets stuck: the agent keeps exploiting one reward
  brake:400,    //  while the prefrontal brake weakens."
  change:516,   // "And the agent itself changes: repeated drug use shifts its internal balance,
  gap:680,      //  so the drug becomes a way to correct a deviation it helped create."
  harm:803,     // "And harm doesn't fix it. Even when the cost of the drug is bigger than its pleasure,
  relief:960,   //  an agent in a withdrawal-like state can keep using it, because the relief outweighs the penalty."
  walk:1060,flash:1100,end:1170,
} as const;
const TRACK2={x:960,y:400,n:7,size:125};
const cells2=trackCells(TRACK2.x,TRACK2.n,TRACK2.size);
const CELL_TOP2=TRACK2.y-TRACK2.size/2;
const VALUE_BEFORE=[.55,.55,.3,.35,.4,.48,.55];
const VALUE_HIJACKED=[.15,.15,.5,.65,.8,.95,1.25];
const STUCK_DASHES=[T2.policy+20,T2.policy+70,T2.policy+120];
const DOSES=[T2.change+40,T2.change+130,T2.change+220];
const SMALL_BRAIN:BrainCamera={x:430,y:730,scale:.36};
const SCALE2={x:860,y:790,arm:230};

/** A labelled weight sitting on a balance pan; y is its bottom edge. */
const WeightBlock:React.FC<{y:number;h:number;color:string;text:string;opacity?:number}>=({y,h,color,text,opacity=1})=><g opacity={opacity}>
  <rect x={-62} y={y-h} width={124} height={h} rx={7} fill={color} opacity={.85}/>
  <text x={0} y={y-h/2+7} fill={C.bg} fontSize={19} fontWeight={700} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif">{text}</text>
</g>;
/** A balance on a stand; tilt in degrees, positive drops the right pan. */
const BalanceScale:React.FC<{x:number;y:number;arm:number;tilt:number;left:React.ReactNode;right:React.ReactNode;opacity?:number}>=({x:cx,y:cy,arm,tilt,left,right,opacity=1})=>{
  const angle=tilt*Math.PI/180;
  const end=(side:number)=>[cx+side*arm*Math.cos(angle),cy+side*arm*Math.sin(angle)];
  const pan=(side:number,children:React.ReactNode)=>{
    const [x,y]=end(side),py=y+80;
    return <g>
      <path d={`M${x} ${y}L${x-60} ${py}M${x} ${y}L${x+60} ${py}`} stroke={C.gray} strokeWidth={2} opacity={.7}/>
      <path d={`M${x-75} ${py}Q${x} ${py+22} ${x+75} ${py}`} stroke={C.white} strokeWidth={4} fill="none" strokeLinecap="round"/>
      <g transform={`translate(${x} ${py})`}>{children}</g>
    </g>;
  };
  return <g opacity={opacity}>
    <path d={`M${cx} ${cy}L${cx-40} ${cy+150}H${cx+40}Z`} fill="none" stroke={C.white} strokeWidth={4} strokeLinejoin="round"/>
    <path d={`M${end(-1)[0]} ${end(-1)[1]}L${end(1)[0]} ${end(1)[1]}`} stroke={C.white} strokeWidth={5} strokeLinecap="round"/>
    <circle cx={cx} cy={cy} r={8} fill={C.white}/>
    {pan(-1,left)}{pan(1,right)}
  </g>;
};
/** "Relief outweighs the penalty": a penalty on one pan and pleasure, then relief, on the other. */
const Balance:React.FC<{f:number;opacity:number}>=({f,opacity})=>{
  const tipLeft=ease(f,T2.harm+50,T2.harm+90),relief=ease(f,T2.relief,T2.relief+30),tipRight=ease(f,T2.relief+25,T2.relief+60);
  return <BalanceScale {...SCALE2} tilt={mix(-14*tipLeft,14,tipRight)} opacity={opacity}
    left={<WeightBlock y={2} h={62} color={C.red} text="PENALTY"/>}
    right={<>
      <WeightBlock y={2} h={40} color={M.pill} text="PLEASURE"/>
      <g transform={`translate(0 ${-160*(1-relief)})`}><WeightBlock y={-40} h={58} color={M.homeo} text="RELIEF" opacity={relief}/></g>
    </>}/>;
};

export const Outro2_WhereItGoesWrong:React.FC=()=>{
  const f=useCurrentFrame();
  // translating addiction into the agent's language
  const partA=progress(f,0,20)*(1-progress(f,T2.leave,T2.leave+20));
  const bookIn=ease(f,T2.book,T2.open);
  // 1. hijacked value
  const partB=progress(f,T2.track,T2.track+30);
  const boost=ease(f,T2.boost+20,T2.low),low=ease(f,T2.low,T2.low+60);
  const value=VALUE_BEFORE.map((v,i)=>i===6?mix(v,VALUE_HIJACKED[6],boost):mix(v,VALUE_HIJACKED[i],low));
  const dopamineTag=progress(f,T2.boost,T2.boost+20)*(1-progress(f,T2.policy,T2.policy+20));
  // 2. stuck policy, weakening brake
  const arrows=ease(f,T2.policy,T2.policy+30);
  const brainIn=progress(f,T2.brake-20,T2.brake+10)*(1-progress(f,T2.harm,T2.harm+30));
  const weak=ease(f,T2.brake+20,T2.brake+100);
  // 3. the agent changes: each dose lifts the level, the setpoint follows, and the level falls back below it
  const level=.4+[...DOSES,T2.walk].reduce((sum,s)=>sum+.45*(ease(f,s,s+12)-ease(f,s+14,s+60)),0);
  const target=.4+DOSES.reduce((sum,s)=>sum+.12*ease(f,s+20,s+60),0);
  const gauge=progress(f,T2.change,T2.change+30);
  // 4. harm
  const sign=ease(f,T2.harm+10,T2.harm+40);
  const wiggle=Math.sin(progress(f,T2.walk,T2.flash)*Math.PI*6)*9*Math.sin(progress(f,T2.walk,T2.flash)*Math.PI);
  const scale=progress(f,T2.harm+20,T2.harm+50);
  // the agent's trips to the drug
  const trips=[...STUCK_DASHES,...DOSES].reduce((sum,s)=>sum+dash(f,s),0);
  const agentX=mix(cells2[3],cells2[6],Math.max(trips,ease(f,T2.walk,T2.flash)));
  const atDrug=agentX>cells2[5]+TRACK2.size*.4;
  const deviation=target-level;
  return <Frame label="The agent reads a Human to Maths book. The drug's value bar shoots up while the apples' shrink; the agent keeps running to the drug as the prefrontal brake weakens; its internal balance gauge shifts so the drug corrects a gap it created; and a balance shows relief outweighing the harm penalty.">
    <g opacity={partA}>
      <MathsAgent x={850} y={560} r={120} amount={progress(f,0,20)} glasses={ease(f,T2.glasses,T2.glasses+20)} look={1}/>
      <TranslationBook x={mix(1300,1170,bookIn)} y={600} amount={progress(f,T2.book,T2.open)} opacity={bookIn} open={ease(f,T2.open,T2.glasses)}/>
    </g>
    <Title f={f} from={10} until={T2.leave-20} y={250} size={40} text="ADDICTION, IN ROBOT LANGUAGE"/>
    {/* section headers */}
    <Title f={f} from={T2.track} until={T2.policy-24} y={80} size={34} color={M.dopamine} text="1 · THE VALUE SIGNAL GETS HIJACKED"/>
    <Title f={f} from={T2.policy} until={T2.change-24} y={80} size={34} color={M.model} text="2 · THE POLICY GETS STUCK"/>
    <Title f={f} from={T2.change} until={T2.harm-24} y={80} size={34} color={M.homeo} text="3 · THE AGENT ITSELF CHANGES"/>
    <Title f={f} from={T2.harm} y={80} size={34} color={C.red} text="4 · HARM DOESN'T FIX IT"/>
    {/* the agent's world */}
    <g opacity={partB}>
      <StateTrack x={TRACK2.x} y={TRACK2.y} n={TRACK2.n} size={TRACK2.size} amount={partB} current={occupancy(agentX,cells2,TRACK2.size)}/>
      {cells2.map((cx,i)=><ValueBar key={cx} cx={cx} top={CELL_TOP2} size={TRACK2.size} value={value[i]*partB} color={i===6?M.pill:M.dopamine}/>)}
      {cells2.slice(2,6).map(cx=><PolicyArrow key={cx} cx={cx} cy={TRACK2.y} size={TRACK2.size} amount={arrows}/>)}
      <Glow x={cells2[6]} y={TRACK2.y} r={55*(1+.5*boost)} color={M.pill} opacity={mix(.06,.16,boost)}/>
      <MathsCapsule x={cells2[6]} y={TRACK2.y} size={.75*TRACK2.size}/>
      <MathsApple x={cells2[0]} y={TRACK2.y+6} size={.7*TRACK2.size} opacity={mix(1,.3,low)}/>
      <MathsApple x={cells2[1]} y={TRACK2.y+6} size={.7*TRACK2.size} opacity={mix(1,.3,low)}/>
      <MathsAgent x={agentX} y={TRACK2.y} r={AGENT_RATIO*TRACK2.size} amount={partB} look={1} expression={atDrug?'happy':gauge>0&&deviation>.12?'sad':'blank'}/>
      {[0,30,60].map(d=><Burst key={d} x={cells2[6]} y={TRACK2.y} age={f-T2.boost-d} color={M.dopamine} radius={75}/>)}
      {[...STUCK_DASHES,...DOSES].map(s=><Burst key={s} x={cells2[6]} y={TRACK2.y} age={f-s-18} color={M.pill} radius={70}/>)}
      <Burst x={cells2[6]} y={TRACK2.y} age={f-T2.flash} color={M.pill} radius={90}/>
    </g>
    <g opacity={dopamineTag}>
      <Label x={1660} y={210} size={30} color={M.dopamine}>DOPAMINE ↑</Label>
      <path d={`M1610 230Q1520 260 ${cells2[6]+50} ${CELL_TOP2-60}`} fill="none" stroke={M.dopamine} strokeWidth={3} strokeDasharray="10 8" {...draw(progress(f,T2.boost,T2.boost+30))}/>
    </g>
    {/* the prefrontal brake */}
    <g opacity={brainIn}>
      <BrainAnatomy {...SMALL_BRAIN} amount={brainIn} frame={f} cortexOpacity={.75} highlights={{PFC:mix(1,.15,weak)}}/>
      <RegionPulse region="PFC" camera={SMALL_BRAIN} amount={mix(1,.1,weak)*(.6+.4*Math.sin(f*.15))}/>
      <BehavioralBrake x={720} y={700} scale={.9} activation={mix(1,.25,weak)} strength={mix(1,.25,weak)}/>
      <Label x={720} y={810} size={22} color={C.gray}>PREFRONTAL BRAKE</Label>
    </g>
    {/* internal balance */}
    <Gauge x={1480} y={800} radius={150} level={level} target={target} opacity={gauge}/>
    <g opacity={gauge}><Label x={1480} y={930} size={22} color={C.gray}>INTERNAL BALANCE</Label></g>
    {/* harm */}
    <g opacity={sign} transform={`translate(${cells2[5]} ${CELL_TOP2+TRACK2.size+70-40*(1-sign)}) rotate(${wiggle})`}>
      <WarningSymbol scale={.9}/>
      <Label x={0} y={70} size={26} color={C.red}>HARM</Label>
    </g>
    <Balance f={f} opacity={scale}/>
    <Caption f={f} from={T2.boost} until={T2.low-24} text={<>DRUGS BOOST <tspan fill={M.dopamine}>DOPAMINE</tspan> DIRECTLY</>}/>
    <Caption f={f} from={T2.low} until={T2.policy-24} text={<><tspan fill={M.pill}>DRUG STATES VALUED TOO HIGHLY</tspan> · <tspan fill={M.apple}>NATURAL REWARDS WORTH LESS</tspan></>}/>
    <Caption f={f} from={T2.policy+10} until={T2.brake+40} text="IT KEEPS EXPLOITING ONE REWARD…"/>
    <Caption f={f} from={T2.brake+70} until={T2.change-24} text={<>…WHILE THE <tspan fill={C.blue}>PREFRONTAL BRAKE</tspan> WEAKENS</>}/>
    <Caption f={f} from={T2.change+10} until={T2.gap-24} text={<>REPEATED USE SHIFTS ITS <tspan fill={M.homeo}>INTERNAL BALANCE</tspan></>}/>
    <Caption f={f} from={T2.gap} until={T2.harm-24} text={<>THE DRUG NOW CORRECTS A <tspan fill={M.harm}>GAP IT HELPED CREATE</tspan></>}/>
    <Caption f={f} from={T2.harm+20} until={T2.relief-24} text="EVEN WHEN THE COST IS BIGGER THAN THE PLEASURE…"/>
    <Caption f={f} from={T2.relief} text={<>…IN WITHDRAWAL, <tspan fill={M.homeo}>RELIEF</tspan> OUTWEIGHS THE <tspan fill={C.red}>PENALTY</tspan></>}/>
  </Frame>;
};


// ---------- Outro 3: Conclusion (54 s) ----------

export const OUTRO3={...SIZE,durationInFrames:1620} as const;
// One beat per line of the voiceover, each timed by its share of the words.
const T3={
  question:0,    // "So why would someone keep making a choice they know is harmful?"
  inside:137,    // "Because, from the inside, it isn't irrational."
  follow:217,    // "The learning system is doing exactly what it evolved to do: follow the highest learned value."
  rewritten:399, // "The values have just been rewritten."
  relief:467,    // "Knowing it's harmful isn't enough when the relief is worth more than the cost."
  bellman:627,   // "Bellman said humans enjoy the luxury of being irrational."
  rules:730,     // "But much of addiction can be described with surprisingly precise rules."
  relearn:855,   // "And that suggests treatment should be about relearning, not just willpower."
  simplify:981,  // "Our explainer is a simplification, but it let us see addiction not as a lack of character, but as learning gone wrong."
  person:1243,   // "So the next time you think of that one person, remember: they aren't failing to learn.
  tooWell:1360,  //  They've learned too well."
  team:1471,     // "We are the supervised learners. Thanks for watching."
  end:1620,
} as const;
const TRACK3={x:960,y:480,n:7,size:130};
const cells3=trackCells(TRACK3.x,TRACK3.n,TRACK3.size);
const CELL_TOP3=TRACK3.y-TRACK3.size/2;
// The learned values now (the drug is worth most) and before they were rewritten (the apple was).
const VALUE_NOW=[.25,.3,.42,.55,.7,.85,1.1];
const VALUE_BEFORE3=[.95,.75,.58,.45,.35,.27,.2];
const WORD={x:1112,width:168};
const AGENT3={x:1440,y:470,r:110};
const PERSON={x:960,y:660,scale:1.4};

/** A rounded label chip; struck crosses it out, glow brightens it. */
const Chip:React.FC<{x:number;y:number;width:number;text:string;color:string;opacity:number;struck?:number;glow?:number}>=({x,y,width,text,color,opacity,struck=0,glow=0})=><g opacity={opacity} transform={`translate(${x} ${y})`}>
  <rect x={-width/2} y={-36} width={width} height={60} rx={30} fill={M.cell} stroke={color} strokeWidth={2+2*glow} opacity={.95}/>
  <rect x={-width/2} y={-36} width={width} height={60} rx={30} fill={color} opacity={.18*glow}/>
  <text x={0} y={4} fill={color} fontSize={26} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" opacity={1-.5*struck}>{text}</text>
  <path d={`M${-width/2+24} -6H${width/2-24}`} stroke={C.red} strokeWidth={5} strokeLinecap="round" {...draw(struck)}/>
</g>;

export const Outro3_Conclusion:React.FC=()=>{
  const f=useCurrentFrame();
  // A. the agent's world: why, from the inside, it follows the drug
  const sceneA=1-progress(f,T3.bellman-10,T3.bellman+15);
  const setup=progress(f,0,40);
  const jitter=-18*ease(f,40,52)+36*ease(f,52,66)-18*ease(f,66,78);
  const lens=progress(f,T3.inside,T3.inside+50);
  const bars=progress(f,T3.follow,T3.follow+40);
  const best=indicate(f,T3.follow+45,40);
  const arrows=ease(f,T3.follow+60,T3.follow+90);
  const toDrug=ease(f,T3.follow+100,T3.follow+150),back=ease(f,T3.rewritten,T3.rewritten+30);
  const ghosts=progress(f,T3.rewritten+10,T3.rewritten+40);
  const costDrop=ease(f,T3.relief+10,T3.relief+35),reliefDrop=ease(f,T3.relief+70,T3.relief+95);
  const tilt=mix(-12*costDrop,14,ease(f,T3.relief+90,T3.relief+120));
  // B. Bellman, then precise rules
  const quote=progress(f,T3.bellman,T3.bellman+30)*(1-progress(f,T3.relearn-15,T3.relearn+10));
  const rise=ease(f,T3.rules+20,T3.rules+50),rules=progress(f,T3.rules+40,T3.rules+70);
  // C. relearning
  const sceneC=progress(f,T3.relearn,T3.relearn+20)*(1-progress(f,T3.simplify-10,T3.simplify+15));
  const relearn=ease(f,T3.relearn+20,T3.relearn+80),toApple=ease(f,T3.relearn+70,T3.relearn+110);
  // D. a simplification: brain and agent side by side
  const split=progress(f,T3.simplify,T3.simplify+30)*(1-progress(f,T3.person-15,T3.person+10));
  const glow=ease(f,T3.simplify+30,T3.simplify+75),pulse=glow*(.5+.5*Math.sin(f*.18));
  // E. that one person, who has learned too well
  const person=progress(f,T3.person,T3.person+30)*(1-progress(f,T3.team-15,T3.team+10));
  const morph=ease(f,T3.tooWell,T3.tooWell+45),light=ease(f,T3.tooWell+30,T3.tooWell+80);
  const team=progress(f,T3.team,T3.team+30);
  // where the agent stands on the track
  const sceneAgentX=cells3[3]+jitter+mix(0,cells3[6]-cells3[3],toDrug*(1-back));
  const relearnAgentX=mix(cells3[3],cells3[1],toApple);
  const values=VALUE_NOW.map((v,i)=>mix(v,VALUE_BEFORE3[i],relearn));
  const headY=PERSON.y-135*PERSON.scale;
  return <Frame label="The agent hesitates between an apple and a drug; from the inside it follows its highest learned value, which has been rewritten so relief outweighs the cost. Bellman's quote is crossed out by a precise equation, the agent relearns to choose the apple, the brain and agent appear side by side with 'learning gone wrong' replacing 'lack of character', one person becomes the agent that learned too well, and the team name appears.">
    {/* A. the agent's world */}
    <g opacity={sceneA}>
      <Title f={f} from={0} until={T3.inside-20} y={130} size={40} text="SO WHY WOULD SOMEONE KEEP MAKING"/>
      <Title f={f} from={12} until={T3.inside-20} y={190} size={40} text="A CHOICE THEY KNOW IS HARMFUL?"/>
      <StateTrack x={TRACK3.x} y={TRACK3.y} n={TRACK3.n} size={TRACK3.size} amount={setup} current={occupancy(sceneAgentX,cells3,TRACK3.size)} outline={[0,0,0,0,0,0,best]}/>
      {cells3.map((cx,i)=><g key={cx}>
        <ValueBar cx={cx} top={CELL_TOP3} size={TRACK3.size} value={VALUE_NOW[i]*bars} color={i===6?M.pill:i===0?M.apple:M.dopamine}/>
        {ghosts>0&&<rect x={cx-.22*TRACK3.size} y={CELL_TOP3-10-VALUE_BEFORE3[i]*160} width={.44*TRACK3.size} height={VALUE_BEFORE3[i]*160} rx={5} fill="none" stroke={C.white} strokeWidth={2} strokeDasharray="7 6" opacity={.55*ghosts}/>}
      </g>)}
      <g opacity={ghosts}><Label x={cells3[0]-110} y={CELL_TOP3-150} size={22} color={C.gray} anchor="end">BEFORE</Label></g>
      {cells3.slice(3,6).map(cx=><PolicyArrow key={cx} cx={cx} cy={TRACK3.y} size={TRACK3.size} amount={arrows*(1-back)}/>)}
      <Glow x={cells3[6]} y={TRACK3.y} r={70} color={M.pill} opacity={setup*(.08+.08*best)}/>
      <MathsCapsule x={cells3[6]} y={TRACK3.y} size={.75*TRACK3.size} opacity={setup}/>
      <MathsApple x={cells3[0]} y={TRACK3.y+6} size={.7*TRACK3.size} opacity={setup*.6}/>
      <circle cx={cells3[3]} cy={TRACK3.y} r={mix(40,520,lens)} fill="none" stroke={M.model} strokeWidth={3} strokeDasharray="12 10" opacity={.6*Math.sin(lens*Math.PI)}/>
      <MathsAgent x={sceneAgentX} y={TRACK3.y} r={AGENT_RATIO*TRACK3.size} amount={setup} look={1} expression={toDrug>.9&&back<.1?'happy':'blank'}/>
      <Burst x={cells3[6]} y={TRACK3.y} age={f-T3.follow-150} color={M.pill} radius={85}/>
      <g opacity={fade(f,45,60,T3.inside)} transform={`translate(${cells3[3]+jitter} ${CELL_TOP3-40}) scale(${pop(f,45)})`}><Label x={0} y={0} size={60} color={C.yellow}>?</Label></g>
      <g opacity={fade(f,T3.inside+20,T3.inside+35,T3.follow)} transform={`translate(${cells3[3]} ${CELL_TOP3-40}) scale(${pop(f,T3.inside+20)})`}><Label x={0} y={0} size={60} color={C.green}>✓</Label></g>
      {/* knowing isn't enough: relief outweighs the cost */}
      <BalanceScale x={960} y={700} arm={230} tilt={tilt} opacity={progress(f,T3.relief,T3.relief+20)}
        left={<g transform={`translate(0 ${-140*(1-costDrop)})`}><WeightBlock y={2} h={50} color={C.red} text="COST" opacity={costDrop}/></g>}
        right={<g transform={`translate(0 ${-140*(1-reliefDrop)})`}><WeightBlock y={2} h={72} color={M.homeo} text="RELIEF" opacity={reliefDrop}/></g>}/>
      <g opacity={progress(f,T3.relief+10,T3.relief+30)}><WarningSymbol x={560} y={700} scale={.7}/><Label x={560} y={770} size={20} color={C.red}>KNOWS IT'S HARMFUL</Label></g>
      <Caption f={f} from={T3.inside+10} until={T3.follow-24} text={<>FROM THE INSIDE, IT <tspan fill={C.green}>ISN'T IRRATIONAL</tspan></>}/>
      <Caption f={f} from={T3.follow+10} until={T3.rewritten-24} text={<>IT FOLLOWS THE <tspan fill={M.dopamine}>HIGHEST LEARNED VALUE</tspan></>}/>
      <Caption f={f} from={T3.rewritten} until={T3.relief-10} text={<>THE VALUES HAVE JUST BEEN <tspan fill={M.pill}>REWRITTEN</tspan></>}/>
      <Caption f={f} from={T3.relief+10} until={T3.relief+70} text="KNOWING IT'S HARMFUL ISN'T ENOUGH…"/>
      <Caption f={f} from={T3.relief+95} text={<>…WHEN THE <tspan fill={M.homeo}>RELIEF</tspan> IS WORTH MORE THAN THE <tspan fill={C.red}>COST</tspan></>}/>
    </g>
    {/* B. Bellman's quote, crossed out by precise rules */}
    <g opacity={quote} transform={`translate(0 ${-150*rise+12*(1-progress(f,T3.bellman,T3.bellman+30))})`}>
      <Label x={960} y={380} size={38}>“In dealing with a human being and a human society,</Label>
      <Label x={WORD.x-12} y={445} size={38} anchor="end">we enjoy the luxury of being</Label>
      <text x={WORD.x} y={445} fill={C.yellow} fontSize={38} textLength={WORD.width+8} lengthAdjust="spacingAndGlyphs" fontFamily="Arial, Helvetica, sans-serif">irrational,</text>
      <Label x={960} y={510} size={38}>illogical and inconsistent.”</Label>
      <Label x={960} y={575} size={24} color={C.gray}>Richard Bellman, 1966</Label>
      <path d={`M${WORD.x-4} 433H${WORD.x+WORD.width+12}`} stroke={C.red} strokeWidth={6} strokeLinecap="round" {...draw(progress(f,T3.rules,T3.rules+25))}/>
    </g>
    <g opacity={quote*rules} fontFamily="Georgia, 'Times New Roman', serif" fontStyle="italic" textAnchor="middle">
      <text x={960} y={620} fill={M.ink} fontSize={64}>V(s) = max<tspan fontSize={36} dy={14}>a</tspan><tspan dy={-14}> [ r + γ V(s′) ]</tspan></text>
      <text x={960} y={720} fill={M.dopamine} fontSize={44} opacity={progress(f,T3.rules+70,T3.rules+95)}>δ = r + γ V(s′) − V(s)</text>
    </g>
    <Caption f={f} from={T3.rules+30} until={T3.relearn-30} text={<>MUCH OF ADDICTION FOLLOWS <tspan fill={M.dopamine}>SURPRISINGLY PRECISE RULES</tspan></>}/>
    {/* C. treatment as relearning */}
    <g opacity={sceneC}>
      <StateTrack x={TRACK3.x} y={TRACK3.y} n={TRACK3.n} size={TRACK3.size} current={occupancy(relearnAgentX,cells3,TRACK3.size)}/>
      {cells3.map((cx,i)=><ValueBar key={cx} cx={cx} top={CELL_TOP3} size={TRACK3.size} value={values[i]} color={i===6?M.pill:i===0?M.apple:M.dopamine}/>)}
      {cells3.slice(1,4).map(cx=><g key={cx} transform={`rotate(180 ${cx} ${TRACK3.y})`}><PolicyArrow cx={cx} cy={TRACK3.y} size={TRACK3.size} amount={ease(f,T3.relearn+50,T3.relearn+80)} color={M.apple}/></g>)}
      <Glow x={cells3[0]} y={TRACK3.y} r={70*mix(.6,1.3,relearn)} color={M.apple} opacity={.06+.1*relearn}/>
      <MathsCapsule x={cells3[6]} y={TRACK3.y} size={.75*TRACK3.size} opacity={mix(1,.45,relearn)}/>
      <MathsApple x={cells3[0]} y={TRACK3.y+6} size={.7*TRACK3.size}/>
      <MathsAgent x={relearnAgentX} y={TRACK3.y} r={AGENT_RATIO*TRACK3.size} look={-1} expression={toApple>.9?'happy':'blank'}/>
      <Burst x={cells3[0]} y={TRACK3.y} age={f-T3.relearn-110} color={M.apple} radius={85}/>
      <Chip x={720} y={720} width={380} text="RELEARNING ✓" color={C.green} opacity={progress(f,T3.relearn+30,T3.relearn+50)} glow={relearn}/>
      <Chip x={1200} y={720} width={420} text="NOT JUST WILLPOWER" color={C.gray} opacity={progress(f,T3.relearn+45,T3.relearn+65)}/>
    </g>
    <Caption f={f} from={T3.relearn+20} until={T3.simplify-30} text={<>TREATMENT: <tspan fill={C.green}>RELEARNING</tspan>, NOT JUST WILLPOWER</>}/>
    {/* D. a simplification that changes how we see addiction */}
    <g opacity={split}>
      <Title f={f} from={T3.simplify} y={95} size={28} color={C.gray} text="OUR EXPLAINER · A SIMPLIFICATION"/>
      <Divider amount={split} opacity={split}/>
      <Glow x={BRAIN_CAM.x} y={BRAIN_CAM.y-80} r={240} color={C.yellow} opacity={.05*glow}/>
      <BrainAnatomy x={BRAIN_CAM.x} y={BRAIN_CAM.y-60} scale={BRAIN_CAM.scale} amount={split} frame={f} cortexOpacity={.75} highlights={{VTA:glow,NAc:glow,PFC:glow}} pathwayProgress={{mesolimbic:glow,mesocortical:glow}} activity={{mesolimbic:pulse,mesocortical:pulse}}/>
      <MathsAgent {...AGENT3} amount={split} gold={glow*.8} expression={glow>.5?'happy':'blank'}/>
      <g opacity={.4+.6*pulse}><DashedLink a={regionPoint('VTA',{...BRAIN_CAM,y:BRAIN_CAM.y-60})} b={[AGENT3.x-AGENT3.r-20,AGENT3.y+40]} amount={glow}/></g>
      <Chip x={640} y={880} width={480} text="A LACK OF CHARACTER" color={C.red} opacity={progress(f,T3.simplify+90,T3.simplify+110)} struck={ease(f,T3.simplify+130,T3.simplify+150)}/>
      <Chip x={1280} y={880} width={480} text="LEARNING GONE WRONG" color={C.yellow} opacity={progress(f,T3.simplify+160,T3.simplify+180)} glow={ease(f,T3.simplify+170,T3.simplify+200)}/>
    </g>
    {/* E. that one person */}
    <g opacity={person}>
      <Glow x={1300} y={560} r={70} color={M.pill} opacity={.1*(1-morph)}/>
      <MathsCapsule x={1300} y={560} size={90} opacity={1-morph}/>
      <g opacity={1-morph}><HumanCharacter x={PERSON.x} y={PERSON.y} scale={PERSON.scale} frame={f} amount={progress(f,T3.person,T3.person+30)} expression="conflicted" look={4}/></g>
      <Glow x={PERSON.x} y={mix(headY,480,morph)} r={mix(60,200,morph)} color={M.dopamine} opacity={.1*light}/>
      <MathsAgent x={PERSON.x} y={mix(headY,480,morph)} r={mix(37*PERSON.scale,130,morph)} amount={morph} opacity={morph} gold={light} expression="happy" brain={light} frame={f-T3.tooWell}/>
    </g>
    <Caption f={f} from={T3.person+30} until={T3.tooWell-20} text="THEY AREN'T FAILING TO LEARN…"/>
    <Caption f={f} from={T3.tooWell+10} until={T3.team-30} color={M.dopamine} text="…THEY'VE LEARNED TOO WELL"/>
    {/* F. the team */}
    <g opacity={team}>
      <MathsAgent x={880} y={420} r={42} expression="happy" amount={team}/>
      <BrainIllustration x={1040} y={420} scale={.2} frame={f} amount={team} signal={team} color={C.yellow}/>
    </g>
    <Title f={f} from={T3.team} y={545} size={64} text="WE ARE THE SUPERVISED LEARNERS"/>
    <Title f={f} from={T3.team+40} y={625} size={34} color={C.gray} text="Thanks for watching"/>
  </Frame>;
};
