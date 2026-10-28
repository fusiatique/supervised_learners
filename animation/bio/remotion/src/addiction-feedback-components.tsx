import React from 'react';
import {C,type HumanExpression} from './components';
import {curvePoint,ease,mix,progress} from './motion';
import {CROSSROADS,routePath} from './risk-components';
export const DRUG_REWARD_EVENTS=[96,150,345,555,648,738] as const;
export const getDrugFeedback=(frame:number)=>{
 const visits=DRUG_REWARD_EVENTS.filter(end=>frame>=end).length;
 const latest=visits?DRUG_REWARD_EVENTS[visits-1]:null;
 const age=latest===null?-1:frame-latest;
 const glow=age<0?0:progress(age,0,3)*(1-progress(age,9,24));
 const harm=age<0?0:progress(age,12,28);
 const expression:HumanExpression=glow>.25?'satisfied':visits>=3?'conflicted':visits?'disappointed':'conflicted';
 return {visits,age,glow,harm,expression,distress:visits?Math.min(1,(visits/6))*harm:0};
};
const colorMix=(a:string,b:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),t)).toString(16).padStart(2,'0')).join('');
/** Same cubic geometry as the walking routes; rounded layered strokes soften their appearance. */
export const AddictionPathways:React.FC<{frame:number}>=({frame})=>{
 const age=Math.max(0,frame),enrich=ease(age,0,55),threat=ease(age,150,738);
 const red=colorMix(C.red,'#873D4F',threat);
 return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
  {(['safe','uncertain'] as const).map((route,i)=>{
   const color=i===0?C.green:red,d=routePath(CROSSROADS[route]);
   const opacity=i===0?.72:mix(.46,.88,threat);
   return <g key={route}>
    <path d={d} stroke={color} strokeWidth={23} opacity={enrich*(i===0?.045:.075)}/>
    <path d={d} stroke={color} strokeWidth={13} opacity={i===0?.09:.09*enrich}/>
    <path d={d} stroke={color} strokeWidth={mix(4,5.5,enrich)} opacity={opacity}/>
    {[0,1].map(n=>{
      const t=((age/(i===0?210:150)+n*.5)%1),[x,y]=curvePoint(t,CROSSROADS[route]);
      return <g key={n} opacity={enrich*Math.sin(t*Math.PI)*(i===0?.52:.55)}>
       <circle cx={x} cy={y} r={13} fill={i===0?C.green:C.red} opacity={.1}/><circle cx={x} cy={y} r={3.4} fill={i===0?'#B2EACB':C.red}/>
      </g>;
    })}
   </g>;
  })}
 </g>;
};
export const PillRewardGlow:React.FC<{glow:number}>=({glow})=><g opacity={glow}>
 <defs><filter id="pill-immediate-reward" x="-70%" y="-100%" width="240%" height="300%"><feGaussianBlur stdDeviation="11"/></filter></defs>
 <ellipse cx={1550} cy={350} rx={104} ry={61} fill={C.yellow} opacity={.4} filter="url(#pill-immediate-reward)"/>
 <ellipse cx={1550} cy={350} rx={98} ry={58} stroke={C.yellow} strokeWidth={3} fill={C.yellow} fillOpacity={.09}/>
</g>;
