import React, { useCallback } from 'react';
import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { ISetGameOptions } from 'common/types/set';
import { EGame } from 'common/types/game';

import Box from 'client/components/common/Box/Box';
import Select from 'client/components/common/Select/Select';

interface ISetGameOptionsProps {
  options: ISetGameOptions;
  onOptionsChange(options: ISetGameOptions): void;
}

const {
  games: {
    [EGame.SET]: {
      minPlayersCount,
      maxPlayersCount,
    },
  },
} = GAMES_CONFIG;

const SetGameOptions: React.FC<ISetGameOptionsProps> = (props) => {
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
        name="setPlayersCount"
        value={options.playersCount}
        options={times(maxPlayersCount - minPlayersCount + 1, (index) => ({
          value: minPlayersCount + index,
          text: minPlayersCount + index,
        }))}
        onChange={handlePlayersCountChange}
      />
    </Box>
  );
};

export default React.memo(SetGameOptions);
