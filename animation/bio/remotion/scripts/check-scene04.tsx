import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {anatomyToScreen,BRAIN_BOUNDS,BRAIN_PATHWAYS,BRAIN_REGIONS} from '../src/BrainAnatomy';
import {DopamineHandoff} from '../src/Scene03_AddictionAndRewardLearning';
import {getScene04Camera,getScene04State,MesocorticolimbicArtwork,Scene04PlaybackArtwork,SCENE04,T04,scene04TimelineFrame} from '../src/Scene04_MesocorticolimbicIntroduction';
import {C,SourceCitation} from '../src/components';
import {curvePoint,progress} from '../src/motion';
import {living04Camera,living04Phase,living04PlaybackFrame,usesLiving04} from '../src/scene04-living-system';

assert.equal(SCENE04.durationInFrames,1320);
assert.equal(SCENE04.durationInFrames/SCENE04.fps,44);
assert.equal(scene04TimelineFrame(629),629);
assert.equal(scene04TimelineFrame(630),629);
assert.equal(scene04TimelineFrame(869),629,'Rewards stay hidden before 29 seconds');
assert.equal(scene04TimelineFrame(870),T04.rewards,'Rewards begin at exactly 29 seconds');
assert.equal(scene04TimelineFrame(1319),899,'Preserve the original ending for Scene 05');
assert.equal(scene04TimelineFrame(1020),720,'Final reward sequence progresses at the stretched rate');
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
assert.equal(usesLiving04(239),false);
assert.equal(usesLiving04(240),true);
assert.equal(usesLiving04(869),true);
assert.equal(usesLiving04(870),false);
assert.deepEqual(living04Camera(240),getScene04Camera(240));
assert.deepEqual(living04Camera(869),getScene04Camera(629));
for(let f=240;f<870;f++){
  const camera=living04Camera(f),prev=living04Camera(Math.max(240,f-1));
  assert.ok(Math.hypot(camera.x-prev.x,camera.y-prev.y)<12,'Living camera has no position jump');
  assert.ok(Math.abs(camera.scale-prev.scale)<.02,'Living camera has no scale jump');
  assert.ok(living04Phase(f)>=0&&living04Phase(f)<1);
  for(const x of [BRAIN_BOUNDS.left,BRAIN_BOUNDS.right])for(const y of [BRAIN_BOUNDS.top,BRAIN_BOUNDS.bottom]){
    const [sx,sy]=anatomyToScreen([x,y],camera);
    assert.ok(sx>=100&&sx<=1820&&sy>=100&&sy<=1000,'Living anatomy stays in frame');
  }
}
// Compare the complete unchanged legacy artwork/citations, rather than just timing constants.
for(const frame of [0,60,120,209,239,870,871,900,1020,1200,1319]){
  const f=scene04TimelineFrame(frame);
  const old=renderToStaticMarkup(<><MesocorticolimbicArtwork frame={f}/><g opacity={1-progress(f,585,600)}><SourceCitation frame={f} source="Piantadosi et al., 2021"/></g><g opacity={progress(f,600,615)}><SourceCitation frame={f} source="Feltenstein et al., 2009"/></g></>);
  assert.equal(renderToStaticMarkup(<Scene04PlaybackArtwork frame={frame}/>),old,`Preserve all artwork outside revised interval at ${frame}`);
}
for(const frame of [240,330,450,570,660,735,795,830,869]){
  const render=()=>renderToStaticMarkup(<svg style={{background:C.bg}}><Scene04PlaybackArtwork frame={frame}/></svg>);
  const first=render();
  renderToStaticMarkup(<Scene04PlaybackArtwork frame={869-frame+240}/>);
  assert.equal(render(),first,'Reverse seeking cannot change rendered artwork');
  assert.ok(first.includes('Piantadosi et al., 2021'));
  assert.ok(!first.includes('Feltenstein'));
}
console.log('PASS: exact 8–29s edit window; unchanged legacy artwork outside window; matched camera boundaries; contained/smooth camera; deterministic activity and reverse seeking; narration citation.');
console.log('PASS: 1320 frames / 44s; rewards start at 29s; fixed anatomical projection endpoints; anterior orientation; full anatomy stays in frame; smooth camera; reverse scrubbing; preserved Scene 03 handoff; reusable ending.');

assert.equal(living04PlaybackFrame(300),300);
assert.equal(living04PlaybackFrame(510),565,'Enhanced dopamine title fully visible at 17 seconds');
assert.equal(living04PlaybackFrame(690),690,'Rejoin original timing before later transitions');
for(let f=301;f<=690;f++){
 const step=living04PlaybackFrame(f)-living04PlaybackFrame(f-1);
 assert.ok(step>0&&step<1.5,'Speed-up stays smooth and never reverses');
}
