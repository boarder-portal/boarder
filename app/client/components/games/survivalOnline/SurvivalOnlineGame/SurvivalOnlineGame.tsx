import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/survivalOnline/SurvivalOnlineGame/components/GameContent/GameContent';

const SurvivalOnlineGame: FC = () => {
  return <Game<GameType.SURVIVAL_ONLINE> fullscreenOrientation="landscape" renderGameContent={GameContent} />;
};

export default memo(SurvivalOnlineGame);
