import React, { useCallback } from 'react';
import times from 'lodash/times';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import { EPexesoFieldLayout, EPexesoSet, IPexesoGameOptions } from 'common/types/pexeso';
import { EGame } from 'common/types';

import { arePexesoOptionsValid } from 'common/utilities/pexeso';

import Box from 'client/components/common/Box/Box';
import Select from 'client/components/common/Select/Select';
import Checkbox from 'client/components/common/Checkbox/Checkbox';

interface IPexesoGameOptionsProps {
  options: IPexesoGameOptions;
  onOptionsChange(options: IPexesoGameOptions): void;
}

const {
  games: {
    [EGame.PEXESO]: {
      minPlayersCount,
      maxPlayersCount,
      matchingCardsCounts,
      differentCardsCounts,
      layoutNames,
    },
  },
} = GAMES_CONFIG;

const PexesoGameOptions: React.FC<IPexesoGameOptionsProps> = (props) => {
  const { options, onOptionsChange } = props;

  const areOptionsValid = <K extends keyof IPexesoGameOptions>(values: Pick<IPexesoGameOptions, K>): boolean => {
    return arePexesoOptionsValid({
      ...options,
      ...values,
    });
  };

  const handleSetChange = useCallback((updatedSet: EPexesoSet) => {
    onOptionsChange({
      ...options,
      set: updatedSet,
    });
  }, [onOptionsChange, options]);

  const handlePlayersCountChange = useCallback((updatedPlayersCount: number) => {
    onOptionsChange({
      ...options,
      playersCount: updatedPlayersCount,
    });
  }, [onOptionsChange, options]);

  const handleMatchingCardsCountChange = useCallback((matchingCardsCount: number) => {
    onOptionsChange({
      ...options,
      matchingCardsCount,
    });
  }, [onOptionsChange, options]);

  const handleDifferentCardsCountChange = useCallback((differentCardsCount: number) => {
    onOptionsChange({
      ...options,
      differentCardsCount,
    });
  }, [onOptionsChange, options]);

  const handleLayoutChange = useCallback((layout: EPexesoFieldLayout) => {
    onOptionsChange({
      ...options,
      layout,
    });
  }, [onOptionsChange, options]);

  const handlePickRandomImagesChange = useCallback((pickRandomImages: boolean) => {
    onOptionsChange({
      ...options,
      pickRandomImages,
    });
  }, [onOptionsChange, options]);

  const handleUseImageVariantsChange = useCallback((useImageVariants: boolean) => {
    onOptionsChange({
      ...options,
      useImageVariants,
    });
  }, [onOptionsChange, options]);

  return (
    <Box flex column between={12}>
      <Select
        label="Сет"
        name="pexesoSet"
        value={options.set}
        options={Object.values(EPexesoSet).map((set) => ({
          value: set,
          text: set,
          disabled: !areOptionsValid({ set }),
        }))}
        onChange={handleSetChange}
      />

      <Select
        label="Количество игроков"
        name="pexesoPlayersCount"
        value={options.playersCount}
        options={times(maxPlayersCount - minPlayersCount + 1, (index) => ({
          value: minPlayersCount + index,
          text: minPlayersCount + index,
        }))}
        onChange={handlePlayersCountChange}
      />

      <Select
        label="Количество совпадающих карточек"
        name="pexesoMatchingCardsCount"
        value={options.matchingCardsCount}
        options={matchingCardsCounts.map((matchingCardsCount) => ({
          value: matchingCardsCount,
          text: matchingCardsCount,
          disabled: !areOptionsValid({ matchingCardsCount }),
        }))}
        onChange={handleMatchingCardsCountChange}
      />

      <Select
        label="Количество разных карточек"
        name="pexesoDifferentCardsCount"
        value={options.differentCardsCount}
        options={differentCardsCounts.map((differentCardsCount) => ({
          value: differentCardsCount,
          text: differentCardsCount,
          disabled: !areOptionsValid({ differentCardsCount }),
        }))}
        onChange={handleDifferentCardsCountChange}
      />

      <Select
        label="Расположение карточек"
        name="pexesoFieldLayout"
        value={options.layout}
        options={[EPexesoFieldLayout.RECT, EPexesoFieldLayout.HEX].map((layout) => ({
          value: layout,
          text: layoutNames[layout],
          disabled: !areOptionsValid({ layout }),
        }))}
        onChange={handleLayoutChange}
      />

      <Checkbox
        label="Случайные картинки"
        checked={options.pickRandomImages}
        onChange={handlePickRandomImagesChange}
      />

      <Checkbox
        label="Вариативные карточки"
        checked={options.useImageVariants}
        disabled={!areOptionsValid({ useImageVariants: !options.useImageVariants })}
        onChange={handleUseImageVariantsChange}
      />
    </Box>
  );
};

export default React.memo(PexesoGameOptions);
