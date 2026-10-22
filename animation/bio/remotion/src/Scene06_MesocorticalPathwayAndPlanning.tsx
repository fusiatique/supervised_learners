import React from 'react';
import {AbsoluteFill,Sequence,useCurrentFrame} from 'remotion';
import {anatomyToScreen,BrainAnatomy,BrainRegionLabel,BRAIN_REGIONS,type BrainCamera} from './BrainAnatomy';
import {ENDING_CAMERA05} from './Scene05_DopamineRewardPredictionErrors';
import {AnimatedArrow,C,Label,SourceCitation} from './components';
import {draw,ease,fade,mix,progress} from './motion';
import {CocaineContainer} from './dopamine-introduction-components';
import {RewardSymbol,WarningSymbol} from './risk-components';
import {RodentPathwayComparison} from './rodent-pathway-comparison';
import {Scene06Opening} from './scene06-opening';
import {GoalRepresentation,PlanningPreview,ProjectionNeuronInset} from './planning-components';

export const SCENE06={width:1920,height:1080,fps:30,durationInFrames:1890} as const;
export const T06={values:0,decision:90,question:180,pathway:270,projection:360,pfc:450,pathwayTitle:390,planning:570,goal:660,steps:750,plan:810,prediction:870,imagineReward:960,imagineRisk:1050,choose:1140,selection:1200,recenter:1260,selectionTitle:1320,comparison:1380,rewarding:1470,aversive:1560,sideBySide:1650,returnToBrain:1720,hold:1770,end:1800} as const;
export const BRAIN_START06=13*30;
// Delay the brain to 13s; at 20s skip to the former 25-second point.
export const scene06ContentFrame=(frame:number)=>frame<BRAIN_START06?Math.min(frame,225):frame<630?frame-120+150*ease(frame,570,630):frame<990?frame+30:frame<1590?1019:frame+120;
// Complete imagined reward, imagined risk and the chosen movement before the 33s cut.
export const scene06PreviewFrame=(contentFrame:number)=>contentFrame<900?contentFrame:contentFrame<=1020?900+(contentFrame-900)*(355/120):contentFrame;
const blend=(a:BrainCamera,b:BrainCamera,t:number):BrainCamera=>({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),scale:mix(a.scale,b.scale,t),anteriorRight:true});
export const getScene06Camera=(frame:number):BrainCamera=>{
  const f=Math.min(frame,T06.hold);
  let camera=blend(ENDING_CAMERA05,{x:950,y:500,scale:1.4},ease(f,210,360));
  camera=blend(camera,{x:500,y:470,scale:1.45},ease(f,T06.planning,T06.goal));
  camera=blend(camera,{x:300,y:230,scale:.5},ease(f,T06.plan,930));
  camera=blend(camera,{x:820,y:480,scale:1.2},ease(f,T06.selection,1290));
  camera=blend(camera,{x:960,y:325,scale:.75},ease(f,T06.comparison,T06.rewarding));
  return blend(camera,{x:960,y:500,scale:1.35},ease(f,T06.returnToBrain,T06.hold));
};
export const getScene06State=(frame:number)=>{
  const f=Math.min(frame,T06.hold);
  return {frame:f,camera:getScene06Camera(f),corticalPath:mix(.15,1,progress(f,T06.projection,T06.pfc)),pfc:mix(.35,1,progress(f,T06.pfc,T06.pfc+30)),nac:mix(1,.45,ease(f,T06.pathway,T06.projection)),corticalActivity:fade(f,390,420,1380)*.6,limbicActivity:0,
    citation:f>=270&&f<570?'Cooper et al., 2017':f>=570&&f<1200?'Alkam et al., 2025':f>=1380?'Cooper et al., 2017':null};
};
const Title:React.FC<{f:number;from:number;until?:number;text:string;y?:number;color?:string;size?:number}>=({f,from,until,text,y=120,color=C.white,size=36})=><g opacity={fade(f,from,from+25,until)} transform={`translate(0 ${12*(1-ease(f,from,from+25))})`}><Label x={960} y={y} size={size} color={color}>{text}</Label></g>;

/** Fixed geometry and final state are reusable for the next biological scene. */
export const MesocorticalPlanningArtwork:React.FC<{frame:number}>=({frame})=>{
  const s=getScene06State(frame),f=s.frame;
  const anatomy=progress(f,210,270);
  const labels=progress(f,300,340)*(1-progress(f,570,630));
  const last=progress(f,1740,1770);
  return <g opacity={anatomy}>
    <BrainAnatomy {...s.camera} cortexOpacity={.6} frame={f} highlights={{VTA:1,NAc:s.nac,PFC:s.pfc}} pathwayProgress={{mesolimbic:1,mesocortical:s.corticalPath}} pathwayOpacity={{mesolimbic:mix(.2,.8,ease(f,1380,1470)),mesocortical:1}} activity={{mesolimbic:s.limbicActivity,mesocortical:s.corticalActivity}}/>
    <BrainRegionLabel region="VTA" camera={s.camera} x={730} y={850} opacity={Math.max(labels,last)}/>
    <BrainRegionLabel region="PFC" camera={s.camera} x={1600} y={420} fullName opacity={Math.max(labels*progress(f,450,480),last)}/>
    <BrainRegionLabel region="NAc" camera={s.camera} x={1270} y={850} opacity={last}/>
  </g>;
};

const PathwayAndGoal:React.FC<{f:number}>=({f})=><g>
  <Title f={f} from={270} until={360} text="VENTRAL TEGMENTAL AREA (VTA)" y={960} size={31}/>
  <Title f={f} from={570} until={810} text="PLANNING & CONTROL"/>
  <GoalRepresentation frame={f} x={1370} y={530} opacity={progress(f,660,690)*(1-progress(f,870,915))}/>
  <g opacity={fade(f,660,690,870)}><path d="M930 380Q1100 330 1160 430" stroke={C.gray} strokeWidth={2} fill="none" {...draw(progress(f,660,705))}/></g>
</g>;
const PlanningAndSelection:React.FC<{f:number}>=({f})=>{
  const enter=progress(f,870,915),exit=1-progress(f,1260,1320),shrink=ease(f,1200,1290);
  return <g>
    <PlanningPreview frame={scene06PreviewFrame(f)} titleFrom={900} titleUntil={1255} x={mix(960,1430,shrink)} y={mix(640,560,shrink)} scale={mix(.9,.38,shrink)} opacity={enter*exit}/>
    <Title f={f} from={870} until={960} text="POSSIBLE ACTIONS"/>
    <g opacity={fade(f,870,900,1200)}><Label x={300} y={425} size={22} color={C.gray}>Planning analogy</Label></g>
    <g opacity={progress(f,1260,1290)*(1-progress(f,1380,1410))}>
      <RewardSymbol x={1510} y={470} scale={.85}/><WarningSymbol x={1510} y={700} scale={.8} opacity={.22}/>
      <circle cx={1510} cy={470} r={100} fill="none" stroke={C.green} strokeWidth={3} {...draw(progress(f,1260,1310))}/>
      <AnimatedArrow x={1210} y={470} length={180} amount={progress(f,1320,1350)} color={C.yellow}/>
      <Label x={1510} y={610} color={C.green} size={26}>SELECTED ACTION</Label>
    </g>
    <Title f={f} from={1320} until={1380} text="ACTION SELECTION" color={C.yellow}/>
  </g>;
};

export const PathwayComparison:React.FC<{frame:number}>=({frame:f})=>{
  const incomingNac=progress(f,1485,1545),incomingPfc=progress(f,1575,1635);
  const together=progress(f,1650,1680),out=1-progress(f,1740,1770);
  const nacOpacity=progress(f,1470,1490)*(1-progress(f,1560,1580))*(1-together)+together;
  const pfcOpacity=progress(f,1560,1580);
  return <g opacity={out}>
    <g opacity={progress(f,1380,1410)}><Label x={570} y={100} color={C.yellow} size={27}>MESOLIMBIC · VTA → NAc</Label><Label x={1350} y={100} color={C.yellow} size={27}>MESOCORTICAL · VTA → PFC</Label></g>
    <g opacity={nacOpacity}>
      <ProjectionNeuronInset frame={f} target="NAc" x={560} y={745} change={incomingNac}/>
      <CocaineContainer x={230} y={690} scale={.65}/><Label x={260} y={830} color={C.gray} size={20}>REWARDING STIMULUS</Label>
    </g>
    <g opacity={pfcOpacity}><ProjectionNeuronInset frame={f} target="PFC" x={1360} y={745} change={incomingPfc}/><WarningSymbol x={1680} y={690} scale={.8}/><Label x={1650} y={830} color={C.red} size={20}>AVERSIVE EXPERIENCE</Label></g>
    <g opacity={fade(f,1490,1510,1560)}><Label x={960} y={550} size={27}>ALTERED INPUT TO NAc-PROJECTING NEURONS</Label></g>
    <g opacity={fade(f,1580,1600,1650)}><Label x={960} y={550} size={27}>ALTERED INPUT TO PFC-PROJECTING NEURONS</Label></g>
    <g opacity={progress(f,1650,1680)}><Label x={960} y={550} size={27} color={C.yellow}>DIFFERENT NEURAL ADAPTATIONS</Label></g>
  </g>;
};
export const Scene06_MesocorticalPathwayAndPlanning:React.FC=()=>{
  const presentationFrame=useCurrentFrame();
  const displayedFrame=presentationFrame<1620?presentationFrame:presentationFrame<1770?1620+(presentationFrame-1620)*.6:presentationFrame-60;
  // Slow the pathway screen by one second, then give possible actions one more second.
  const playbackFrame=displayedFrame<390?displayedFrame:displayedFrame<630?390+(displayedFrame-390)*(210/240):displayedFrame<900?displayedFrame-30:displayedFrame<1110?870+(displayedFrame-900)*(180/210):displayedFrame-60;
  const frame=playbackFrame<840?playbackFrame:playbackFrame<1020?840+(playbackFrame-840)*.5:playbackFrame-90;
  const f=Math.min(scene06ContentFrame(frame),T06.hold),s=getScene06State(f);
  return <AbsoluteFill style={{backgroundColor:C.bg}}><svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="From learned value to action selection: the VTA to prefrontal cortex mesocortical pathway, goals and imagined consequences, and schematic rodent findings about inputs to projection-defined VTA neurons.">
    {frame>=BRAIN_START06&&(frame<990||frame>=1590)&&<MesocorticalPlanningArtwork frame={f}/>}
    <Sequence from={0} durationInFrames={390} layout="none"><Scene06Opening frame={frame} pathwayTarget={anatomyToScreen(BRAIN_REGIONS.VTA.center,getScene06Camera(270))}/></Sequence>
    <Sequence from={390} durationInFrames={660} layout="none"><PathwayAndGoal f={f}/></Sequence>
    <Sequence from={870} durationInFrames={270} layout="none"><PlanningAndSelection f={f}/></Sequence>
    <Sequence from={1140} durationInFrames={660} layout="none"><RodentPathwayComparison frame={frame-990} startingCamera={getScene06Camera(1019)} endingCamera={getScene06Camera(1710)}/><g opacity={1-progress(frame,990,1010)}><PlanningAndSelection f={1019}/></g></Sequence>
    <Title f={f} from={T06.pathway} until={T06.planning} text="MESOCORTICAL PATHWAY" color={C.yellow}/>
    {frame>=BRAIN_START06&&(frame<990||frame>=1590)&&s.citation&&<g opacity={f<570?fade(f,270,300,540):f<1200?fade(f,570,600,1170):progress(f,1380,1410)}><SourceCitation frame={f} source={s.citation}/></g>}
  </svg></AbsoluteFill>;
};
