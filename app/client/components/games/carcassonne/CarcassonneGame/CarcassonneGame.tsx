import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/carcassonne/CarcassonneGame/components/GameContent/GameContent';

const CarcassonneGame: FC = () => {
  return <Game<GameType.CARCASSONNE> renderGameContent={GameContent} />;
};

export default memo(CarcassonneGame);
