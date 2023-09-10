import { FC, memo, useCallback, useEffect, useState } from 'react';
import times from 'lodash/times';
import classNames from 'classnames';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { HAND_COUNTS } from 'common/constants/games/mahjong';

import { EHandsCount, IHandResult, IPlayer } from 'common/types/mahjong';

import Modal from 'client/components/common/Modal/Modal';
import Table from 'client/components/common/Table/Table';
import TableCell from 'client/components/common/TableCell/TableCell';
import TableRow from 'client/components/common/TableRow/TableRow';
import Mahjong from 'client/pages/Game/components/MahjongGame/components/Mahjong/Mahjong';
import Flex from 'client/components/common/Flex/Flex';

import styles from './ResultsModal.module.scss';

enum EViewMode {
  TABLE = 'TABLE',
  MAHJONG = 'MAHJONG',
}

interface IResultsModalProps {
  open: boolean;
  handsCount: EHandsCount;
  players: IPlayer[];
  results: IHandResult[];
  openedResult: IHandResult | null;
  onClose(): void;
}

const ResultsModal: FC<IResultsModalProps> = (props) => {
  const { open, handsCount, players, results, openedResult, onClose } = props;

  const [viewMode, setViewMode] = useState(EViewMode.TABLE);
  const [chosenResult, setChosenResult] = useState<IHandResult | null>(null);

  const chosenResultWinner =
    !chosenResult || chosenResult.winnerIndex === -1 ? null : players.at(chosenResult.winnerIndex) ?? null;

  const chooseResult = useCallback((result: IHandResult) => {
    setViewMode(EViewMode.MAHJONG);
    setChosenResult(result);
  }, []);

  const backToTable = useCallback(() => {
    setViewMode(EViewMode.TABLE);
  }, []);

  useEffect(() => {
    batchedUpdates(() => {
      if (open) {
        setViewMode(openedResult ? EViewMode.MAHJONG : EViewMode.TABLE);
        setChosenResult(openedResult);
      }
    });
  }, [open, openedResult]);

  return (
    <Modal
      containerClassName={classNames(styles.root, { [styles.results]: viewMode === EViewMode.TABLE })}
      open={open}
      onClose={onClose}
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
                onClick={() => mahjong && chooseResult(result)}
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
        <Flex direction="column" between={6}>
          <div className={styles.backButton} onClick={backToTable}>
            🠔 Назад
          </div>

          {chosenResultWinner && (
            <div className={styles.winnerHeader}>
              Победил(а) <span className={styles.winner}>{chosenResultWinner.name}</span>!
            </div>
          )}

          {chosenResult?.mahjong && (
            <div>
              <Mahjong mahjong={chosenResult.mahjong} tileWidth={50} />
            </div>
          )}
        </Flex>
      )}
    </Modal>
  );
};

export default memo(ResultsModal);
