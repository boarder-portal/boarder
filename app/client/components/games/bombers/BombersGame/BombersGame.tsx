import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import BombersGameContent from 'client/components/games/bombers/BombersGame/components/BombersGameContent/BombersGameContent';

const BombersGame: FC = () => {
  return <Game<GameType.BOMBERS> renderGameContent={BombersGameContent} />;
};

export default memo(BombersGame);
