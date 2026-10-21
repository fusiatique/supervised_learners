import React from 'react';
import {C} from './components';
import {draw, progress} from './motion';
import {RewardSymbol, type SymbolPlacement} from './risk-components';

export const WaterGlass:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill="none" stroke={C.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-41 -51L-30 54H30L41 -51Z" {...draw(amount)}/>
  <path d="M-35 -2Q-18 -12 0 -2T35 -2L29 48H-29Z" fill={C.green} fillOpacity={.09*amount} stroke={C.green} strokeWidth={3} {...draw(amount)}/>
</g>;
export const RewardHearts:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-18 -21C-49 -56 -80 -13 -53 12L-18 46 17 12C44 -13 13 -56 -18 -21Z" fill={C.bg} stroke={C.white} {...draw(amount)}/>
  <path d="M24 -5C-5 -37 -33 1 -8 26L24 57 56 26C81 1 53 -37 24 -5Z" fill={C.bg} stroke={C.green} {...draw(amount)}/>
</g>;
export const NaturalRewardIcons:React.FC<{x?:number;y?:number;scale?:number;amount?:number;opacity?:number}>=({x=230,y=555,scale=1,amount=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <RewardSymbol y={-115} scale={.72} amount={progress(amount,0,.5)} opacity={progress(amount,0,.12)}/>
  <WaterGlass y={40} scale={.72} amount={progress(amount,.2,.75)} opacity={progress(amount,.2,.32)}/>
  <RewardHearts y={195} scale={.68} amount={progress(amount,.45,1)} opacity={progress(amount,.45,.6)}/>
</g>;
