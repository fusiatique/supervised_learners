import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {AnimatedArrow, BrainIllustration, C, ComputerCharacter, DecisionPath, HumanCharacter, Label, LearningLoop, ProcessorIllustration, SourceCitation} from './components';
import {curvePoint, draw, ease, fade, mix, pop, progress} from './motion';

export const SCENE01={width:1920,height:1080,fps:30,durationInFrames:930,computerFrom:210,brainFrom:420} as const;
// Remove the old 7–9 second interval while retaining later choreography.
export const scene01TimelineFrame=(frame:number)=>frame<SCENE01.computerFrom?frame:frame+60;

const Decisions: React.FC = () => {
  const frame=useCurrentFrame();
  const f=scene01TimelineFrame(Math.min(frame,SCENE01.brainFrom-1));
  const split=ease(f,270,330);
  const attempt=ease(f,360,390)*22;
  const confusion=f>=420&&f<510;
  const shrug=Math.sin(progress(f,180,204)*Math.PI);
  return <g opacity={1-progress(frame,SCENE01.brainFrom,SCENE01.brainFrom+15)}>
    <g transform={`translate(${mix(160,70,split)} ${mix(-130,80,split)}) scale(${mix(1.4,.88,split)})`}>
      <DecisionPath amount={progress(f,60,120)} frame={f}/>
      <HumanCharacter x={340} y={585} scale={1.05} amount={progress(f,0,57)} frame={f} walking={0} shrug={shrug}/>
      {[0,1].map(i=><g key={i} opacity={fade(f,120+i*14,135+i*14,183)} transform={`translate(${445+i*160} ${390+i*70}) scale(${pop(f,120+i*14)})`}><Label x={0} y={0} size={40} color={C.red}>?</Label></g>)}
    </g>
    <path d="M960 150V880" stroke={C.white} opacity={.18} strokeWidth={3} fill="none" {...draw(progress(f,270,330))}/>
    <g opacity={progress(f,270,300)} transform="translate(1000 80) scale(.88)">
      <DecisionPath amount={progress(f,330,390)} color={C.blue} frame={Math.max(0,f-270)}/>
      <ComputerCharacter x={340+attempt} y={600} scale={.85} amount={progress(f,270,330)} frame={f} confused={confusion}/>
      <g opacity={progress(f,420,438)}>
        <Label x={510} y={835} size={30} color={C.blue} anchor="start">{f<510?'IF condition → action':'IF condition → action A'}</Label>
        <g opacity={f<510?.5+.5*Math.sin(f*.35)**2:1}><Label x={510} y={884} size={30} color={f<510?C.red:C.green} anchor="start">{f<510?'ELSE → ?':'ELSE → action B'}</Label></g>
      </g>
      {confusion&&<g transform={`translate(365 350) scale(${pop(f,420)})`} stroke={C.red} strokeWidth={4} fill={C.bg} strokeLinejoin="round"><path d="M0 -33L31 22H-31Z"/><path d="M0 -14V3M0 12V13" strokeLinecap="round"/></g>}
      <g opacity={fade(f,510,522)} transform={`translate(375 355) scale(${pop(f,510)})`}><path d="M-18 0L-3 15 25 -19" stroke={C.green} fill="none" strokeWidth={5} strokeLinecap="round"/></g>
    </g>
    <g opacity={fade(f,330,350)}><Label x={1450} y={180} size={25} color={C.gray}>Conventional programmed computation</Label></g>
  </g>;
};

const BrainToLearning: React.FC = () => {
  const local=useCurrentFrame();
  // Compress the illustration and linking sequence into 14–20 seconds.
  // The question begins at 20 seconds; the closing animation unfolds until
  // 30 seconds, followed by a one-second hold for the next scene.
  const f=Math.min(local<=180?660+local*(390/180):1050+(local-180)*.6,1230);
  const rise=ease(f,960,1050);
  const brainX=mix(530,420,rise), chipX=mix(1390,1500,rise);
  const y=mix(510,270,rise), scale=mix(1.35,.66,rise);
  const linked=progress(f,810,894)*(1-progress(f,990,1040));
  const signal=progress(f,720,750);
  return <g opacity={progress(local,0,15)}>
    <BrainIllustration x={brainX} y={y} scale={scale} frame={f-630} amount={progress(local,0,60)} signal={signal}/>
    <ProcessorIllustration x={chipX} y={y} scale={scale} frame={f-630} amount={progress(local,0,60)} signal={signal}/>
    <g opacity={1-progress(f,990,1040)}>
      {[0,1,2].map(i=>{
        const dy=(i-1)*80;
        const p=[[800,510+dy],[940,385+dy],[1040,635+dy],[1185,510+dy]];
        const t=((Math.max(0,f-820)+i*32)%120)/120;
        const [x,py]=curvePoint(t,p);
        return <g key={i}>
          <path d={`M800 ${510+dy}C940 ${385+dy} 1040 ${635+dy} 1185 ${510+dy}`} fill="none" stroke={i===1?C.blue:C.yellow} strokeWidth={3} opacity={.4+progress(f,900,930)*.3} {...draw(progress(f,810+i*12,872+i*12))}/>
          <circle cx={x} cy={py} r={6} fill={i===1?C.blue:C.yellow} opacity={linked}/>
        </g>;
      })}
    </g>
    <g opacity={fade(f,742,762,965)}><Label x={530} y={815} size={30} color={C.yellow}>Understanding the brain</Label><Label x={1390} y={815} size={30} color={C.blue}>Inspiring computational models</Label></g>
    <LearningLoop frame={f}/>
  </g>;
};

export const Scene01_HumanVsComputer: React.FC = () => {
  const frame=useCurrentFrame();
  return <AbsoluteFill style={{backgroundColor:C.bg}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="Humans navigate uncertainty; conventional programs follow explicit instructions. Understanding the brain inspires models of action, outcome and learning.">
      <Sequence from={0} durationInFrames={SCENE01.brainFrom+15} layout="none"><Decisions/></Sequence>
      <Sequence from={SCENE01.brainFrom} durationInFrames={SCENE01.durationInFrames-SCENE01.brainFrom} layout="none"><BrainToLearning/></Sequence>
      <SourceCitation frame={frame}/>
    </svg>
  </AbsoluteFill>;
};
