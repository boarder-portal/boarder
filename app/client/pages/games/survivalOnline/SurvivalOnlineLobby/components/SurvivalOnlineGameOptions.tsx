import React, { useCallback } from 'react';
import times from 'lodash/times';

import { MAX_PLAYERS_COUNT, MIN_PLAYERS_COUNT } from 'common/constants/games/survivalOnline';

import { ISurvivalOnlineGameOptions } from 'common/types/survivalOnline';

import Box from 'client/components/common/Box/Box';
import Select from 'client/components/common/Select/Select';

interface ISurvivalOnlineGameOptionsProps {
  options: ISurvivalOnlineGameOptions;
  onOptionsChange(options: ISurvivalOnlineGameOptions): void;
}

const SurvivalOnlineGameOptions: React.FC<ISurvivalOnlineGameOptionsProps> = (props) => {
  const { options, onOptionsChange } = props;

  const handlePlayersCountChange = useCallback((updatedPlayersCount: number) => {
    onOptionsChange({
      ...options,
      playersCount: updatedPlayersCount,
    });
  }, [onOptionsChange, options]);

  return (
    <Box flex column between={12}>
      <Select
        label="Количество игроков"
        name="survivalOnlinePlayersCount"
        value={options.playersCount}
        options={times(MAX_PLAYERS_COUNT - MIN_PLAYERS_COUNT + 1, (index) => ({
          value: MIN_PLAYERS_COUNT + index,
          text: MIN_PLAYERS_COUNT + index,
        }))}
        onChange={handlePlayersCountChange}
      />
    </Box>
  );
};

export default React.memo(SurvivalOnlineGameOptions);
