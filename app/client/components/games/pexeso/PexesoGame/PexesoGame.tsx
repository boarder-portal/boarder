import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import PexesoGameContent from 'client/components/games/pexeso/PexesoGame/components/PexesoGameContent/PexesoGameContent';

const PexesoGame: FC = () => {
  return <Game<GameType.PEXESO> renderGameContent={PexesoGameContent} />;
};

export default memo(PexesoGame);
