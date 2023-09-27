import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import MahjongGameContent from 'client/components/games/mahjong/MahjongGame/components/MahjongGameContent/MahjongGameContent';

const MahjongGame: FC = () => {
  return <Game<GameType.MAHJONG> renderGameContent={MahjongGameContent} />;
};

export default memo(MahjongGame);
