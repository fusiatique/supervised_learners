import React from 'react';
import {BrainAnatomy} from './BrainAnatomy';
import {C, HumanCharacter, Label} from './components';
import {draw, ease, mix, progress} from './motion';
import {SimpleNeuron} from './reward-components';
import {type SymbolPlacement} from './risk-components';

export const Cookie:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-43 -20Q-29 -49 3 -45Q35 -44 45 -12Q57 20 27 40Q-4 55 -31 35Q-54 15 -43 -20Z" fill={C.yellow} fillOpacity={.09*amount} stroke={C.yellow} strokeWidth={3.5} {...draw(amount)}/>
  {[[-19,-17],[13,-24],[27,5],[-8,13],[4,33],[-31,8]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r={4} fill={C.yellow} opacity={amount}/>)}
</g>;
export const CookiePlate:React.FC<SymbolPlacement & {frame?:number}>=({x=0,y=0,scale=1,amount=1,opacity=1,frame=0})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <ellipse cy={54} rx={116} ry={22} stroke={C.white} strokeWidth={3} fill="none" {...draw(amount)}/>
  <Cookie x={-48} y={14} scale={.8} amount={amount}/><Cookie x={43} y={14} scale={.8} amount={amount}/><Cookie y={-30} scale={.8} amount={amount}/>
  {[0,1,2].map(i=><path key={i} d={`M${-45+i*45} -88q-17 -20 0 -40t0 -40`} transform={`translate(0 ${-6*Math.sin(frame*.04+i)})`} fill="none" stroke={C.gray} opacity={.6*amount} strokeWidth={2} {...draw(amount)}/>)}
</g>;
export const ShoppingBag:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill="none" stroke={C.white} strokeWidth={4} strokeLinejoin="round"><path d="M-55 -25H55L66 65H-66Z M-26 -25V-45A26 26 0 0 1 26 -45V-25" {...draw(amount)}/><path d="M-20 16L0 35 30 0" stroke={C.green} {...draw(amount)}/></g>;
export const DopamineMessenger:React.FC<SymbolPlacement & {frame:number}>=({x=960,y=480,scale=1,amount=1,opacity=1,frame})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity*amount}>
  <circle r={68+3*Math.sin(frame*.045)} fill={C.yellow} opacity={.055}/><circle r={45} fill={C.bg} stroke={C.yellow} strokeWidth={3}/><Label x={0} y={10} size={30} color={C.yellow}>DA</Label>
</g>;
export const Smile:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} stroke={C.white} strokeWidth={4} fill="none" strokeLinecap="round"><circle r={65} {...draw(amount)}/><path d="M-25 -17V-12M25 -17V-12M-28 15Q0 49 28 15" {...draw(amount)}/></g>;
export const CocaineContainer:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-38 -72H38V-48L53 -28V70Q53 83 40 83H-40Q-53 83 -53 70V-28L-38 -48Z" stroke={C.white} fill={C.bg} {...draw(amount)}/><path d="M-42 -82H42V-65H-42Z" stroke={C.gray} fill={C.bg} {...draw(amount)}/><path d="M-49 5H49V56H-49Z" stroke={C.red} fill={C.red} fillOpacity={.06*amount} {...draw(amount)}/><Label x={0} y={39} size={18} color={C.red}>COCAINE</Label>
</g>;
export const Pair:React.FC<{frame:number;amount:number}>=({frame,amount})=><g>
  <HumanCharacter x={-45} y={115} scale={.46} frame={frame} amount={amount} expression="satisfied" look={5}/><HumanCharacter x={45} y={115} scale={.46} frame={frame+8} amount={amount} expression="satisfied" look={-5}/>
  <path d="M0 -65C-35 -100 -59 -54 -33 -34L0 -7 33 -34C59 -54 35 -100 0 -65Z" fill={C.bg} stroke={C.green} strokeWidth={3} {...draw(amount)}/>
</g>;
/** Shared handoff: Scene 03.5 ends at frame 30; Scene 04 continues from there. */
export const DopamineCircuitBridge:React.FC<{frame:number;showBrain?:boolean}>=({frame,showBrain=true})=>{
  const brain=progress(frame,0,30)*.35;
  return <g>
    <g opacity={1-progress(frame,0,30)}><SimpleNeuron x={880} y={540} scale={1.3} amount={.72} opacity={.3}/></g>
    {showBrain&&<BrainAnatomy x={700} y={405} scale={.7} anteriorRight={false} amount={brain} frame={0}/>}
    {Array.from({length:9},(_,i)=>{const a=i*Math.PI*2/9;const t=ease(frame,0,60);return <g key={i}>
      <circle cx={mix(880+Math.cos(a)*165,700+Math.cos(a)*150,t)+Math.sin((frame+1680)*.035+i)*4} cy={mix(540+Math.sin(a)*120,405+Math.sin(a)*90,t)+Math.cos((frame+1680)*.03+i)*4} r={12} fill={C.yellow} opacity={.06}/>
      <circle cx={mix(880+Math.cos(a)*165,700+Math.cos(a)*150,t)+Math.sin((frame+1680)*.035+i)*4} cy={mix(540+Math.sin(a)*120,405+Math.sin(a)*90,t)+Math.cos((frame+1680)*.03+i)*4} r={4} fill={C.yellow}/>
    </g>;})}
  </g>;
};

/** Powder in a sealed bag for the cocaine illustration in Scene 06. */
export const CocainePowderBag:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
 <path d="M-57 -78H57L51 -48 64 65Q65 80 48 82H-48Q-65 80 -64 65L-51 -48Z" stroke={C.white} fill={C.bg} {...draw(amount)}/>
 <path d="M-50 -61H50M-48 -53H48" stroke={C.gray} fill="none" {...draw(amount)}/>
 <g opacity={amount}>
  <path d="M-49 64L-33 42 -18 45 0 20 17 38 30 34 49 64Z" fill={C.white} fillOpacity={.7} stroke={C.white} strokeWidth={2}/>
  <path d="M-20 55l8 -5m19 5 7 2m-10 -17 4 3" stroke={C.bg} strokeWidth={2}/>
  <Label x={0} y={-12} size={20} color={C.white}>COCAINE</Label>
 </g>
</g>;
