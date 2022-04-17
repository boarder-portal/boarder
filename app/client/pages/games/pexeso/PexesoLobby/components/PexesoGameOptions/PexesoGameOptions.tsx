import React, { useCallback, useRef, useState } from 'react';
import times from 'lodash/times';
import styled from 'styled-components';
import block from 'bem-cn';

import {
  DIFFERENT_CARDS_COUNTS,
  LAYOUT_NAMES,
  MATCHING_CARDS_COUNTS,
  MAX_PLAYERS_COUNT,
  MIN_PLAYERS_COUNT,
  SHUFFLE_AFTER_MOVES_COUNTS,
  SHUFFLE_CARDS_COUNTS,
} from 'common/constants/games/pexeso';

import {
  EFieldLayout,
  ESet,
  EShuffleType,
  IGameOptions,
  TShuffleOptions,
} from 'common/types/pexeso';

import { arePexesoOptionsValid } from 'common/utilities/pexeso';

import Box from 'client/components/common/Box/Box';
import Select from 'client/components/common/Select/Select';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import RadioGroup from 'client/components/common/RadioGroup/RadioGroup';

interface IPexesoGameOptionsProps {
  options: IGameOptions;
  onOptionsChange(options: IGameOptions): void;
}

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
  const lastShuffleOptions = useRef<NonNullable<TShuffleOptions>>(options.shuffleOptions || {
    type: EShuffleType.TURNED,
    afterMovesCount: 1,
  });

  const areOptionsValid = <K extends keyof IGameOptions>(values: Pick<IGameOptions, K>): boolean => {
    return arePexesoOptionsValid({
      ...options,
      ...values,
    });
  };

  const handleSetChange = useCallback((updatedSet: ESet) => {
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

  const handleLayoutChange = useCallback((layout: EFieldLayout) => {
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

  const handleShuffleTypeChange = useCallback((type: EShuffleType) => {
    let newShuffleOptions: NonNullable<TShuffleOptions>;

    if (type === EShuffleType.TURNED) {
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
        type: EShuffleType.RANDOM,
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
        options={Object.values(ESet).map((set) => ({
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
        options={times(MAX_PLAYERS_COUNT - MIN_PLAYERS_COUNT + 1, (index) => ({
          value: MIN_PLAYERS_COUNT + index,
          text: MIN_PLAYERS_COUNT + index,
        }))}
        onChange={handlePlayersCountChange}
      />

      <Select
        label="Количество совпадающих карточек"
        name="pexesoMatchingCardsCount"
        value={options.matchingCardsCount}
        options={MATCHING_CARDS_COUNTS.map((matchingCardsCount) => ({
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
        options={DIFFERENT_CARDS_COUNTS.map((differentCardsCount) => ({
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
        options={Object.values(EFieldLayout).map((layout) => ({
          value: layout,
          text: LAYOUT_NAMES[layout],
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
              value: EShuffleType.TURNED,
            }, {
              text: (
                <>
                  случайные{' '}

                  <Select
                    name="shuffleCardsCount"
                    value={shuffleCardsCount}
                    options={SHUFFLE_CARDS_COUNTS.map((cardsCount) => ({
                      value: cardsCount,
                      text: cardsCount,
                    }))}
                    style={{ margin: '0 4px' }}
                    onChange={handleShuffleCardsCountChange}
                  />

                  {' '}{shuffleCardsCount > 4 ? 'карточек' : 'карточки'}
                </>
              ),
              value: EShuffleType.RANDOM,
            }]}
            value={options.shuffleOptions.type}
            onChange={handleShuffleTypeChange}
          />

          <div className={b('shuffleAfterMovesCount')}>
            {options.shuffleOptions.afterMovesCount === 1 ? 'каждый' : 'каждые'}{' '}

            <Select
              name="shuffleAfterMovesCount"
              value={options.shuffleOptions.afterMovesCount}
              options={SHUFFLE_AFTER_MOVES_COUNTS.map((afterMovesCount) => ({
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
