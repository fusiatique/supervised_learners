import assert from 'node:assert/strict';
import {attentionMotion,brainFocus} from '../src/brain-attention';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {anatomyToScreen,BrainAnatomy,BrainRegionLabel,BRAIN_PATHWAYS,BRAIN_REGIONS,PATHWAY_TARGETS,STRUCTURE_PATHS,type BrainRegion} from '../src/BrainAnatomy';
import {NAc_INPUTS} from '../src/dopamine-learning-components';
import {curvePoint} from '../src/motion';

// Relative anatomical relationships in the canonical anterior-left coordinate system.
const r=BRAIN_REGIONS;
assert.ok(r.PFC.center[0]<r.NAc.center[0]&&r.NAc.center[0]<r.VTA.center[0]);
assert.ok(r.BLA.center[0]<r.vHPC.center[0]);
assert.ok(r.corpusCallosum.center[1]<r.thalamus.center[1]);
assert.ok(r.thalamus.center[1]<r.hypothalamus.center[1]);
assert.ok(r.hypothalamus.center[1]<r.VTA.center[1]);
assert.ok(r.VTA.center[1]<r.pons.center[1]&&r.pons.center[1]<r.medulla.center[1]);
assert.ok(r.cerebellum.center[0]>r.midbrain.center[0]);
assert.ok(r.NAc.rx<r.thalamus.rx/2,'NAc stays a small deep target');
for(const [id,target] of Object.entries(PATHWAY_TARGETS)){
  const path=BRAIN_PATHWAYS[id as keyof typeof BRAIN_PATHWAYS];
  assert.deepEqual(path[0],[...r.VTA.center]);
  assert.deepEqual(path[3],[...r[target].center]);
  for(let i=0;i<=100;i++){
    const [x,y]=curvePoint(i/100,path);
    assert.ok(x>=120&&x<=880&&y>=75&&y<=595);
  }
}
for(const [id,path] of Object.entries(NAc_INPUTS)){
  assert.strictEqual(path[0],r[id as keyof typeof NAc_INPUTS].center,'Input origins use shared references');
  assert.strictEqual(path[3],r.NAc.center,'Input target uses shared reference');
}
const camera={x:960,y:530,scale:1.5,anteriorRight:false};
assert.ok(anatomyToScreen(r.PFC.center,camera)[0]<anatomyToScreen(r.VTA.center,camera)[0]);
assert.ok(anatomyToScreen(r.cerebellum.center,camera)[0]>anatomyToScreen(r.VTA.center,camera)[0]);
const highlights=Object.fromEntries(Object.keys(r).map(key=>[key,1]));
const render=(frame:number)=><svg><BrainAnatomy {...camera} frame={frame} highlights={highlights} pathwayProgress={{mesolimbic:1,mesocortical:1}} activity={{mesolimbic:.4,mesocortical:.4,mesoamygdala:.2,mesohippocampal:.2}}/></svg>;
for(const region of Object.keys(r) as BrainRegion[]){
  assert.ok(STRUCTURE_PATHS[region].endsWith('Z'));
  const hidden=renderToStaticMarkup(<svg><BrainAnatomy {...camera} regionOpacity={{[region]:0}} highlights={{[region]:1}}/></svg>);
  assert.ok(hidden.includes(`opacity="0" data-highlight="${region}"`),'Region highlight opacity is independently controlled');
  const label=renderToStaticMarkup(<svg><BrainRegionLabel region={region} camera={camera} x={300} y={200}/></svg>);
  const [x,y]=anatomyToScreen(r[region].center,camera);
  assert.ok(label.includes(`M${x} ${y}L`),'Label leader points to centralized region anchor');
}
for(const frame of [0,45,180,450,735,899]){
  const first=renderToStaticMarkup(render(frame));
  renderToStaticMarkup(render(899-frame));
  assert.equal(renderToStaticMarkup(render(frame)),first,'Reverse scrubbing preserves geometry and activity');
  assert.ok(!first.includes('NaN'));
  for(const target of Object.values(PATHWAY_TARGETS))assert.ok(first.includes(`data-projection="VTA-to-${target}"`));
}
console.log('PASS: anatomical relationships; independent VTA projections; shared input anchors; consistent mirroring; independent structure highlights/opacity; attached labels; deterministic reverse seeking.');

const mirroredLabel=renderToStaticMarkup(<svg><BrainRegionLabel region="PFC" camera={camera} x={1600} y={420} fullName mirrorPosition/></svg>);
assert.ok(mirroredLabel.includes('x="320"'),'Fixed PFC callout mirrors to the left of the brain');
const [labelTargetX,labelTargetY]=anatomyToScreen(r.PFC.center,camera);
assert.ok(mirroredLabel.includes(`M${labelTargetX} ${labelTargetY}L355 400H320`),'Leader exits toward the nearby label');

assert.equal(brainFocus(99,[100,200]).strength,0);
assert.equal(brainFocus(200,[100,200]).strength,0);
assert.equal(attentionMotion(brainFocus(124,[100,200])).scale,1,'Introduction pop returns precisely to its anchor');
for(let f=0;f<240;f++){
 const attention=brainFocus(f,[100,200]),motion=attentionMotion(attention);
 assert.ok(attention.strength>=0&&attention.strength<=1);
 assert.ok(motion.scale>=1&&motion.scale<=1.055);
 assert.deepEqual(brainFocus(f,[100,200]),brainFocus(f,[100,200]),'Attention remains deterministic when seeking');
}
