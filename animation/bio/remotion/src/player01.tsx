import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {SCENE01,Scene01_HumanVsComputer} from './Scene01_HumanVsComputer';

const Preview: React.FC = () => {
  const ref=useRef<PlayerRef>(null);
  useEffect(()=>{
    const receive=(e: MessageEvent)=>{
      if(e.source!==window.parent || e.origin!==window.location.origin)return;
      if(e.data?.type==='scene01:pause')ref.current?.pause();
      if(e.data?.type==='scene01:play')ref.current?.play();
    };
    window.addEventListener('message',receive);
    window.parent.postMessage({type:'scene01:ready'},window.location.origin);
    return ()=>window.removeEventListener('message',receive);
  },[]);
  return <Player ref={ref} component={Scene01_HumanVsComputer} compositionWidth={SCENE01.width} compositionHeight={SCENE01.height} durationInFrames={SCENE01.durationInFrames} fps={SCENE01.fps} controls clickToPlay doubleClickToFullscreen style={{width:'100%',height:'100%'}}/>;
};
createRoot(document.getElementById('root')!).render(<Preview/>);
