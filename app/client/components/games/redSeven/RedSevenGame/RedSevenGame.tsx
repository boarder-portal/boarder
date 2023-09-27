import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import RedSevenGameContent from 'client/components/games/redSeven/RedSevenGame/components/RedSevenGameContent/RedSevenGameContent';

const RedSevenGame: FC = () => {
  return <Game<GameType.RED_SEVEN> renderGameContent={RedSevenGameContent} />;
};

export default memo(RedSevenGame);
