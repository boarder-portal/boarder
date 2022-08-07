import { FC, memo, useCallback, useEffect, useState } from 'react';
import times from 'lodash/times';
import classNames from 'classnames';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { HAND_COUNTS } from 'common/constants/games/mahjong';

import { EHandsCount, IHandMahjong, IHandResult, IPlayer } from 'common/types/mahjong';

import Modal from 'client/components/common/Modal/Modal';
import Table from 'client/components/common/Table/Table';
import TableCell from 'client/components/common/TableCell/TableCell';
import TableRow from 'client/components/common/TableRow/TableRow';
import Mahjong from 'client/pages/Game/components/MahjongGame/components/Mahjong/Mahjong';

import styles from './ResultsModal.pcss';

enum EViewMode {
  TABLE = 'TABLE',
  MAHJONG = 'MAHJONG',
}

interface IResultsModalProps {
  open: boolean;
  handsCount: EHandsCount;
  players: IPlayer[];
  results: IHandResult[];
  openedMahjong: IHandMahjong | null;
  onClose(): void;
}

const ResultsModal: FC<IResultsModalProps> = (props) => {
  const { open, handsCount, players, results, openedMahjong, onClose } = props;

  const [viewMode, setViewMode] = useState(EViewMode.TABLE);
  const [chosenMahjong, setChosenMahjong] = useState<IHandMahjong | null>(null);

  const chooseMahjong = useCallback((mahjong: IHandMahjong) => {
    setViewMode(EViewMode.MAHJONG);
    setChosenMahjong(mahjong);
  }, []);

  const backToTable = useCallback(() => {
    setViewMode(EViewMode.TABLE);
  }, []);

  const onModalClose = useCallback(() => {
    setViewMode(EViewMode.TABLE);

    onClose();
  }, [onClose]);

  useEffect(() => {
    batchedUpdates(() => {
      setViewMode(openedMahjong ? EViewMode.MAHJONG : EViewMode.TABLE);
      setChosenMahjong(openedMahjong);
    });
  }, [openedMahjong]);

  return (
    <Modal
      containerClassName={classNames(styles.root, { [styles.results]: viewMode === EViewMode.TABLE })}
      open={open}
      onClose={onModalClose}
    >
      {viewMode === EViewMode.TABLE ? (
        <Table
          bordered
          fullWidth
          layout="fixed"
          header={
            <>
              <TableCell className={styles.indexCell} />

              {players.map(({ name, index }) => (
                <TableCell key={index} className={styles.resultCell}>
                  {name}
                </TableCell>
              ))}
            </>
          }
          footer={
            <>
              <TableCell className={styles.indexCell} />

              {players.map((_, playerIndex) => (
                <TableCell key={playerIndex} className={styles.resultCell}>
                  {results.reduce((score, { scores }) => score + scores[playerIndex], 0)}
                </TableCell>
              ))}
            </>
          }
        >
          {times(HAND_COUNTS[handsCount], (index) => {
            const result = results.at(index);
            const mahjong = result?.mahjong;
            const scores = result?.scores;

            return (
              <TableRow
                key={index}
                className={classNames(styles.row, { [styles.clickable]: mahjong })}
                onClick={() => mahjong && chooseMahjong(mahjong)}
              >
                <TableCell className={styles.indexCell}>{index + 1}</TableCell>

                {players.map((score, index) => (
                  <TableCell key={index} className={styles.resultCell}>
                    {scores?.at(index) ?? '\u00a0'}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </Table>
      ) : (
        <div>
          <div className={styles.backButton} onClick={backToTable}>
            🠔 Назад
          </div>

          <div className={styles.mahjongContainer}>
            {chosenMahjong && <Mahjong mahjong={chosenMahjong} tileWidth={50} />}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default memo(ResultsModal);
