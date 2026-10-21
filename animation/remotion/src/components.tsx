import React from 'react';
import {draw, pop, progress} from './motion';

export const C = {bg: '#101827', white: '#F5F5F5', blue: '#65C7F7', yellow: '#FFD166', green: '#6DD5A0', red: '#F07178', gray: '#AAB4C3'};
type Placement = {x?: number; y?: number; scale?: number; color?: string; amount?: number};
export const Label: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; color?: string; anchor?: 'start'|'middle'|'end'}> = ({x, y, children, size=30, color=C.white, anchor='middle'}) => <text x={x} y={y} fill={color} stroke="none" fontSize={size} textAnchor={anchor} fontFamily="Arial, Helvetica, sans-serif">{children}</text>;

export const SourceCitation: React.FC<{frame: number; source?: string}> = ({frame, source='Bellman, 1966'}) => <g opacity={progress(frame, 0, 30)}><text x={45} y={1045} fill={C.gray} fontSize={24} fontFamily="Arial, Helvetica, sans-serif">{source}</text></g>;

export type HumanExpression = 'neutral' | 'curious' | 'disappointed' | 'recognition' | 'satisfied' | 'conflicted';
export const HumanCharacter: React.FC<Placement & {frame: number; walking?: number; shrug?: number; expression?: HumanExpression; look?: number; headTilt?: number; naturalMotion?: boolean; seated?: boolean}> = ({x=0,y=0,scale=1,color=C.white,amount=1,frame,walking=0,shrug=0,expression='neutral',look,headTilt=0,naturalMotion=false,seated=false}) => {
  const step = Math.sin(frame * .33) * 16 * walking;
  const blink = frame >= 44 && frame <= 49;
  const gaze = look ?? (frame > 120 && frame < 150 ? -5 : frame >= 150 && frame < 180 ? 5 : 0);
  const arm = naturalMotion ? step * .65 : 0;
  const mouth = expression === 'disappointed' || expression === 'conflicted' ? 'M-10 -117Q0 -125 10 -117' : expression === 'curious' ? 'M-7 -120Q0 -123 7 -120' : expression === 'satisfied' ? 'M-13 -124Q0 -109 13 -124' : 'M-10 -122Q0 -115 10 -122';
  return <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <g transform={`rotate(${headTilt} 0 -135)`}>
    <circle cx={0} cy={-135} r={37} {...draw(amount)}/>
    <g opacity={progress(amount, .65, 1)} strokeWidth={3}>
      <path d={blink ? 'M-16 -139H-8 M8 -139H16' : `M${-12+gaze} -141v4 M${12+gaze} -141v4`}/>
      <path d={mouth}/>
      {expression==='conflicted'&&<path d="M-19 -151l12 3M7 -148l12 -3"/>}
      {expression==='disappointed'&&<path d="M-19 -147l12 -3M7 -150l12 3"/>}
      {expression==='curious'&&<path d="M7 -152l13 3"/>}
    </g>
    </g>
    <path d={`M0 -97 Q-7 -52 0 0 M-1 -72 Q-29 -61 ${-48+arm} ${-27+Math.abs(arm)*.4} M0 -72 Q29 -61 ${48+arm} ${-27+Math.abs(arm)*.4}`} {...draw(amount)} opacity={1-shrug}/>
    <path d={`M0 -97Q-7 -52 0 0 M0 -72Q-25 -43 -47 ${-60-shrug*18} M0 -72Q25 -43 47 ${-60-shrug*18}`} {...draw(amount)} opacity={shrug}/>
    <path d={seated?'M0 0L40 35V90M0 0L-15 35V90':`M0 0 L${-25+step} 64 M0 0 L${25-step} 64`} {...draw(amount)}/>
  </g>;
};

export const ComputerCharacter: React.FC<Placement & {confused?: boolean; frame: number}> = ({x=0,y=0,scale=1,color=C.blue,amount=1,confused=false,frame}) => <g transform={`translate(${x+(confused?Math.sin(frame*.8)*5:0)} ${y}) scale(${scale})`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  <path d="M-87 -165Q-100 -165 -100 -151V-26Q-100 -13 -86 -13H86Q100 -13 100 -26V-151Q100 -165 86 -165Z M-17 -13V15H17V-13 M-55 20H55" {...draw(amount)}/>
  <path d="M-82 -144H82V-38H-82Z" {...draw(amount)}/>
  <g opacity={progress(amount,.65,1)}><path d="M-30 -105v10 M30 -105v10"/><path d={confused?'M-16 -65Q0 -80 16 -65':'M-17 -75Q0 -55 17 -75'}/></g>
</g>;

export const DecisionPath: React.FC<{amount: number; color?: string; success?: number; uncertainty?: number; frame: number}> = ({amount,color=C.yellow,success=0,uncertainty=1,frame}) => <g fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
  {['M340 650C440 650 480 360 720 320','M340 650C490 650 550 530 760 530','M340 650C470 650 540 720 760 720'].map((d,i)=><path key={d} d={d} {...draw(progress(amount,i*.12,.76+i*.12))} opacity={.55}/>) }
  <g opacity={progress(amount,.6,1)}><g opacity={uncertainty}><Label x={736} y={306} size={48} color={color}>?</Label><circle cx={782} cy={526} r={25} strokeDasharray="4 10"/><Label x={782} y={535} size={28} color={C.red}>±</Label></g>
  <path d="M780 739V675L822 687L780 705" stroke={success>0?C.green:color}/></g>
  {success>0&&<g opacity={success}><circle cx={800} cy={704} r={47+(1-success)*24} stroke={C.green} opacity={.4}/><path d="M831 737l12 12 24 -28" stroke={C.green}/></g>}
  {frame>=120&&frame<200&&[0,1,2].map(i=><g key={i} opacity={pop(frame,120+i*10)} transform={`translate(${470+i*95} ${420+i*65}) rotate(${Math.sin(frame*.1+i)*22})`}><path d={i%2?'M25 0H-25L-13 -10M-25 0L-13 10':'M-25 0H25L13 -10M25 0L13 10'} stroke={C.red}/></g>)}
</g>;

const brainOutline='M-170 80C-231 50 -239 -12 -212 -62C-203 -111 -159 -141 -109 -146C-77 -182 -21 -188 18 -169C71 -184 126 -159 148 -123C196 -107 221 -65 213 -22C235 24 209 72 167 84C133 113 83 105 48 90L62 146L33 152L-5 91C-57 114 -127 114 -170 80Z';
export const BrainIllustration: React.FC<Placement & {frame: number; signal?: number}> = ({x=0,y=0,scale=1,color=C.yellow,amount=1,frame,signal=0}) => <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
  <path d={brainOutline} {...draw(amount)}/>
  {['M-193 -46Q-143 -85 -127 -40T-61 -13Q-34 4 -53 47','M-105 -137Q-125 -89 -76 -86T-7 -121Q20 -142 47 -112','M-30 -154Q-4 -96 25 -72T37 -17Q9 12 31 58','M68 -142Q112 -106 83 -66T106 -8Q151 13 180 -25','M-195 33Q-147 5 -126 43T-65 66','M78 77Q136 47 166 72','M132 -95Q165 -68 187 -86'].map(d=><path key={d} d={d} {...draw(progress(amount,.3,1))}/>)}
  {[[-155,-35],[-81,-96],[-37,24],[43,-83],[111,-8],[135,57]].map(([nx,ny],i)=><g key={i} opacity={signal*progress(frame,45+i*9,65+i*9)}><circle cx={nx} cy={ny} r={13+Math.sin(frame*.12-i)*3} fill={color} stroke="none" opacity={.12}/><circle cx={nx} cy={ny} r={5} fill={color} stroke="none"/></g>)}
  {signal>0&&[0,1,2].map(i=>{const t=((frame+i*31)%100)/100;return <circle key={i} cx={-160+t*300} cy={Math.sin(t*Math.PI*2)*50-i*17} r={4} fill={color} stroke="none" opacity={signal}/>;})}
</g>;

export const ProcessorIllustration: React.FC<Placement & {frame: number; signal?: number}> = ({x=0,y=0,scale=1,color=C.blue,amount=1,frame,signal=0}) => <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round">
  <path d="M-105 -105H105V105H-105Z M-69 -69H69V69H-69Z" {...draw(amount)}/>
  {[-72,-36,0,36,72].map(n=><g key={n}>{[`M${n} -105V-150`,`M${n} 105V150`,`M-105 ${n}H-150`,`M105 ${n}H150`].map(d=><path key={d} d={d} {...draw(progress(amount,.35,1))}/>)}</g>)}
  <path d="M-46 35V-30H-10V14H34V-40 M-45 54H50V-4" {...draw(progress(amount,.5,1))}/>
  {[0,1,2].map(i=>{const t=((frame+i*30)%100)/100;return <circle key={i} cx={-150+t*300} cy={[-36,0,36][i]} r={5} stroke="none" fill={color} opacity={signal}/>;})}
</g>;

export const AnimatedArrow: React.FC<{x: number; y: number; length?: number; amount: number; color?: string}> = ({x,y,length=180,amount,color=C.white}) => <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><path d={`M0 0H${length}l-15 -12 M${length} 0l-15 12`} {...draw(amount)}/></g>;

/** Shared end composition: reuse at frame=1260 to open the next scene. */
export const LearningLoop: React.FC<{frame: number}> = ({frame}) => <g>
  {['HOW','DO','WE','LEARN','TO','MAKE','DECISIONS?'].map((word,i)=>{
    const positions=[424,573,685,800,987,1081,1242];
    const a=progress(frame,1050+i*8,1074+i*8);
    return <g key={word} opacity={a} transform={`translate(0 ${22*(1-a)})`}><Label x={positions[i]} y={545} anchor="start" size={45}>{word}</Label></g>;
  })}
  {[{x:550,label:'Action',color:C.yellow},{x:960,label:'Outcome',color:C.green},{x:1370,label:'Learning',color:C.blue}].map(({x,label,color},i)=>{
    const a=pop(frame,1140+i*20); const glow=progress(frame,1200,1230);
    return <g key={label} transform={`translate(${x} 725) scale(${a})`}>
      <circle r={70} fill={color} opacity={.05+glow*.04}/><circle r={62} fill="none" stroke={color} strokeWidth={3}/>
      <g stroke={color} fill="none" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        {i===0?<path d="M-15 20V-18Q-15 -30 -6 -24L12 -10 26 -3Q34 0 29 10L13 28H-4Z"/>:i===1?<path d="M-26 0L-8 18 29 -21"/>:<><path d="M-29 4A30 30 0 0 1 20 -24L29 -17 M29 -31V-17H15 M29 -4A30 30 0 0 1 -20 24L-29 17 M-29 31V17H-15"/></>}
      </g><Label x={0} y={117} size={34} color={color}>{label}</Label>
    </g>;
  })}
  <AnimatedArrow x={650} y={725} length={210} amount={progress(frame,1155,1180)}/>
  <AnimatedArrow x={1060} y={725} length={210} amount={progress(frame,1175,1200)}/>
</g>;
