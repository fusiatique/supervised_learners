import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {SCENE06, Scene06_MesocorticalPathwayAndPlanning} from './Scene06_MesocorticalPathwayAndPlanning';

const Preview: React.FC = () => {
  const ref=useRef<PlayerRef>(null);
  useEffect(()=>{
    const receive=(e: MessageEvent)=>{
      if(e.source!==window.parent || e.origin!==window.location.origin)return;
      if(e.data?.type==='scene06:pause')ref.current?.pause();
      if(e.data?.type==='scene06:play')ref.current?.play();
    };
    window.addEventListener('message',receive);
    window.parent.postMessage({type:'scene06:ready'},window.location.origin);
    return ()=>window.removeEventListener('message',receive);
  },[]);
  return <Player ref={ref} component={Scene06_MesocorticalPathwayAndPlanning} compositionWidth={SCENE06.width} compositionHeight={SCENE06.height} durationInFrames={SCENE06.durationInFrames} fps={SCENE06.fps} controls clickToPlay doubleClickToFullscreen style={{width:'100%',height:'100%'}}/>;
};
createRoot(document.getElementById('root')!).render(<Preview/>);
