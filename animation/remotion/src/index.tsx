import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Scene01_HumanVsComputer} from './Scene01_HumanVsComputer';
import {SCENE02, Scene02_RiskAndAddiction} from './Scene02_RiskAndAddiction';
import {SCENE03, Scene03_AddictionAndRewardLearning} from './Scene03_AddictionAndRewardLearning';
import {SCENE04, Scene04_MesocorticolimbicIntroduction} from './Scene04_MesocorticolimbicIntroduction';
import {SCENE05, Scene05_DopamineRewardPredictionErrors} from './Scene05_DopamineRewardPredictionErrors';

const Root: React.FC = () => <>
  <Composition id="Scene01-HumanVsComputer" component={Scene01_HumanVsComputer} width={1920} height={1080} fps={30} durationInFrames={1260}/>
  <Composition id="Scene02-RiskAndAddiction" component={Scene02_RiskAndAddiction} width={SCENE02.width} height={SCENE02.height} fps={SCENE02.fps} durationInFrames={SCENE02.durationInFrames}/>
  <Composition id="Scene03-AddictionAndRewardLearning" component={Scene03_AddictionAndRewardLearning} width={SCENE03.width} height={SCENE03.height} fps={SCENE03.fps} durationInFrames={SCENE03.durationInFrames}/>
  <Composition id="Scene04-MesocorticolimbicIntroduction" component={Scene04_MesocorticolimbicIntroduction} width={SCENE04.width} height={SCENE04.height} fps={SCENE04.fps} durationInFrames={SCENE04.durationInFrames}/>
  <Composition id="Scene05-DopamineRewardPredictionErrors" component={Scene05_DopamineRewardPredictionErrors} width={SCENE05.width} height={SCENE05.height} fps={SCENE05.fps} durationInFrames={SCENE05.durationInFrames}/>
</>;
registerRoot(Root);
