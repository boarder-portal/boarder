import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import OnitamaGameContent from 'client/components/games/onitama/OnitamaGame/components/OnitamaGameContent/OnitamaGameContent';

const OnitamaGame: FC = () => {
  return <Game game={GameType.ONITAMA} renderGameContent={OnitamaGameContent} />;
};

export default memo(OnitamaGame);
