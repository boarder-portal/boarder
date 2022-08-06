import { FC, memo } from 'react';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';

import { FAN_NAMES, FAN_SCORES } from 'common/constants/games/mahjong/fans';

import { EFan, IHandMahjong } from 'common/types/mahjong';

import { isHandFan, isSetsFan, isSpecialFan } from 'common/utilities/mahjong/fans';
import isDefined from 'common/utilities/isDefined';

import Flex from 'client/components/common/Flex/Flex';
import Tiles, { EOpenType } from 'client/pages/Game/components/MahjongGame/components/Tiles/Tiles';
import Tile from 'client/pages/Game/components/MahjongGame/components/Tile/Tile';
import Table from 'client/components/common/Table/Table';
import TableCell from 'client/components/common/TableCell/TableCell';
import TableRow from 'client/components/common/TableRow/TableRow';

import styles from './Mahjong.pcss';

interface IMahjongProps {
  mahjong: IHandMahjong;
  tileWidth: number;
}

const Mahjong: FC<IMahjongProps> = (props) => {
  const { mahjong, tileWidth } = props;

  const groupedFans = groupBy(mahjong.fans, (fan) => fan.fan);

  return (
    <>
      <Flex direction="column" between={4}>
        <Flex alignItems="center" between={6}>
          <div className={styles.tilesCaption}>Ожидания</div>

          <Tiles tiles={mahjong.waits} tileWidth={tileWidth} />
        </Flex>

        <Flex alignItems="center" between={6}>
          <div className={styles.tilesCaption}>Рука</div>

          {mahjong.concealedSets.map((set, index) => (
            <Tiles key={index} tiles={set.tiles} tileWidth={tileWidth} openType={EOpenType.SEMI_CONCEALED} />
          ))}

          {mahjong.meldedSets.map((set, index) => (
            <Tiles key={index} tiles={set.tiles} tileWidth={tileWidth} />
          ))}

          <Tiles tiles={mahjong.hand} tileWidth={tileWidth} />

          <Tile tile={mahjong.winningTile} width={tileWidth} />
        </Flex>

        {mahjong.sets && (
          <Flex alignItems="center" between={6}>
            <div className={styles.tilesCaption}>Разбиение</div>

            {mahjong.sets.map((set, index) => (
              <Tiles key={index} tiles={set.tiles} tileWidth={tileWidth} />
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
            <TableCell className={styles.tableCell}>{mahjong.score}</TableCell>
          </>
        }
      >
        {map(groupedFans, (fans, fanString) => {
          const fan = fanString as EFan;

          return (
            <TableRow key={fan}>
              <TableCell className={styles.tableCell}>{FAN_NAMES[fan]}</TableCell>
              <TableCell className={styles.tableCell}>
                {fan === EFan.FLOWER_TILES ? (
                  <Tiles
                    inline
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
