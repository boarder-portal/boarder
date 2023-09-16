import classNames from 'classnames';
import times from 'lodash/times';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom';

import { HAND_COUNTS } from 'common/constants/games/mahjong';

import { HandResult, HandsCount, Player } from 'common/types/games/mahjong';

import Button from 'client/components/common/Button/Button';
import Flex from 'client/components/common/Flex/Flex';
import Modal, { BaseModalProps } from 'client/components/common/Modal/Modal';
import Table from 'client/components/common/Table/Table';
import TableCell from 'client/components/common/TableCell/TableCell';
import TableRow from 'client/components/common/TableRow/TableRow';
import Mahjong from 'client/pages/Game/components/MahjongGame/components/Mahjong/Mahjong';

import styles from './ResultsModal.module.scss';

enum ViewMode {
  TABLE = 'TABLE',
  MAHJONG = 'MAHJONG',
}

interface ResultsModalProps extends BaseModalProps {
  handsCount: HandsCount;
  players: Player[];
  results: HandResult[];
  openedResult: HandResult | null;
}

const ResultsModal: FC<ResultsModalProps> = (props) => {
  const { open, handsCount, players, results, openedResult, onClose } = props;

  const [viewMode, setViewMode] = useState(ViewMode.TABLE);
  const [chosenResult, setChosenResult] = useState<HandResult | null>(null);

  const chosenResultWinner =
    !chosenResult || chosenResult.winnerIndex === -1 ? null : players.at(chosenResult.winnerIndex) ?? null;

  const chooseResult = useCallback((result: HandResult) => {
    setViewMode(ViewMode.MAHJONG);
    setChosenResult(result);
  }, []);

  const backToTable = useCallback(() => {
    setViewMode(ViewMode.TABLE);
  }, []);

  useEffect(() => {
    batchedUpdates(() => {
      if (open) {
        setViewMode(openedResult ? ViewMode.MAHJONG : ViewMode.TABLE);
        setChosenResult(openedResult);
      }
    });
  }, [open, openedResult]);

  return (
    <Modal
      contentClassName={classNames(styles.modalContent, { [styles.results]: viewMode === ViewMode.TABLE })}
      open={open}
      title="Результаты"
      onClose={onClose}
    >
      {viewMode === ViewMode.TABLE ? (
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

                {players.map((_player, index) => (
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
          <Button className={styles.backButton} variant="outlined" onClick={backToTable}>
            🠔 К таблице
          </Button>

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
