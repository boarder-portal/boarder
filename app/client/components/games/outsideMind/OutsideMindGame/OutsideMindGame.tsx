import { FC, memo } from 'react';

import { GameType } from 'common/types/game';

import Game from 'client/components/game/Game/Game';
import OutsideMindGameContent from 'client/components/games/outsideMind/OutsideMindGame/components/OutsideMindGameContent/OutsideMindGameContent';

const OutsideMindGame: FC = () => {
  return <Game game={GameType.OUTSIDE_MIND} renderGameContent={OutsideMindGameContent} />;
};

export default memo(OutsideMindGame);
