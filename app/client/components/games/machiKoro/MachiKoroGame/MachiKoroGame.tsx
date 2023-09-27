import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import MachiKoroGameContent from 'client/components/games/machiKoro/MachiKoroGame/components/MachiKoroGameContent/MachiKoroGameContent';

const MachiKoroGame: FC = () => {
  return <Game<GameType.MACHI_KORO> renderGameContent={MachiKoroGameContent} />;
};

export default memo(MachiKoroGame);
