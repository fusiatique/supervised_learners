import React from 'react';
import {BrainIllustration, C, LearningLoop, ProcessorIllustration} from './components';
import {curvePoint, draw, mix, progress} from './motion';

export type SymbolPlacement = {x?: number; y?: number; scale?: number; amount?: number; opacity?: number};

/** Matched cubic routes: both drawing and walking use these exact control points. */
export const CROSSROADS = {
  safe: [[960,850],[960,720],[650,630],[500,430]],
  uncertain: [[960,850],[960,720],[1270,630],[1420,430]],
};
export const routePath = (points: number[][]) => `M${points[0].join(' ')}C${points.slice(1).map(p=>p.join(' ')).join(' ')}`;

export const WarningSymbol: React.FC<SymbolPlacement> = ({x=0,y=0,scale=1,amount=1,opacity=1}) => <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} stroke={C.red} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" fill={C.bg}>
  <path d="M0 -39Q2 -41 4 -37L41 30Q43 34 38 34H-38Q-43 34 -41 30L-4 -37Q-2 -41 0 -39Z" {...draw(amount)}/>
  <path d="M0 -15V8M0 21V22" fill="none" {...draw(amount)}/>
</g>;

export const ThoughtBubble: React.FC<SymbolPlacement> = ({x=0,y=0,scale=1,amount=1,opacity=1}) => <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <path d="M-45 -50C-90 -54 -97 -3 -76 15C-91 42 -58 69 -32 53C-5 76 36 59 39 41C77 44 94 12 77 -12C85 -47 43 -67 16 -53C-3 -71 -32 -65 -45 -50Z" fill={C.bg} stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" {...draw(amount)}/>
  <circle cx={-59} cy={78} r={9} fill={C.bg} stroke={C.white} strokeWidth={3} opacity={amount}/>
  <circle cx={-76} cy={102} r={5} fill={C.bg} stroke={C.white} strokeWidth={3} opacity={amount}/>
  <WarningSymbol scale={.7} amount={amount}/>
</g>;

export const RewardSymbol: React.FC<SymbolPlacement> = ({x=0,y=0,scale=1,amount=1,opacity=1}) => <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill="none" stroke={C.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M0 -30C-31 -57 -67 -26 -56 11C-46 48 -23 62 0 47C23 62 46 48 56 11C67 -26 31 -57 0 -30Z" fill={C.green} fillOpacity={.07*amount} {...draw(amount)}/>
  <path d="M0 -29Q-7 -50 7 -65" {...draw(amount)}/>
  <path d="M6 -52Q21 -77 43 -65Q35 -43 6 -52Z" stroke={C.green} {...draw(amount)}/>
  <path d="M-40 -9Q-46 4 -37 17" stroke={C.green} opacity={.6} {...draw(amount)}/>
</g>;

export const MysteryBox: React.FC<SymbolPlacement & {open?: number}> = ({x=0,y=0,scale=1,amount=1,opacity=1,open=0}) => <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill={C.bg} stroke={C.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-60 -27H60V55H-60Z M60 -27L78 -43V36L60 55" {...draw(amount)}/>
  <g transform={`rotate(${-36*open} -60 -27)`}><path d="M-65 -27H65V-42H-65Z M-65 -42L-47 -58H80L65 -42 M65 -27L80 -43V-58" {...draw(amount)}/></g>
  <path d="M-13 -3Q-13 -19 2 -19Q21 -19 16 -3Q13 3 3 8V16M3 28V29" fill="none" opacity={amount*(1-open)} {...draw(amount)}/>
</g>;

export const CapsuleSymbol: React.FC<SymbolPlacement> = ({x=0,y=0,scale=1,amount=1,opacity=1}) => <g transform={`translate(${x} ${y}) rotate(-25) scale(${scale})`} opacity={opacity} stroke={C.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M0 -31H-43A31 31 0 0 0 -43 31H0Z" fill={C.red} fillOpacity={.7*amount} stroke="none"/>
  <path d="M0 -31H43A31 31 0 0 1 43 31H0Z" fill={C.white} fillOpacity={.85*amount} stroke="none"/>
  <path d="M-43 -31H43A31 31 0 0 1 43 31H-43A31 31 0 0 1 -43 -31Z M0 -31V31" fill="none" {...draw(amount)}/>
</g>;

export const CrossroadsPaths: React.FC<{amount: number; safeHighlight: number; riskyDim: number; drug: number; finalDim: number; walkingSafe?: number}> = ({amount,safeHighlight,riskyDim,drug,finalDim,walkingSafe}) => {
  const left=routePath(CROSSROADS.safe), right=routePath(CROSSROADS.uncertain);
  const [signalX,signalY]=curvePoint(walkingSafe??0,CROSSROADS.safe);
  return <g fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={mix(1,.67,finalDim)}>
    <path d={left} stroke={C.green} strokeWidth={18} opacity={.11*safeHighlight} {...draw(amount)}/>
    <path d={left} stroke={C.white} opacity={.35} {...draw(amount)}/>
    <path d={left} stroke={C.green} opacity={mix(.3,1,safeHighlight)} {...draw(amount)}/>
    <path d={right} stroke={C.white} opacity={mix(.65,.2,riskyDim)} {...draw(amount)}/>
    <path d={right} stroke={C.red} opacity={.47*drug} {...draw(amount)}/>
    {walkingSafe!==undefined&&<><circle cx={signalX} cy={signalY} r={17} fill={C.green} stroke="none" opacity={.12}/><circle cx={signalX} cy={signalY} r={5} fill={C.green} stroke="none"/></>}
  </g>;
};

/** Exact illustration arrangement held at the end of Scene 01, without its citation. */
export const Scene01ClosingArtwork: React.FC = () => <g>
  <BrainIllustration x={420} y={270} scale={.66} frame={600} signal={1}/>
  <ProcessorIllustration x={1500} y={270} scale={.66} frame={600} signal={1}/>
  <LearningLoop frame={1230}/>
</g>;
