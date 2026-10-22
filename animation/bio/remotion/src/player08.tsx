import React, {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef} from '@remotion/player';
import {SCENE08, Scene08_SynapticPlasticityAndAddiction} from './Scene08_SynapticPlasticityAndAddiction';

const Preview: React.FC = () => {
  const ref=useRef<PlayerRef>(null);
  useEffect(()=>{
    const receive=(e: MessageEvent)=>{
      if(e.source!==window.parent || e.origin!==window.location.origin)return;
      if(e.data?.type==='scene08:pause')ref.current?.pause();
      if(e.data?.type==='scene08:play')ref.current?.play();
    };
    window.addEventListener('message',receive);
    window.parent.postMessage({type:'scene08:ready'},window.location.origin);
    return ()=>window.removeEventListener('message',receive);
  },[]);
  return <Player ref={ref} component={Scene08_SynapticPlasticityAndAddiction} compositionWidth={SCENE08.width} compositionHeight={SCENE08.height} durationInFrames={SCENE08.durationInFrames} fps={SCENE08.fps} controls clickToPlay doubleClickToFullscreen style={{width:'100%',height:'100%'}}/>;
};
createRoot(document.getElementById('root')!).render(<Preview/>);
