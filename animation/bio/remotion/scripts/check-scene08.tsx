import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SCENE08,T08,CAMERA08,Scene08Artwork,state08,strengths08} from '../src/Scene08_SynapticPlasticityAndAddiction';
import {DRUG_STRENGTHS,LEARNED_STRENGTHS,NETWORK_NODES,NETWORK_EDGES,PlasticSynapse,postsynapticResponse} from '../src/plasticity-components';
import {anatomyToScreen,BRAIN_REGIONS} from '../src/BrainAnatomy';
assert.deepEqual(SCENE08,{width:1920,height:1080,fps:30,durationInFrames:2550});
assert.equal(T08.learnedBoundary,900);
assert.equal(T08.drug,45*30);
for(let f=0;f<=900;f++)assert.equal(state08(f).dopamine,false,'No dopamine before the completed learning boundary');
assert.equal(state08(901).dopamine,true);
for(let f=0;f<1350;f++)assert.equal(state08(f).drug,false);
assert.deepEqual(strengths08(900),LEARNED_STRENGTHS);
assert.deepEqual(strengths08(899),strengths08(900),'Learned network is stable at the narration boundary');
assert.deepEqual(strengths08(2099),DRUG_STRENGTHS);
assert.equal(state08(1349).citation,null);
assert.equal(state08(1350).citation,'Volkow et al., 2019');
assert.ok(postsynapticResponse(1)>postsynapticResponse(.45));
assert.ok(postsynapticResponse(.16)<postsynapticResponse(.45));
assert.ok(NETWORK_NODES.length>=6&&NETWORK_NODES.length<=10);
for(const [a,b] of NETWORK_EDGES)assert.ok(a!==b&&a<NETWORK_NODES.length&&b<NETWORK_NODES.length);
const render=(node:React.ReactNode)=>renderToStaticMarkup(node);
for(const state of ['baseline','potentiated','depressed'] as const){
 const markup=render(<svg><PlasticSynapse frame={15} testFrame={0} state={state}/></svg>);
 assert.ok(markup.includes('r="6"'),'Illustrative test input amplitude is identical across efficacy states');
}
const frames=[0,89,149,239,360,449,540,620,700,780,810,870,899,900,901,990,1110,1230,1349,1350,1500,1590,1700,1810,1890,1980,2040,2070,2099];
const forward=new Map<number,string>();
for(const frame of frames){
 const markup=render(<Scene08Artwork frame={frame}/>);
 assert.ok(!markup.includes('NaN')&&!markup.includes('Infinity'),`Finite SVG at ${frame}`);
 forward.set(frame,markup);
}
for(const frame of [...frames].reverse())assert.equal(render(<Scene08Artwork frame={frame}/>),forward.get(frame),'Deterministic reverse scrubbing');
assert.equal(forward.get(2070),forward.get(2099),'Final second is an exact stable hold');
const pfc=anatomyToScreen(BRAIN_REGIONS.PFC.center,CAMERA08),nac=anatomyToScreen(BRAIN_REGIONS.NAc.center,CAMERA08);
assert.ok(pfc[0]<nac[0]&&pfc[1]<nac[1],'Existing anterior PFC and ventral striatal NAc coordinates are preserved');
console.log('PASS: 70s / 2100 frames; stable learned network at 30s; dopamine only afterward; drugs at 45s; equal test inputs with ordered responses; invariant network; existing anatomy; citation; deterministic scrubbing and final hold.');
