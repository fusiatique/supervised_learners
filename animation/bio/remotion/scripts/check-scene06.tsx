import {RODENT_COMPARISON,RodentPathwayComparison,StableOutgoingProjection} from '../src/rodent-pathway-comparison';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SCENE06,T06,BRAIN_START06,scene06ContentFrame,scene06PreviewFrame,getScene06Camera,getScene06State,MesocorticalPlanningArtwork,PathwayComparison} from '../src/Scene06_MesocorticalPathwayAndPlanning';
import {Scene06Opening} from '../src/scene06-opening';
import {getPlanningPose,ImaginedTrajectory} from '../src/planning-components';
import {ENDING_CAMERA05} from '../src/Scene05_DopamineRewardPredictionErrors';
import {BRAIN_PATHWAYS,BRAIN_REGIONS,anatomyToScreen} from '../src/BrainAnatomy';
assert.deepEqual(SCENE06,{width:1920,height:1080,fps:30,durationInFrames:1680});
assert.equal(scene06ContentFrame(599),479);
assert.equal(scene06ContentFrame(600),630,'At 20 seconds, cut to the former 25-second point');
assert.equal(getScene06State(480).pfc,1,'PFC highlight completes within 19–20 seconds');
assert.equal(scene06ContentFrame(989),1019);
assert.equal(scene06ContentFrame(990),1019,'Comparison begins from the previous brain camera');
assert.equal(scene06ContentFrame(1590),1710,'Return to the existing ending after 53 seconds');
assert.equal(scene06PreviewFrame(900),900);
assert.equal(getPlanningPose(scene06PreviewFrame(1020)).actual,1,'Stickman completes the choice by the cut');
assert.equal(BRAIN_START06,390);
assert.equal(scene06ContentFrame(390),270,'Brain sequence formerly at 9 seconds now starts at 13 seconds');
assert.equal(scene06ContentFrame(1679),1799,'Preserve the full ending');
assert.equal(T06.pathwayTitle,13*30,'Pathway title starts with VTA at 13 seconds');
assert.deepEqual(getScene06Camera(0),ENDING_CAMERA05);
assert.deepEqual([T06.pathway,T06.planning,T06.prediction,T06.selection,T06.comparison],[270,570,870,1200,1380]);
assert.equal(getScene06State(300).citation,'Cooper et al., 2017');
assert.equal(getScene06State(700).citation,'Alkam et al., 2025');
assert.equal(getScene06State(1400).citation,'Cooper et al., 2017');
assert.deepEqual(BRAIN_PATHWAYS.mesocortical[0],[...BRAIN_REGIONS.VTA.center]);
assert.deepEqual(BRAIN_PATHWAYS.mesocortical.at(-1),[...BRAIN_REGIONS.PFC.center]);
for(let f=870;f<1140;f++)assert.equal(getPlanningPose(f).actual,0,'Actual movement waits until both previews finish');
assert.equal(getPlanningPose(1255).actual,1);
const forward=new Map<number,string>();
for(let f=0;f<1800;f++){
 const camera=getScene06Camera(f),prev=getScene06Camera(Math.max(0,f-1));
 assert.ok(Math.hypot(camera.x-prev.x,camera.y-prev.y)<20,'No camera jump');
 assert.ok(Math.abs(camera.scale-prev.scale)<.04);
 const vta=anatomyToScreen(BRAIN_REGIONS.VTA.center,camera),pfc=anatomyToScreen(BRAIN_REGIONS.PFC.center,camera);
 assert.ok(pfc[0]>vta[0],'Anterior orientation is preserved');
 forward.set(f,JSON.stringify(getScene06State(f)));
}
for(let f=1799;f>=0;f--)assert.equal(JSON.stringify(getScene06State(f)),forward.get(f));
assert.deepEqual(getScene06State(1770),getScene06State(1799),'Final second is a complete hold');
const render=(node:React.ReactNode)=>renderToStaticMarkup(<svg>{node}</svg>);
const imagined=render(<ImaginedTrajectory frame={1010} start={960} end={1050} route="reward"/>);
assert.ok(imagined.includes('stroke-dasharray="9 12"'));
assert.ok(!imagined.includes('RewardPulse'));
const comparison=render(<PathwayComparison frame={1700}/>);
assert.ok(comparison.includes('INCOMING CONNECTIONS'));
assert.ok(comparison.includes('Schematic · rodent findings'));
assert.ok(render(<MesocorticalPlanningArtwork frame={1799}/>).includes('Prefrontal cortex'));
console.log('PASS: 56 seconds, 1080p30; brain reveal at 13 seconds; fixed anatomy; imagined futures precede action; input-change schematic; citations; deterministic scrubbing; final one-second hold.');

const openingTarget=anatomyToScreen(BRAIN_REGIONS.VTA.center,getScene06Camera(270));
const openingFrames=[0,60,120,210,270,300,330,375,389];
const openingForward=new Map(openingFrames.map(frame=>[frame,render(<Scene06Opening frame={frame} pathwayTarget={openingTarget}/>)]));
for(const frame of [...openingFrames].reverse()){
 const markup=render(<Scene06Opening frame={frame} pathwayTarget={openingTarget}/>);
 assert.equal(markup,openingForward.get(frame),'Opening supports deterministic reverse scrubbing');
 assert.ok(!markup.includes('NaN')&&!markup.includes('Infinity'));
 assert.ok(!markup.includes('Prefrontal')&&!markup.includes('VENTRAL TEGMENTAL'),'No brain labels in the opening');
}
assert.ok(openingForward.get(300)?.includes('WHAT ACTION?'));
assert.ok(openingForward.get(210)?.includes('stroke-dasharray="9 10"'),'Missing piece remains unfilled and dashed');
console.log('PASS: 13-second puzzle opening, finite geometry, no anatomical labels, deterministic reverse scrubbing.');


assert.equal(RODENT_COMPARISON.start,33*30);
assert.equal(RODENT_COMPARISON.end,53*30);
assert.equal(RODENT_COMPARISON.duration,600);
assert.ok(RODENT_COMPARISON.cocaine<RODENT_COMPARISON.aversive);
for(const frame of [0,60,119,180,260,350,420,500,580,599]){
 const node=<RodentPathwayComparison frame={frame} startingCamera={getScene06Camera(1019)} endingCamera={getScene06Camera(1710)}/>;
 const markup=render(node);
 assert.equal(markup,render(node));
 assert.ok(markup.includes('Cooper et al., 2017'));
 assert.ok(!markup.includes('NaN'));
}
for(const target of ['NAc','PFC'] as const){
 const outgoing=render(<StableOutgoingProjection target={target}/>);
 assert.ok(outgoing.includes('data-connection="outgoing"'));
 assert.ok(!outgoing.includes('stroke-dashoffset'),'Outgoing axon has no input-dependent animation');
}
console.log('PASS: 600-frame rodent comparison, staged experiences, continuous citation, deterministic geometry and stable outgoing projections.');
