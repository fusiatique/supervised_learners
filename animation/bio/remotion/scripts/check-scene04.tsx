import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {anatomyToScreen,BRAIN_BOUNDS,BRAIN_PATHWAYS,BRAIN_REGIONS} from '../src/BrainAnatomy';
import {DopamineHandoff} from '../src/Scene03_AddictionAndRewardLearning';
import {getScene04Camera,getScene04State,MesocorticolimbicArtwork,SCENE04,T04} from '../src/Scene04_MesocorticolimbicIntroduction';
import {curvePoint} from '../src/motion';

assert.equal(SCENE04.durationInFrames,900);
assert.equal(SCENE04.durationInFrames/SCENE04.fps,30);
assert.deepEqual(BRAIN_PATHWAYS.mesolimbic[0],[...BRAIN_REGIONS.VTA.center]);
assert.deepEqual(BRAIN_PATHWAYS.mesocortical[0],[...BRAIN_REGIONS.VTA.center]);
assert.deepEqual(BRAIN_PATHWAYS.mesolimbic.at(-1),[...BRAIN_REGIONS.NAc.center]);
assert.deepEqual(BRAIN_PATHWAYS.mesocortical.at(-1),[...BRAIN_REGIONS.PFC.center]);
assert.ok(BRAIN_REGIONS.VTA.center[1]>BRAIN_REGIONS.NAc.center[1]);
assert.ok(BRAIN_REGIONS.VTA.center[0]>BRAIN_REGIONS.NAc.center[0]);
assert.ok(BRAIN_REGIONS.NAc.center[0]>BRAIN_REGIONS.PFC.center[0]);
const forward=new Map<number,string>();
for(let f=0;f<900;f++){
  const camera=getScene04Camera(f),prev=getScene04Camera(Math.max(0,f-1));
  assert.ok(Math.abs(camera.scale-prev.scale)<.04,'Camera zoom must be continuous');
  assert.ok(Math.hypot(camera.x-prev.x,camera.y-prev.y)<15,'No camera position jump');
  const vta=anatomyToScreen(BRAIN_REGIONS.VTA.center,camera),nac=anatomyToScreen(BRAIN_REGIONS.NAc.center,camera),pfc=anatomyToScreen(BRAIN_REGIONS.PFC.center,camera);
  assert.ok(pfc[0]>nac[0]&&nac[0]>vta[0],'Right-facing anterior orientation must stay consistent');
  if(f>=T04.system){
    for(const x of [BRAIN_BOUNDS.left,BRAIN_BOUNDS.right])for(const y of [BRAIN_BOUNDS.top,BRAIN_BOUNDS.bottom]){
      const [sx,sy]=anatomyToScreen([x,y],camera);
      assert.ok(sx>=100&&sx<=1820&&sy>=100&&sy<=1000,`Full anatomy must fit at frame ${f}`);
    }
  }
  forward.set(f,JSON.stringify(getScene04State(f)));
}
for(let f=899;f>=0;f--)assert.equal(JSON.stringify(getScene04State(f)),forward.get(f));
for(const path of Object.values(BRAIN_PATHWAYS))for(let i=0;i<=100;i++){
  const [x,y]=curvePoint(i/100,path);
  assert.ok(x>=120&&x<=880&&y>=75&&y<=595,'Pathways remain inside the brain bounds');
}
const original=renderToStaticMarkup(<svg><DopamineHandoff frame={1679}/></svg>);
assert.equal(original,renderToStaticMarkup(<svg><DopamineHandoff frame={1679} neuronOpacity={1} particleOpacity={1}/></svg>),'Scene 03 handoff defaults must be preserved');
const end=()=>renderToStaticMarkup(<svg><MesocorticolimbicArtwork frame={899}/></svg>);
assert.equal(end(),end(),'The reusable ending must render deterministically');
console.log('PASS: 900 frames; fixed anatomical projection endpoints; anterior orientation; full anatomy stays in frame; smooth camera; reverse scrubbing; preserved Scene 03 handoff; reusable ending.');
