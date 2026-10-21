import React from 'react';
import {C} from './components';
import {draw, progress} from './motion';
import type {SymbolPlacement} from './risk-components';

export const RewardPulse: React.FC<SymbolPlacement & {age?: number; strength?: number; plus?: boolean}> = ({x=0,y=0,scale=1,amount=1,opacity=1,age=0,strength=1,plus=true}) => {
  const ring=progress(age,0,45);
  return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} stroke={C.yellow} fill="none" strokeLinecap="round" strokeWidth={4}>
    <circle r={32*strength} fill={C.yellow} fillOpacity={.06} {...draw(amount)}/>
    {plus&&<path d="M-12 0H12M0 -12V12" {...draw(amount)}/>}
    <circle r={(34+ring*53)*strength} opacity={Math.sin(ring*Math.PI)*.4} strokeWidth={3}/>
    <circle r={(42+ring*35)*strength} opacity={Math.sin(ring*Math.PI)*.06} fill={C.yellow} stroke="none"/>
  </g>;
};

export const LearnedAssociation: React.FC<{d: string; amount?: number; strength?: number; opacity?: number; color?: string; arrow?: boolean}> = ({d,amount=1,strength=0,opacity=1,color=C.yellow,arrow=false}) => <g opacity={opacity} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
  <path d={d} strokeWidth={12+strength*9} opacity={.035+strength*.035} {...draw(amount)}/>
  <path d={d} strokeWidth={3+strength*4} opacity={.55+strength*.4} {...draw(amount)}/>
  {arrow&&<path d="M0 0"/>}
</g>;

export const CueSymbol: React.FC<SymbolPlacement & {ring?: number}> = ({x=0,y=0,scale=1,amount=1,opacity=1,ring=0}) => <g transform={`translate(${x} ${y}) rotate(${Math.sin(ring*Math.PI*6)*7*Math.sin(ring*Math.PI)}) scale(${scale})`} opacity={opacity} fill="none" stroke={C.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-41 26Q-29 11 -28 -13Q-27 -42 0 -42Q27 -42 28 -13Q29 11 41 26Z M-13 39Q0 55 13 39 M0 -42V-55" {...draw(amount)}/>
  <g stroke={C.yellow} opacity={Math.sin(ring*Math.PI)}><path d="M-49 -36Q-66 -9 -50 12 M49 -36Q66 -9 50 12 M-64 -46Q-87 -10 -67 22 M64 -46Q87 -10 67 22"/></g>
</g>;

export const BrokenHeart: React.FC<SymbolPlacement> = ({x=0,y=0,scale=1,amount=1,opacity=1}) => <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill="none" stroke={C.red} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-7 -24C-42 -57 -72 -11 -45 17L0 59 45 17C72 -11 42 -57 9 -25 M4 -25L-9 -5 9 11 -5 32" {...draw(amount)}/>
</g>;

/** Shared handoff for the next dopamine scene; amount controls the incomplete outline. */
export const SimpleNeuron: React.FC<SymbolPlacement & {color?:string}> = ({x=0,y=0,scale=1,amount=1,opacity=1,color=C.yellow}) => <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-59 -15Q-44 -67 0 -56Q45 -63 62 -13Q74 27 34 46Q0 67 -37 42Q-71 25 -59 -15Z" {...draw(amount)}/>
  {['M-45 -43L-97 -94 -126 -85M-97 -94L-108 -132','M-60 -6L-127 -20 -155 3M-127 -20L-154 -55','M-38 41L-90 90 -124 86M-90 90L-85 127','M12 -55L35 -114 70 -136M35 -114L10 -137','M38 40L70 105 109 116','M61 1C160 -18 210 23 300 2L340 -25M300 2L341 33'].map(d=><path key={d} d={d} {...draw(amount)}/>)}
  <circle r={18} opacity={.35} {...draw(amount)}/>
</g>;
