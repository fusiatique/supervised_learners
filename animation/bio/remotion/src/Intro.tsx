import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrainAnatomy, BrainRegionLabel, type BrainCamera} from './BrainAnatomy';
import {C, HumanCharacter, Label, type HumanExpression} from './components';
import {ease, fade, mix, pop, progress} from './motion';
import {AGENT_RATIO, Burst, Glow, M, MathsAgent, MathsCapsule, occupancy, PolicyArrow, StateTrack, Title, trackCells} from './intro-outro-components';

export const INTRO={width:1920,height:1080,fps:30,durationInFrames:780} as const;
// One beat per line of the voiceover, each timed by its share of the words.
export const TI={
  crowd:0,      // "Every day, millions of people make a choice they wish they could stop making."
  one:146,      // "Picture that one person."
  hurt:188,     // "They know it's hurting them."
  others:240,   // "Everyone around them knows it too."
  cantStop:302, // "And yet, they just can't stop."
  why:365,      // "Why?"
  title:400,    // "We are Supervised Learners,"
  morph:445,    // "and we'll show that addiction might not be a failure to learn,"
  learn:520,
  tooWell:590,  // "but learning that works a little too well,"
  split:645,    // "using reinforcement learning and the human brain's own reward pathways."
  end:780,
} as const;

const TRACK={x:960,y:800,n:5,size:150};
const cells=trackCells(TRACK.x,TRACK.n,TRACK.size);
const HUMAN={x:760,y:600,scale:1.25};
const DRUG=[1250,520];
const BRAIN_CAM:BrainCamera={x:470,y:560,scale:.72};

// A crowd of small figures, each reaching for its own capsule. The one in the middle is "that one person".
const rand=(i:number)=>{const v=Math.sin(i*12.9898+4.1)*43758.5453;return v-Math.floor(v);};
const CROWD_ROWS=[380,510,640,770,900],CROWD_COLS=13,CROWD_SCALE=.45;
const crowd=CROWD_ROWS.flatMap((y,row)=>Array.from({length:CROWD_COLS},(_,col)=>({x:960+(col-(CROWD_COLS-1)/2)*140+(row%2?35:-35),y,one:row===2&&col===6})))
  .map((p,i)=>({...p,x:p.one?960:p.x,i}));
const ONE=crowd.find(p=>p.one)!;
const ONE_CAPSULE=[ONE.x+82*CROWD_SCALE,ONE.y-70*CROWD_SCALE];
const reachHand=(reach:number)=>({x:mix(48,62,reach),y:mix(-27,-62,reach)});
const crowdCapsule=(x:number,y:number)=>[x+82*CROWD_SCALE,y-70*CROWD_SCALE];

const CrowdFigure:React.FC<{f:number;x:number;y:number;i:number;opacity:number}>=({f,x,y,i,opacity})=>{
  const dist=Math.hypot(x-960,(y-640)*1.6)/1000;
  const appear=progress(f,dist*70,dist*70+22);
  const reach=ease(f,25+rand(i)*60,60+rand(i)*60);
  const glow=.5+.5*Math.sin(f*.12+rand(i+7)*6);
  const [cx,cy]=crowdCapsule(x,y);
  if(appear<=0||opacity<=0)return null;
  return <g opacity={opacity*appear}>
    <Glow x={cx} y={cy} r={22} color={M.pill} opacity={.1*glow*reach}/>
    <MathsCapsule x={cx} y={cy} size={30} opacity={progress(appear,.4,1)}/>
    <HumanCharacter x={x} y={y} scale={CROWD_SCALE} frame={f+i*7} amount={appear} rightHand={reachHand(reach)} look={4} expression={rand(i+3)>.5?'conflicted':'neutral'}/>
  </g>;
};

/** "Every day": a sun crossing the sky above the crowd. */
const Sun:React.FC<{f:number;opacity:number}>=({f,opacity})=>{
  const a=Math.PI*(1-progress(f,0,TI.one));
  return <g opacity={opacity*fade(f,0,20)} transform={`translate(${960+760*Math.cos(a)} ${250-140*Math.sin(a)})`} stroke={C.yellow} strokeWidth={4} strokeLinecap="round">
    <circle r={26} fill={C.yellow} opacity={.85}/>
    {Array.from({length:8},(_,k)=>{const b=k*Math.PI/4+f*.01;return <path key={k} d={`M${Math.cos(b)*38} ${Math.sin(b)*38}L${Math.cos(b)*52} ${Math.sin(b)*52}`}/>;})}
  </g>;
};

/** "They know it's hurting them": a health bar that drains from green to red, shaking with each hit. */
const HealthBar:React.FC<{x:number;y:number;level:number;opacity:number;hit:number}>=({x,y,level,opacity,hit})=>{
  const w=220,h=22,color=level>.6?C.green:level>.35?C.yellow:C.red;
  return <g opacity={opacity} transform={`translate(${x+Math.sin(hit*40)*6*hit} ${y})`}>
    <Label x={0} y={-24} size={22} color={C.gray}>HEALTH</Label>
    <rect x={-w/2} y={-h/2} width={w} height={h} rx={h/2} fill="none" stroke={C.gray} strokeWidth={3}/>
    <rect x={-w/2+4} y={-h/2+4} width={Math.max(0,(w-8)*level)} height={h-8} rx={(h-8)/2} fill={color}/>
  </g>;
};

const WATCHERS=[{x:170,look:5},{x:320,look:5},{x:1480,look:-5},{x:1650,look:-5}];

export const Intro:React.FC=()=>{
  const f=useCurrentFrame();
  // 1–2. The crowd, then one person steps forward.
  const crowdOut=progress(f,TI.one,TI.one+30);
  const forward=ease(f,TI.one,TI.hurt);
  // 3. The health bar drains.
  const hurt=progress(f,TI.hurt,TI.hurt+18);
  const health=mix(1,.22,ease(f,TI.hurt+6,TI.others));
  const hit=Math.max(0,Math.sin(progress(f,TI.hurt+10,TI.others)*Math.PI*3));
  // 4. The people around them notice; they leave at "Why?".
  const othersOut=1-progress(f,TI.why,TI.title);
  // 5. They step away, hesitate, and are pulled back to the drug.
  const away=ease(f,TI.cantStop,TI.cantStop+22),back=ease(f,TI.cantStop+40,TI.why-4);
  const hesitating=f>TI.cantStop+22&&f<TI.cantStop+40;
  const hesitate=Math.sin(progress(f,TI.cantStop+22,TI.cantStop+40)*Math.PI*4)*7;
  const pull=Math.sin(progress(f,TI.cantStop+40,TI.why)*Math.PI);
  const px=mix(ONE.x,HUMAN.x,forward)-240*away+240*back,py=mix(ONE.y,HUMAN.y,forward);
  const scale=mix(CROWD_SCALE,HUMAN.scale,forward);
  const walking=Math.max(Math.sin(away*Math.PI),Math.sin(back*Math.PI),.6*Math.sin(forward*Math.PI));
  const expression:HumanExpression=f<TI.hurt?'neutral':f<TI.cantStop+40?'disappointed':'conflicted';
  const look=f<TI.cantStop?5:f<TI.cantStop+22?-5:f<TI.cantStop+30?5:f<TI.cantStop+36?-5:5;
  // 8. The person becomes the agent, which learns its way to the drug — and values it too highly.
  const morph=ease(f,TI.morph,TI.morph+45),settle=ease(f,TI.morph+45,TI.learn);
  const walk=ease(f,TI.learn,TI.learn+40),home=ease(f,TI.learn+50,TI.tooWell);
  const agentX=mix(mix(px,cells[0],settle),cells[4],walk*(1-home));
  const learned=(i:number)=>ease(f,TI.tooWell+(4-i)*8,TI.tooWell+(4-i)*8+16);
  const overshoot=ease(f,TI.tooWell+30,TI.split);
  const drugX=mix(DRUG[0],cells[4],morph),drugY=mix(DRUG[1],TRACK.y,morph);
  // 9. Split screen: the brain's reward pathways on the left, reinforcement learning on the right.
  const split=ease(f,TI.split,TI.split+40),brain=progress(f,TI.split+20,TI.split+60);
  const pathways=progress(f,TI.split+40,TI.split+90),activity=.5+.5*Math.sin(f*.15);
  const world=`translate(${mix(TRACK.x,1440,split)} ${mix(TRACK.y,580,split)}) scale(${mix(1,.68,split)}) translate(${-TRACK.x} ${-TRACK.y})`;
  return <AbsoluteFill style={{backgroundColor:C.bg}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="A crowd of people reach for a drug. One person steps forward: a health bar drains, the people around them worry, and they walk away but are pulled back. The person becomes a learning agent that learns its way to the drug too well, beside the brain's reward pathways.">
      {/* 1. every day, millions of people */}
      <Sun f={f} opacity={1-crowdOut}/>
      {crowd.filter(p=>!p.one).map(p=><CrowdFigure key={p.i} f={f} x={p.x} y={p.y} i={p.i} opacity={1-crowdOut}/>)}
      <Title f={f} from={30} until={TI.one-24} text="EVERY DAY, MILLIONS OF PEOPLE" y={110} size={40}/>

      {/* 3–4. the harm, and the people around them */}
      <g opacity={1-progress(f,TI.morph,TI.morph+20)}>
        <HealthBar x={px} y={300} level={health} opacity={hurt} hit={hit}/>
        {WATCHERS.map((w,k)=>{
          const a=progress(f,TI.others+k*8,TI.others+k*8+18);
          return <g key={k} opacity={a*othersOut}>
            <HumanCharacter x={w.x} y={640} scale={.95} frame={f+k*13} amount={a} look={w.look} expression="disappointed"/>
            <g transform={`translate(${w.x} 425) scale(${pop(f,TI.others+k*8+10)})`}><Label x={0} y={0} size={56} color={C.red}>!</Label></g>
          </g>;
        })}
      </g>
      <Glow x={drugX} y={drugY} r={70*(1+.25*pull)} color={M.pill} opacity={forward*(.08+.12*pull)*(1-morph)}/>
      <Burst x={DRUG[0]} y={DRUG[1]} age={f-(TI.why-6)} color={M.pill} radius={90}/>

      {/* 8–9. the agent's world; it moves to the right half for the split screen */}
      <g transform={world}>
        <StateTrack x={TRACK.x} y={TRACK.y} n={TRACK.n} size={TRACK.size} amount={progress(f,TI.morph,TI.learn)} current={occupancy(agentX,cells,TRACK.size).map(v=>v*settle)} glow={cells.map((_,i)=>learned(i)*(i===4?1:.25+.15*i))} outline={[0,0,0,0,overshoot*(.6+.4*activity)]}/>
        {cells.slice(0,4).map((cx,i)=><PolicyArrow key={i} cx={cx} cy={TRACK.y} size={TRACK.size} amount={learned(i)}/>)}
        <Glow x={cells[4]} y={TRACK.y} r={TRACK.size*mix(.5,1.15,overshoot)} color={M.pill} opacity={.14*overshoot}/>
        <Burst x={cells[4]} y={TRACK.y} age={f-(TI.learn+40)} color={M.pill} radius={100}/>
        <MathsCapsule x={drugX} y={drugY} size={mix(90,.75*TRACK.size,morph)*(1+.25*overshoot)} opacity={forward}/>
        <MathsAgent x={agentX} y={mix(py-135*scale,TRACK.y,settle)} r={mix(37*scale,AGENT_RATIO*TRACK.size,settle)} amount={morph} opacity={morph} look={1} expression={f>=TI.learn+40?'happy':'blank'}/>
      </g>

      {/* 2–5. that one person */}
      <MathsCapsule x={ONE_CAPSULE[0]} y={ONE_CAPSULE[1]} size={30} opacity={fade(f,20,40)*(1-forward)}/>
      <g opacity={1-morph}>
        <HumanCharacter x={px} y={py} scale={scale} frame={f} amount={progress(f,0,22)} walking={walking} naturalMotion expression={expression} look={look} headTilt={hesitating?hesitate:0} rightHand={reachHand(ease(f,40,90)*(1-forward))}/>
      </g>

      {/* 6. why? */}
      <g opacity={fade(f,TI.why,TI.why+12)*(1-progress(f,TI.morph,TI.morph+18))} transform={`translate(${px+120} 450) scale(${1.6*pop(f,TI.why)})`}><Label x={0} y={0} size={72} color={C.yellow}>?</Label></g>

      {/* 7. the team, and what we'll show */}
      <Title f={f} from={TI.title} text="WE ARE THE SUPERVISED LEARNERS" y={140} size={48}/>
      <Title f={f} from={TI.learn} until={TI.tooWell-24} text="NOT A FAILURE TO LEARN…" y={975} size={34} color={C.gray}/>
      <Title f={f} from={TI.tooWell} until={TI.split-10} text="…LEARNING THAT WORKS A LITTLE TOO WELL" y={975} size={34} color={C.yellow}/>

      {/* 9. the brain's own reward pathways */}
      <path d="M960 230V930" stroke={C.gray} strokeWidth={2} opacity={.5*split}/>
      <g opacity={brain}>
        <BrainAnatomy {...BRAIN_CAM} amount={brain} frame={f} cortexOpacity={.75} highlights={{VTA:pathways,NAc:pathways,PFC:pathways*.8}} pathwayProgress={{mesolimbic:pathways,mesocortical:pathways}} activity={{mesolimbic:activity*pathways,mesocortical:activity*pathways}}/>
        <g opacity={pathways}><BrainRegionLabel region="VTA" camera={BRAIN_CAM} x={330} y={830}/><BrainRegionLabel region="NAc" camera={BRAIN_CAM} x={560} y={860}/><BrainRegionLabel region="PFC" camera={BRAIN_CAM} x={790} y={800}/></g>
      </g>
      <Title f={f} from={TI.split+50} text="THE BRAIN'S REWARD PATHWAYS" x={480} y={975} size={32} color={C.yellow}/>
      <Title f={f} from={TI.split+50} text="REINFORCEMENT LEARNING" x={1440} y={975} size={32} color={M.model}/>
    </svg>
  </AbsoluteFill>;
};
