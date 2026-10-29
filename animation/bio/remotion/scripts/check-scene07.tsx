import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SCENE07,Scene07OriginalTimeline,SCENE07_CUT,scene07PlaybackFrame,scene07CutOpacity,T07,getScene07Camera,getScene07State,getControlPose07,ReceptorsAndControl,PrelimbicExperimentArtwork} from '../src/Scene07_PrefrontalControlAndAddiction';
import {getScene06Camera} from '../src/Scene06_MesocorticalPathwayAndPlanning';
import {getRatExperimentPose,RatBrain} from '../src/prefrontal-control-components';
assert.deepEqual(SCENE07,{width:1920,height:1080,fps:30,durationInFrames:1560});
assert.deepEqual(getScene07Camera(0),getScene06Camera(1770));
assert.deepEqual([T07.brake,T07.receptors,T07.adaptation,T07.subregions,T07.experiment],[240,540,930,1290,1530]);
assert.equal(getScene07State(449).citation,null);
assert.equal(getScene07State(450).citation,'Volkow et al., 2019; Uhl et al., 2019');
assert.equal(getScene07State(930).citation,'Volkow et al., 2019');
assert.equal(getScene07State(1500).humanOpacity,0,'Human anatomy is gone before the rodent experiment');
assert.equal(getControlPose07(375).x,getControlPose07(419).x,'Active brake stops the character');
assert.ok(getControlPose07(480).x>getControlPose07(419).x,'Weaker control allows further approach');
const forward=new Map<number,string>();
for(let f=0;f<1800;f++){
 const current=getScene07State(f),previous=getScene07State(Math.max(0,f-1));
 assert.ok(Math.hypot(current.camera.x-previous.camera.x,current.camera.y-previous.camera.y)<20);
 assert.ok(Math.abs(current.camera.scale-previous.camera.scale)<.04);
 assert.ok(Math.abs(current.pfc-previous.pfc)<.08,'No sudden PFC activity change');
 forward.set(f,JSON.stringify(current));
}
for(let f=1799;f>=0;f--)assert.equal(JSON.stringify(getScene07State(f)),forward.get(f));
assert.deepEqual(getScene07State(1770),getScene07State(1799));
assert.equal(getRatExperimentPose(1650,'stimulation').x,getRatExperimentPose(1799,'stimulation').x,'Stimulated rat stops approaching');
assert.ok(getRatExperimentPose(1740,'inhibition').x>getRatExperimentPose(1680,'inhibition').x,'Inhibited rat continues approaching');
const render=(node:React.ReactNode)=>renderToStaticMarkup(<svg>{node}</svg>);
const association=render(<ReceptorsAndControl f={810}/>);
assert.ok(association.includes('stroke-dasharray="3 8"'),'Association line is genuinely dotted');
assert.ok(association.includes('ASSOCIATED WITH LOWER PFC ACTIVITY'));
assert.ok(render(<RatBrain label/>).includes('Rat medial prefrontal cortex'));
const final=render(<PrelimbicExperimentArtwork frame={1799}/>);
assert.ok(final.includes('REDUCED')&&final.includes('INCREASED'));
assert.ok(final.includes('Cocaine-exposed rats · schematic comparison'));
assert.equal(final,render(<PrelimbicExperimentArtwork frame={1770}/>),'Final composition is held');
console.log('PASS: 52 seconds; Scene 06 camera continuity; scientific association uses dotted line; gradual activity; brake stopping; correct rat outcome contrast; citations; deterministic reverse scrubbing; stable final hold.');

assert.equal(scene07PlaybackFrame(1079),1079);
assert.equal(scene07PlaybackFrame(1080),1440,'D2 sequence connects directly to the former 48s PFC sequence');
assert.equal(scene07PlaybackFrame(1559),1919,'Preserve the complete ending');
assert.equal(scene07CutOpacity(1062),1);
assert.equal(scene07CutOpacity(1080),0);
assert.equal(scene07CutOpacity(1098),1);
for(let f=0;f<SCENE07.durationInFrames;f++){
 const source=scene07PlaybackFrame(f);
 assert.ok(source<SCENE07_CUT.from||source>=SCENE07_CUT.to,'Removed brain/stickman section is never sampled');
 assert.ok(Math.abs(scene07CutOpacity(f)-scene07CutOpacity(Math.max(0,f-1)))<.16,'Cubic transition fades continuously without an opacity jump');
}
console.log('PASS: direct 36s-to-former-48s edit, smooth sequential fades, removed section excluded and full ending retained.');

// Exercise the complete source composition, not only the standalone final artwork.
for(const frame of [1350,1440,1530,1559]){
 const ending=renderToStaticMarkup(<Scene07OriginalTimeline frame={scene07PlaybackFrame(frame)}/>);
 assert.ok(ending.includes('STIMULATION')&&ending.includes('INHIBITION'),'Both rodent experiment panels remain in the shortened video');
 assert.equal((ending.match(/>PRELIMBIC CORTEX</g)||[]).length,2,'Both rodents have their prelimbic cortex label');
}
assert.equal(renderToStaticMarkup(<Scene07OriginalTimeline frame={scene07PlaybackFrame(1530)}/>),renderToStaticMarkup(<Scene07OriginalTimeline frame={scene07PlaybackFrame(1559)}/>),'Preserve the final second of the complete two-rodent scene');
console.log('PASS: complete composed ending includes both rodent panels through the final hold.');
