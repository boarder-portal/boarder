import { ESetConcealedType, EWind } from 'common/types/mahjong';

import { getHandMahjong, IHandScoreOptions } from 'common/utilities/mahjong/scoring';
import { parseChow, parseKong, parsePung, parseTile, parseTiles } from 'common/utilities/mahjong/parse';
import { stringifyMahjong } from 'common/utilities/mahjong/stringify';

const standardOptions: Omit<IHandScoreOptions, 'hand'> = {
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
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 88 points
    describe('big four winds', () => {
      test('half flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('We'), parsePung('Ws')],
              hand: parseTiles('WwWwWw WnWn c6c6'),
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
              meldedSets: [parsePung('Ws')],
              hand: parseTiles('WwWwWw WnWn DrDr'),
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
              meldedSets: [parsePung('Dr'), parsePung('Dg'), parsePung('Dw')],
              hand: parseTiles('c5c5c6c7'),
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
              meldedSets: [parsePung('Dr'), parsePung('Dg'), parsePung('Dw'), parsePung('d9')],
              hand: parseTiles('b1'),
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
              isSelfDraw: false,
              roundWind: EWind.WEST,
              seatWind: EWind.WEST,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all green', () => {
      test('pure shifted pungs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b2'), parsePung('b3'), parsePung('b4')],
              hand: parseTiles('DgDg b6b6'),
              winningTile: parseTile('Dg'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('triple chow', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b3'), parseChow('b3'), parseChow('b3'), parsePung('b8')],
              hand: parseTiles('b6'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });

      test('seven pairs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('b2b2 b3b3 b4b4 b6b6 b8b8 b8b8 Dg'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('nine gates', () => {
      test('edge', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('c1c1 c1c2c3 c4c5c6 c7c8c9 c9c9'),
              winningTile: parseTile('c9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('middle', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('c1c1c1 c2c3c4 c5 c6c7c8 c9c9c9'),
              winningTile: parseTile('c5'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('four kongs', () => {
      test('all types', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              concealedSets: [parseKong('b3', ESetConcealedType.CONCEALED)],
              meldedSets: [
                parseKong('c5', ESetConcealedType.MELDED),
                parseKong('d8', ESetConcealedType.MELDED),
                parseKong('Dr', ESetConcealedType.MELDED),
              ],
              hand: parseTiles('We'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('big three dragons', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [
                parseKong('Dr', ESetConcealedType.MELDED),
                parseKong('Dg', ESetConcealedType.MELDED),
                parseKong('Dw', ESetConcealedType.MELDED),
                parseKong('Wn', ESetConcealedType.MELDED),
              ],
              hand: parseTiles('We'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('seven shifted pairs', () => {
      test('all simples', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('b2b2 b3b3 b4b4 b5b5 b6b6 b7b7 b8'),
              winningTile: parseTile('b8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('thirteen orphans', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('c1c9b1b9d1d9DrDgDwWwWeWsWn'),
              winningTile: parseTile('Wn'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 64 points
    describe('all terminals', () => {
      test('double pung x2', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('d1'), parsePung('b1')],
              hand: parseTiles('b9b9b9 c9c9c9 c1'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('triple pung', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b9'), parsePung('d9'), parsePung('c9'), parsePung('d1')],
              hand: parseTiles('b1'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('little four winds', () => {
      test('half flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('We'), parsePung('Ws'), parsePung('Ww')],
              hand: parseTiles('Wn d7d8d9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all honors', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('We'), parsePung('Ws'), parsePung('Ww')],
              hand: parseTiles('WnWn DgDg'),
              winningTile: parseTile('Dg'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('little three dragons', () => {
      test('pung of terminals', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dr'), parsePung('Dw')],
              hand: parseTiles('DgDg d3d5 c1c1c1'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all terminals and honors', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dw'), parsePung('Dg'), parsePung('b1'), parsePung('b9')],
              hand: parseTiles('Dr'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all honors', () => {
      test('big three winds', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Ww'), parsePung('We'), parsePung('Wn')],
              hand: parseTiles('DwDw DgDg'),
              winningTile: parseTile('Dw'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('little three dragons', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dr'), parsePung('Dg'), parsePung('We'), parsePung('Ww')],
              hand: parseTiles('Dw'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('four concealed pungs', () => {
      test('from discard', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('d1d1d1 d7d7d7 c8c8c8 b5b5b5 b8'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });

      test('from wall', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('d3d3d3 d4d4d4 b7b7b7 WwWw c9c9'),
              winningTile: parseTile('c9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('pure terminal chows', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('d2')],
              hand: parseTiles('d1d2d3 d5 d7d7d8d8d9d9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 48 points
    describe('quadruple chow', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b2')],
              hand: parseTiles('b1b1b1 b2b2b2 b3b3b3 c9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('concealed', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('b1b1b1b1 b2b2b2b2 b3b3b3 c9c9'),
              winningTile: parseTile('b3'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('four pure shifted pungs', () => {
      test('lower four', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b1'), parsePung('b2'), parsePung('b3')],
              hand: parseTiles('b4b4b4 c1'),
              winningTile: parseTile('c1'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('full flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c9')],
              hand: parseTiles('c6c6 c7c7c7 c8c8c8 c5c5'),
              winningTile: parseTile('c6'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 32 points
    describe('four pure shifted chows', () => {
      test('shifted by 1', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('c2c3c4 c3c4c5 c4c5c6 c5c6 c6c6'),
              winningTile: parseTile('c7'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('shifted by 2', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('d2')],
              hand: parseTiles('d3d4d5 d5d6d7 d7d8d9 b9'),
              winningTile: parseTile('b9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('three kongs', () => {
      test('upper tiles', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b9')],
              concealedSets: [
                parseKong('c7', ESetConcealedType.CONCEALED),
                parseKong('c8', ESetConcealedType.CONCEALED),
                parseKong('c9', ESetConcealedType.CONCEALED),
              ],
              hand: parseTiles('d9'),
              winningTile: parseTile('d9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all types', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseKong('Ww', ESetConcealedType.MELDED)],
              concealedSets: [
                parseKong('Dr', ESetConcealedType.CONCEALED),
                parseKong('c9', ESetConcealedType.CONCEALED),
              ],
              hand: parseTiles('d1d2d3 b1'),
              winningTile: parseTile('b1'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all terminals and honors', () => {
      test('all types', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dr')],
              hand: parseTiles('c1c1c1 d1d1d1 b9b9b9 Ws'),
              winningTile: parseTile('Ws'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('seven pairs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('c1c1 c1c1 d1d1 d1d1 DrDr DwDw Dg'),
              winningTile: parseTile('Dg'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 24 points
    describe('seven pairs', () => {
      test('lower four', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('c1c2c3c4 c1c2c4 c1c2c4 c1c2c4'),
              winningTile: parseTile('c3'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all types', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('DrDr DgDg DwDw c1c1 d2d2 b3b3 We'),
              winningTile: parseTile('We'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('greater honors and knitted tiles', () => {
      test('d2b2c3', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('d1d4 b5b8 c3c6c9 WeWsWwWn DrDg'),
              winningTile: parseTile('Dw'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('c1d3b3', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parseTiles('d3d6d9 b1b7b4 WeWsWwWn DrDgDw'),
              winningTile: parseTile('c8'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all even pungs', () => {
      test('double pung', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b4'), parsePung('d6')],
              hand: parseTiles('b8b8 d4d4d4 c8c8'),
              winningTile: parseTile('b8'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('triple pung', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b6'), parsePung('d6'), parsePung('c6')],
              hand: parseTiles('c8c8 d8d8'),
              winningTile: parseTile('c8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
  });
});
