import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import OuterMindsGameContent from 'client/components/games/outerMinds/OuterMindsGame/components/OuterMindsGameContent/OuterMindsGameContent';

const OuterMindsGame: FC = () => {
  return <Game game={GameType.OUTER_MINDS} renderGameContent={OuterMindsGameContent} />;
};

export default memo(OuterMindsGame);
