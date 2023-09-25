import classNames from 'classnames';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import { FC, memo } from 'react';

import { MIN_SCORE } from 'common/constants/games/mahjong';
import { FAN_NAMES, FAN_SCORES } from 'common/constants/games/mahjong/fans';

import { FanKind, HandMahjong, SetConcealedType } from 'common/types/games/mahjong';

import { isHandFan, isSetsFan, isSpecialFan } from 'common/utilities/games/mahjong/fans';
import { getPureFansScore } from 'common/utilities/games/mahjong/scoring';
import isDefined from 'common/utilities/isDefined';

import Flex from 'client/components/common/Flex/Flex';
import Table from 'client/components/common/Table/Table';
import TableCell from 'client/components/common/TableCell/TableCell';
import TableRow from 'client/components/common/TableRow/TableRow';
import Tile from 'client/components/games/mahjong/MahjongGame/components/GameContent/components/Tile/Tile';
import Tiles, {
  OpenType,
} from 'client/components/games/mahjong/MahjongGame/components/GameContent/components/Tiles/Tiles';

import styles from './Mahjong.module.scss';

interface MahjongProps {
  mahjong: HandMahjong;
  tileWidth: number;
  showHand?: boolean;
  showWaits?: boolean;
  showScoreEval?: boolean;
}

const Mahjong: FC<MahjongProps> = (props) => {
  const { mahjong, tileWidth, showHand = true, showWaits = true, showScoreEval } = props;

  const groupedFans = groupBy(mahjong.fans, (fan) => fan.fan);

  return (
    <>
      <Flex direction="column" between={4}>
        {showWaits && (
          <Flex alignItems="center" between={6}>
            <div className={styles.tilesCaption}>Ожидания</div>

            <Tiles className={styles.tiles} tiles={mahjong.waits} tileWidth={tileWidth} />
          </Flex>
        )}

        {showHand && (
          <Flex alignItems="center" between={6}>
            <div className={styles.tilesCaption}>Рука</div>

            {mahjong.declaredSets.map((set, index) => (
              <Tiles
                key={index}
                className={styles.tiles}
                tiles={set.tiles}
                tileWidth={tileWidth}
                openType={set.concealedType === SetConcealedType.CONCEALED ? OpenType.SEMI_CONCEALED : OpenType.OPEN}
              />
            ))}

            <Tiles className={styles.tiles} tiles={mahjong.hand} tileWidth={tileWidth} />

            <Tile className={styles.tile} tile={mahjong.winningTile} width={tileWidth} />
          </Flex>
        )}

        {mahjong.sets && (
          <Flex alignItems="center" between={6}>
            <div className={styles.tilesCaption}>Разбиение</div>

            {mahjong.sets.map((set, index) => (
              <Tiles key={index} className={styles.tiles} tiles={set.tiles} tileWidth={tileWidth} />
            ))}
          </Flex>
        )}
      </Flex>

      <Table
        className={styles.table}
        bordered
        fullWidth
        header={
          <>
            <TableCell className={styles.tableCell}>Фан</TableCell>
            <TableCell className={styles.tableCell}>Кости</TableCell>
            <TableCell className={styles.tableCell}>Очков</TableCell>
          </>
        }
        footer={
          <>
            <TableCell className={styles.tableCell} />
            <TableCell className={styles.tableCell} />
            <TableCell
              className={classNames(
                styles.tableCell,
                showScoreEval && (getPureFansScore(mahjong.fans) < MIN_SCORE ? styles.negative : styles.positive),
              )}
            >
              {mahjong.score}
            </TableCell>
          </>
        }
      >
        {map(groupedFans, (fans, fanString) => {
          const fan = fanString as FanKind;

          return (
            <TableRow key={fan}>
              <TableCell className={styles.tableCell}>{FAN_NAMES[fan]}</TableCell>
              <TableCell className={styles.tableCell}>
                {fan === FanKind.FLOWER_TILES || fan === FanKind.TILE_HOG ? (
                  <Tiles
                    tiles={fans
                      .filter(isSpecialFan)
                      .map(({ tile }) => tile)
                      .filter(isDefined)}
                    tileWidth={tileWidth * 0.75}
                  />
                ) : (
                  <Flex direction="column" alignItems="center" between={1}>
                    {fans.map((fan, index) =>
                      isHandFan(fan) ? (
                        'Вся рука'
                      ) : isSetsFan(fan) ? (
                        <Flex key={index} between={4}>
                          {fan.sets.map((set, index) => (
                            <Tiles key={index} tiles={set.tiles} tileWidth={tileWidth * 0.75} />
                          ))}
                        </Flex>
                      ) : (
                        '—'
                      ),
                    )}
                  </Flex>
                )}
              </TableCell>
              <TableCell className={styles.tableCell}>{FAN_SCORES[fan] * fans.length}</TableCell>
            </TableRow>
          );
        })}
      </Table>
    </>
  );
};

export default memo(Mahjong);
