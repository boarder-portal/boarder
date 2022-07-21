import { ESetConcealedType, EWind } from 'common/types/mahjong';

import { getHandMahjong } from 'common/utilities/mahjong/scoring';
import { parseKong, parsePung, parseTile, parseTiles } from 'common/utilities/mahjong/parse';
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
    describe('basic scoring', () => {
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

    describe('big four winds', () => {
      test('half flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('We', ESetConcealedType.MELDED), parsePung('Ws', ESetConcealedType.MELDED)],
              hand: parseTiles('WwWwWw WnWn c6c6'),
              waits: parseTiles('Wnc6'),
              winningTile: parseTile('Wn'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('terminals', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('WeWeWe WsWsWs WwWwWw WnWn b9b9'),
              waits: parseTiles('Wnb9'),
              winningTile: parseTile('Wn'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });

      test('honors', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              concealedSets: [parseKong('We', ESetConcealedType.CONCEALED)],
              meldedSets: [parsePung('Ws', ESetConcealedType.MELDED)],
              hand: parseTiles('WwWwWw WnWn DrDr'),
              waits: parseTiles('WnDr'),
              winningTile: parseTile('Wn'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    describe('big three dragons', () => {
      test('half flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [
                parsePung('Dr', ESetConcealedType.MELDED),
                parsePung('Dg', ESetConcealedType.MELDED),
                parsePung('Dw', ESetConcealedType.MELDED),
              ],
              hand: parseTiles('c5c5c6c7'),
              waits: parseTiles('c5c8'),
              winningTile: parseTile('c5'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('terminals', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [
                parsePung('Dr', ESetConcealedType.MELDED),
                parsePung('Dg', ESetConcealedType.MELDED),
                parsePung('Dw', ESetConcealedType.MELDED),
                parsePung('d9', ESetConcealedType.MELDED),
              ],
              hand: parseTiles('b1'),
              waits: parseTiles('b1'),
              winningTile: parseTile('b1'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });

      test('honors', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('DrDrDr DgDgDg DwDwDw WwWwWw Wn'),
              waits: parseTiles('Wn'),
              winningTile: parseTile('Wn'),
              isSelfDraw: false,
              roundWind: EWind.WEST,
              seatWind: EWind.WEST,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
  });
});
