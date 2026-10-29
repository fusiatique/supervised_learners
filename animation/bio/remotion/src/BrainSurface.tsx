import React,{useId} from 'react';
import {CORTEX_OUTLINE,CORTICAL_SULCI,FINE_SULCI} from './brain-anatomy-geometry';
import {draw,progress} from './motion';

/** Presentation-only layer: shares the original coordinate system and reveal amount. */
export const BrainSurface:React.FC<{amount:number;detail?:number}>=({amount,detail=1})=>{
 const id=useId().replace(/[^a-zA-Z0-9]/g,'');
 return <g data-layer="cortical-anatomy" stroke="none" strokeLinecap="round" strokeLinejoin="round">
  <defs>
   <linearGradient id={id+'cortex'} x1=".25" y1="0" x2=".75" y2="1" >
    <stop offset="0" stopColor="#727c8c"/><stop offset=".46" stopColor="#414e61"/><stop offset="1" stopColor="#253247"/>
   </linearGradient>
   <radialGradient id={id+'white'} cx="43%" cy="40%" r="65%"><stop stopColor="#738091"/><stop offset="1" stopColor="#354255"/></radialGradient>
   <clipPath id={id+'clip'}><path d={CORTEX_OUTLINE}/></clipPath>
  </defs>
  <path d={CORTEX_OUTLINE} fill={'url(#'+id+'cortex)'} fillOpacity={progress(amount,0,.45)*.83} stroke="#a0a9b7" strokeWidth={2.3} {...draw(amount)}/>
  <g clipPath={'url(#'+id+'clip)'} opacity={progress(amount,.2,.8)}>
   <path d="M293 362C269 306 304 237 365 202C440 157 548 150 630 183C711 211 752 260 746 315C742 353 707 394 657 415C604 440 565 447 525 451L464 447C407 464 337 451 300 423C328 393 317 378 293 362Z" fill={'url(#'+id+'white)'} opacity=".65"/>
   <path d="M294 321C289 266 334 214 390 193C469 160 561 167 628 194C679 214 716 242 727 274" fill="none" stroke="#a0a9b7" strokeWidth={12} opacity=".09"/>
   {CORTICAL_SULCI.map(d=><g key={d}>
    <path d={d} transform="translate(1 2)" fill="none" stroke="#b5bfcc" strokeWidth={3.3} opacity=".13" {...draw(progress(amount,.2,1))}/>
    <path d={d} fill="none" stroke="#121f31" strokeWidth={2.6} opacity=".72" {...draw(progress(amount,.2,1))}/>
   </g>)}
   <g opacity={.25+.45*detail}>{FINE_SULCI.map(d=><path key={d} d={d} fill="none" stroke="#a3afbe" strokeWidth={1.2} opacity=".45" {...draw(progress(amount,.5,1))}/>)}</g>
   <path d="M355 334C347 300 380 267 426 252C488 232 564 241 618 263C649 276 665 296 659 311C636 306 614 295 586 291C533 279 467 282 424 302C393 316 375 334 355 334Z" fill="#101c2d" opacity=".76"/>
  </g>
 </g>;
};
