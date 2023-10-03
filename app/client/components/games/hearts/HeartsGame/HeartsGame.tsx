import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import HeartsGameContent from 'client/components/games/hearts/HeartsGame/components/HeartsGameContent/HeartsGameContent';

const HeartsGame: FC = () => {
  return <Game game={GameType.HEARTS} renderGameContent={HeartsGameContent} />;
};

export default memo(HeartsGame);
