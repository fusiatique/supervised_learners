import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {getRiskScenePose, RiskAndAddictionArtwork, SCENE02, scene02TimelineFrame} from '../src/Scene02_RiskAndAddiction';

assert.equal(SCENE02.durationInFrames / SCENE02.fps,32);
assert.equal(scene02TimelineFrame(0),0);
assert.equal(scene02TimelineFrame(269),0);
assert.equal(scene02TimelineFrame(270),0);
assert.equal(scene02TimelineFrame(335),65);
assert.equal(scene02TimelineFrame(930),660);
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
console.log('PASS: 960 frames; nine-second opening extension; route endpoints; continuous walking; reverse scrubbing; full one-second ending hold.');
