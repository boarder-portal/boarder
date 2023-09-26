import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/redSeven/RedSevenGame/components/GameContent/GameContent';

const RedSevenGame: FC = () => {
  return <Game<GameType.RED_SEVEN> renderGameContent={GameContent} />;
};

export default memo(RedSevenGame);
