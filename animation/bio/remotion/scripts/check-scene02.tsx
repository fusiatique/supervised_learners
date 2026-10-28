import assert from 'node:assert/strict';
import React from 'react';
import {Scene01ClosingArtwork} from '../src/risk-components';
import {getOpeningCycleState} from '../src/OpeningLearningCycle';
import {ease,mix} from '../src/motion';
import {renderToStaticMarkup} from 'react-dom/server';
import {getRiskScenePose, RiskAndAddictionArtwork, SCENE02, scene02TimelineFrame, Scene02OpeningArtwork} from '../src/Scene02_RiskAndAddiction';

assert.equal(SCENE02.durationInFrames / SCENE02.fps,32);
assert.equal(scene02TimelineFrame(0),0);
assert.equal(scene02TimelineFrame(239),0);
assert.equal(scene02TimelineFrame(240),0);
assert.equal(scene02TimelineFrame(305),65);
assert.equal(scene02TimelineFrame(900),660);
for(const [f,x,y] of [[0,960,850],[200,1420,430],[270,960,850],[420,500,430],[510,960,850],[660,1420,430]]) {
  const pose=getRiskScenePose(f);
  assert.equal(pose.x,x,`x at frame ${f}`);
  assert.equal(pose.footY,y,`foot y at frame ${f}`);
}
for(let f=1;f<690;f++) {
  const a=getRiskScenePose(f-1),b=getRiskScenePose(f);
  assert.ok(Math.hypot(b.x-a.x,b.footY-a.footY)<45,`Unexpected position jump at ${f}`);
  assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.footY));
}
const markup=(frame:number)=>renderToStaticMarkup(<svg><RiskAndAddictionArtwork frame={frame}/></svg>);
assert.equal(markup(660),markup(689),'Final artwork must remain still for a full second');
const frames=[0,100,185,260,360,420,500,590,630,689];
const forward=new Map(frames.map(f=>[f,markup(f)]));
for(const f of [...frames].reverse())assert.equal(markup(f),forward.get(f),'Reverse scrubbing must be deterministic');
console.log('PASS: 960 frames; eight-second opening; route endpoints; continuous walking; reverse scrubbing; full one-second ending hold.');

const renderOpening=(frame:number)=>renderToStaticMarkup(<svg><Scene02OpeningArtwork frame={frame}/></svg>);
const originalOpening=(frame:number)=>{const a=ease(scene02TimelineFrame(frame),0,65);return renderToStaticMarkup(<svg><g opacity={1-a} transform={`translate(960 600) scale(${mix(1,.78,a)}) translate(-960 -600)`}><Scene01ClosingArtwork/></g></svg>);};
for(let frame=0;frame<=30;frame++)assert.equal(renderOpening(frame),originalOpening(frame),'First second must remain identical');
assert.equal(scene02TimelineFrame(241),1,'Character starts immediately after eight seconds');
for(const frame of [240,270,300])assert.equal(getOpeningCycleState(Math.min(frame,240)).question,0,'Opening question stays invisible throughout transition');
assert.equal(getOpeningCycleState(135).negative,0,'First sentence ends with a positive loop');
assert.equal(getOpeningCycleState(219).negative,1,'Harmful consequence remains at the final emphasis');
assert.equal(getOpeningCycleState(219).action,1,'The same action remains selected despite harm');
assert.equal(getOpeningCycleState(219).rotation,getOpeningCycleState(239).rotation,'Learning icon stops rotating during the hold');
assert.equal(getOpeningCycleState(270).question,1);
assert.equal(getOpeningCycleState(270).feedback,0);
for(const frame of [27,66,102,135,174,219,240,270])assert.equal(renderOpening(frame),renderOpening(frame),'Seeking is deterministic');
console.log('PASS: first second preserved; direct negative-loop-to-character transition; positive-to-negative learning cycles; harmful action persists; restoration and direct seeking.');
