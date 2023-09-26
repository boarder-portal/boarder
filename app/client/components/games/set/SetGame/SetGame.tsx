import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/set/SetGame/components/GameContent/GameContent';

const SetGame: FC = () => {
  return <Game<GameType.SET> renderGameContent={GameContent} />;
};

export default memo(SetGame);
