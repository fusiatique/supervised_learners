import React from 'react';
import {C,Label} from './components';
import {SimpleNeuron} from './reward-components';
import {curvePoint,draw,mix,progress} from './motion';

export type SynapseState='baseline'|'potentiated'|'depressed';
export const SYNAPTIC_EFFICACY={baseline:.45,potentiated:1,depressed:.16} as const;
export const postsynapticResponse=(strength:number)=>.2+.8*Math.max(0,Math.min(1,strength));
const activity=(frame:number,start:number,duration:number)=>progress(frame,start,start+3)*(1-progress(frame,start+duration-4,start+duration));

/** Constant test input, variable illustrative response. Line weight denotes efficacy. */
export const PlasticSynapse:React.FC<{frame:number;strength?:number;state?:SynapseState;testFrame?:number;training?:boolean;amount?:number;x?:number;y?:number;scale?:number;responseLabel?:boolean}>=({frame:f,strength,state='baseline',testFrame=0,training=false,amount=1,x=0,y=0,scale=1,responseLabel=true})=>{
 const efficacy=strength??SYNAPTIC_EFFICACY[state];
 const relative=f-testFrame;
 const phase=training?((Math.max(0,relative))%66):relative;
 const travel=progress(phase,0,30),response=activity(phase,31,30)*postsynapticResponse(efficacy);
 const a=amount;
 const color=efficacy>.65?C.green:C.blue;
 return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={a} aria-label="Synaptic efficacy and response to the same test input">
  <circle cx={-450} r={39} fill={C.blue} opacity={activity(phase,0,36)*.1}/>
  <SimpleNeuron x={-450} scale={.65} color={C.white} amount={a}/>
  <SimpleNeuron x={450} scale={.65} color={C.white} amount={a}/>
  <path d="M-228 1C-159 1-105-14-34 0M36 0Q174-8 348 0" fill="none" stroke={color} strokeWidth={mix(1.8,6,efficacy)} opacity={mix(.35,1,efficacy)} {...draw(a)}/>
  <path d="M-35-30Q7-28-6 0Q7 28-35 30M30-40Q17 0 30 40" fill="none" stroke={C.white} strokeWidth={3} {...draw(a)}/>
  <circle cx={mix(-450,-12,travel)} cy={0} r={6} fill={C.blue} opacity={activity(phase,0,31)}/>
  <g opacity={response}>
   <circle cx={450} r={mix(28,70,efficacy)} fill={color} opacity={.11}/>
   <circle cx={450} r={mix(25,55,efficacy)} stroke={color} strokeWidth={3} fill="none"/>
  </g>
  <path d={`M345 158H395L410 ${158-78*postsynapticResponse(efficacy)} 425 ${158+22*postsynapticResponse(efficacy)} 441 158H550`} stroke={color} strokeWidth={3} fill="none" opacity={progress(relative,31,45)} {...draw(progress(relative,31,57))}/>
  {responseLabel&&<g opacity={progress(relative,31,45)}><Label x={450} y={211} size={24} color={C.gray}>RESPONSE</Label></g>}
 </g>;
};

export const NETWORK_NODES=[[-520,-170],[-160,-210],[200,-135],[520,-190],[-510,180],[-160,145],[200,215],[530,165]];
export const NETWORK_EDGES=[[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[0,4],[1,5],[2,6],[3,7],[5,2]];
export const LEARNED_STRENGTHS=[.95,.85,.9,.25,.22,.38,.3,.8,.35,.4,.9];
export const REWARDED_STRENGTHS=[1,.94,.98,.2,.18,.32,.25,.88,.3,.35,.96];
export const DRUG_STRENGTHS=[1,1,.98,.16,.18,.21,.24,.9,.28,.3,.95];
export const interpolateStrengths=(a:number[],b:number[],t:number)=>a.map((v,i)=>mix(v,b[i],t));
export const networkEdgePoints=(index:number)=>{
 const [a,b]=NETWORK_EDGES[index],start=NETWORK_NODES[a],end=NETWORK_NODES[b];
 return [[start[0]+27,start[1]],[mix(start[0],end[0],.35),start[1]-28],[mix(start[0],end[0],.7),end[1]+20],[end[0]-31,end[1]]];
};
/** One fixed network geometry is reused from initial learning through the final hold. */
export const PlasticNeuralNetwork:React.FC<{frame:number;strengths?:number[];amount?:number;active?:number;focusPair?:number;dopamine?:number;freeze?:boolean;x?:number;y?:number;scale?:number}>=({frame:f,strengths=NETWORK_EDGES.map(()=>.45),amount=1,active=1,focusPair=0,dopamine=0,freeze=false,x=960,y=550,scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} aria-label="A network with independently changing synaptic efficacies">
 {NETWORK_EDGES.map(([a,b],i)=>{
  const points=networkEdgePoints(i),s=strengths[i],p=freeze?0:((f+i*13)%96)/96;
  const point=curvePoint(p,points),pair=a<2&&b<2?1:1-focusPair*.88;
  const d=`M${points[0]}C${points[1]} ${points[2]} ${points[3]}`;
  return <g key={i} opacity={pair}>
   <path d={d} stroke={s>.7?C.green:C.blue} strokeWidth={mix(1.2,5.3,s)} opacity={mix(.2,.85,s)} fill="none" {...draw(amount)}/>
   <path d={d} stroke={C.yellow} strokeWidth={8} opacity={dopamine*(i<3?.13:.035)} fill="none" {...draw(amount)}/>
   <circle cx={point[0]} cy={point[1]} r={4.5} fill={C.blue} opacity={freeze?0:amount*active*(s>.65?1:.25)*(Math.sin(p*Math.PI)**2)}/>
  </g>;
 })}
 {NETWORK_NODES.map(([nx,ny],i)=><g key={i} opacity={i<2?1:1-focusPair*.88}>
  <SimpleNeuron x={nx} y={ny} scale={.4} amount={Math.min(amount,progress(f,i*8,i*8+28))} color={C.white}/>
  <circle cx={nx} cy={ny} r={25} fill={C.blue} opacity={freeze?0:.055*active*(.5+.5*Math.sin(f*.08-i))}/>
 </g>)}
</g>;
