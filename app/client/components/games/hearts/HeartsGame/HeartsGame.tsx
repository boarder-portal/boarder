import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/hearts/HeartsGame/components/GameContent/GameContent';

const HeartsGame: FC = () => {
  return <Game<GameType.HEARTS> renderGameContent={GameContent} />;
};

export default memo(HeartsGame);
