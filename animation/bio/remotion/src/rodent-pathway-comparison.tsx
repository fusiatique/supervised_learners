import React from 'react';
import {BrainAnatomy,type BrainCamera} from './BrainAnatomy';
import {C,Label,SourceCitation} from './components';
import {CocainePowderBag} from './dopamine-introduction-components';
import {WarningSymbol} from './risk-components';
import {curvePoint,draw,ease,mix,pop,progress} from './motion';

export const RODENT_COMPARISON={start:990,end:1590,duration:600,cocaine:120,cocaineInputs:180,aversive:300,aversiveInputs:360,together:480,title:540} as const;
/** Schematic side view; right-facing snout, rounded ears, paws and a long tail. */
export const LaboratoryRat:React.FC<{frame:number;amount?:number;x?:number;y?:number;scale?:number}>=({frame,amount=1,x=0,y=0,scale=1})=><g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
 <path d="M-118 35C-162 13-168-58-107-87C-52-116 38-107 83-61L113-61Q149-50 172-19L205-4Q213 4 202 12L151 28 118 44Q105 67 71 63L18 57-51 63Q-94 63-118 35Z" {...draw(amount)}/>
 <path d="M-136 13C-212-25-228 104-315 81C-354 69-321 34-294 49" stroke={C.gray} {...draw(amount)}/>
 <path d="M74-52C49-92 91-118 115-91Q136-65 107-45M84-65Q76-89 95-88M-73 48L-81 77H-37M45 50L58 76H103M120 38L130 63H164" {...draw(amount)}/>
 <circle cx={150} cy={-22} r={4} fill={C.white} stroke="none" opacity={amount}/>
 <path d="M195 3L229-8M194 9L230 16M191 14L220 32" strokeWidth={1.7} {...draw(amount)}/>
 <circle cx={207} cy={4} r={3} fill={C.gray} stroke="none" opacity={amount}/>
</g>;

/** Separate rodent schematic, not a relabelled human brain. Anterior is right. */
const RodentBrainInset:React.FC<{frame:number}>=({frame:f})=>{
 const amount=progress(f,30,60);
 const paths=progress(f,60,105);
 return <g opacity={amount} transform="translate(1260 470)">
  <circle r={211} fill={C.bg} stroke={C.gray} strokeWidth={2} {...draw(amount)}/>
  <path d="M-155 16Q-166-76-96-101Q-10-132 92-83L136-50Q167-51 173-23Q170-6 148-3L115 27Q58 65-27 49L-59 70-77 48Q-125 70-147 45ZM-145 20Q-119-6-90 21L-90 55M-36 44L-28 87 2 87-5 48" fill="none" stroke={C.gray} strokeWidth={3} {...draw(amount)}/>
  <ellipse cx={-22} cy={35} rx={13} ry={9} fill={C.yellow} opacity={amount}/>
  <Label x={-48} y={108} size={23} color={C.yellow}>VTA</Label>
  <path d="M-22 35Q25-4 77 4" fill="none" stroke={C.yellow} strokeWidth={3} {...draw(paths)}/>
  <path d="M-22 35Q12-62 125-43" fill="none" stroke={C.blue} strokeWidth={3} {...draw(paths)}/>
  <g opacity={paths}><circle cx={77} cy={4} r={9} fill="none" stroke={C.yellow} strokeWidth={2}/><circle cx={125} cy={-43} r={11} fill="none" stroke={C.blue} strokeWidth={2}/>
   <Label x={92} y={39} size={20} color={C.yellow}>NAc</Label><Label x={121} y={-69} size={20} color={C.blue}>PFC</Label>
  </g>
  <g opacity={progress(f,70,100)}><Label x={-80} y={163} size={22} color={C.yellow}>VTA → NAc</Label><Label x={88} y={163} size={22} color={C.blue}>VTA → PFC</Label></g>
 </g>;
};

const INPUTS=[
 [[-310,-132],[-190,-140],[-148,-55],[-67,-28]],
 [[-322,0],[-214,-37],[-141,43],[-64,9]],
 [[-283,147],[-160,154],[-153,60],[-39,49]],
];
const curve=(points:number[][])=>`M${points[0]}C${points[1]} ${points[2]} ${points[3]}`;
/** Geometry and styling of this outgoing projection never depend on input adaptation. */
export const StableOutgoingProjection:React.FC<{target:'NAc'|'PFC'}>=({target})=><g data-connection="outgoing" fill="none" stroke={C.yellow} strokeWidth={3}>
 <path d="M55 3C117 22 167-62 250-60M238-68L250-60 238-52"/>
 <ellipse cx={290} cy={-60} rx={38} ry={29}/>
 <Label x={290} y={-53} size={24} color={C.yellow}>{target}</Label>
</g>;

export const VtaInputNeuron:React.FC<{frame:number;start:number;target:'NAc'|'PFC';reveal?:number}>=({frame:f,start,target,reveal=start-50})=>{
 const incoming=progress(f,start,start+35),change=progress(f,start+25,start+60);
 return <g>
  <g opacity={incoming} data-connection="incoming">
   {INPUTS.map((points,i)=>{
    const width=mix([2.1,2.8,2.2][i],[3.1,1.8,2.6][i],change);
    const brightness=mix([.55,.9,.65][i],[.95,.55,.8][i],change);
    const travel=((Math.max(0,f-start)+i*17)%66)/66;
    const pulse=curvePoint(travel,points),end=points[3],near=curvePoint(.91,points);
    return <g key={i}>
     <path d={curve(points)} fill="none" stroke={C.blue} strokeWidth={11} opacity={.065*change} {...draw(incoming)}/>
     <path d={curve(points)} fill="none" stroke={C.blue} strokeWidth={width} opacity={brightness} {...draw(incoming)}/>
     <circle cx={pulse[0]} cy={pulse[1]} r={mix(3,4.5,change)} fill={C.blue} opacity={incoming*.85}/>
     <circle cx={end[0]} cy={end[1]} r={5} fill={C.blue} opacity={incoming}/>
     <path d={`M${near[0]-9} ${near[1]-7}L${near[0]} ${near[1]} ${near[0]-10} ${near[1]+5}`} fill="none" stroke={C.blue} strokeWidth={2} opacity={incoming}/>
    </g>;
   })}
  </g>
  <path d="M-51-36L-29-59 6-51 37-24 55 3 36 38 2 56-39 49-64 9Z M-51-36L-81-68-109-77M-29-59L-19-96 5-112M-64 9L-99 29-120 25M-39 49L-54 86-39 112M2 56L19 89" fill={C.bg} stroke={C.yellow} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" {...draw(progress(f,reveal,reveal+40))}/>
  <g opacity={progress(f,reveal,reveal+40)}><StableOutgoingProjection target={target}/><Label x={0} y={7} size={22} color={C.yellow}>VTA</Label></g>
  <g opacity={progress(f,start+60,start+80)}><Label x={-175} y={205} size={25} color={C.blue}>ALTERED INPUTS</Label></g>
 </g>;
};

const ComparisonPanel:React.FC<{frame:number;target:'NAc'|'PFC';x:number}>=({frame:f,target,x})=>{
 const left=target==='NAc',start=left?180:360,experience=left?120:300;
 const active=left?1-.45*ease(f,300,330)+.45*ease(f,480,510):.45+.55*ease(f,300,330);
 const symbol=progress(f,experience,experience+25);
 const settle=mix(.95,1,Math.min(1,pop(f,experience)));
 return <g transform={`translate(${x} 0)`} opacity={active}>
  <LaboratoryRat frame={f} x={-60} y={335} scale={.62} amount={progress(f,90,120)}/>
  <g opacity={symbol} transform={`translate(225 255) scale(${settle})`}>
   {left?<CocainePowderBag scale={.52} amount={symbol}/>:<WarningSymbol scale={.8} amount={symbol}/>}
  </g>
  <g opacity={symbol}><Label x={0} y={175} size={left?28:25} color={left?C.white:C.red}>{left?'COCAINE':'UNPLEASANT EXPERIENCE'}</Label></g>
  <g transform="translate(-30 620)" opacity={progress(f,105,135)}><VtaInputNeuron frame={f} start={start} target={target} reveal={120}/></g>
  <g opacity={progress(f,105,120)}><Label x={0} y={940} size={30} color={C.yellow}>VTA → {target}</Label></g>
 </g>;
};

/** Local frames 0–599 correspond exactly to playback 33–53 seconds. */
export const RodentPathwayComparison:React.FC<{frame:number;startingCamera:BrainCamera;endingCamera:BrainCamera}>=({frame:f,startingCamera,endingCamera})=>{
 const split=progress(f,90,120),end=progress(f,570,599);
 const introBrain=1-progress(f,30,60);
 const camera={x:mix(startingCamera.x,960,ease(f,0,30)),y:mix(startingCamera.y,240,ease(f,0,30)),scale:mix(startingCamera.scale,.48,ease(f,0,30)),anteriorRight:true};
 return <g aria-label="Rodent research: altered inputs onto two populations of VTA projection neurons">
  <g opacity={introBrain}><BrainAnatomy {...camera} cortexOpacity={.6} frame={0} highlights={{VTA:1,NAc:.45,PFC:1}} pathwayProgress={{mesolimbic:1,mesocortical:1}}/></g>
  <g opacity={(1-split)}>
   <LaboratoryRat frame={f} x={720} y={735} scale={1.15} amount={progress(f,0,35)}/>
   <g opacity={progress(f,25,50)}><path d="M928 673Q1100 680 1110 575" fill="none" stroke={C.gray} strokeWidth={2} {...draw(progress(f,25,55))}/></g>
   <RodentBrainInset frame={f}/>
   <g opacity={progress(f,30,50)}><Label x={720} y={920} size={26} color={C.gray}>RODENT RESEARCH</Label></g>
  </g>
  <g opacity={split*(1-end)}>
   <path d="M960 190V975" stroke={C.gray} strokeWidth={1} opacity={.25}/>
   <ComparisonPanel frame={f} target="NAc" x={480}/>
   <ComparisonPanel frame={f} target="PFC" x={1440}/>
   <g opacity={progress(f,540,565)}><Label x={960} y={85} size={32}>DIFFERENT EXPERIENCES, DIFFERENT NEURAL ADAPTATIONS</Label></g>
   <Label x={960} y={1000} size={20} color={C.gray}>Schematic · rodent findings</Label>
  </g>
  <g opacity={end}><BrainAnatomy {...endingCamera} cortexOpacity={.6} frame={0} highlights={{VTA:1,NAc:.45,PFC:1}} pathwayProgress={{mesolimbic:1,mesocortical:1}} pathwayOpacity={{mesolimbic:.8,mesocortical:1}}/></g>
  <SourceCitation frame={990+f} source="Cooper et al., 2017"/>
 </g>;
};
