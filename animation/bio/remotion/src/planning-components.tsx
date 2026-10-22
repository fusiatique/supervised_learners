import React from 'react';
import {AnimatedArrow,C,HumanCharacter,Label} from './components';
import {curvePoint,draw,ease,fade,mix,progress} from './motion';
import {RewardSymbol,WarningSymbol} from './risk-components';

export const PLANNING_ROUTES={reward:[[0,194],[-80,90],[-330,20],[-400,-166]],risk:[[0,194],[80,90],[330,20],[400,-166]]};
const path=(p:number[][])=>`M${p[0].join(' ')}C${p.slice(1).map(v=>v.join(' ')).join(' ')}`;
export const getPlanningPose=(f:number)=>{
  const actual=ease(f,1140,1255);
  const [x,y]=curvePoint(actual,PLANNING_ROUTES.reward);
  return {x,y:y-64,walking:Math.sin(actual*Math.PI),actual};
};
export const ImaginedTrajectory:React.FC<{frame:number;start:number;end:number;route:'reward'|'risk'}>=({frame,start,end,route})=>{
  const p=ease(frame,start,end-18),[x,y]=curvePoint(p,PLANNING_ROUTES[route]);
  const opacity=progress(frame,start,start+12)*(1-progress(frame,end-12,end));
  return <g opacity={opacity*.4}>
    <path d={path(PLANNING_ROUTES[route])} stroke={C.blue} strokeWidth={3} strokeDasharray="9 12" fill="none"/>
    <HumanCharacter x={x} y={y-64} scale={.8} color={C.blue} frame={frame} walking={Math.sin(p*Math.PI)} naturalMotion expression={route==='reward'?'satisfied':'conflicted'} look={route==='reward'?-5:5}/>
    <g opacity={progress(frame,end-32,end-18)} transform={`translate(${route==='reward'?-400:400} -310)`}><path d={route==='reward'?'M-20 0L-3 17 28 -20':'M-20 -18L20 18M20 -18L-20 18'} stroke={route==='reward'?C.green:C.red} strokeWidth={5} fill="none" strokeLinecap="round"/></g>
  </g>;
};
export const PlanningPreview:React.FC<{frame:number;x?:number;y?:number;scale?:number;opacity?:number;unknown?:boolean;title?:boolean;titleFrom?:number;titleUntil?:number}>=({frame:f,x=960,y=650,scale=1,opacity=1,unknown=false,title=true,titleFrom=1140,titleUntil=1200})=>{
  const pose=getPlanningPose(f),chosen=progress(f,1140,1190);
  return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <path d={path(PLANNING_ROUTES.reward)} stroke={C.white} strokeWidth={3} opacity={.4} fill="none" {...draw(progress(f,90,150))}/>
    <path d={path(PLANNING_ROUTES.risk)} stroke={C.white} strokeWidth={3} opacity={mix(.4,.12,chosen)} fill="none" {...draw(progress(f,110,170))}/>
    <path d={path(PLANNING_ROUTES.reward)} stroke={C.green} strokeWidth={5} opacity={chosen} fill="none" {...draw(chosen)}/>
    <RewardSymbol x={-400} y={-230} scale={.8}/>
    {unknown?<Label x={400} y={-215} size={62} color={C.yellow}>?</Label>:<WarningSymbol x={400} y={-230} scale={.95}/>}
    <HumanCharacter x={pose.x} y={pose.y} scale={.8} frame={f} walking={pose.walking} naturalMotion expression={pose.actual>.95?'satisfied':'curious'} look={f<1050?-5:5}/>
    {f<270&&<g opacity={fade(f,180,200,245)}><Label x={0} y={-80} size={45} color={C.yellow}>?</Label></g>}
    {!unknown&&<><ImaginedTrajectory frame={f} start={960} end={1050} route="reward"/><ImaginedTrajectory frame={f} start={1050} end={1140} route="risk"/></>}
    {title&&<g opacity={progress(f,titleFrom,titleFrom+30)*(1-progress(f,titleUntil,titleUntil+45))}><Label x={0} y={315} size={30}>PREDICT → EVALUATE → CHOOSE</Label></g>}
    <g opacity={progress(f,1250,1270)} transform="translate(-400 -315)"><path d="M-18 0L-3 15 25 -18" stroke={C.green} strokeWidth={5} fill="none" strokeLinecap="round"/></g>
  </g>;
};
export const GoalRepresentation:React.FC<{frame:number;x?:number;y?:number;scale?:number;opacity?:number}>=({frame:f,x=1320,y=530,scale=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <circle r={250} stroke={C.gray} strokeWidth={2} fill={C.bg} {...draw(progress(f,660,705))}/>
  <HumanCharacter x={-155} y={60} scale={.5} frame={f} amount={progress(f,660,700)} look={5}/><RewardSymbol x={165} y={-10} scale={.63} amount={progress(f,670,710)}/>
  <g opacity={progress(f,680,710)}><Label x={165} y={-100} size={25} color={C.green}>GOAL</Label></g>
  {[0,1,2].map(i=><g key={i} opacity={progress(f,750+i*15,765+i*15)}><circle cx={-60+i*65} cy={35} r={7} fill={C.blue}/><AnimatedArrow x={-125+i*65} y={35} length={45} amount={progress(f,750+i*15,765+i*15)} color={C.blue}/></g>)}
  <g opacity={progress(f,810,840)}><Label x={0} y={165} size={25} color={C.blue}>PLAN BEFORE ACTING</Label></g>
</g>;
export const ProjectionNeuronInset:React.FC<{frame:number;target:'NAc'|'PFC';x:number;y:number;scale?:number;opacity?:number;change:number}>=({frame,target,x,y,scale=1,opacity=1,change})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <circle r={146} fill={C.bg} stroke={C.gray} strokeWidth={2}/>
  <circle r={150} fill="none" stroke={C.yellow} strokeWidth={2} opacity={.4*change}/>
  <Label x={0} y={-160} size={27} color={C.yellow}>VTA → {target}</Label>
  <path d="M-20 -31Q8 -58 35 -26L49 17Q20 48 -15 32L-38 0Z M40 10Q85 16 108 65" stroke={C.yellow} strokeWidth={3} fill="none" strokeLinecap="round"/>
  {[[-110,-65],[-115,10],[-72,95]].map(([sx,sy],i)=><g key={i}>
    <path d={`M${sx} ${sy}Q${sx*.5} ${sy*.8} -25 ${-15+i*18}`} stroke={C.blue} strokeWidth={mix(2,4,change)} opacity={mix(.35,.95,change)} fill="none"/>
    <circle cx={-31} cy={-15+i*18} r={mix(3,6,change)} fill={C.blue}/>
    <path d={`M${sx*.65} ${sy*.7}l-10 -2m10 2l-5 -9`} stroke={C.blue} strokeWidth={2} fill="none"/>
  </g>)}
  <Label x={0} y={204} size={22} color={C.gray}>INCOMING CONNECTIONS</Label>
  <Label x={0} y={239} size={20} color={C.gray}>Schematic · rodent findings</Label>
</g>;
