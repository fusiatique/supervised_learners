import React from 'react';
import {anatomyToScreen, BrainAnatomy, BrainRegionLabel, BRAIN_REGIONS, DopamineParticle, type BrainCamera, type PathwayId} from './BrainAnatomy';
import {C, HumanCharacter, Label, SourceCitation} from './components';
import {curvePoint, draw, ease, fade, mix, progress} from './motion';
import {SimpleNeuron} from './reward-components';
import {CapsuleSymbol, RewardSymbol, WarningSymbol} from './risk-components';

export const LIVING04={start:240,diversity:360,convergence:510,vta:630,neurons:690,mesolimbic:750,behavior:780,return:840,end:870} as const;
export const usesLiving04=(frame:number)=>frame>=LIVING04.start&&frame<LIVING04.end;

/** Ease into faster playback after 10s; the enhanced-activity title is fully visible at 17s.
 * Gradually rejoin the original clock so later transitions and total length stay intact. */
export const living04PlaybackFrame=(frame:number)=>{
  const smooth=(t:number)=>t*t*(3-2*t);
  const offset=frame<=300||frame>=690?0:frame<=510
    ?55*smooth((frame-300)/210)
    :55*(1-smooth((frame-510)/180));
  return frame+offset;
};

/** Playback frames, independent of the legacy source clock used by Scene 05. */
export const living04Camera=(f:number):BrainCamera=>{
  const space=ease(f,360,408)*(1-ease(f,600,630));
  const focus=ease(f,630,690)*(1-ease(f,810,840));
  return {x:960+100*focus,y:530-20*focus,scale:1.68*(1-.1*space-.1*focus),anteriorRight:true};
};

/** Continuous phase integration increases event frequency without resetting pulses. */
export const living04Phase=(f:number,offset=0)=>{
  const elapsed=Math.max(0,f-250);
  const ramp=progress(f,540,585);
  const extra=f<=585?22.5*ramp*ramp:22.5+Math.max(0,f-585);
  return ((elapsed+extra+offset)%150)/150;
};

const NeuralActivity:React.FC<{frame:number;camera:BrainCamera}>=({frame:f,camera})=>{
  const boost=ease(f,540,585),visible=progress(f,250,280);
  return <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.scale}) translate(-500 -330) translate(1000 0) scale(-1 1)`}>
    {(['mesolimbic','mesocortical'] as PathwayId[]).map((pathway,j)=><g key={pathway}>
      {[0,75].map((offset,i)=>{
        const phase=living04Phase(f,offset+j*26);
        const revealed=progress(f,j?303:250,j?355:310);
        const opacity=visible*progress(phase,0,.08)*(1-progress(phase,.9,1))*(i===0?.6+.4*boost:.22+.65*boost)*(phase<=revealed?1:0);
        const target=BRAIN_REGIONS[j?'PFC':'NAc'];
        return <g key={i}><DopamineParticle pathway={pathway} phase={phase} opacity={opacity}/>
          <ellipse cx={target.center[0]} cy={target.center[1]} rx={j?16:target.rx*1.4} ry={j?25:target.ry*1.5} fill={C.yellow} opacity={visible*boost*progress(phase,.78,.9)*(1-progress(phase,.9,1))*.14}/>
        </g>;
      })}
    </g>)}
  </g>;
};

const DrugEffects:React.FC<{frame:number;camera:BrainCamera}>=({frame:f,camera})=>{
  const origins=[[175,345],[1745,345],[180,740]];
  const target=anatomyToScreen(BRAIN_REGIONS.VTA.center,camera);
  return <g opacity={1-progress(f,600,630)}>
    {origins.map(([x,y],i)=>{
      const enter=progress(f,366+i*24,396+i*24),phase=((f-390+i*19)%80+80)%80/80;
      const start=510+i*7,t=progress(f,start,start+49);
      const path=[[x,y],[mix(x,target[0],.35),y-95],[mix(x,target[0],.7),target[1]-80],target];
      const [sx,sy]=curvePoint(ease(f,start,start+49),path);
      return <g key={i}>
        <g transform={`translate(${x} ${y+12*(1-enter)})`} opacity={enter}>
          {i===0?<CapsuleSymbol scale={.85} amount={enter}/>:i===1?<g fill="none" stroke={C.white} strokeWidth={3} strokeLinejoin="round">
            <path d="M-20 -55H20V-33L34 -18V47Q34 55 26 55H-26Q-34 55 -34 47V-18L-20 -33Z M-23 -64H23V-54H-23Z M-32 15H32" {...draw(enter)}/>
          </g>:<g fill={C.bg} stroke={C.white} strokeWidth={3}>
            <path d="M-38 0L-18 -36H22L44 0L22 36H-18Z M44 0H69 M-38 0H-65" fill="none" {...draw(enter)}/>
            {[[-38,0],[22,-36],[22,36]].map(([cx,cy],n)=><circle key={n} cx={cx} cy={cy} r={8} opacity={enter}/>)}
          </g>}
          {i===0?<circle r={65+phase*30} fill="none" stroke={C.red} strokeWidth={2} opacity={.45*(1-phase)*enter}/>:i===1?<g fill={C.blue} opacity={enter*.6}>{[0,1,2].map(n=><circle key={n} cx={-17+n*17} cy={83-Math.sin(phase*Math.PI+n)*12} r={3}/>)}</g>:<path d={`M-65 83Q-32 ${65+phase*20} 0 83T65 83`} fill="none" stroke={C.yellow} strokeWidth={2} opacity={enter*.6}/>}
        </g>
        <path d={`M${path[0]}C${path[1]} ${path[2]} ${path[3]}`} fill="none" stroke={C.gray} strokeWidth={1.8} opacity={fade(f,start,start+12,start+49)*.28} {...draw(t)}/>
        <circle cx={sx} cy={sy} r={11} fill="none" stroke={[C.red,C.blue,C.yellow][i]} strokeWidth={2} opacity={progress(f,start,start+8)*(1-progress(f,start+44,start+54))}/>
      </g>;
    })}
  </g>;
};

const VTAInset:React.FC<{frame:number;camera:BrainCamera}>=({frame:f,camera})=>{
  const grow=ease(f,690,720),close=ease(f,840,869);
  const shrink=1-.1*ease(f,780,805),[vx,vy]=anatomyToScreen(BRAIN_REGIONS.VTA.center,camera);
  const x=mix(vx,310,grow*(1-close)),y=mix(vy,680,grow*(1-close));
  const scale=grow*(1-close)*shrink;
  return <g opacity={grow*(1-close)}>
    <path d={`M${vx} ${vy}L${x+180*scale} ${y}`} fill="none" stroke={C.yellow} strokeWidth={1.8} opacity={.6}/>
    <g transform={`translate(${x} ${y}) scale(${Math.max(.001,scale)})`}>
      <circle r={210} fill={C.bg} stroke={C.gray} strokeWidth={2}/>
      {[[-55,-100],[-65,0],[-55,100]].map(([nx,ny],i)=>{
        const amount=progress(f,698+i*9,720+i*12),phase=((f-710+i*29)%94+94)%94/94;
        const selected=progress(f,750,765),opacity=i===1?1:1-selected*.4;
        const [px,py]=curvePoint(phase,[[61,1],[160,-18],[210,23],[300,2]]);
        return <g key={i} opacity={opacity}>
          <SimpleNeuron x={nx} y={ny} scale={.42} amount={amount}/>
          <circle cx={nx+px*.42} cy={ny+py*.42} r={3.5} fill={C.yellow} opacity={amount*progress(phase,0,.1)*(1-progress(phase,.9,1))}/>
          {i===1&&<path d={`M${nx+340*.42} ${ny}H201`} fill="none" stroke={C.yellow} strokeWidth={2} {...draw(selected)}/>}
        </g>;
      })}
      <g opacity={progress(f,710,730)}><Label x={0} y={-242} size={27} color={C.yellow}>DOPAMINE NEURONS</Label></g>
    </g>
  </g>;
};

const RiskyChoice:React.FC<{frame:number}>=({frame:f})=>{
  const amount=progress(f,780,803),walk=ease(f,822,840),look=f<818?-5:5;
  return <g opacity={amount*(1-progress(f,840,864))} transform="translate(1690 855)">
    <path d="M0 75Q0 20 -115 -50M0 75Q0 20 108 -50" fill="none" stroke={C.gray} strokeWidth={2} {...draw(amount)}/>
    <RewardSymbol x={-115} y={-85} scale={.42} amount={amount}/>
    <RewardSymbol x={105} y={-85} scale={.42} amount={amount}/>
    <WarningSymbol x={154} y={-92} scale={.5} amount={amount}/>
    <HumanCharacter x={mix(0,60,walk)} y={mix(50,-15,walk)} scale={.45} frame={f-780} expression="conflicted" look={look} walking={walk>0&&walk<1?1:0} naturalMotion amount={amount}/>
  </g>;
};

export const Scene04LivingSystem:React.FC<{frame:number;opening:React.ReactNode;ending:React.ReactNode}>=({frame,opening,ending})=>{
  const f=living04PlaybackFrame(frame);
  const camera=living04Camera(f),enter=ease(f,240,270),exit=ease(f,840,869);
  const boost=ease(f,540,585),focus=ease(f,630,690);
  return <g>
    <g opacity={1-enter}>{opening}</g>
    <g opacity={enter*(1-exit)}>
      <BrainAnatomy {...camera} amount={1} cortexOpacity={1-.35*focus} highlights={{VTA:1,NAc:progress(f,292,330),PFC:progress(f,320,358)}}
        pathwayProgress={{mesolimbic:progress(f,250,310),mesocortical:progress(f,303,355)}}
        pathwayWidthScale={{mesolimbic:1+1.8*ease(f,744,774)*(1-ease(f,825,855))}}
        pathwayOpacity={{mesolimbic:1,mesocortical:1-.6*focus}} activity={{mesolimbic:0,mesocortical:0}}/>
      <NeuralActivity frame={f} camera={camera}/>
      <DrugEffects frame={f} camera={camera}/>
      <g opacity={boost*.25}>
        <ellipse cx={anatomyToScreen(BRAIN_REGIONS.VTA.center,camera)[0]} cy={anatomyToScreen(BRAIN_REGIONS.VTA.center,camera)[1]} rx={40} ry={28} fill={C.yellow}/>
      </g>
      <g opacity={fade(f,285,315,495)}>
        <text x={960} y={78} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={35} fill={C.white}>MESOCORTICOLIMBIC <tspan fill={C.yellow}>DOPAMINE</tspan> SYSTEM</text>
      </g>
      <g opacity={fade(f,548,565,609)}><Label x={960} y={78} size={34} color={C.yellow}>ENHANCED DOPAMINE ACTIVITY</Label></g>
      <BrainRegionLabel region="VTA" camera={camera} x={1040} y={940} fullName opacity={progress(f,630,651)*(1-progress(f,828,840))}/>
      <VTAInset frame={f} camera={camera}/>
      <g opacity={fade(f,750,765,780)}><Label x={1100} y={78} size={32} color={C.yellow}>MESOLIMBIC PATHWAY</Label></g>
      <RiskyChoice frame={f}/>
      <g opacity={progress(f,810,816)*(1-progress(f,828,840))}><Label x={1050} y={78} size={33}>RISKY REWARD SEEKING</Label></g>
    </g>
    <g opacity={exit}>{ending}</g>
    <SourceCitation frame={f} source="Piantadosi et al., 2021"/>
  </g>;
};
