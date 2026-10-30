import React from 'react';
import {BrainIllustration, C, Label} from './components';
import {draw, ease, fade, mix, progress} from './motion';
import {type SymbolPlacement} from './risk-components';

/** Colours from the maths scenes (animation/maths/manim/scenes/common/theme.py). */
export const M={pill:'#e86bb4',apple:'#7cc36b',ink:'#e8ecf4',muted:'#8a94a8',cell:'#1b2538',highlight:'#3b3b66',dopamine:'#f5b041',homeo:'#2ec4b6',harm:'#e5484d',model:'#9d7cf2',face:'#1a1530'};
const SERIF='"Latin Modern Roman", "CMU Serif", "Times New Roman", Times, serif';
const MathText:React.FC<{x:number;y:number;size:number;color:string;children:React.ReactNode;opacity?:number}>=({x,y,size,color,children,opacity=1})=><text x={x} y={y} fill={color} opacity={opacity} fontSize={size} fontStyle="italic" fontFamily={SERIF} textAnchor="middle">{children}</text>;

/** Same fade-and-rise title used across the bio scenes. */
export const Title:React.FC<{f:number;from:number;until?:number;text:React.ReactNode;x?:number;y?:number;color?:string;size?:number}>=({f,from,until,text,x=960,y=125,color=C.white,size=35})=><g opacity={fade(f,from,from+24,until)} transform={`translate(0 ${13*(1-ease(f,from,from+24))})`}><Label x={x} y={y} size={size} color={color}>{text}</Label></g>;

export type Expression='blank'|'happy'|'sad'|'open';
const mouthPath=(r:number,expression:Expression)=>{
  const l=-.26*r,rt=.26*r,y=.4*r;
  if(expression==='happy')return `M${l} ${y}Q0 ${y+.12*r} ${rt} ${y}`;
  if(expression==='sad')return `M${l} ${y+.1*r}Q0 ${y-.02*r} ${rt} ${y+.1*r}`;
  return `M${l} ${y}H${rt}`;
};
/** The maths agent glyph (common/agent.py): a violet-ringed face, centred on (x, y).
 *  `look` shifts the eyes sideways; `brain` lights the brain point above the eyes. */
export const MathsAgent:React.FC<{x:number;y:number;r:number;amount?:number;opacity?:number;expression?:Expression;look?:number;glasses?:number;gold?:number;brain?:number;frame?:number}>=({x,y,r,amount=1,opacity=1,expression='blank',look=0,glasses=0,gold=0,brain=0,frame=0})=>{
  const face=progress(amount,.5,1),ex=.33*r,ey=-.12*r,dx=look*.06*r;
  return <g transform={`translate(${x} ${y})`} opacity={opacity}>
    {gold>0&&<circle r={r*1.45} fill={M.dopamine} opacity={.08*gold}/>}
    <circle r={r} fill={M.face} stroke={M.model} strokeWidth={4} {...draw(amount)}/>
    {brain>0&&<g opacity={brain}>
      <circle cy={-.55*r} r={.3*r} fill={M.dopamine} opacity={.22}/>
      <BrainIllustration y={-.53*r} scale={.5*r/450} frame={frame} amount={brain} signal={brain} color={M.dopamine}/>
    </g>}
    <g opacity={face}>
      {[-1,1].map(side=><g key={side}>
        <ellipse cx={side*ex+dx} cy={ey} rx={.075*r} ry={.12*r} fill={M.ink}/>
        <ellipse cx={side*ex+dx} cy={ey} rx={.075*r} ry={.12*r} fill={M.dopamine} opacity={gold}/>
      </g>)}
      {expression==='open'
        ?<ellipse cy={.42*r} rx={.13*r} ry={.09*r} fill="none" stroke={M.ink} strokeWidth={3.5}/>
        :<path d={mouthPath(r,expression)} fill="none" stroke={M.ink} strokeWidth={3.5} strokeLinecap="round"/>}
    </g>
    <g opacity={glasses} transform={`translate(0 ${-1.2*r*(1-glasses)})`} stroke={M.ink} strokeWidth={3} fill="none" strokeLinecap="round">
      <circle cx={-ex} cy={ey} r={.21*r}/><circle cx={ex} cy={ey} r={.21*r}/><path d={`M${-ex+.21*r} ${ey}H${ex-.21*r}M${-ex-.21*r} ${ey}L${-.97*r} ${ey-.08*r}M${ex+.21*r} ${ey}L${.97*r} ${ey-.08*r}`}/>
    </g>
  </g>;
};
/** Agent radius as a fraction of the cell it sits in, as in the maths grid stage. */
export const AGENT_RATIO=.3;

/** A row of maths grid cells s1..sn. Cell centres come from trackCells.
 *  current: how much each cell carries the agent's violet tint; glow: amber value glow;
 *  outline: amber emphasis ring. */
export const trackCells=(x:number,n:number,size:number)=>Array.from({length:n},(_,i)=>x+(i-(n-1)/2)*size);
export const occupancy=(agentX:number,cells:number[],size:number)=>cells.map(cx=>Math.max(0,1-Math.abs(agentX-cx)/size));
export const StateTrack:React.FC<{x:number;y:number;n:number;size:number;amount?:number;opacity?:number;current?:number[];glow?:number[];outline?:number[];labels?:boolean}>=({x,y,n,size,amount=1,opacity=1,current=[],glow=[],outline=[],labels=true})=><g opacity={opacity}>
  {trackCells(x,n,size).map((cx,i)=>{
    const a=progress(amount,i/n*.6,i/n*.6+.4),half=size/2;
    return <g key={i} opacity={a}>
      <rect x={cx-half} y={y-half} width={size} height={size} fill={M.cell} stroke={M.ink} strokeWidth={2}/>
      <rect x={cx-half} y={y-half} width={size} height={size} fill={M.highlight} opacity={current[i]??0}/>
      <rect x={cx-half} y={y-half} width={size} height={size} fill={M.dopamine} opacity={.5*(glow[i]??0)}/>
      {labels&&<MathText x={cx-.04*size} y={y+.15*size} size={.42*size} color={M.ink} opacity={.2}>s<tspan fontSize={.24*size} dy={.08*size}>{i+1}</tspan></MathText>}
      {(outline[i]??0)>0&&<rect x={cx-half} y={y-half} width={size} height={size} fill="none" stroke={M.dopamine} strokeWidth={5} opacity={outline[i]}/>}
    </g>;
  })}
</g>;
/** A value written small in a cell's bottom-right corner, as value_tex does. */
export const CellValue:React.FC<{cx:number;cy:number;size:number;children:React.ReactNode;scale?:number}>=({cx,cy,size,children,scale=1})=><g transform={`translate(${cx+.3*size} ${cy+.3*size}) scale(${scale})`}><MathText x={0} y={.08*size} size={.22*size} color={M.dopamine}>{children}</MathText></g>;
/** The policy's action in a cell: a small violet arrow (policy_arrow). */
export const PolicyArrow:React.FC<{cx:number;cy:number;size:number;amount?:number;color?:string}>=({cx,cy,size,amount=1,color=M.model})=>{
  const l=.28*size;
  return <g stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill={color}>
    <path d={`M${cx-l} ${cy}H${cx+l-14}`} {...draw(amount)}/>
    <path d={`M${cx+l} ${cy}l-16 -9v18Z`} opacity={progress(amount,.6,1)}/>
  </g>;
};

export const Glow:React.FC<{x:number;y:number;r:number;color:string;opacity:number}>=({x,y,r,color,opacity})=><g>
  <circle cx={x} cy={y} r={r*1.35} fill={color} opacity={opacity*.4}/><circle cx={x} cy={y} r={r} fill={color} opacity={opacity}/>
</g>;

/** Manim's Flash: lines radiate and fade; age is frames since it started. */
export const Burst:React.FC<{x:number;y:number;age:number;color:string;radius?:number;lines?:number}>=({x,y,age,color,radius=70,lines=12})=>{
  const t=progress(age,0,18);
  if(t<=0||t>=1)return null;
  const inner=radius*mix(.45,1.1,t),outer=inner+radius*.5*(1-t);
  return <g opacity={Math.sin(t*Math.PI*.5+Math.PI*.5)} stroke={color} strokeWidth={4} strokeLinecap="round">
    {Array.from({length:lines},(_,i)=>{const a=i*2*Math.PI/lines;return <path key={i} d={`M${x+Math.cos(a)*inner} ${y+Math.sin(a)*inner}L${x+Math.cos(a)*outer} ${y+Math.sin(a)*outer}`}/>;})}
  </g>;
};

/** The maths reward: a solid amber star (common/reward.py). */
const STAR=Array.from({length:10},(_,i)=>{const r=i%2?.45:1,a=-Math.PI/2+i*Math.PI/5;return `${(r*Math.cos(a)).toFixed(3)} ${(r*Math.sin(a)).toFixed(3)}`;}).join('L');
export const RewardStar:React.FC<SymbolPlacement>=({x=0,y=0,scale=1,opacity=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
  <path d={`M${STAR}Z`} fill={M.dopamine}/>
</g>;

/** Closed "Human → Maths" book that opens into two ruled pages. */
export const TranslationBook:React.FC<SymbolPlacement & {open:number}>=({x=0,y=0,scale=1,amount=1,opacity=1,open})=><g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
  <g opacity={1-open}>
    <path d="M-95 -68H95V68H-95Z M-80 -68V68" stroke={C.yellow} strokeWidth={4} fill={C.bg} {...draw(amount)}/>
    <Label x={8} y={8} size={20} color={C.yellow}>HUMAN → MATHS</Label>
  </g>
  <g opacity={open} transform={`scale(${mix(.5,1,open)} 1)`} fill={C.bg} stroke={C.white} strokeWidth={3}>
    <path d="M-2 -68Q-80 -84 -162 -68V68Q-80 52 -2 68Z M2 -68Q80 -84 162 -68V68Q80 52 2 68Z"/>
    <g stroke={C.gray} strokeWidth={2}>{[-30,0,30].map(ly=><path key={ly} d={`M-130 ${ly}H-34M34 ${ly}H130`}/>)}</g>
  </g>
</g>;

/** The maths internal-state dial (common/gauge.py): teal fill up to H, a needle, the
 *  setpoint tick H* and a red arc for the gap between them. Levels run 0 (left) to 1 (right). */
export const Gauge:React.FC<{x:number;y:number;radius:number;level:number;target:number;opacity?:number}>=({x,y,radius,level,target,opacity=1})=>{
  const pt=(v:number,k:number)=>{const a=Math.PI*(1-v);return [x+k*radius*Math.cos(a),y-k*radius*Math.sin(a)];};
  const arc=(from:number,to:number,k:number)=>{const [ax,ay]=pt(from,k),[bx,by]=pt(to,k);return `M${ax} ${ay}A${k*radius} ${k*radius} 0 0 ${to>from?1:0} ${bx} ${by}`;};
  const [nx,ny]=pt(level,.72),[t1x,t1y]=pt(target,.74),[t2x,t2y]=pt(target,1.2),[lx,ly]=pt(target,1.45);
  return <g opacity={opacity} fill="none" strokeLinecap="butt">
    <path d={arc(0,1,1)} stroke={M.muted} strokeWidth={14} opacity={.35}/>
    {[0,.25,.5,.75,1].map(v=>{const [ax,ay]=pt(v,.78),[bx,by]=pt(v,.9);return <path key={v} d={`M${ax} ${ay}L${bx} ${by}`} stroke={M.muted} strokeWidth={2}/>;})}
    <path d={arc(0,Math.max(.001,level),1)} stroke={M.homeo} strokeWidth={14}/>
    {Math.abs(target-level)>.005&&<path d={arc(Math.min(level,target),Math.max(level,target),1.14)} stroke={M.harm} strokeWidth={7}/>}
    <path d={`M${t1x} ${t1y}L${t2x} ${t2y}`} stroke={M.ink} strokeWidth={4}/>
    <MathText x={lx} y={ly+12} size={34} color={M.ink}>H*</MathText>
    <path d={`M${x} ${y}L${nx} ${ny}`} stroke={M.ink} strokeWidth={4} strokeLinecap="round"/>
    <circle cx={x} cy={y} r={8} fill={M.ink}/>
    <MathText x={x} y={y+52} size={40} color={M.homeo}>H</MathText>
  </g>;
};

/** Dashed link that grows from a to b. */
export const DashedLink:React.FC<{a:readonly number[];b:readonly number[];amount:number;color?:string}>=({a,b,amount,color=C.yellow})=>amount<=0?null:<path d={`M${a[0]} ${a[1]}L${mix(a[0],b[0],amount)} ${mix(a[1],b[1],amount)}`} stroke={color} strokeWidth={3} strokeDasharray="12 10" strokeLinecap="round" opacity={.8}/>;

/** Brief emphasis envelope, the equivalent of Manim's Indicate. */
export const indicate=(f:number,start:number,duration=42)=>Math.sin(progress(f,start,start+duration)*Math.PI);

/** The maths drug (common/icons.py capsule): a tilted two-tone capsule, white and pink, with a glint. `size` is its length in px. */
export const MathsCapsule:React.FC<{x:number;y:number;size:number;opacity?:number}>=({x,y,size,opacity=1})=><g transform={`translate(${x} ${y}) rotate(${-0.6*180/Math.PI})`} opacity={opacity}>
  <clipPath id={`capsule-${size.toFixed(1)}`}><rect x={-size/2} y={-.2*size} width={size} height={.4*size} rx={.2*size}/></clipPath>
  <g clipPath={`url(#capsule-${size.toFixed(1)})`}><rect x={-size/2} y={-.2*size} width={size/2} height={.4*size} fill={M.ink}/><rect x={0} y={-.2*size} width={size/2} height={.4*size} fill={M.pill}/></g>
  <path d={`M${-.3*size} ${-.09*size}H${-.05*size}`} stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" opacity={.7}/>
</g>;

/** The maths green apple (common/icons.py apple): a round body, a stalk and a leaf. `size` matches the Manim size in px. */
export const MathsApple:React.FC<{x:number;y:number;size:number;opacity?:number}>=({x,y,size,opacity=1})=><g transform={`translate(${x} ${y})`} opacity={opacity}>
  <circle cx={-.14*size} r={.32*size} fill={M.apple}/><circle cx={.14*size} r={.32*size} fill={M.apple}/>
  <path d={`M0 ${-.22*size}V${-.42*size}`} stroke={M.ink} strokeWidth={3}/>
  <ellipse cx={.12*size} cy={-.38*size} rx={.12*size} ry={.055*size} fill="#4f9a46" transform={`rotate(${-0.5*180/Math.PI} ${.12*size} ${-.38*size})`}/>
</g>;
