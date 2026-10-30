import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {SCENE01,Scene01_HumanVsComputer} from './Scene01_HumanVsComputer';
import {SCENE02, Scene02_RiskAndAddiction} from './Scene02_RiskAndAddiction';
import {SCENE03, Scene03_AddictionAndRewardLearning} from './Scene03_AddictionAndRewardLearning';
import {SCENE04, Scene04_MesocorticolimbicIntroduction} from './Scene04_MesocorticolimbicIntroduction';
import {SCENE05, Scene05_DopamineRewardPredictionErrors} from './Scene05_DopamineRewardPredictionErrors';

import {SCENE03_5, Scene03_5_DopamineIntroduction} from './Scene03_5_DopamineIntroduction';

import {SCENE06,Scene06_MesocorticalPathwayAndPlanning} from './Scene06_MesocorticalPathwayAndPlanning';

import {SCENE07,Scene07_PrefrontalControlAndAddiction} from './Scene07_PrefrontalControlAndAddiction';
import {INTRO, Intro} from './Intro';
import {OUTRO1, OUTRO2, OUTRO3, Outro1_BringingTogether, Outro2_WhereItGoesWrong, Outro3_Conclusion} from './Outro';

import {SCENE08,Scene08_SynapticPlasticityAndAddiction} from './Scene08_SynapticPlasticityAndAddiction';
import {retimed} from './retimed';

// Scenes re-timed to fit the voiceover: same animation, new length.
// The cut lists are each scene's Sequence starts and ends.
const Scene04_26s=retimed(Scene04_MesocorticolimbicIntroduction,SCENE04.durationInFrames,26*30,[210]);
const Scene03_5_69s=retimed(Scene03_5_DopamineIntroduction,SCENE03_5.durationInFrames,69*30,[150,170,360,380,630,650,810,830,1080,1100,1350,1560]);
const Scene05_119s=retimed(Scene05_DopamineRewardPredictionErrors,SCENE05.durationInFrames,119*30,[270,960,1020,1665,1695,2250,2280,2370,2580,2880,2910,3270]);

const Root: React.FC = () => <>
  <Composition id="Scene01-HumanVsComputer" component={Scene01_HumanVsComputer} width={SCENE01.width} height={SCENE01.height} fps={SCENE01.fps} durationInFrames={SCENE01.durationInFrames}/>
  <Composition id="Scene02-RiskAndAddiction" component={Scene02_RiskAndAddiction} width={SCENE02.width} height={SCENE02.height} fps={SCENE02.fps} durationInFrames={SCENE02.durationInFrames}/>
  <Composition id="Scene03-AddictionAndRewardLearning" component={Scene03_AddictionAndRewardLearning} width={SCENE03.width} height={SCENE03.height} fps={SCENE03.fps} durationInFrames={SCENE03.durationInFrames}/>
  <Composition id="Scene03-5-DopamineIntroduction" component={Scene03_5_DopamineIntroduction} width={SCENE03_5.width} height={SCENE03_5.height} fps={SCENE03_5.fps} durationInFrames={SCENE03_5.durationInFrames}/>
  <Composition id="Scene04-MesocorticolimbicIntroduction" component={Scene04_MesocorticolimbicIntroduction} width={SCENE04.width} height={SCENE04.height} fps={SCENE04.fps} durationInFrames={SCENE04.durationInFrames}/>
  <Composition id="Scene05-DopamineRewardPredictionErrors" component={Scene05_DopamineRewardPredictionErrors} width={SCENE05.width} height={SCENE05.height} fps={SCENE05.fps} durationInFrames={SCENE05.durationInFrames}/>
  <Composition id="Scene06-MesocorticalPathwayAndPlanning" component={Scene06_MesocorticalPathwayAndPlanning} width={SCENE06.width} height={SCENE06.height} fps={SCENE06.fps} durationInFrames={SCENE06.durationInFrames}/>
  <Composition id="Scene07-PrefrontalControlAndAddiction" component={Scene07_PrefrontalControlAndAddiction} width={SCENE07.width} height={SCENE07.height} fps={SCENE07.fps} durationInFrames={SCENE07.durationInFrames}/>
  <Composition id="Scene08-SynapticPlasticityAndAddiction" component={Scene08_SynapticPlasticityAndAddiction} width={SCENE08.width} height={SCENE08.height} fps={SCENE08.fps} durationInFrames={SCENE08.durationInFrames}/>
  <Composition id="Scene04-26s" component={Scene04_26s} width={SCENE04.width} height={SCENE04.height} fps={SCENE04.fps} durationInFrames={26*30}/>
  <Composition id="Scene03-5-69s" component={Scene03_5_69s} width={SCENE03_5.width} height={SCENE03_5.height} fps={SCENE03_5.fps} durationInFrames={69*30}/>
  <Composition id="Scene05-119s" component={Scene05_119s} width={SCENE05.width} height={SCENE05.height} fps={SCENE05.fps} durationInFrames={119*30}/>
  <Composition id="Intro" component={Intro} width={INTRO.width} height={INTRO.height} fps={INTRO.fps} durationInFrames={INTRO.durationInFrames}/>
  <Composition id="Outro1-BringingTogether" component={Outro1_BringingTogether} width={OUTRO1.width} height={OUTRO1.height} fps={OUTRO1.fps} durationInFrames={OUTRO1.durationInFrames}/>
  <Composition id="Outro2-WhereItGoesWrong" component={Outro2_WhereItGoesWrong} width={OUTRO2.width} height={OUTRO2.height} fps={OUTRO2.fps} durationInFrames={OUTRO2.durationInFrames}/>
  <Composition id="Outro3-Conclusion" component={Outro3_Conclusion} width={OUTRO3.width} height={OUTRO3.height} fps={OUTRO3.fps} durationInFrames={OUTRO3.durationInFrames}/>
</>;
registerRoot(Root);
