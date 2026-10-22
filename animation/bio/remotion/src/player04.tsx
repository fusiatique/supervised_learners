import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {SCENE04, Scene04_MesocorticolimbicIntroduction} from './Scene04_MesocorticolimbicIntroduction';

const Preview: React.FC = () => {
  const ref=useRef<PlayerRef>(null);
  useEffect(()=>{
    const receive=(e: MessageEvent)=>{
      if(e.source!==window.parent || e.origin!==window.location.origin)return;
      if(e.data?.type==='scene04:pause')ref.current?.pause();
      if(e.data?.type==='scene04:play')ref.current?.play();
    };
    window.addEventListener('message',receive);
    window.parent.postMessage({type:'scene04:ready'},window.location.origin);
    return ()=>window.removeEventListener('message',receive);
  },[]);
  return <Player ref={ref} component={Scene04_MesocorticolimbicIntroduction} compositionWidth={SCENE04.width} compositionHeight={SCENE04.height} durationInFrames={SCENE04.durationInFrames} fps={SCENE04.fps} controls clickToPlay doubleClickToFullscreen style={{width:'100%',height:'100%'}}/>;
};
createRoot(document.getElementById('root')!).render(<Preview/>);
