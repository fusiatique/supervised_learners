import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {writeFileSync} from 'node:fs';
import {BrainAnatomy} from '../src/BrainAnatomy';
import {BrainIllustration} from '../src/components';
import {RatBrain} from '../src/prefrontal-control-components';
const cases=[
 ['Muted anatomy',{}],
 ['VTA activation',{highlights:{VTA:1},regionFocus:{VTA:{strength:1,age:32}}}],
 ['NAc activation',{highlights:{NAc:1},regionFocus:{NAc:{strength:1,age:32}}}],
 ['PFC activation',{highlights:{PFC:1},regionFocus:{PFC:{strength:1,age:32}}}],
 ['Mesolimbic · VTA → NAc',{highlights:{VTA:1,NAc:1},pathwayProgress:{mesolimbic:1},pathwayFocus:{mesolimbic:1},activity:{mesolimbic:1}}],
 ['Mesocortical · VTA → PFC',{highlights:{VTA:1,PFC:1},pathwayProgress:{mesocortical:1},pathwayFocus:{mesocortical:1},activity:{mesocortical:1}}],
] as const;
const panels=cases.map(([label,props])=>`<section><h2>${label}</h2>${renderToStaticMarkup(<svg viewBox="0 0 1000 670"><BrainAnatomy x={500} y={330} scale={1.1} frame={64} {...props}/></svg>)}</section>`);
panels.push(`<section><h2>Compact brain · introductory scenes</h2>${renderToStaticMarkup(<svg viewBox="0 0 1000 670"><BrainIllustration x={500} y={330} scale={1.8} frame={90} signal={.6}/></svg>)}</section>`);
panels.push(`<section><h2>Rodent medial view · prelimbic focus</h2>${renderToStaticMarkup(<svg viewBox="0 0 1000 670"><RatBrain x={500} y={330} scale={1.65} focus={{strength:1,age:32}}/></svg>)}</section>`);
writeFileSync('/private/tmp/neuroai-brain-review.html',`<!doctype html><style>body{margin:0;background:#101827;color:#d6deea;font:18px Arial;display:grid;grid-template-columns:1fr 1fr;gap:2px}section{padding:15px;border:1px solid #263347}h2{font-size:22px;margin:0 0 5px}svg{width:100%;display:block}</style>${panels.join('')}`);
