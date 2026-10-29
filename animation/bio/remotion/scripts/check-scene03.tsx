import assert from 'node:assert/strict';
import React from 'react';
import {REWARD_UPDATE,getRewardUpdateState} from '../src/RewardLearningUpdate';
import {DRUG_REWARD_EVENTS,getDrugFeedback} from '../src/addiction-feedback-components';
import {renderToStaticMarkup} from 'react-dom/server';
import {DopamineHandoff, getAddictionPose, getNaturalLearningPose, getScene03Timing, SCENE03, T03, scene03ExtendedFrame, scene03SourceFrame} from '../src/Scene03_AddictionAndRewardLearning';
import {getRiskScenePose} from '../src/Scene02_RiskAndAddiction';

assert.equal(SCENE03.durationInFrames,2340);
assert.equal(SCENE03.durationInFrames/SCENE03.fps,78);
assert.equal(T03.rewardLearning,33*SCENE03.fps);
assert.equal(SCENE03.durationInFrames-SCENE03.openingFrames-SCENE03.bridgeFrames-SCENE03.addictionHold-SCENE03.reinforcementHold-T03.rewardLearning,27*SCENE03.fps);
assert.equal(SCENE03.openingFrames/SCENE03.fps,6);
assert.equal(SCENE03.bridgeFrom/SCENE03.fps,35);
assert.equal(SCENE03.bridgeFrames/SCENE03.fps,8);
assert.deepEqual(getAddictionPose(96),getAddictionPose(0),'Opening choice returns to the original starting pose');
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
console.log('PASS: 78 seconds; two-second positive reinforcement hold; two-second addiction title hold; eight-second reward-learning bridge; six-second opening question; exact 33/27-second split; Scene 02 position continuity; critical title and citation timing; no teleports; deterministic scrubbing; text-free neuron handoff.');

for(const end of DRUG_REWARD_EVENTS){
 assert.ok(getDrugFeedback(end+5).glow>.9,'Each arrival produces an immediate reward flash');
 assert.equal(getDrugFeedback(end+5).expression,'satisfied');
 assert.equal(getDrugFeedback(end+28).glow,0,'Reward flash fades before harmful aftermath');
 assert.ok(['disappointed','conflicted'].includes(getDrugFeedback(end+28).expression));
}
assert.ok(getDrugFeedback(770).distress>getDrugFeedback(125).distress,'Repeated returns increase distress');
for(const frame of [307,524,615,705])assert.ok(getAddictionPose(frame).x<960,'An attempted safer choice moves left of the crossroads');
console.log('PASS: repeated reward/aftermath responses, mounting distress, and continuous attempts toward the safe path.');

assert.equal(scene03SourceFrame(47*30),49*30,'Climax appears two seconds earlier');
assert.equal(scene03SourceFrame(42*30),44*30,'Bridge connects directly to man-pill-plus scene');

assert.equal(REWARD_UPDATE.from,48*30);
assert.equal(REWARD_UPDATE.duration,14*30);
assert.equal(getRewardUpdateState(149).received,1);
assert.equal(getRewardUpdateState(150).received,3,'Unexpected reward is three apples');
assert.equal(getRewardUpdateState(209).expected,1);
assert.equal(getRewardUpdateState(210).expected,3,'Expectation updates after the surprise');
assert.ok(getRewardUpdateState(285).mouseX>getRewardUpdateState(240).mouseX,'Next trial approaches the reward location');
assert.equal(getRewardUpdateState(0).opacity,0);
assert.equal(getRewardUpdateState(300).opacity,0);
for(const frame of [0,60,132,150,210,285,299])assert.deepEqual(getRewardUpdateState(frame),getRewardUpdateState(frame));
console.log('PASS: 48–62 second replacement with a two-second hold at 59s, one-versus-three reward, expectation update before next approach, deterministic fades.');

assert.equal(scene03ExtendedFrame(1769),1769);
assert.equal(scene03ExtendedFrame(1770),1770);
assert.equal(scene03ExtendedFrame(1829),1770);
assert.equal(scene03ExtendedFrame(1830),1770);
assert.equal(scene03ExtendedFrame(1860),1800);

// The opening hold must never freeze partially drawn consequences.
import {scene03WarningFrame,scene03StoryFrame} from '../src/Scene03_AddictionAndRewardLearning';
for(let frame=150;frame<=215;frame++)assert.equal(scene03WarningFrame(frame),frame,'Warnings keep a linear drawing clock across the story hold');
for(let frame=215;frame<=275;frame++)assert.ok(scene03WarningFrame(frame)>=215,'Completed warnings and heart stay complete until the scene resumes');
assert.equal(scene03WarningFrame(300),scene03StoryFrame(300),'Effect clock rejoins the unchanged story clock');
console.log('PASS: consequence drawings finish continuously before the opening hold.');

import {rewardLearningStoryFrame,rewardLearningBellRing} from '../src/RewardLearningUpdate';
assert.equal(rewardLearningStoryFrame(300),240);
assert.equal(rewardLearningStoryFrame(330),285,'Rat reaches the reward before the hold at 59s');
for(let frame=301;frame<=330;frame++)assert.ok(getRewardUpdateState(rewardLearningStoryFrame(frame)).mouseX>=getRewardUpdateState(rewardLearningStoryFrame(frame-1)).mouseX,'Final approach never pauses or reverses');
for(let frame=330;frame<=390;frame++)assert.equal(getRewardUpdateState(rewardLearningStoryFrame(frame)).mouseX,getRewardUpdateState(285).mouseX,'Rat stays at its completed destination');
assert.notEqual(rewardLearningBellRing(333),rewardLearningBellRing(340),'Bell keeps ringing during the hold');
assert.equal(rewardLearningBellRing(396),0,'Bell settles before the unchanged crossfade');
console.log('PASS: rat completes its approach before the hold; bell keeps moving independently and settles before the scene exit.');
