import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DopamineHandoff, getAddictionPose, getNaturalLearningPose, getScene03Timing, SCENE03, T03} from '../src/Scene03_AddictionAndRewardLearning';
import {getRiskScenePose} from '../src/Scene02_RiskAndAddiction';

assert.equal(SCENE03.durationInFrames,1800);
assert.equal(SCENE03.durationInFrames/SCENE03.fps,60);
assert.equal(T03.rewardLearning,33*SCENE03.fps);
assert.equal(SCENE03.durationInFrames-T03.rewardLearning,27*SCENE03.fps);
const before=getRiskScenePose(689),after=getAddictionPose(0);
assert.equal(before.x,after.x);
assert.equal(before.footY,after.footY);
for(let f=0;f<T03.rewardLearning;f++)assert.equal(getScene03Timing(f).instructionOpacity,0,'No definition before 33 seconds');
assert.equal(getScene03Timing(989).climaxOpacity,1);
assert.equal(getScene03Timing(990).climaxOpacity,1,'Climax phrase must remain visible at 33 seconds');
assert.equal(getScene03Timing(990).instructionOpacity,0);
assert.equal(getScene03Timing(350).citationOpacity,0);
assert.equal(getScene03Timing(420).citationOpacity,1);
assert.equal(getScene03Timing(930).citationOpacity,0);
assert.equal(getScene03Timing(1679).diagramOpacity,0,'No large diagram at the neuron handoff');
for(const [fn,start,end] of [[getAddictionPose,0,990],[getNaturalLearningPose,990,1680]] as const){
  const forward=new Map<number,string>();
  for(let f=start;f<end;f++){
    const pose=fn(f),prev=fn(Math.max(start,f-1));
    assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.footY));
    assert.ok(Math.hypot(pose.x-prev.x,pose.footY-prev.footY)<90,`Position jump at frame ${f}`);
    forward.set(f,JSON.stringify(pose));
  }
  for(let f=end-1;f>=start;f--)assert.equal(JSON.stringify(fn(f)),forward.get(f),'Reverse scrubbing must reproduce positions');
}
const final=()=>renderToStaticMarkup(<svg><DopamineHandoff frame={1679}/></svg>);
assert.equal(final(),final());
assert.ok(!final().includes('<text'),'No large title in the final frame');
console.log('PASS: 60 seconds; exact 33/27-second split; Scene 02 position continuity; critical title and citation timing; no teleports; deterministic scrubbing; text-free neuron handoff.');
