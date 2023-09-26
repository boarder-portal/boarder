import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import GameContent from 'client/components/games/sevenWonders/SevenWondersGame/components/GameContent/GameContent';

const SevenWondersGame: FC = () => {
  return <Game<GameType.SEVEN_WONDERS> renderGameContent={GameContent} />;
};

export default memo(SevenWondersGame);
