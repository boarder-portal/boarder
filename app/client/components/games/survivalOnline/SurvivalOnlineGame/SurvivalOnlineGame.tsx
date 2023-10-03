import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import SurvivalOnlineGameContent from 'client/components/games/survivalOnline/SurvivalOnlineGame/components/SurvivalOnlineGameContent/SurvivalOnlineGameContent';

const SurvivalOnlineGame: FC = () => {
  return <Game game={GameType.SURVIVAL_ONLINE} renderGameContent={SurvivalOnlineGameContent} />;
};

export default memo(SurvivalOnlineGame);
