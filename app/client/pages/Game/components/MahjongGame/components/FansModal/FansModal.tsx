import { FC, memo } from 'react';

import { ALL_FANS, FAN_DESCRIPTIONS, FAN_EXAMPLES, FAN_NAMES, FAN_SCORES } from 'common/constants/games/mahjong/fans';

import Modal from 'client/components/common/Modal/Modal';
import Table from 'client/components/common/Table/Table';
import TableCell from 'client/components/common/TableCell/TableCell';
import TableRow from 'client/components/common/TableRow/TableRow';
import Flex from 'client/components/common/Flex/Flex';
import Tiles from 'client/pages/Game/components/MahjongGame/components/Tiles/Tiles';

interface IFansModalProps {
  open: boolean;
  onClose(): void;
}

const FansModal: FC<IFansModalProps> = (props) => {
  const { open, onClose } = props;

  return (
    <Modal open={open} onClose={onClose}>
      <Table
        bordered
        header={
          <>
            <TableCell>Очков</TableCell>
            <TableCell>Название</TableCell>
            <TableCell>Описание</TableCell>
            <TableCell>Примеры</TableCell>
          </>
        }
      >
        {ALL_FANS.map((fan, fanIndex) => {
          const score = FAN_SCORES[fan];
          const isFirstScore = fanIndex === 0 || FAN_SCORES[ALL_FANS[fanIndex - 1]] !== score;
          const sameScoreFansCount = ALL_FANS.filter((fan) => FAN_SCORES[fan] === score).length;

          return (
            <TableRow key={fan}>
              {isFirstScore && <TableCell rowSpan={sameScoreFansCount}>{score}</TableCell>}
              <TableCell>{FAN_NAMES[fan]}</TableCell>
              <TableCell>{FAN_DESCRIPTIONS[fan]}</TableCell>
              <TableCell>
                <Flex direction="column" between={2}>
                  {FAN_EXAMPLES[fan].map((tiles, index) => (
                    <Flex key={index} between={4}>
                      {tiles.map((tiles, index) => (
                        <Tiles key={index} tiles={tiles} tileWidth={40} />
                      ))}
                    </Flex>
                  ))}
                </Flex>
              </TableCell>
            </TableRow>
          );
        })}
      </Table>
    </Modal>
  );
};

export default memo(FansModal);
