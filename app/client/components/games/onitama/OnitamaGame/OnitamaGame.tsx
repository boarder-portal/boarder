import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/onitama/OnitamaGame/components/GameContent/GameContent';

const OnitamaGame: FC = () => {
  return <Game<GameType.ONITAMA> renderGameContent={GameContent} />;
};

export default memo(OnitamaGame);
