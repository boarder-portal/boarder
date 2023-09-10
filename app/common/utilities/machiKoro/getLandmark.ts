import { ALL_LANDMARK_CARDS } from 'common/constants/games/machiKoro';

import { LandmarkCard, LandmarkId } from 'common/types/machiKoro';

export default function getLandmark(id: LandmarkId): LandmarkCard {
  return ALL_LANDMARK_CARDS.find((card) => card.id === id)!;
}
