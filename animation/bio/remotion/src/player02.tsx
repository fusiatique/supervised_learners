import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {SCENE02, Scene02_RiskAndAddiction} from './Scene02_RiskAndAddiction';

const Preview: React.FC = () => {
  const ref=useRef<PlayerRef>(null);
  useEffect(()=>{
    const receive=(e: MessageEvent)=>{
      if(e.source!==window.parent || e.origin!==window.location.origin)return;
      if(e.data?.type==='scene02:pause')ref.current?.pause();
      if(e.data?.type==='scene02:play')ref.current?.play();
    };
    window.addEventListener('message',receive);
    window.parent.postMessage({type:'scene02:ready'},window.location.origin);
    return ()=>window.removeEventListener('message',receive);
  },[]);
  return <Player ref={ref} component={Scene02_RiskAndAddiction} compositionWidth={SCENE02.width} compositionHeight={SCENE02.height} durationInFrames={SCENE02.durationInFrames} fps={SCENE02.fps} controls clickToPlay doubleClickToFullscreen style={{width:'100%',height:'100%'}}/>;
};
createRoot(document.getElementById('root')!).render(<Preview/>);
