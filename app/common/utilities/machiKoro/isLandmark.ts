import { ELandmarkId, ILandmarkCard } from 'common/types/machiKoro';

const LANDMARKS = Object.values(ELandmarkId);

export default function isLandmark(id: any): id is ELandmarkId {
  return LANDMARKS.includes(id);
}
