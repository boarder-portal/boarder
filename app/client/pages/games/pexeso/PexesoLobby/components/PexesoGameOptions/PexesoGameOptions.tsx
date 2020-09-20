import React, { useCallback } from 'react';
import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EPexesoSet, IPexesoGameOptions } from 'common/types/pexeso';

import Box from 'client/components/common/Box/Box';
import Select from 'client/components/common/Select/Select';

interface IPexesoGameOptionsProps {
  options: IPexesoGameOptions;
  onOptionsChange(options: IPexesoGameOptions): void;
}

const {
  games: {
    pexeso: {
      minPlayersCount,
      maxPlayersCount,
    },
  },
} = GAMES_CONFIG;

const PexesoGameOptions: React.FC<IPexesoGameOptionsProps> = (props) => {
  const { options, onOptionsChange } = props;

  const handleSetChange = useCallback((updatedSet: EPexesoSet) => {
    onOptionsChange({
      ...options,
      set: updatedSet,
    });
  }, [onOptionsChange, options]);

  const handlePlayersCountChange = useCallback((updatedPlayersCount) => {
    onOptionsChange({
      ...options,
      playersCount: updatedPlayersCount,
    });
  }, [onOptionsChange, options]);

  return (
    <Box flex column between={12}>
      <Select
        label="Сет"
        name="pexesoSet"
        value={options.set}
        options={Object.values(EPexesoSet).map((name) => ({
          value: name,
          text: name,
        }))}
        onChange={handleSetChange as any}
      />

      <Select
        label="Количество игроков"
        name="pexesoPlayersCount"
        value={String(options.playersCount)}
        options={times(maxPlayersCount - minPlayersCount + 1, (index) => ({
          value: String(minPlayersCount + index),
          text: String(minPlayersCount + index),
        }))}
        onChange={handlePlayersCountChange as any}
      />
    </Box>
  );
};

export default React.memo(PexesoGameOptions);
