import { EWind } from 'common/types/mahjong';

import { getHandMahjong } from 'common/utilities/mahjong/scoring';
import { parseTile, parseTiles } from 'common/utilities/mahjong/parse';
import { stringifyMahjong } from 'common/utilities/mahjong/stringify';

const standardOptions = {
  roundWind: EWind.EAST,
  seatWind: EWind.EAST,
  isSelfDraw: true,
  meldedSets: [],
  concealedSets: [],
  flowers: [],
  isLastTile: false,
  isRobbingKong: false,
  isReplacementTile: false,
  isLastWallTile: false,
};

describe('mahjong', () => {
  describe('scoring', () => {
    test('basic mahjong', () => {
      expect(
        stringifyMahjong(
          getHandMahjong({
            ...standardOptions,
            hand: parseTiles('WeWeWe WsWsWs WwWwWw WnWnWn Dr'),
            waits: parseTiles('Dr'),
            winningTile: parseTile('Dr'),
          }),
        ),
      ).toMatchSnapshot();
    });
  });
});
