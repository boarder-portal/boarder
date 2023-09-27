import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import SevenWondersGameContent from 'client/components/games/sevenWonders/SevenWondersGame/components/SevenWondersGameContent/SevenWondersGameContent';

const SevenWondersGame: FC = () => {
  return <Game<GameType.SEVEN_WONDERS> renderGameContent={SevenWondersGameContent} />;
};

export default memo(SevenWondersGame);
