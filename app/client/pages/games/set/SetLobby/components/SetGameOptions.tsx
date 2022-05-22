import React, { useCallback } from 'react';
import times from 'lodash/times';

import { MAX_PLAYERS_COUNT, MIN_PLAYERS_COUNT } from 'common/constants/games/set';

import { IGameOptions } from 'common/types/set';

import Select from 'client/components/common/Select/Select';
import Flex from 'client/components/common/Flex/Flex';

interface ISetGameOptionsProps {
  options: IGameOptions;
  onOptionsChange(options: IGameOptions): void;
}

const SetGameOptions: React.FC<ISetGameOptionsProps> = (props) => {
  const { options, onOptionsChange } = props;

  const handlePlayersCountChange = useCallback(
    (updatedPlayersCount: number) => {
      onOptionsChange({
        ...options,
        playersCount: updatedPlayersCount,
      });
    },
    [onOptionsChange, options],
  );

  return (
    <Flex direction="column" between={3}>
      <Select
        label="Количество игроков"
        name="setPlayersCount"
        value={options.playersCount}
        options={times(MAX_PLAYERS_COUNT - MIN_PLAYERS_COUNT + 1, (index) => ({
          value: MIN_PLAYERS_COUNT + index,
          text: MIN_PLAYERS_COUNT + index,
        }))}
        onChange={handlePlayersCountChange}
      />
    </Flex>
  );
};

export default React.memo(SetGameOptions);
