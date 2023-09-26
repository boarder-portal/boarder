import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/bombers/BombersGame/components/GameContent/GameContent';

const BombersGame: FC = () => {
  return <Game<GameType.BOMBERS> fullscreenOrientation="landscape" renderGameContent={GameContent} />;
};

export default memo(BombersGame);
