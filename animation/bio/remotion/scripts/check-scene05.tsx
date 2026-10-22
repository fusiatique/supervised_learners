import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {BRAIN_REGIONS} from '../src/BrainAnatomy';
import {C,HumanCharacter} from '../src/components';
import {SimpleNeuron} from '../src/reward-components';
import {getScene04Camera} from '../src/Scene04_MesocorticolimbicIntroduction';
import {AccumbensInputsArtwork,CITATIONS05,getScene05IntroCamera,SCENE05,T05} from '../src/Scene05_DopamineRewardPredictionErrors';
import {FOOD_TRIALS,getFoodEvents,getFoodSpikeTimes,getSpikeTimes,NAc_INPUTS,RewardPredictionError} from '../src/dopamine-learning-components';

assert.equal(SCENE05.durationInFrames,3990);
assert.equal(SCENE05.durationInFrames/SCENE05.fps,133);
assert.equal(SCENE05.bridgeFrames/SCENE05.fps,9);
assert.equal(SCENE05.experimentBridgeFrames/SCENE05.fps,7);
assert.equal(SCENE05.experimentBridgeFrom,SCENE05.bridgeFrames+1890+210);
assert.equal(SCENE05.contextBridgeFrames/SCENE05.fps,13);
assert.equal(SCENE05.contextBridgeFrom+SCENE05.contextBridgeFrames+720,SCENE05.durationInFrames);
const endCamera=getScene04Camera(900),opening=getScene05IntroCamera(0);
for(const key of ['x','y','scale'] as const)assert.ok(Math.abs(opening[key]-endCamera[key])<1e-8,'Scene 04 camera continuity');
for(let f=1;f<=600;f++){
  const a=getScene05IntroCamera(f-1),b=getScene05IntroCamera(f);
  assert.ok(Math.abs(a.scale-b.scale)<.025);
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<15);
}
const baseline=getSpikeTimes('baseline'),burst=getSpikeTimes('burst'),dip=getSpikeTimes('dip');
assert.ok(burst.length>baseline.length&&dip.length<baseline.length);
assert.ok(dip.every(t=>t<.65||t>.83),'Dip is an absence of spikes, not negative spikes');
for(const mode of [baseline,burst,dip])assert.ok(mode.every(t=>t>=0&&t<=1));
for(const trial of FOOD_TRIALS){
  const event=trial.learned?trial.cue:trial.reward;
  const normalized=(event!-trial.start)/(trial.end-trial.start);
  assert.equal(getFoodSpikeTimes(trial.start).filter(t=>t>=normalized-1e-8&&t<=normalized+.09).length>=7,true,'Burst must align to the displayed event');
  const state=getFoodEvents(event!);
  assert.ok(Math.abs(state.reveal-normalized)<1e-9);
}
const learned=getFoodEvents(1449),learnedSpikes=getFoodSpikeTimes(1449);
assert.ok(learnedSpikes.filter(t=>t>=learned.eventTime&&t<learned.eventTime+.09).length<=2,'Expected food has no extra phasic burst');
const omitted=getFoodEvents(1710),omittedSpikes=getFoodSpikeTimes(1710);
assert.ok(omittedSpikes.every(t=>t<omitted.eventTime||t>omitted.eventTime+.18));
assert.ok(omittedSpikes.filter(t=>t>=(1588-1560)/240&&t<(1588-1560)/240+.09).length>=7,'Learned cue still bursts before an omitted reward');
for(const [region,points] of Object.entries(NAc_INPUTS)){
  assert.deepEqual(points[0],BRAIN_REGIONS[region as keyof typeof NAc_INPUTS].center);
  assert.deepEqual(points.at(-1),BRAIN_REGIONS.NAc.center);
}
assert.equal(CITATIONS05[0].from,0);
assert.equal(CITATIONS05.at(-1)!.to,2400);
for(let i=1;i<CITATIONS05.length;i++)assert.equal(CITATIONS05[i-1].to,CITATIONS05[i].from);
assert.equal(CITATIONS05.find(c=>c.from===T05.stimulation)!.source,'Piantadosi et al., 2021');
for(const [expected,actual] of [[.2,.8],[.6,.6],[.7,0]]){
  const svg=renderToStaticMarkup(<svg><RewardPredictionError expected={expected} actual={actual}/></svg>);
  assert.ok(!svg.includes('NaN'));
}
const end=(frame:number)=>renderToStaticMarkup(<svg><AccumbensInputsArtwork frame={frame}/></svg>);
assert.equal(end(2370),end(2399),'Hold final artwork for one second');
const frames=[2070,2170,2280,2350,2399],forward=frames.map(end);
frames.reverse().forEach((f,i)=>assert.equal(end(f),forward[forward.length-i-1],'Ending scrubs deterministically'));
assert.equal(renderToStaticMarkup(<svg><HumanCharacter frame={100}/></svg>),renderToStaticMarkup(<svg><HumanCharacter frame={100} seated={false}/></svg>));
assert.equal(renderToStaticMarkup(<svg><SimpleNeuron/></svg>),renderToStaticMarkup(<svg><SimpleNeuron color={C.yellow}/></svg>));
console.log('PASS: 2400 frames; camera handoff; sparse/burst/pause patterns; event-aligned reward and cue bursts; omitted reward pause; fixed input endpoints; citation coverage; three error signs; deterministic final hold; preserved shared defaults.');
