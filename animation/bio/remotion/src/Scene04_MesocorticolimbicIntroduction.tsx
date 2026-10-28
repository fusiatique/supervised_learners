import React from 'react';
import {brainFocus} from './brain-attention';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {anatomyToScreen, BrainAnatomy, BRAIN_REGIONS, BrainRegionLabel, type BrainCamera} from './BrainAnatomy';
import {C, Label, SourceCitation} from './components';
import {DopamineCircuitBridge} from './dopamine-introduction-components';
import {curvePoint, draw, ease, fade, mix, pop, progress} from './motion';
import {CapsuleSymbol} from './risk-components';
import {NaturalRewardIcons} from './natural-reward-icons';
import {Scene04LivingSystem, usesLiving04} from './scene04-living-system';

export const SCENE04={width:1920,height:1080,fps:30,durationInFrames:1320} as const;
export const T04={head:0,brain:60,zoom:120,system:210,projections:270,signals:360,mesolimbic:450,rewardSeeking:570,citationSwitch:600,rewards:630,drugs:690,naturalPulse:750,drugPulse:810,finalZoom:870,end:900} as const;

// Keep the preceding pathway scene on screen for eight extra seconds,
// then stretch the final reward sequence from nine to fifteen seconds.
// Source-frame functions remain unchanged for Scene 05's existing handoff.
export const scene04TimelineFrame=(frame:number)=>frame<630?frame:frame<870?629:Math.min(899,630+(frame-870)*.6);

export const getScene04Camera=(frame:number):BrainCamera=>{
  const zoom=ease(frame,T04.zoom,T04.system),compare=ease(frame,T04.rewards,T04.drugs);
  const base={x:mix(700,960,zoom),y:mix(mix(405,530,zoom),515,compare),scale:mix(mix(.7,1.68,zoom),1.18,compare),anteriorRight:false};
  const focus=1+.045*ease(frame,T04.finalZoom,T04.end);
  const [vx,vy]=anatomyToScreen(BRAIN_REGIONS.VTA.center,base);
  return {...base,x:vx+(base.x-vx)*focus,y:vy+(base.y-vy)*focus,scale:base.scale*focus};
};

export const getScene04State=(frame:number)=>{
  const focus=ease(frame,T04.mesolimbic,510);
  const stimulation=Math.max(fade(frame,805,818,836),fade(frame,865,878));
  return {
    camera:getScene04Camera(frame),
    brainAmount:mix(.35,1,progress(frame,0,T04.zoom)),
    vta:Math.min(1,pop(frame,T04.system)),
    nac:progress(frame,T04.projections,330),
    pfc:progress(frame,295,360),
    limbicPath:progress(frame,T04.projections,350),
    corticalPath:progress(frame,290,T04.signals),
    limbicActivity:progress(frame,T04.signals,390)*mix(.6,1,focus)*mix(1,.22,ease(frame,630,690))+stimulation*.78,
    corticalActivity:progress(frame,T04.signals,390)*mix(.6,.22,focus),
    cortexOpacity:mix(1,.65,focus),
    externalOpacity:1-progress(frame,T04.finalZoom,T04.end)*.55,
  };
};

const EnteringBrain:React.FC=()=>{
  const f=useCurrentFrame();
  const cam=getScene04Camera(f);
  const ratio=cam.scale/.7;
  const gather=ease(f,0,115);
  return <g>
    <g opacity={1-progress(f,90,150)}><DopamineCircuitBridge frame={30+f} showBrain={false}/></g>
    <g transform={`translate(${cam.x-700*ratio} ${cam.y-405*ratio}) scale(${ratio})`} opacity={1-progress(f,120,195)}>
      <g transform="translate(1400 0) scale(-1 1)"><path d="M480 800L480 680C410 610 400 480 425 380C450 260 560 190 700 190C860 180 960 280 970 390C975 420 1005 430 1005 450L1055 470Q1075 480 1054 493L1005 500L1015 530Q1020 542 1001 549L990 550Q1035 580 1000 610Q980 640 915 640L880 645Q875 710 900 775" fill="none" stroke={C.white} strokeWidth={3.5/ratio} strokeLinecap="round" strokeLinejoin="round" {...draw(progress(f,5,115))}/></g>
    </g>
  </g>;
};

const StimulusPulse:React.FC<{frame:number;start:number;drug?:boolean}>=({frame,start,drug=false})=>{
  const t=ease(frame,start,start+55);
  const points=drug?[[1585,580],[1500,580],[1420,555],[1360,550]]:[[325,580],[405,580],[470,555],[530,550]];
  const [x,y]=curvePoint(t,points);
  const opacity=progress(frame,start,start+8)*(1-progress(frame,start+55,start+65));
  return <g opacity={opacity}><circle cx={x} cy={y} r={15} fill={drug?C.red:C.green} opacity={.08}/><circle cx={x} cy={y} r={5} fill={drug?C.red:C.green}/></g>;
};

/** Exported with a global scene frame so Scene 05 can continue from frame 900. */
export const MesocorticolimbicArtwork:React.FC<{frame:number;showBrain?:boolean}>=({frame:f,showBrain=true})=>{
  const s=getScene04State(f);
  const vtaLabel=progress(f,225,260);
  return <g>
    {showBrain&&<BrainAnatomy {...s.camera} regionFocus={{VTA:brainFocus(f,[750,899]),NAc:brainFocus(f,[750,899])}} pathwayFocus={{mesolimbic:brainFocus(f,[750,899]).strength}} amount={s.brainAmount} opacity={1} cortexOpacity={s.cortexOpacity} frame={Math.max(0,f-T04.signals)}
      highlights={{VTA:s.vta,NAc:s.nac,PFC:s.pfc}}
      pathwayProgress={{mesolimbic:s.limbicPath,mesocortical:s.corticalPath}}
      pathwayOpacity={{mesolimbic:1,mesocortical:mix(1,.4,ease(f,450,510))}}
      activity={{mesolimbic:Math.min(1,s.limbicActivity),mesocortical:s.corticalActivity}}/>}
    <BrainRegionLabel mirrorPosition region="VTA" camera={s.camera} x={1320} y={895} fullName opacity={vtaLabel}/>
    <g opacity={fade(f,360,390,630)}>
      <text x={960} y={78} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={35} fill={C.white}>MESOCORTICOLIMBIC <tspan fill={C.yellow}>DOPAMINE</tspan> SYSTEM</text>
    </g>
    <g opacity={fade(f,460,490,630)}><Label x={1350} y={805} size={25} color={C.yellow}>MESOLIMBIC PATHWAY</Label></g>
    <g opacity={fade(f,570,595,630)}><Label x={960} y={1000} size={26}>REWARD-RELATED LEARNING &amp; MOTIVATION</Label></g>
    <g opacity={s.externalOpacity}>
      <NaturalRewardIcons amount={progress(f,630,690)}/>
      <g opacity={progress(f,635,660)}><Label x={230} y={310} size={27} color={C.green}>NATURAL REWARDS</Label></g>
      <CapsuleSymbol x={1690} y={580} scale={Math.min(1,pop(f,690))} amount={progress(f,690,720)} opacity={progress(f,690,710)}/>
      <g opacity={progress(f,695,720)}><Label x={1690} y={310} size={27} color={C.red}>ADDICTIVE DRUGS</Label></g>
      <path d="M325 580C405 580 470 555 530 550" fill="none" stroke={C.green} strokeWidth={2} opacity={.3} {...draw(progress(f,750,805))}/>
      <path d="M1585 580C1500 580 1420 555 1360 550" fill="none" stroke={C.red} strokeWidth={2} opacity={.3} {...draw(progress(f,810,865))}/>
      <StimulusPulse frame={f} start={750}/><StimulusPulse frame={f} start={810} drug/>
    </g>
  </g>;
};

// Half-second accents follow the spoken list once the reward icons have appeared.
const RewardExampleHighlights:React.FC<{frame:number}>=({frame})=>{
 if(frame<=975||frame>=1041||(frame>=1020&&frame<=1026))return null;
 const pulse=(start:number)=>ease(frame,start,start+4)*(1-ease(frame,start+10,start+15));
 return <g fill="none" strokeWidth={3.5}>
  {[440,595,750].map((y,i)=>{
   const amount=pulse(975+i*15);
   return <g key={y} opacity={amount}>
    <circle cx={230} cy={y} r={63} stroke={C.green}/>
    <circle cx={230} cy={y} r={67} stroke={C.green} strokeWidth={9} opacity={.12}/>
   </g>;
  })}
  <g opacity={pulse(1026)}>
   <circle cx={1690} cy={580} r={94} stroke={C.yellow}/>
   <circle cx={1690} cy={580} r={99} stroke={C.yellow} strokeWidth={11} opacity={.12}/>
  </g>
 </g>;
};

export const Scene04PlaybackArtwork:React.FC<{frame:number}>=({frame})=>{
  const f=scene04TimelineFrame(frame);
  if(usesLiving04(frame))return <Scene04LivingSystem frame={frame} opening={<MesocorticolimbicArtwork frame={240}/>} ending={<MesocorticolimbicArtwork frame={629}/>}/>;
  return <>
    <MesocorticolimbicArtwork frame={f}/>
    <RewardExampleHighlights frame={frame}/>
    <g opacity={1-progress(f,585,600)}><SourceCitation frame={f} source="Piantadosi et al., 2021"/></g>
    <g opacity={progress(f,600,615)}><SourceCitation frame={f} source="Feltenstein et al., 2009"/></g>
  </>;
};

export const Scene04_MesocorticolimbicIntroduction:React.FC=()=>{
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor:C.bg}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="Entering a left-facing medial brain cutaway. The ventral midbrain VTA projects to the ventral forebrain nucleus accumbens and anterior prefrontal cortex. Moving signals illustrate neuronal activity along these projections. Natural rewards and addictive drugs interact with overlapping reward-related circuitry.">
      <Sequence from={0} durationInFrames={210} layout="none"><EnteringBrain/></Sequence>
      <Scene04PlaybackArtwork frame={frame}/>
    </svg>
  </AbsoluteFill>;
};
