import { ESetConcealedType, EWind, IFlowerTile } from 'common/types/mahjong';

import { getHandMahjong, IHandScoreOptions } from 'common/utilities/mahjong/scoring';
import {
  parseChow,
  parseKong,
  parsePung,
  parsePlayableTile,
  parsePlayableTiles,
  parseTiles,
} from 'common/utilities/mahjong/parse';
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
              hand: parsePlayableTiles('WeWeWe WsWsWs WwWwWw WnWnWn Dr'),
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
              hand: parsePlayableTiles('WwWwWw WnWn c6c6'),
              winningTile: parsePlayableTile('Wn'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('terminals', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('WeWeWe WsWsWs WwWwWw WnWn b9b9'),
              winningTile: parsePlayableTile('Wn'),
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
              hand: parsePlayableTiles('WwWwWw WnWn DrDr'),
              winningTile: parsePlayableTile('Wn'),
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
              hand: parsePlayableTiles('c5c5c6c7'),
              winningTile: parsePlayableTile('c5'),
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
              hand: parsePlayableTiles('b1'),
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
              hand: parsePlayableTiles('DrDrDr DgDgDg DwDwDw WwWwWw Wn'),
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
              hand: parsePlayableTiles('DgDg b6b6'),
              winningTile: parsePlayableTile('Dg'),
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
              hand: parsePlayableTiles('b6'),
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
              hand: parsePlayableTiles('b2b2 b3b3 b4b4 b6b6 b8b8 b8b8 Dg'),
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
              hand: parsePlayableTiles('c1c1 c1c2c3 c4c5c6 c7c8c9 c9c9'),
              winningTile: parsePlayableTile('c9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('middle', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c1c1c1 c2c3c4 c5 c6c7c8 c9c9c9'),
              winningTile: parsePlayableTile('c5'),
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
              hand: parsePlayableTiles('We'),
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
              hand: parsePlayableTiles('We'),
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
              hand: parsePlayableTiles('b2b2 b3b3 b4b4 b5b5 b6b6 b7b7 b8'),
              winningTile: parsePlayableTile('b8'),
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
              hand: parsePlayableTiles('c1c9b1b9d1d9DrDgDwWwWeWsWn'),
              winningTile: parsePlayableTile('Wn'),
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
              hand: parsePlayableTiles('b9b9b9 c9c9c9 c1'),
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
              hand: parsePlayableTiles('b1'),
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
              hand: parsePlayableTiles('Wn d7d8d9'),
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
              hand: parsePlayableTiles('WnWn DgDg'),
              winningTile: parsePlayableTile('Dg'),
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
              hand: parsePlayableTiles('DgDg d3d5 c1c1c1'),
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
              hand: parsePlayableTiles('Dr'),
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
              hand: parsePlayableTiles('DwDw DgDg'),
              winningTile: parsePlayableTile('Dw'),
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
              hand: parsePlayableTiles('Dw'),
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
              hand: parsePlayableTiles('d1d1d1 d7d7d7 c8c8c8 b5b5b5 b8'),
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
              hand: parsePlayableTiles('d3d3d3 d4d4d4 b7b7b7 WwWw c9c9'),
              winningTile: parsePlayableTile('c9'),
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
              hand: parsePlayableTiles('d1d2d3 d5 d7d7d8d8d9d9'),
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
              hand: parsePlayableTiles('b1b1b1 b2b2b2 b3b3b3 c9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('concealed', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b1b1b1b1 b2b2b2b2 b3b3b3 c9c9'),
              winningTile: parsePlayableTile('b3'),
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
              hand: parsePlayableTiles('b4b4b4 c1'),
              winningTile: parsePlayableTile('c1'),
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
              hand: parsePlayableTiles('c6c6 c7c7c7 c8c8c8 c5c5'),
              winningTile: parsePlayableTile('c6'),
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
              hand: parsePlayableTiles('c2c3c4 c3c4c5 c4c5c6 c5c6 c6c6'),
              winningTile: parsePlayableTile('c7'),
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
              hand: parsePlayableTiles('d3d4d5 d5d6d7 d7d8d9 b9'),
              winningTile: parsePlayableTile('b9'),
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
              meldedSets: [parseKong('c8', ESetConcealedType.MELDED)],
              concealedSets: [
                parseKong('c7', ESetConcealedType.CONCEALED),
                parseKong('b9', ESetConcealedType.CONCEALED),
              ],
              hand: parsePlayableTiles('c9c9c9 d9'),
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
              hand: parsePlayableTiles('d1d2d3 b1'),
              winningTile: parsePlayableTile('b1'),
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
              hand: parsePlayableTiles('c1c1c1 d1d1d1 b9b9b9 Ws'),
              winningTile: parsePlayableTile('Ws'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('seven pairs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c1c1 c1c1 d1d1 d1d1 DrDr DwDw Dg'),
              winningTile: parsePlayableTile('Dg'),
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
              hand: parsePlayableTiles('c1c2c3c4 c1c2c4 c1c2c4 c1c2c4'),
              winningTile: parsePlayableTile('c3'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all types', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('DrDr DgDg DwDw c1c1 d2d2 b3b3 We'),
              winningTile: parsePlayableTile('We'),
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
              hand: parsePlayableTiles('d1d4 b5b8 c3c6c9 WeWsWwWn DrDg'),
              winningTile: parsePlayableTile('Dw'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('c1d3b3', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('d3d6d9 b1b7b4 WeWsWwWn DrDgDw'),
              winningTile: parsePlayableTile('c8'),
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
              hand: parsePlayableTiles('b8b8 d4d4d4 c8c8'),
              winningTile: parsePlayableTile('b8'),
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
              hand: parsePlayableTiles('c8c8 d8d8'),
              winningTile: parsePlayableTile('c8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('full flush', () => {
      test('seven pairs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b1b1 b2b2 b4b4 b5b5 b6b6 b8b8 b9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('pure straight', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('d2')],
              hand: parsePlayableTiles('d2d2 d5d5 d6d6 d7d7 d8d9'),
              winningTile: parsePlayableTile('d4'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('short straight', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c1')],
              hand: parsePlayableTiles('c2 c3c3 c4c4 c5c5c5 c6 c8'),
              winningTile: parsePlayableTile('c7'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('pure triple chow', () => {
      test('all fives', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('c4')],
              hand: parsePlayableTiles('c3c3 c4c4 c5c5 d5d6d7 b5'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('half flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('c8')],
              hand: parsePlayableTiles('c7c7 c8c8 c9c9 DrDrDr Ww'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('pure shifted pungs', () => {
      test('reversible tiles', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dw')],
              hand: parsePlayableTiles('b4b5b6 b4b5b6 b4b5b6 d3'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('half flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c1'), parsePung('c2')],
              hand: parsePlayableTiles('c3c3c3 c9c9 DgDg'),
              winningTile: parsePlayableTile('c9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('upper tiles', () => {
      test('mixed triple chow', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c7c8c9 d7d8d9 b7b8b9 b7b8b9 c7'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('double pung', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b8')],
              hand: parsePlayableTiles('c8c8 c7c8c9 d7d8d9 d8d8'),
              winningTile: parsePlayableTile('c8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('middle tiles', () => {
      test('pure shifted pungs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c4'), parsePung('c5')],
              hand: parsePlayableTiles('c6c6c6 d5d6 d4d4'),
              winningTile: parsePlayableTile('d4'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('seven pairs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('d4d6 d4d6 c4c5c4c5 b4b4 b5 b6b6'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('lower tiles', () => {
      test('mixed triple chow', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('d2')],
              hand: parsePlayableTiles('b1b2b3 c1c2c3 d1d2d3 c2'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('mixed shifted pungs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('d1'), parsePung('c2'), parsePung('b3'), parsePung('c3')],
              hand: parsePlayableTiles('d2'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 16 points
    describe('pure straight', () => {
      test('all chows', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b1b2b3b4b5b6b7b8b9 d5d6 c6c6'),
              winningTile: parsePlayableTile('d4'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('dragon pung', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dg')],
              hand: parsePlayableTiles('c1c2c3c4c5c6c7c8c9 d4'),
              winningTile: parsePlayableTile('d4'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('three-suited terminal chows', () => {
      test('bcd', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b2'), parseChow('b8')],
              hand: parsePlayableTiles('c5c5 d1d2 d7d8d9'),
              winningTile: parsePlayableTile('d3'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('cdb', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c1c2c3 c7c8c9 b1b2b3 b7b8b9 d5'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('pure shifted chows', () => {
      test('shifted by 1', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b8')],
              hand: parsePlayableTiles('c1c2 c2c3c4 c3c4c5 d8d8'),
              winningTile: parsePlayableTile('c3'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('shifted by 2', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b2b3b4 b4b5b6 b6b7 b8b8 d6d7d8'),
              winningTile: parsePlayableTile('b8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all fives', () => {
      test('mixed shifted chows', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('c6')],
              hand: parsePlayableTiles('c3c4c5 b4b5b6 d5d5 d6d7'),
              winningTile: parsePlayableTile('d5'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('middle tiles', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('d4d5d6 b4b5b6 c4c6 c5c5c5 b5b5'),
              winningTile: parsePlayableTile('c5'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('triple pung', () => {
      test('outside hand', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('d8')],
              hand: parsePlayableTiles('b1c1d1 b1c1d1 b1c1d1 c9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all simples', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b4'), parsePung('c4'), parsePung('d4')],
              hand: parsePlayableTiles('c7c8 c7c8'),
              winningTile: parsePlayableTile('c7'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('three concealed pungs', () => {
      test('all pungs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b4b4b4 b6b6b6 b8b8b8 d3d3 d7d7'),
              winningTile: parsePlayableTile('d7'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all types', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b3b3b3 d9d9d9 DwDwDw WwWw c2c3'),
              winningTile: parsePlayableTile('c4'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 12 points
    describe('lesser honors and knitted tiles', () => {
      test('bcd', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b7b4b1 c8c2 d3d6d9 WeWwWsWn Dw'),
              winningTile: parsePlayableTile('Dg'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('knitted straight', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('DgDr WsWeWn c4c7c1 b8b5b2 d3d6'),
              winningTile: parsePlayableTile('d9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('knitted straight', () => {
      test('all types', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dr')],
              hand: parsePlayableTiles('d1d4d7 c2c5c8 b3b6b9 Ww'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all chows', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b3')],
              hand: parsePlayableTiles('c1c4c7 b2b5b8 d3d6d9d9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('upper four', () => {
      test('mixed double chow', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c6c7c8 d6d7d8 b6b6b6 b7b8 d9d9'),
              winningTile: parsePlayableTile('b9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('seven pairs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b6b6 b8b8 b9b9 c6c6 c7c7 d6d6 d8'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('lower four', () => {
      test('all chows', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b2')],
              hand: parsePlayableTiles('d1d2d3 d2d3d4 c2c3c4c4'),
              winningTile: parsePlayableTile('c4'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all pungs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c3'), parsePung('b3')],
              hand: parsePlayableTiles('b1b1b1 b4b4b4 d2'),
              winningTile: parsePlayableTile('d2'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('big three winds', () => {
      test('one voided suit', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Ww'), parsePung('Wn'), parsePung('Ws')],
              hand: parsePlayableTiles('d4d5 b8b8'),
              winningTile: parsePlayableTile('d3'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('half flush', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Ww'), parsePung('Wn'), parsePung('Ws')],
              hand: parsePlayableTiles('b2b2 DgDg'),
              winningTile: parsePlayableTile('Dg'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 8 points
    describe('mixed straight', () => {
      test('all chows', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b2')],
              hand: parsePlayableTiles('d4d6 c7c8c9 c7c8c9 b7b7'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('no honors', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c1c2 b4b5b6 d3d7 d3d8 d3d9 d8d8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('reversible tiles', () => {
      test('all fives', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('d4'), parseChow('d4')],
              hand: parsePlayableTiles('b4b4 b5b5 b6b6 d5'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all pungs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b8'), parsePung('d8')],
              hand: parsePlayableTiles('DwDwDw b9b9 d9d9'),
              winningTile: parsePlayableTile('b9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('mixed triple chow', () => {
      test('no honors', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c8')],
              hand: parsePlayableTiles('c5c6c7 b5b6b7 d5d6d7 d9'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all chows', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('c6')],
              hand: parsePlayableTiles('d2d3 c2c3c4 b2b3b4 c6c6'),
              winningTile: parsePlayableTile('d4'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('mixed shifted pungs', () => {
      test('no honors', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('d6'), parsePung('c7'), parsePung('b8')],
              hand: parsePlayableTiles('c1c2 c5c5'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('all pungs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b3'), parsePung('c4'), parsePung('d5'), parsePung('b5')],
              hand: parsePlayableTiles('d2'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('chicken hand', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('d2'), parsePung('b7'), parsePung('c8')],
              hand: parsePlayableTiles('WnWn b3b4'),
              winningTile: parsePlayableTile('b2'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('last tile draw', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b2')],
              hand: parsePlayableTiles('c1c2c3 d2d3 c8c8c8 DwDw'),
              winningTile: parsePlayableTile('d4'),
              isLastWallTile: true,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('last tile claim', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('d1')],
              hand: parsePlayableTiles('d2d2d2 c3c3c3 b1b2 c7c7'),
              isSelfDraw: false,
              isLastWallTile: true,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('out with replacement tile', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseKong('c7', ESetConcealedType.MELDED)],
              hand: parsePlayableTiles('d7d8 c1c2c3 d1d2d3 DgDg'),
              winningTile: parsePlayableTile('d9'),
              isReplacementTile: true,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('robbing the kong', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('d4')],
              hand: parsePlayableTiles('c4c4c4 WnWn d4d5d6 c5c6'),
              winningTile: parsePlayableTile('c7'),
              isRobbingKong: true,
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('two concealed kongs', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c7')],
              concealedSets: [
                parseKong('b1', ESetConcealedType.CONCEALED),
                parseKong('b2', ESetConcealedType.CONCEALED),
              ],
              hand: parsePlayableTiles('c8c8c8c9'),
              winningTile: parsePlayableTile('c7'),
              isLastTile: true,
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 6 points
    describe('all pungs', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c8'), parsePung('b8'), parsePung('d8')],
              hand: parsePlayableTiles('DwDw WsWs'),
              winningTile: parsePlayableTile('Dw'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('half flush', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c2c3c4 c4c5 c5c6c7 c7c8c9 WnWn'),
              winningTile: parsePlayableTile('c3'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('mixed shifted chows', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c2c3c4 d3d4d5 b4b5b6 b6b7b8 b5'),
              winningTile: parsePlayableTile('b5'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all types', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('d1d2d3 c4c5c6 b9b9 DrDrDr WeWe'),
              winningTile: parsePlayableTile('b9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('melded hand', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [
                parsePung('b8'),
                parseKong('c2', ESetConcealedType.MELDED),
                parsePung('c7'),
                parseChow('c6'),
              ],
              hand: parsePlayableTiles('c8'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('two dragon pungs', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dr'), parseKong('Dg', ESetConcealedType.MELDED)],
              hand: parsePlayableTiles('c1c2c3 c7c8c9 b8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 4 points
    describe('outside hand', () => {
      test('all chows', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c1c2c3 b1b2b3 b7b8b9 d7d8d9 d1'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('mixed double chow', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('DwDw c1c2c3 c7c8c9 b7b8b9 WwWw'),
              winningTile: parsePlayableTile('Dw'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('fully concealed hand', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c2c3c4 d3d4d5 d6d7d8 b4b4 b7b8'),
              winningTile: parsePlayableTile('b6'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('two melded kongs', () => {
      test('two pure melded kongs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [
                parsePung('Dr'),
                parseKong('d4', ESetConcealedType.MELDED),
                parseKong('c4', ESetConcealedType.MELDED),
              ],
              hand: parsePlayableTiles('c1c1c1c3'),
              winningTile: parsePlayableTile('c3'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });

      test('melded + concealed kongs', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseKong('c1', ESetConcealedType.MELDED)],
              concealedSets: [parseKong('c2', ESetConcealedType.CONCEALED)],
              hand: parsePlayableTiles('d2d3d4 DwDw WwWw'),
              winningTile: parsePlayableTile('Ww'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('last tile', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseChow('b2'), parsePung('b8')],
              hand: parsePlayableTiles('b3b4b5 c1c1 b6b7'),
              winningTile: parsePlayableTile('b8'),
              isSelfDraw: false,
              isLastTile: true,
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 2 points
    describe('dragon pung', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dw')],
              hand: parsePlayableTiles('c1c2c3 d4d5d6 b7b8b9 Ww'),
              winningTile: parsePlayableTile('Ww'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('prevalent wind', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('We'), parsePung('Dr')],
              hand: parsePlayableTiles('d4d4 d2d2d2 b3b3'),
              winningTile: parsePlayableTile('d4'),
              roundWind: EWind.EAST,
              seatWind: EWind.WEST,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('seat wind', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Ws'), parsePung('d3')],
              hand: parsePlayableTiles('d4d4 d5d6d7 WeWe'),
              winningTile: parsePlayableTile('d4'),
              roundWind: EWind.SOUTH,
              seatWind: EWind.SOUTH,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('concealed hand', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c2c3 c5c6c7 b6b6 d3d4d5 d6d7d8'),
              winningTile: parsePlayableTile('c4'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all chows', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('d2d3d4 c3c4c5 b4b5b6 b7b9 d7d7'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('tile hog', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c7 c8c8c8 c9 d7d8d9 b7b8b9 b6b6'),
              winningTile: parsePlayableTile('c8'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('double pung', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('b5'), parsePung('c5')],
              hand: parsePlayableTiles('d4d4d4 d6d6 d8d8'),
              winningTile: parsePlayableTile('d6'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('two concealed pungs', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b6b6b6 b8b8b8 c1c2c3 c7c8c9 c5'),
              winningTile: parsePlayableTile('c5'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('concealed kong', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('d6'), parsePung('b7')],
              concealedSets: [parseKong('c5', ESetConcealedType.CONCEALED)],
              hand: parsePlayableTiles('c1c2c3 Dw'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('all simples', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c2c3c4 d3d4 b4b5b6 b3b3b3 d4d4'),
              winningTile: parsePlayableTile('d5'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });

    // 1 point
    describe('pure double chow', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c1c2c3 c1c2c3 c7c8c9 d7d8d9 Ww'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('mixed double chow', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c5c6c7 d5d6d7 DwDwDw WwWw b2b3'),
              winningTile: parsePlayableTile('b1'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('short straight', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b2b3b4 b5b6b7 b8b8b8 b6b7b8 d5'),
              winningTile: parsePlayableTile('d5'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('two terminal chows', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b1b2b3 b7b8b9 d1d2d3 d7d8d9 c1'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('pung of terminal or honors', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('d1'), parsePung('c1')],
              hand: parsePlayableTiles('b1b1b1 DwDwDw d5'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('melded kong', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parseKong('d1', ESetConcealedType.MELDED)],
              hand: parsePlayableTiles('c2c2c2 b3b3b3 c5c6 WwWw'),
              winningTile: parsePlayableTile('c7'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('one voided suit', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('b9b8b7b6b5b4b3b2b1 DgDgDg c2'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('no honors', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('c1c2c3 b4b5b6 d7d8d9 d1d1 d2d2'),
              winningTile: parsePlayableTile('d1'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('edge wait', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('d1d2d3 c7c8c9 DwDw b1b2b3 b8b9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('closed wait', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              hand: parsePlayableTiles('DrDrDr WeWe b1b2b3 d4d5d6 c7c9'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('single wait', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dg'), parseChow('d3')],
              hand: parsePlayableTiles('DwDwDw c2c3c4 Wn'),
            }),
          ),
        ).toMatchSnapshot();
      });

      test('shouldn\'t be included when for multiple sets', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dg'), parsePung('Dr')],
              hand: parsePlayableTiles('d2d3d4d5 c5c6c7'),
              winningTile: parsePlayableTile('d5'),
              isSelfDraw: false,
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('self-drawn', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('Dr')],
              hand: parsePlayableTiles('c1c2c3 d1d2d3 b1b2b3 Ww'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
    describe('flower tiles', () => {
      test('basic', () => {
        expect(
          stringifyMahjong(
            getHandMahjong({
              ...standardOptions,
              meldedSets: [parsePung('c1')],
              hand: parsePlayableTiles('c2c2c2 c3c3c3 d1d2d3 d3'),
              flowers: parseTiles('f2f7') as IFlowerTile[],
              winningTile: parsePlayableTile('d3'),
            }),
          ),
        ).toMatchSnapshot();
      });
    });
  });
});
