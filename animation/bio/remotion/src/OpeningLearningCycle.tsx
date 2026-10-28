import React from 'react';
import {AnimatedArrow,BrainIllustration,C,Label,LearningLoop,ProcessorIllustration} from './components';
import {curvePoint,draw,ease,mix,progress} from './motion';

export const OPENING_CYCLE={preserve:30,action:39,outcome:66,learning:86,feedback:98,repeat:102,negative:135,maladaptive:174,settle:219,hold:240,restore:270} as const;
const feedbackPoint=(t:number):number[]=>t<.25?curvePoint(t*4,[[1432,725],[1510,725],[1520,930],[1370,930]]):t<.75?[mix(1370,550,(t-.25)*2),930]:curvePoint((t-.75)*4,[[550,930],[400,930],[410,725],[488,725]]);
const pulse=(f:number,start:number,end:number)=>progress(f,start,start+5)*(1-progress(f,end-5,end));
const rgb=(a:string,b:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),t)).toString(16).padStart(2,'0')).join('');
export const getOpeningCycleState=(frame:number)=>{
 const f=Math.max(30,Math.min(frame,270));
 const restore=ease(f,240,270),working=1-restore;
 const negative=progress(f,148,159)*working;
 // A full forward-and-feedback circuit: positive replay, then two faster harmful repeats.
 const cycle=f>=199&&f<219?{start:199,end:219}:f>=174&&f<199?{start:174,end:199}:f>=135&&f<174?{start:135,end:174}:f>=102&&f<135?{start:102,end:135}:null;
 const phase=cycle?progress(f,cycle.start,cycle.end):0;
 const action=(Math.max(pulse(f,39,57),cycle?1-progress(phase,0,.2):0,f>=219?1:0))*working;
 const outcome=Math.max(pulse(f,66,82),cycle?Math.sin(progress(phase,.23,.48)*Math.PI):0)*working;
 const learning=Math.max(pulse(f,86,102),cycle?Math.sin(progress(phase,.48,.7)*Math.PI):0)*working;
 const rotation=progress(f,86,219)*360;
 return {f,restore,working,negative,phase,cycleStart:cycle?.start??null,action,outcome,learning,rotation,feedback:progress(f,86,102)*working,question:1-progress(f,30,55)*working,zoom:1+.045*ease(f,30,66)*working};
};
const Dot:React.FC<{x:number;y:number;color:string;opacity:number}>=({x,y,color,opacity})=><g opacity={opacity}><circle cx={x} cy={y} r={14} fill={color} opacity={.09}/><circle cx={x} cy={y} r={5} fill={color}/></g>;

/** Changes only the nine-second opening hold; shared Scene 01 artwork stays untouched. */
export const OpeningLearningCycle:React.FC<{frame:number}>=({frame})=>{
 const s=getOpeningCycleState(frame),f=s.f;
 const outcomeColor=rgb(C.green,C.red,s.negative),feedbackColor=rgb(C.blue,C.red,s.negative);
 const chipOpacity=mix(1,.18,ease(f,30,60)*s.working);
 const firstAction=progress(f,43,66),firstLearning=progress(f,66,86),firstFeedback=progress(f,98,102);
 const stageOpacity=(start:number,end:number)=>pulse(f,start,end)*s.working;
 const phase=s.phase;
 const forward=s.cycleStart!==null&&phase<.64;
 const forwardT=progress(phase,.08,.64);
 const forwardX=forwardT<.5?mix(650,860,forwardT*2):mix(1060,1270,(forwardT-.5)*2);
 const feedbackT=progress(phase,.64,1);
 const [returnX,returnY]=feedbackPoint(feedbackT);
 const [firstX,firstY]=feedbackPoint(firstFeedback);
 const ringT=progress(f,66,86);
 return <g transform={`translate(960 725) scale(${s.zoom}) translate(-960 -725)`}>
  <BrainIllustration x={420} y={270} scale={.66} frame={600+(f-30)*s.working} signal={1}/>
  <g opacity={chipOpacity}><ProcessorIllustration x={1500} y={270} scale={.66} frame={600} signal={1}/></g>
  <defs><clipPath id="opening-question-only"><path d="M0 450H1920V600H0Z"/></clipPath></defs>
  <g opacity={s.question} clipPath="url(#opening-question-only)"><LearningLoop frame={1230}/></g>
  {[{x:550,label:'Action',color:C.yellow,active:s.action},{x:960,label:'Outcome',color:outcomeColor,active:s.outcome},{x:1370,label:'Learning',color:C.blue,active:s.learning}].map(({x,label,color,active},i)=><g key={label} transform={`translate(${x} 725)`}>
    <circle r={70} fill={color} opacity={.09+active*.1}/><circle r={62} stroke={color} strokeWidth={3+active} fill="none"/>
    <g transform={i===2?`rotate(${s.rotation})`:i===0?`scale(${1+.055*active})`:undefined} stroke={color} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={i===2&&f>=148&&f<174?.75+.25*Math.cos(f*.7)**2:1}>
      {i===0?<path d="M-15 20V-18Q-15 -30 -6 -24L12 -10 26 -3Q34 0 29 10L13 28H-4Z"/>:i===1?<><path d="M-26 0L-8 18 29 -21" opacity={1-s.negative}/><path d="M-23 0H23" opacity={s.negative}/></>:<path d="M-29 4A30 30 0 0 1 20 -24L29 -17 M29 -31V-17H15 M29 -4A30 30 0 0 1 -20 24L-29 17 M-29 31V17H-15"/>}
    </g>
    <Label x={0} y={117} size={34} color={color}>{label}</Label>
  </g>)}
  <AnimatedArrow x={650} y={725} length={210} amount={1}/><AnimatedArrow x={1060} y={725} length={210} amount={1}/>
  <g opacity={s.feedback} stroke={feedbackColor} strokeWidth={3} fill="none" strokeLinecap="round"><path d="M1432 725C1510 725 1520 930 1370 930H550C400 930 410 725 488 725" {...draw(progress(f,86,102))}/><path d="M488 725l-15 -9m15 9l-15 9" {...draw(progress(f,98,102))}/></g>
  <g opacity={Math.sin(ringT*Math.PI)*.35*s.working}><circle cx={960} cy={725} r={70+25*ringT} fill="none" stroke={C.green} strokeWidth={2}/></g>
  <g opacity={stageOpacity(66,96)}><Label x={960} y={622} size={32} color={C.green}>+1</Label></g>
  <g opacity={s.negative}><Label x={960} y={622} size={32} color={C.red}>−1</Label></g>
  <Dot x={mix(650,860,firstAction)} y={725} color={C.yellow} opacity={stageOpacity(43,70)}/>
  <Dot x={mix(1060,1270,firstLearning)} y={725} color={C.blue} opacity={stageOpacity(66,90)}/>
  <Dot x={firstX} y={firstY} color={C.blue} opacity={stageOpacity(98,105)}/>
  <Dot x={forwardX} y={725} color={s.negative>.2?C.red:C.yellow} opacity={s.cycleStart!==null&&forward?s.working:0}/>
  <Dot x={returnX} y={returnY} color={feedbackColor} opacity={s.cycleStart!==null&&!forward?s.working:0}/>
 </g>;
};
