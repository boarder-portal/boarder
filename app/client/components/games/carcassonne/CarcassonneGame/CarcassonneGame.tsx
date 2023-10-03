import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import CarcassonneGameContent from 'client/components/games/carcassonne/CarcassonneGame/components/CarcassonneGameContent/CarcassonneGameContent';

const CarcassonneGame: FC = () => {
  return <Game game={GameType.CARCASSONNE} renderGameContent={CarcassonneGameContent} />;
};

export default memo(CarcassonneGame);
