import React from 'react';
import {AbsoluteFill,Sequence,useCurrentFrame} from 'remotion';
import {anatomyToScreen,BrainAnatomy,BRAIN_REGIONS,type BrainCamera} from './BrainAnatomy';
import {getScene06Camera,MesocorticalPlanningArtwork} from './Scene06_MesocorticalPathwayAndPlanning';
import {AnimatedArrow,C,HumanCharacter,Label,SourceCitation} from './components';
import {draw,ease,fade,mix,progress} from './motion';
import {CocaineContainer} from './dopamine-introduction-components';
import {CueSymbol} from './reward-components';
import {RewardSymbol,WarningSymbol} from './risk-components';
import {BehavioralBrake,D2ReceptorAvailability,getRatExperimentPose,RatBrain,RatIllustration,SynapticAdaptation} from './prefrontal-control-components';

export const SCENE07={width:1920,height:1080,fps:30,durationInFrames:1800} as const;
export const T07={bridge:0,options:60,conflict:150,brake:240,approach:330,stop:375,weaken:420,resist:480,receptors:540,receptorInset:630,association:720,functions:810,urges:870,adaptation:930,synapse:1020,cueResponse:1110,responseLabels:1200,subregions:1290,rodent:1380,prelimbic:1470,experiment:1530,stimulate:1590,inhibit:1680,summary:1740,hold:1770,end:1800} as const;
const blend=(a:BrainCamera,b:BrainCamera,t:number):BrainCamera=>({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),scale:mix(a.scale,b.scale,t),anteriorRight:true});
export const getScene07Camera=(frame:number)=>{
 const f=Math.min(frame,T07.hold);
 let camera=blend(getScene06Camera(1770),{x:560,y:350,scale:.85},ease(f,60,150));
 camera=blend(camera,{x:610,y:430,scale:1.1},ease(f,540,630));
 camera=blend(camera,{x:560,y:380,scale:.9},ease(f,930,1020));
 return blend(camera,{x:570,y:420,scale:1.05},ease(f,1290,1380));
};
export const getControlPose07=(frame:number)=>{
 const first=ease(frame,330,375),weaker=ease(frame,420,480);
 return {x:1080+90*first+190*weaker,walking:Math.max(Math.sin(first*Math.PI),Math.sin(weaker*Math.PI)),brake:progress(frame,345,375)*(1-progress(frame,420,450))};
};
export const getScene07State=(frame:number)=>{
 const f=Math.min(frame,T07.hold);
 const pfc=f<540?mix(1,.3,ease(f,420,480)):f<930?mix(mix(.3,.8,ease(f,540,630)),.25,ease(f,720,810)):f<1290?mix(.25,.6,ease(f,930,1020)):mix(.6,1,ease(f,1290,1350));
 return {frame:f,camera:getScene07Camera(f),pfc,humanOpacity:1-progress(f,1380,1470),citation:f<450?null:f<930?'Volkow et al., 2019; Uhl et al., 2019':'Volkow et al., 2019',association:progress(f,720,780),stimulation:getRatExperimentPose(f,'stimulation'),inhibition:getRatExperimentPose(f,'inhibition')};
};
const Title:React.FC<{f:number;from:number;until?:number;text:string;y?:number;color?:string;size?:number}>=({f,from,until,text,y=125,color=C.white,size=35})=><g opacity={fade(f,from,from+24,until)} transform={`translate(0 ${13*(1-ease(f,from,from+24))})`}><Label x={960} y={y} size={size} color={color}>{text}</Label></g>;

const HumanAnatomy:React.FC<{f:number}>=({f})=>{
 const s=getScene07State(f),[px,py]=anatomyToScreen(BRAIN_REGIONS.PFC.center,s.camera);
 return <g opacity={s.humanOpacity}>
  <g opacity={1-progress(f,60,120)}><MesocorticalPlanningArtwork frame={1770}/></g>
  <g opacity={progress(f,60,120)}><BrainAnatomy {...s.camera} cortexOpacity={.6} frame={f} highlights={{VTA:1,NAc:.45,PFC:s.pfc}} pathwayProgress={{mesolimbic:1,mesocortical:1}} pathwayOpacity={{mesolimbic:.5,mesocortical:1}} activity={{mesocortical:f>=930&&f<1110?.3:0}}/></g>
  <circle cx={px} cy={py} r={45+25*ease(f,0,60)} stroke={C.blue} strokeWidth={2} fill="none" opacity={fade(f,8,25,60)*.3}/>
  <g opacity={fade(f,1290,1320,1380)} transform={`translate(${s.camera.x} ${s.camera.y}) scale(${s.camera.scale}) translate(-500 -330) translate(1000 0) scale(-1 1)`}>
    <path d="M180 200L262 227M154 285L245 300M165 375L257 375" fill="none" stroke={C.blue} strokeWidth={2} strokeDasharray="4 7" opacity={progress(f,1290,1350)}/>
  </g>
 </g>;
};
const ControlMetaphor:React.FC<{f:number}>=({f})=>{
 const pose=getControlPose07(f),cam=getScene07Camera(f),[px,py]=anatomyToScreen(BRAIN_REGIONS.PFC.center,cam);
 const strength=mix(1,.25,ease(f,420,480));
 const visible=progress(f,60,100)*(1-progress(f,540,580));
 return <g>
  <Title f={f} from={8} until={150} text="WHAT IF CONTROL BECOMES IMPAIRED?"/>
  <g opacity={visible}>
    <RewardSymbol x={700} y={755} scale={.85}/><CocaineContainer x={1510} y={750} scale={.75}/><WarningSymbol x={1640} y={745} scale={.6}/>
    <HumanCharacter x={pose.x} y={870} scale={.8} frame={f} walking={pose.walking} naturalMotion expression={f<240?'curious':'conflicted'} look={f<120?-5:5}/>
    <AnimatedArrow x={1250} y={920} length={190} amount={progress(f,100,165)} color={C.yellow}/>
    <path d={`M${px} ${py}Q1050 500 ${pose.x} 680`} stroke={C.blue} strokeWidth={2} opacity={.65*strength*progress(f,150,210)} fill="none" strokeDasharray="5 8"/>
    <g opacity={fade(f,150,180,240)}><Label x={1120} y={600} size={32}><tspan fill={C.yellow}>DESIRE</tspan> vs. <tspan fill={C.blue}>CONTROL</tspan></Label></g>
    <g opacity={progress(f,240,270)}>
      <BehavioralBrake x={1290} y={370} activation={pose.brake} strength={strength} amount={progress(f,240,285)}/>
      <Label x={1290} y={490} size={21} color={C.gray}>Control metaphor</Label>
      <path d={`M${px} ${py}Q1050 230 1200 350`} stroke={C.gray} strokeWidth={2} fill="none" strokeDasharray="4 7" opacity={progress(f,240,285)}/>
      <path d="M1260 690V850M1275 690V850" stroke={C.blue} strokeWidth={5} opacity={pose.brake}/>
    </g>
  </g>
  <Title f={f} from={240} until={420} text="INHIBITORY CONTROL" color={C.blue}/>
  <Title f={f} from={480} until={540} text="WEAKER CONTROL → HARDER TO RESIST" color={C.red} y={970} size={31}/>
 </g>;
};
export const ReceptorsAndControl:React.FC<{f:number}>=({f})=>{
 const camera=getScene07Camera(f),[sx,sy]=anatomyToScreen([365,330],camera),[px,py]=anatomyToScreen(BRAIN_REGIONS.PFC.center,camera);
 const opacity=progress(f,540,575)*(1-progress(f,930,960));
 return <g opacity={opacity}>
  <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale}) translate(-500 -330) translate(1000 0) scale(-1 1)`}>
    <path d="M405 250C347 228 299 272 310 322Q322 381 398 418Q358 378 354 329Q350 289 405 281Z" fill={C.yellow} fillOpacity={.08} stroke={C.yellow} strokeWidth={2.5} {...draw(progress(f,540,610))}/>
  </g>
  <g opacity={progress(f,550,590)}><path d={`M${sx} ${sy}L810 650H870`} stroke={C.gray} strokeWidth={1.5} fill="none"/><Label x={850} y={690} size={25} color={C.yellow}>STRIATUM</Label><Label x={850} y={724} size={19} color={C.gray}>Conceptual projection</Label></g>
  <D2ReceptorAvailability x={1200} y={425} scale={.85} availability="higher" amount={progress(f,630,675)} emphasis={mix(1,.35,ease(f,720,780))}/>
  <D2ReceptorAvailability x={1570} y={425} scale={.85} availability="lower" amount={progress(f,650,690)} emphasis={progress(f,720,780)}/>
  <g opacity={progress(f,630,660)}><Label x={1380} y={215} size={31} color={C.yellow}>D2 RECEPTORS</Label></g>
  <path d={`M${sx} ${sy}Q${sx+100} ${sy-180} ${px} ${py}`} stroke={C.blue} strokeWidth={2} strokeDasharray="3 8" fill="none" opacity={progress(f,720,780)}/>
  <Title f={f} from={720} until={870} text="ASSOCIATED WITH LOWER PFC ACTIVITY" color={C.blue} size={31}/>
  <g opacity={progress(f,810,840)*mix(1,.4,ease(f,870,910))}>
    {[0,1,2].map(i=><g key={i} transform={`translate(${1120+i*260} 770)`}>
      {i===0?<g>{[-40,0,40].map((x,j)=><circle key={x} cx={x} cy={0} r={j===1?18:9} stroke={j===1?C.yellow:C.gray} strokeWidth={2} fill="none"/>)}</g>:i===1?<BehavioralBrake scale={.5} activation={.6} strength={.5}/>:<g fill="none" stroke={C.blue} strokeWidth={3}><path d="M0 40V0L-40 -35M0 0L40 -35M-40 -35v18m0 -18h18M40 -35v18m0 -18H22"/></g>}
      <Label x={0} y={85} size={20} color={C.gray}>{['SALIENCE','IMPULSE CONTROL','DECISION-MAKING'][i]}</Label>
    </g>)}
  </g>
  <g opacity={progress(f,870,895)}><HumanCharacter x={540} y={875} scale={.48} frame={f} expression="conflicted" look={5}/><CocaineContainer x={710} y={830} scale={.42}/><WarningSymbol x={810} y={830} scale={.4}/></g>
  <Title f={f} from={870} until={930} text="RESISTING URGES MAY BECOME HARDER" y={965} color={C.red} size={29}/>
 </g>;
};
const Adaptations:React.FC<{f:number}>=({f})=>{
 const response=ease(f,1110,1170),opacity=progress(f,930,960)*(1-progress(f,1290,1320));
 return <g opacity={opacity}>
  <Title f={f} from={930} until={1020} text="MESOCORTICAL PATHWAY" color={C.yellow}/>
  <g opacity={1-progress(f,1110,1155)}>
    {[0,1,2].map(i=><CocaineContainer key={i} x={1100+i*160} y={810} scale={.43} amount={progress(f,940+i*22,970+i*22)} opacity={progress(f,940+i*22,960+i*22)}/>)}
    <SynapticAdaptation x={1330} y={440} amount={progress(f,1020,1055)} adaptation={progress(f,1030,1110)} frame={f}/>
    <g opacity={progress(f,1020,1050)}><Label x={1330} y={700} size={28} color={C.yellow}>SYNAPTIC ADAPTATION</Label></g>
  </g>
  <g opacity={progress(f,1110,1150)}>
    <CueSymbol x={1090} y={580} scale={.7}/><CocaineContainer x={970} y={580} scale={.35}/><RewardSymbol x={1570} y={580} scale={.8}/>
    <HumanCharacter x={mix(1320,1200,response)} y={875} scale={.75} frame={f} naturalMotion walking={Math.sin(response*Math.PI)} expression="recognition" look={-5}/>
    <path d="M1230 730Q1160 670 1110 650" stroke={C.yellow} strokeWidth={5} fill="none" {...draw(response)}/>
    <path d="M1390 730Q1490 670 1550 650" stroke={C.yellow} strokeWidth={2} opacity={.25} fill="none" {...draw(response)}/>
    <circle cx={1090} cy={580} r={90} fill="none" stroke={C.yellow} strokeWidth={3} opacity={.4*response}/><circle cx={1570} cy={580} r={78} fill="none" stroke={C.yellow} strokeWidth={2} opacity={.12*response}/>
    <g opacity={progress(f,1200,1225)}><Label x={960} y={135} size={29} color={C.red}>STRONGER DRUG-CUE REACTIVITY</Label><Label x={960} y={190} size={29} color={C.green}>WEAKER NATURAL-REWARD RESPONSE</Label></g>
    <Label x={1390} y={975} size={20} color={C.gray}>Possible changes following chronic exposure</Label>
  </g>
 </g>;
};
const RodentTransition:React.FC<{f:number}>=({f})=>{
 const zoom=ease(f,1470,1530),leave=ease(f,1530,1590);
 return <g>
  <Title f={f} from={1290} until={1380} text="PREFRONTAL CORTEX"/>
  <Title f={f} from={1320} until={1410} text="DIFFERENT REGIONS, DIFFERENT ROLES" y={950} size={28} color={C.blue}/>
  <RatBrain x={mix(1370,960,zoom)} y={mix(440,380,zoom)} scale={mix(1,1.3,zoom)} amount={progress(f,1380,1450)} opacity={progress(f,1380,1410)*(1-leave)} prelimbic={progress(f,1440,1500)} label/>
 </g>;
};

/** Reuse at frame 1770 to carry the stable comparison into Scene 08. */
export const PrelimbicExperimentArtwork:React.FC<{frame:number}>=({frame})=>{
 const f=Math.min(frame,T07.hold),left=getRatExperimentPose(f,'stimulation'),right=getRatExperimentPose(f,'inhibition');
 const opacity=progress(f,1530,1590);
 return <g opacity={opacity}>
  <path d="M960 230V915" stroke={C.gray} strokeWidth={1.5} opacity={.2}/>
  <Label x={500} y={190} size={31} color={C.green}>STIMULATION</Label><Label x={1420} y={190} size={31} color={C.red}>INHIBITION</Label>
  <RatBrain x={500} y={370} scale={.65} prelimbic={left.activity}/><RatBrain x={1420} y={370} scale={.65} prelimbic={right.activity}/>
  <Label x={500} y={520} size={21} color={C.gray}>PRELIMBIC CORTEX</Label><Label x={1420} y={520} size={21} color={C.gray}>PRELIMBIC CORTEX</Label>
  <circle cx={594} cy={346} r={9} fill={C.yellow} opacity={progress(f,1590,1620)*.55}/><circle cx={1514} cy={346} r={mix(6,2,ease(f,1680,1740))} fill={C.yellow} opacity={mix(.4,.08,ease(f,1680,1740))}/>
  <RatIllustration x={left.x} y={745} scale={.7} frame={f} walking={left.walking}/><RatIllustration x={right.x} y={745} scale={.7} frame={f} walking={right.walking}/>
  <CueSymbol x={770} y={730} scale={.45}/><CocaineContainer x={835} y={735} scale={.3}/><CueSymbol x={1680} y={730} scale={.45}/><CocaineContainer x={1745} y={735} scale={.3}/>
  <path d="M220 805H865M1110 805H1775" stroke={C.gray} strokeWidth={2} opacity={.25}/>
  <path d="M660 670V790" stroke={C.green} strokeWidth={4} opacity={progress(f,1620,1650)}/>
  <g opacity={progress(f,1590,1660)}><Label x={500} y={890} size={29}><tspan fill={C.green}>REDUCED</tspan> DRUG SEEKING</Label></g>
  <g opacity={progress(f,1680,1740)}><Label x={1420} y={890} size={29}><tspan fill={C.red}>INCREASED</tspan> DRUG SEEKING</Label></g>
  <Title f={f} from={1740} text="PREFRONTAL ACTIVITY INFLUENCES DRUG SEEKING" y={970} size={27}/>
  <Label x={960} y={95} size={24} color={C.gray}>Cocaine-exposed rats · schematic comparison</Label>
 </g>;
};
export const Scene07_PrefrontalControlAndAddiction:React.FC=()=>{
 const f=Math.min(useCurrentFrame(),T07.hold),s=getScene07State(f);
 return <AbsoluteFill style={{backgroundColor:C.bg}}><svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="Prefrontal impulse control, a schematic association between striatal D2 receptor availability and PFC activity, chronic-cocaine adaptations, and opposite effects of stimulating or inhibiting rat prelimbic cortex on drug seeking.">
  <HumanAnatomy f={f}/>
  <Sequence from={0} durationInFrames={580} layout="none"><ControlMetaphor f={f}/></Sequence>
  <Sequence from={540} durationInFrames={420} layout="none"><ReceptorsAndControl f={f}/></Sequence>
  <Sequence from={930} durationInFrames={390} layout="none"><Adaptations f={f}/></Sequence>
  <Sequence from={1290} durationInFrames={300} layout="none"><RodentTransition f={f}/></Sequence>
  <Sequence from={1530} durationInFrames={270} layout="none"><PrelimbicExperimentArtwork frame={f}/></Sequence>
  {s.citation&&<g opacity={f<930?fade(f,450,480,900):progress(f,930,960)}><SourceCitation frame={f} source={s.citation}/></g>}
 </svg></AbsoluteFill>;
};
