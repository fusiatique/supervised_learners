import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {C,HumanCharacter,Label} from './components';
import {CueSymbol} from './reward-components';
import {RewardSymbol} from './risk-components';
import {draw,ease,mix,progress} from './motion';

export const REWARD_UPDATE={from:1440,duration:360,focus:60,firstArrival:132,surprise:150,update:210,nextTrial:240,out:288} as const;
export const getRewardUpdateState=(frame:number)=>{
 const f=Math.max(0,Math.min(300,frame));
 const focus=ease(f,60,82),first=ease(f,80,132),back=ease(f,210,240),again=ease(f,240,285);
 return {frame:f,mouseX:mix(1130,760,focus)+510*first-510*back+510*again,received:f>=150?3:f>=132?1:0,expected:f>=210?3:1,surprised:progress(f,150,160)*(1-progress(f,200,215)),information:progress(f,210,222)*(1-progress(f,260,278)),connection:mix(.35,1,ease(f,210,255)),opacity:progress(f,0,12)*(1-progress(f,288,300))};
};
const Mouse:React.FC<{x:number;y:number;frame:number;surprised:number;walking:number;facing:number}>=({x,y,frame,surprised,walking,facing})=>{
 const step=Math.sin(frame*.5)*6*walking;
 return <g transform={`translate(${x} ${y}) scale(${.8*facing} .8)`} stroke={C.white} strokeWidth={3.5} fill={C.bg} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-56 12C-159 -55 -177 40 -107 45" fill="none"/>
  <ellipse rx={65} ry={35}/><path d="M39 -25Q75 -52 105 -14L132 4 104 23 53 24"/>
  <circle cx={76} cy={-33} r={23}/><circle cx={76} cy={-33} r={13} stroke={C.gray} strokeWidth={2}/>
  <circle cx={107} cy={-8} r={2.8+surprised*2} fill={C.white}/><circle cx={130} cy={4} r={3} fill={C.white}/>
  <path d="M123 8l28 -8M122 13l26 12" strokeWidth={2}/>
  <path d={`M-34 31l${-6+step} 20h24M52 25l${7-step} 26h24`}/>
  <ellipse cx={112} cy={16} rx={4} ry={2+surprised*3} opacity={surprised}/>
 </g>;
};
const AppleSet:React.FC<{x:number;y:number;count:number;scale?:number;amount?:number}>=({x,y,count,scale=.65,amount=1})=><g opacity={amount}>
 {Array.from({length:count},(_,i)=><RewardSymbol key={i} x={x+(count===1?0:(i-1)*84)} y={y+(count===3&&i===1?-24:0)} scale={scale}/>)}</g>;

/** Begins at 48s; a longer organism introduction keeps later events and the 60s exit aligned. */
export const RewardLearningUpdate:React.FC=()=>{
 const frame=useCurrentFrame();
 const storyFrame=frame<120?frame*.5:frame-60;
 const s=getRewardUpdateState(storyFrame),f=s.frame;
 const humanOpacity=1-progress(f,60,80),examples=progress(f,60,82);
 const ring1=progress(f,65,85)*(1-progress(f,90,100)),ring2=progress(f,240,258)*(1-progress(f,260,272));
 const context=progress(f,60,95),gold=progress(f,150,160)*(1-progress(f,190,210));
 const thought=progress(f,150,165)*(1-progress(f,245,270));
 const walking=(f>=80&&f<=132)||(f>=210&&f<=285)?1:0;
 return <AbsoluteFill style={{backgroundColor:C.bg,opacity:progress(frame,0,12)*(1-progress(frame,348,360))}}><svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="A human and mouse introduce reward learning across organisms. A bell predicts a reward location, one expected apple becomes three, and updated expectations guide another approach.">
  <g opacity={humanOpacity}>
   <Label x={960} y={160} size={36}>LEARNING FROM REWARDS</Label>
   <HumanCharacter x={700} y={720} scale={.9} frame={f} naturalMotion expression="curious" look={5}/>
  </g>
  <g opacity={examples}>
   <CueSymbol x={420} y={560} scale={1.1} amount={context} ring={Math.max(ring1,ring2)}/>
   <rect x={1300} y={440} width={380} height={300} rx={26} stroke={C.blue} strokeWidth={2} strokeDasharray="5 10" fill={C.blue} fillOpacity={.025} opacity={context}/>
   <Label x={1490} y={783} size={23} color={C.gray}>REWARD LOCATION</Label>
   <path d="M330 745H1690" stroke={C.gray} strokeWidth={2} opacity={.18}/>
   <path d="M470 850H900M1020 850H1450" stroke={C.blue} strokeWidth={2+s.connection*2} opacity={s.connection*.7} strokeDasharray="5 11" fill="none"/>
   {[{x:420,label:'CUE'},{x:960,label:'ACTION'},{x:1500,label:'REWARD'}].map(({x,label})=><g key={label}><circle cx={x} cy={850} r={5} fill={label==='REWARD'?C.green:C.blue}/><Label x={x} y={905} size={25} color={label==='REWARD'?C.green:C.gray}>{label}</Label></g>)}
   <path d="M470 850H900M1020 850H1450" stroke={C.yellow} strokeWidth={3} opacity={s.information*.8} fill="none" {...draw(progress(f,210,255))}/>
  </g>
  <Mouse x={s.mouseX} y={690} frame={f} surprised={s.surprised} walking={walking} facing={1-2*ease(f,207,214)+2*ease(f,237,244)}/>
  <g opacity={context}>
   <ellipse cx={1490} cy={580} rx={175} ry={115} fill={C.yellow} opacity={gold*.055}/>
   <ellipse cx={1490} cy={580} rx={160+gold*10} ry={100+gold*10} stroke={C.yellow} strokeWidth={2} fill="none" opacity={gold*.6}/>
   <AppleSet x={1490} y={600} count={s.received||1} amount={s.received?1:.17} scale={.75}/>
  </g>
  <g opacity={thought}>
   <path d="M930 325Q895 270 970 255H1180Q1260 260 1250 335Q1265 400 1190 410H1110L1060 455 1075 410H975Q910 410 930 325Z" stroke={C.white} strokeWidth={3} fill={C.bg} {...draw(progress(f,150,165))}/>
   <AppleSet x={1090} y={340} count={s.expected} scale={s.expected===1?.47:.38}/>
  </g>
  <g opacity={progress(f,150,165)}><Label x={960} y={160} size={34}><tspan fill={C.gray}>Expected: 1</tspan> · <tspan fill={C.yellow}>Received: 3</tspan></Label></g>
  <g transform="translate(960 215)" opacity={.35+s.information*.65}>
   <circle r={28+s.information*5} fill={C.bg} stroke={s.information>.1?C.yellow:C.blue} strokeWidth={2.5}/>
   <Label x={0} y={11} size={32} color={s.information>.1?C.yellow:C.blue}>i</Label>
   <circle r={43} fill="none" stroke={C.yellow} strokeWidth={2} opacity={s.information*.35}/>
  </g>
  <g opacity={progress(f,210,230)}><Label x={960} y={980} size={28} color={C.yellow}>UPDATED EXPECTATION → NEXT CHOICE</Label></g>
 </svg></AbsoluteFill>;
};
