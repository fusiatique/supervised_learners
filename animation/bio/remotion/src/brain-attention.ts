import {ease} from './motion';

export type BrainAttention={strength:number;age:number;color?:string};
/** Narration-aligned emphasis; no wall-clock state, so scrubbing stays deterministic. */
export const brainFocus=(frame:number,...windows:readonly (readonly [number,number])[]):BrainAttention=>{
 let result:BrainAttention={strength:0,age:0};
 for(const [start,end] of windows){
  const strength=ease(frame,start,start+12)*(1-ease(frame,end-15,end));
  if(strength>result.strength)result={strength,age:frame-start};
 }
 return result;
};
export const attentionMotion=({strength,age}:BrainAttention)=>({
 pulse:.5+.5*Math.sin(age*Math.PI/27),
 scale:1+(age>=0&&age<24?.055*Math.sin(Math.PI*age/24)**2:0)*strength,
});
