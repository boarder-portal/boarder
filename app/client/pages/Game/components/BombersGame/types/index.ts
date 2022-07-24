import { TImagesDictionary } from 'client/hooks/useImages';

export type TBomberImage = 'grass' | 'wall' | 'box' | 'bomb' | 'bonusBomb' | 'bonusRange' | 'bonusSpeed' | 'bonusHp';

export type TBombersImages = TImagesDictionary<TBomberImage>;
