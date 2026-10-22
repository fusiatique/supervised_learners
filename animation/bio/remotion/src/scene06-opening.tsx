import React from 'react';
import {C,Label} from './components';
import {curvePoint,draw,ease,mix,pop,progress} from './motion';

const pieces=[
 'M-402-270H-18Q0-270 0-252V-190C64-190 64-80 0-80V0H-155C-155 64-265 64-265 0H-402Q-420 0-420-18V-252Q-420-270-402-270Z',
 'M18-270H402Q420-270 420-252V-18Q420 0 402 0H265C265 64 155 64 155 0H0V-80C64-80 64-190 0-190V-252Q0-270 18-270Z',
 'M-420 0H-265C-265 64-155 64-155 0H0V80C64 80 64 190 0 190V252Q0 270-18 270H-402Q-420 270-420 252Z',
 'M0 0H155C155 64 265 64 265 0H420V252Q420 270 402 270H18Q0 270 0 252V190C64 190 64 80 0 80Z',
];

const Bell:React.FC<{frame:number;amount:number}>=({frame:f,amount})=>{
 const ringing=progress(f,35,45)*(1-progress(f,73,84));
 return <g transform={`rotate(${Math.sin(f*.42)*4*ringing})`} fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
  <rect x={-35} y={-62} width={70} height={124} rx={13} {...draw(amount)}/>
  <path d="M-19 13Q-12 7-12-10A12 12 0 0 1 12-10Q12 7 19 13ZM-5 22Q0 30 5 22M0-25V-30" {...draw(amount)}/>
  {[-1,1].map(side=><path key={side} d={`M${side*46}-22Q${side*62} 0 ${side*46} 22M${side*58}-34Q${side*82} 0 ${side*58} 34`} opacity={ringing*(.55+.25*Math.sin(f*.3))} {...draw(progress(f,35,52))}/>)}
 </g>;
};
const DeliveryBag:React.FC<{amount:number}>=({amount})=><g fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
 <path d="M-45-30H45L53 58H-53ZM-22-30V-45A22 22 0 0 1 22-45V-30" {...draw(amount)}/>
 <path d="M-22 9H22L14 33H-14ZM-28 9H28M-4-4Q-12-13-3-22M12-4Q4-13 13-22" stroke={C.yellow} {...draw(amount)}/>
</g>;

/** The first 390 frames only. No anatomy or audio is introduced here. */
export const Scene06Opening:React.FC<{frame:number;pathwayTarget:number[]}>=({frame:f,pathwayTarget})=>{
 const zoom=ease(f,120,207),morph=ease(f,78,116),out=ease(f,330,365);
 const scale=mix(1.65,1,zoom),tx=mix(1306.5,960,zoom),ty=mix(762.75,540,zoom);
 const iconScale=mix(1.08,.65,morph),pulse=progress(f,48,74);
 const missingPulse=1+.025*Math.sin((f-240)*.15)*progress(f,240,250)*(1-progress(f,280,300));
 const lineAmount=ease(f,348,389);
 const points=[[1170,405],[1460,330],[pathwayTarget[0]+180,pathwayTarget[1]-190],pathwayTarget];
 const tip=curvePoint(lineAmount,points);
 // Let the tail catch the moving tip, leaving a point exactly on the VTA.
 const tail=lineAmount*ease(f,370,389);
 const lineStroke={pathLength:1,strokeDasharray:`${Math.max(.00001,lineAmount-tail)} 1`,strokeDashoffset:-tail};
 return <g aria-label="Reward learning is one puzzle piece of decision-making; choosing an action is the missing piece">
  <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
   <g opacity={1-out}>
    <g opacity={progress(f,115,145)}><Label x={0} y={-355} size={38}>DECISION-MAKING</Label></g>
    <g opacity={progress(f,78,106)}>
     <path d={pieces[0]} fill={C.yellow} fillOpacity={.045} stroke={C.yellow} strokeWidth={2.5} {...draw(progress(f,78,115))}/>
    </g>
    <g transform={`translate(-320 -140) scale(${iconScale})`}>
     <ellipse rx={72} ry={87} fill={C.yellow} opacity={progress(f,72,90)*.09}/>
     <Bell frame={f} amount={progress(f,0,28)}/>
    </g>
    <g transform={`translate(-100 -140) scale(${iconScale})`}><DeliveryBag amount={progress(f,10,38)}/></g>
    <path d="M-265-140H-151M-163-149L-151-140-163-131" fill="none" stroke={C.yellow} strokeWidth={2.5} strokeLinecap="round" {...draw(progress(f,26,50))}/>
    <circle cx={mix(-265,-151,pulse)} cy={-140} r={5} fill={C.yellow} opacity={progress(f,48,51)*(1-progress(f,73,78))}/>
    <g opacity={progress(f,30,52)}><Label x={-210} y={-37} size={25} color={C.yellow}>WHAT IS REWARDING?</Label></g>
    {[2,3].map((index,i)=>{
     const start=145+i*24,a=progress(f,start,start+32),settle=mix(.975,1,Math.min(1,pop(f,start)));
     return <g key={index} opacity={a} transform={`translate(0 ${12*(1-ease(f,start,start+32))}) scale(${settle})`}>
      <path d={pieces[index]} fill={C.blue} fillOpacity={.025} stroke={C.gray} strokeWidth={2} {...draw(a)}/>
      <g opacity={a*.35} stroke={C.gray} strokeWidth={2} fill="none">
       {i===0?<path d="M-285 125H-135M-285 150H-185" {...draw(a)}/>:<path d="M155 155L210 100 265 155M210 100V185" {...draw(a)}/>}
      </g>
     </g>;
    })}
   </g>
   <g transform={`translate(210 -135) scale(${missingPulse}) translate(-210 135)`} opacity={progress(f,180,210)*(1-progress(f,340,370))}>
    <path d={pieces[1]} fill="none" stroke={C.yellow} strokeWidth={3} strokeDasharray="9 10" opacity={.75+.15*Math.sin(f*.08)}/>
    <g opacity={1-progress(f,258,282)} transform={`translate(210 -127) scale(${1+.12*Math.sin(progress(f,240,267)*Math.PI)})`}><Label x={0} y={16} size={68} color={C.yellow}>?</Label></g>
    <g opacity={progress(f,266,289)*(1-progress(f,330,347))}>
     <Label x={210} y={-157} size={32} color={C.yellow}>WHAT ACTION?</Label>
     <path d="M210-65V-115M210-105L149-65M210-105L271-65M149-65L153-81M149-65L166-66M271-65L254-66M271-65L267-81M210-115L201-104M210-115L219-104" fill="none" stroke={C.yellow} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...draw(progress(f,285,319))}/>
    </g>
   </g>
  </g>
  <g opacity={progress(f,343,354)}>
   <path d={`M${points[0]}C${points[1]} ${points[2]} ${points[3]}`} fill="none" stroke={C.yellow} strokeWidth={14} opacity={.08} {...lineStroke}/>
   <path d={`M${points[0]}C${points[1]} ${points[2]} ${points[3]}`} fill="none" stroke={C.yellow} strokeWidth={3} strokeLinecap="round" {...lineStroke}/>
   <circle cx={tip[0]} cy={tip[1]} r={7} fill={C.yellow}/>
  </g>
 </g>;
};
