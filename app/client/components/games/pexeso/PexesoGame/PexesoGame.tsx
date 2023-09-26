import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/pexeso/PexesoGame/components/GameContent/GameContent';

const PexesoGame: FC = () => {
  return <Game<GameType.PEXESO> renderGameContent={GameContent} />;
};

export default memo(PexesoGame);
