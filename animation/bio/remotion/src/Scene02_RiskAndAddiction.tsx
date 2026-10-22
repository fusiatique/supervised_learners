import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {AnimatedArrow, C, HumanCharacter, type HumanExpression, Label, SourceCitation} from './components';
import {curvePoint, draw, ease, fade, mix, pop, progress} from './motion';
import {CapsuleSymbol, CROSSROADS, CrossroadsPaths, MysteryBox, RewardSymbol, Scene01ClosingArtwork, ThoughtBubble, WarningSymbol} from './risk-components';

export const SCENE02 = {width:1920,height:1080,fps:30,durationInFrames:960,holdFrom:660,openingHold:270} as const;
// Keep the opening question on screen for nine additional seconds before the transition.
export const scene02TimelineFrame=(frame:number)=>Math.max(0,frame-SCENE02.openingHold);

/** Pure frame-to-pose function: forward playback and reverse scrubbing agree. */
export const getRiskScenePose = (frame: number) => {
  const f=Math.max(0,Math.min(frame,SCENE02.holdFrom));
  let route=CROSSROADS.uncertain, t=0, movementStart=0, movementEnd=0;
  if(f>=120&&f<210){t=ease(f,120,174);movementStart=120;movementEnd=174;}
  else if(f>=210&&f<270){t=1-ease(f,210,265);movementStart=210;movementEnd=265;}
  else if(f>=330&&f<450){route=CROSSROADS.safe;t=ease(f,330,390);movementStart=330;movementEnd=390;}
  else if(f>=450&&f<510){route=CROSSROADS.safe;t=1-ease(f,450,506);movementStart=450;movementEnd=506;}
  else if(f>=510&&f<540){t=.025*Math.sin(progress(f,510,540)*Math.PI);movementStart=510;movementEnd=540;}
  else if(f>=540&&f<570){route=CROSSROADS.safe;t=.025*Math.sin(progress(f,540,570)*Math.PI);movementStart=540;movementEnd=570;}
  else if(f>=570){t=ease(f,570,627);movementStart=570;movementEnd=627;}
  const [x,footY]=curvePoint(t,route);
  const walking=progress(f,movementStart,movementStart+7)*(1-progress(f,movementEnd-7,movementEnd));
  let expression: HumanExpression='curious';
  if(f>=180&&f<270)expression='disappointed';
  else if(f>=270&&f<390)expression='recognition';
  else if(f>=390&&f<450)expression='satisfied';
  else if(f>=450)expression='conflicted';
  let look=0;
  if(f>=65&&f<100)look=-5;
  else if(f>=100&&f<210)look=5;
  else if(f>=270&&f<293)look=5;
  else if(f>=293&&f<450)look=-5;
  else if(f>=510&&f<540)look=-5;
  else if(f>=540)look=5;
  return {frame:f,x,footY,t,walking,expression,look,route};
};

/** Reuse at frame=660 for Scene 03's first frame; no timeline-local state. */
export const RiskAndAddictionArtwork: React.FC<{frame: number}> = ({frame}) => {
  const pose=getRiskScenePose(frame);
  const f=pose.frame;
  const drug=ease(f,450,505);
  const safeHighlight=ease(f,270,330);
  const finalDim=ease(f,630,660);
  const warning=pop(f,174);
  const warningTravel=ease(f,174,198);
  const memoryA=fade(f,252,270,310), memoryB=fade(f,574,585,610);
  const memory=Math.max(memoryA,memoryB);
  const memoryScale=pop(f,f<450?252:574);
  const bounce=-Math.abs(Math.sin(f*.33))*3*pose.walking;
  const disappointment=fade(f,180,192,252);
  const question=fade(f,78,91,107);
  const pulse=progress(f,175,205);
  const success=progress(f,390,410);
  const successGlow=success*(1-progress(f,425,450));
  return <g>
    <g opacity={1-drug*.12}>
      <CrossroadsPaths amount={progress(f,22,100)} safeHighlight={safeHighlight} riskyDim={safeHighlight} drug={drug} finalDim={finalDim} walkingSafe={f>=330&&f<390?pose.t:undefined}/>
      <RewardSymbol x={375} y={350} amount={progress(f,62,90)} opacity={progress(f,60,78)}/>
    </g>
    <g transform={`translate(1550 350) scale(${mix(1,.94,drug)})`} opacity={1-drug}>
      <MysteryBox amount={progress(f,64,95)} opacity={progress(f,62,80)} open={ease(f,171,187)}/>
    </g>
    <CapsuleSymbol x={1550} y={350} amount={drug} opacity={drug}/>
    <circle cx={1550} cy={350} r={70+100*pulse} stroke={C.red} fill="none" strokeWidth={4} opacity={Math.sin(pulse*Math.PI)*.32}/>
    <WarningSymbol x={mix(1550,1670,warningTravel)} y={mix(345,237,warningTravel)} scale={warning} opacity={progress(f,174,180)}/>
    <g opacity={question} transform={`translate(${pose.x+92} ${pose.footY-285}) scale(${pop(f,78)})`}><Label x={0} y={0} size={44} color={C.yellow}>?</Label></g>
    <g transform={`translate(${pose.x} ${pose.footY-64+bounce+disappointment*5})`}>
      <HumanCharacter frame={f} amount={progress(f,7,58)} walking={pose.walking} naturalMotion expression={pose.expression} look={pose.look} headTilt={f<120?Math.sin(progress(f,78,116)*Math.PI)*7:f>=510&&f<570?Math.sin((f-510)*Math.PI/30)*5:0} shrug={f<120?Math.sin(progress(f,90,120)*Math.PI)*.3:0}/>
    </g>
    <ThoughtBubble x={pose.x+145} y={Math.max(160,pose.footY-330)} scale={memoryScale*.85} amount={progress(f,f<450?252:574,f<450?270:589)} opacity={memory}/>
    <g opacity={success*(1-drug)}>
      <circle cx={375} cy={350} r={85+successGlow*12} fill={C.green} opacity={successGlow*.07}/>
      <g transform={`translate(375 218) scale(${pop(f,390)})`}><path d="M-22 0L-5 17 27 -22" fill="none" stroke={C.green} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"/></g>
    </g>
    <g opacity={fade(f,510,521,548)} transform="translate(790 560) rotate(-143)"><AnimatedArrow x={0} y={0} length={110} amount={progress(f,510,528)} color={C.green}/></g>
    <g opacity={fade(f,540,552,579)} transform="translate(1130 560) rotate(-37)"><AnimatedArrow x={0} y={0} length={110} amount={progress(f,540,558)} color={C.red}/></g>
    <g opacity={fade(f,450,475,615)}><Label x={960} y={145} size={43}>ADDICTION</Label></g>
  </g>;
};

const OpeningTransition: React.FC = () => {
  const f=scene02TimelineFrame(useCurrentFrame());
  const a=ease(f,0,65);
  return <g opacity={1-a} transform={`translate(960 600) scale(${mix(1,.78,a)}) translate(-960 -600)`}><Scene01ClosingArtwork/></g>;
};

export const Scene02_RiskAndAddiction: React.FC = () => {
  const frame=scene02TimelineFrame(useCurrentFrame());
  return <AbsoluteFill style={{backgroundColor:C.bg}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" role="img" aria-label="A person encounters a harmful uncertain outcome, learns to choose a safer apple, then approaches a drug-associated option despite remembered harm. One example of impaired behavioral flexibility.">
      <Sequence from={0} durationInFrames={SCENE02.openingHold+66} layout="none"><OpeningTransition/></Sequence>
      <RiskAndAddictionArtwork frame={frame}/>
      <g opacity={1-progress(frame,435,465)}><SourceCitation frame={frame} source="Yates & Stone, 1992"/></g>
      <g opacity={progress(frame,435,465)}><SourceCitation frame={frame} source="Piantadosi et al., 2021"/></g>
    </svg>
  </AbsoluteFill>;
};
