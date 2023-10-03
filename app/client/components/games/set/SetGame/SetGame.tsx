import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import SetGameContent from 'client/components/games/set/SetGame/components/SetGameContent/SetGameContent';

const SetGame: FC = () => {
  return <Game game={GameType.SET} renderGameContent={SetGameContent} />;
};

export default memo(SetGame);
