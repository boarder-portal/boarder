import { ImagesDictionary } from 'client/hooks/useImages';

export type BomberImage = 'grass' | 'wall' | 'box' | 'bomb' | 'bonusBomb' | 'bonusRange' | 'bonusSpeed' | 'bonusHp';

export type BombersImages = ImagesDictionary<BomberImage>;
