import { ALL_LANDMARK_CARDS } from 'common/constants/games/machiKoro';

import { ELandmarkId, ILandmarkCard } from 'common/types/machiKoro';

export default function getLandmark(id: ELandmarkId): ILandmarkCard {
  return ALL_LANDMARK_CARDS.find((card) => card.id === id)!;
}
