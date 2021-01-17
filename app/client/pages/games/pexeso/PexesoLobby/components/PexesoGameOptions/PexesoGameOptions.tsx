import React, { useCallback, useRef, useState } from 'react';
import times from 'lodash/times';
import styled from 'styled-components';
import block from 'bem-cn';

import { GAMES_CONFIG } from 'common/constants/gamesConfig';

import {
  EPexesoFieldLayout,
  EPexesoSet,
  EPexesoShuffleType,
  IPexesoGameOptions,
  TPexesoShuffleOptions,
} from 'common/types/pexeso';
import { EGame } from 'common/types/game';

import { arePexesoOptionsValid } from 'common/utilities/pexeso';

import Box from 'client/components/common/Box/Box';
import Select from 'client/components/common/Select/Select';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import RadioGroup from 'client/components/common/RadioGroup/RadioGroup';

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
      shuffleAfterMovesCounts,
      shuffleCardsCounts,
    },
  },
} = GAMES_CONFIG;

const b = block('PexesoGameOptions');

const Root = styled(Box)`
  .PexesoGameOptions {
    &__shuffleOptions {
      padding-left: 16px;
    }

    &__shuffleAfterMovesCount {
      display: flex;
      align-items: baseline;
      margin-top: 8px;
    }
  }

  .MuiFormControlLabel-label {
    display: flex;
    align-items: baseline;
  }
`;

const PexesoGameOptions: React.FC<IPexesoGameOptionsProps> = (props) => {
  const { options, onOptionsChange } = props;

  const [shuffleCardsCount, setShuffleCardsCount] = useState(2);
  const lastShuffleOptions = useRef<NonNullable<TPexesoShuffleOptions>>(options.shuffleOptions || {
    type: EPexesoShuffleType.TURNED,
    afterMovesCount: 1,
  });

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

  const handleShuffleCheckboxChange = useCallback((shuffle: boolean) => {
    onOptionsChange({
      ...options,
      shuffleOptions: shuffle ? lastShuffleOptions.current : null,
    });
  }, [onOptionsChange, options]);

  const handleShuffleAfterMovesCountChange = useCallback((afterMovesCount) => {
    if (!options.shuffleOptions) {
      return;
    }

    onOptionsChange({
      ...options,
      shuffleOptions: {
        ...options.shuffleOptions,
        afterMovesCount,
      },
    });
  }, [onOptionsChange, options]);

  const handleShuffleTypeChange = useCallback((type: EPexesoShuffleType) => {
    let newShuffleOptions: NonNullable<TPexesoShuffleOptions>;

    if (type === EPexesoShuffleType.TURNED) {
      newShuffleOptions = {
        type,
        afterMovesCount: lastShuffleOptions.current.afterMovesCount,
      };
    } else {
      newShuffleOptions = {
        type,
        afterMovesCount: lastShuffleOptions.current.afterMovesCount,
        cardsCount: shuffleCardsCount,
      };
    }

    lastShuffleOptions.current = newShuffleOptions;

    onOptionsChange({
      ...options,
      shuffleOptions: newShuffleOptions,
    });
  }, [onOptionsChange, options, shuffleCardsCount]);

  const handleShuffleCardsCountChange = useCallback((cardsCount: number) => {
    if (!options.shuffleOptions) {
      return;
    }

    setShuffleCardsCount(cardsCount);
    onOptionsChange({
      ...options,
      shuffleOptions: {
        type: EPexesoShuffleType.RANDOM,
        afterMovesCount: options.shuffleOptions.afterMovesCount,
        cardsCount,
      },
    });
  }, [onOptionsChange, options]);

  return (
    <Root className={b()} flex column between={12}>
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
        options={Object.values(EPexesoFieldLayout).map((layout) => ({
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

      <Checkbox
        label="Перемешивать"
        checked={!!options.shuffleOptions}
        onChange={handleShuffleCheckboxChange}
      />

      {options.shuffleOptions && (
        <div className={b('shuffleOptions')}>
          <RadioGroup
            options={[{
              text: 'перевернутые только что карточки',
              value: EPexesoShuffleType.TURNED,
            }, {
              text: (
                <>
                  случайные{' '}

                  <Select
                    name="shuffleCardsCount"
                    value={shuffleCardsCount}
                    options={shuffleCardsCounts.map((cardsCount) => ({
                      value: cardsCount,
                      text: cardsCount,
                    }))}
                    style={{ margin: '0 4px' }}
                    onChange={handleShuffleCardsCountChange}
                  />

                  {' '}{shuffleCardsCount > 4 ? 'карточек' : 'карточки'}
                </>
              ),
              value: EPexesoShuffleType.RANDOM,
            }]}
            value={options.shuffleOptions.type}
            onChange={handleShuffleTypeChange}
          />

          <div className={b('shuffleAfterMovesCount')}>
            {options.shuffleOptions.afterMovesCount === 1 ? 'каждый' : 'каждые'}{' '}

            <Select
              name="shuffleAfterMovesCount"
              value={options.shuffleOptions.afterMovesCount}
              options={shuffleAfterMovesCounts.map((afterMovesCount) => ({
                value: afterMovesCount,
                text: afterMovesCount,
              }))}
              style={{ margin: '0 4px' }}
              onChange={handleShuffleAfterMovesCountChange}
            />

            {' '} {
              options.shuffleOptions.afterMovesCount === 1
                ? 'ход'
                : options.shuffleOptions.afterMovesCount > 4
                  ? 'ходов'
                  : 'хода'
            }
          </div>
        </div>
      )}
    </Root>
  );
};

export default React.memo(PexesoGameOptions);
