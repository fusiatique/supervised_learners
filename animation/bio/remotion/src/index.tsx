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

import {SCENE08,Scene08_SynapticPlasticityAndAddiction} from './Scene08_SynapticPlasticityAndAddiction';

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
</>;
registerRoot(Root);
