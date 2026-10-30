import React from 'react';
import {Freeze, useCurrentFrame} from 'remotion';

/** Plays a scene at a new length without changing its animation: every output frame
 *  shows the scene at the matching (possibly in-between) moment of its own timeline,
 *  so motion stays smooth instead of dropping or repeating frames.
 *  `cuts` are the scene's Sequence boundaries; a moment just before one is snapped to
 *  a whole frame, because between two sections neither may be drawn. */
export const retimed=(Scene:React.FC,sourceFrames:number,targetFrames:number,cuts:readonly number[]=[]):React.FC=>{
  const Retimed:React.FC=()=>{
    const f=useCurrentFrame();
    let t=Math.min(sourceFrames-1,f*(sourceFrames-1)/(targetFrames-1));
    if(cuts.some(c=>t>c-1&&t<c))t=Math.round(t);
    return <Freeze frame={t}><Scene/></Freeze>;
  };
  return Retimed;
};
