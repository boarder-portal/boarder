import { FC, memo } from 'react';

import { WithClassName } from 'client/types/react';
import { GameType } from 'common/types/game';
import { Card as CardModel, GameCard } from 'common/types/games/carcassonne';

import GameImage from 'client/components/common/GameImage/GameImage';

interface Props extends WithClassName {
  card: CardModel | GameCard;
}

const Card: FC<Props> = (props) => {
  const { className, card } = props;

  return <GameImage className={className} game={GameType.CARCASSONNE} src={`/tiles/${card.id}.jpg`} />;
};

export default memo(Card);
