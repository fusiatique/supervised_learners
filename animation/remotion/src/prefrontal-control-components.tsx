import React from 'react';
import {C,Label} from './components';
import {draw,ease,mix,progress} from './motion';
import {type SymbolPlacement} from './risk-components';

export const BehavioralBrake:React.FC<SymbolPlacement & {activation:number;strength?:number}>=({x=0,y=0,scale=1,amount=1,opacity=1,activation,strength=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} stroke={C.blue} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
  <path d="M-65 65H70M-45 65L-12 0" opacity={.35+.65*strength} {...draw(amount)}/>
  <g transform={`translate(0 ${17*activation}) rotate(${14*activation})`} opacity={.2+.8*strength}>
    <path d="M-55 -42H52V-4H-55Z" fill={C.bg} {...draw(amount)}/>
    {[-32,-10,12,34].map(cx=><path key={cx} d={`M${cx} -34l-9 22`} {...draw(amount)}/>)}
  </g>
  <path d="M-15 25H45" strokeWidth={8} opacity={activation*strength}/>
</g>;

/** Availability schematic, not receptor counts, dopamine concentration or a measurement. */
export const D2ReceptorAvailability:React.FC<{x:number;y:number;scale?:number;availability:'higher'|'lower';amount:number;emphasis?:number}>=({x,y,scale=1,availability,amount,emphasis=1})=>{
  const positions=availability==='higher'?[-96,-58,-20,20,58,96]:[-58,20,96];
  return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={amount}>
    <circle r={152} stroke={C.gray} strokeWidth={2} fill={C.bg}/><circle r={157} stroke={C.yellow} strokeWidth={2} fill="none" opacity={.3*emphasis}/>
    <path d="M-125 20H125M-125 34H125" stroke={C.gray} strokeWidth={2}/>
    {positions.map((rx,i)=><g key={rx} transform={`translate(${rx} 20)`} opacity={progress(amount,i*.08,.5+i*.08)} stroke={C.blue} strokeWidth={3} fill={C.bg} strokeLinejoin="round"><path d="M-8 10V-22L-15 -36V-50H-7V-39H7V-50H15V-36L8 -22V10"/></g>)}
    <Label x={0} y={-83} size={27} color={C.yellow}>D2</Label>
    <Label x={0} y={90} size={18} color={C.gray}>Availability schematic</Label>
    <Label x={0} y={205} size={23} color={availability==='lower'?C.yellow:C.white}>{availability==='higher'?'HIGHER':'LOWER'} AVAILABILITY</Label>
  </g>;
};

export const SynapticAdaptation:React.FC<{x:number;y:number;scale?:number;amount:number;adaptation:number;frame:number}>=({x,y,scale=1,amount,adaptation,frame})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={amount}>
  <circle r={200} stroke={C.gray} strokeWidth={2} fill={C.bg}/>
  <g stroke={C.blue} strokeWidth={3} fill="none" strokeLinecap="round"><path d="M-160 -55Q-105 -45 -76 -15Q-30 0 -76 30Q-105 65 -160 65M160 -65Q110 -65 78 -28Q32 0 78 28Q110 65 160 55" {...draw(amount)}/></g>
  <path d="M-63 0H63" stroke={C.yellow} strokeWidth={mix(2,5,adaptation)} opacity={mix(.4,.9,adaptation)} {...draw(amount)}/>
  {[0,1,2].map(i=>{const t=((frame+i*23)%110)/110;return <circle key={i} cx={mix(-58,58,t)} cy={-24+i*23} r={3+i%2} fill={C.yellow} opacity={amount*.65}/>;})}
  <Label x={0} y={135} size={19} color={C.gray}>Conceptual adaptation</Label>
</g>;

/** Rat silhouette reuses the outline and proportions of Scene 05's schematic rat. */
export const RatIllustration:React.FC<SymbolPlacement & {walking?:number;frame:number}>=({x=0,y=0,scale=1,amount=1,opacity=1,walking=0,frame})=>{
 const step=Math.sin(frame*.22)*8*walking;
 return <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} stroke={C.white} strokeWidth={3.5} fill={C.bg} strokeLinecap="round" strokeLinejoin="round">
  <ellipse rx={80} ry={45} {...draw(amount)}/><path d="M55 -25Q92 -67 132 -18L158 7 121 26 70 28M-76 15C-166 -65 -194 40 -120 56" {...draw(amount)}/>
  <path d={`M-40 39L${-53+step} 67H${-23+step}M72 27L${80-step} 66H${108-step}`} {...draw(amount)}/>
  <circle cx={96} cy={-37} r={22} {...draw(amount)}/><circle cx={126} cy={-8} r={3} fill={C.white} opacity={amount}/><path d="M149 5l27 -9M147 12l28 9" strokeWidth={2} {...draw(amount)}/>
 </g>;
};

/** Medial-view rodent schematic, anterior RIGHT; PL belongs to rodent mPFC. */
export const RatBrain:React.FC<SymbolPlacement & {prelimbic?:number;label?:boolean}>=({x=0,y=0,scale=1,amount=1,opacity=1,prelimbic=1,label=false})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <g stroke={C.gray} strokeWidth={3} fill={C.bg} strokeLinecap="round" strokeLinejoin="round">
    <path d="M-185 15C-215 -55 -120 -114 -20 -115C72 -119 152 -97 188 -44Q204 -20 193 24Q154 74 65 72L-90 80Q-165 80 -185 15Z" fill={C.blue} fillOpacity={.035} {...draw(amount)}/>
    <path d="M185 -38Q235 -64 253 -27Q257 4 196 22M-184 10Q-243 0 -248 42Q-243 85 -174 71M-181 74L-139 109H-89L-96 78" {...draw(amount)}/>
    <path d="M-146 -28Q-62 -78 52 -54Q102 -43 130 -11M-138 0Q-36 -35 53 -6Q82 18 40 32M-232 35L-190 44M-231 51L-194 59" opacity={.45} {...draw(amount)}/>
  </g>
  <path d="M129 -68Q167 -59 178 -33L165 6Q148 15 126 -1L115 -39Z" fill={C.blue} fillOpacity={.04+.2*prelimbic} stroke={C.blue} strokeWidth={3} opacity={amount*(.25+.75*prelimbic)} {...draw(amount)}/>
  {label&&<g opacity={amount}><path d="M153 -34L275 -110H320" stroke={C.gray} fill="none" strokeWidth={2}/><Label x={280} y={-135} size={26}>PRELIMBIC CORTEX</Label><Label x={0} y={160} size={22} color={C.gray}>Rat medial prefrontal cortex · schematic</Label></g>}
</g>;
export const getRatExperimentPose=(frame:number,condition:'stimulation'|'inhibition')=>{
 const start=condition==='stimulation'?1590:1680,end=condition==='stimulation'?1650:1740;
 const t=ease(frame,start,end);
 return {x:condition==='stimulation'?mix(300,440,t):mix(1180,1480,t),walking:Math.sin(t*Math.PI),activity:condition==='stimulation'?mix(.4,1,t):mix(.4,.12,t)};
};
