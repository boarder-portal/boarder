import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/machiKoro/MachiKoroGame/components/GameContent/GameContent';

const MachiKoroGame: FC = () => {
  return <Game<GameType.MACHI_KORO> renderGameContent={GameContent} />;
};

export default memo(MachiKoroGame);
