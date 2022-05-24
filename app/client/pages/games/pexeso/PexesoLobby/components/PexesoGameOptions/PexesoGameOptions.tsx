import React, { useCallback, useRef, useState } from 'react';

import {
  DIFFERENT_CARDS_COUNTS,
  LAYOUT_NAMES,
  MATCHING_CARDS_COUNTS,
  SHUFFLE_AFTER_MOVES_COUNTS,
  SHUFFLE_CARDS_COUNTS,
} from 'common/constants/games/pexeso';

import { EFieldLayout, ESet, EShuffleType, IGameOptions, TShuffleOptions } from 'common/types/pexeso';
import { EGame } from 'common/types/game';

import { arePexesoOptionsValid } from 'common/utilities/pexeso';

import Select from 'client/components/common/Select/Select';
import Checkbox from 'client/components/common/Checkbox/Checkbox';
import RadioGroup from 'client/components/common/RadioGroup/RadioGroup';
import Flex from 'client/components/common/Flex/Flex';
import { TChangeOptions } from 'client/components/Lobby/Lobby';

import styles from './PexesoGameOptions.pcss';

interface IPexesoGameOptionsProps {
  options: IGameOptions;
  onOptionsChange: TChangeOptions<EGame.PEXESO>;
}

const PexesoGameOptions: React.FC<IPexesoGameOptionsProps> = (props) => {
  const { options, onOptionsChange } = props;

  const [shuffleCardsCount, setShuffleCardsCount] = useState(2);
  const lastShuffleOptions = useRef<NonNullable<TShuffleOptions>>(
    options.shuffleOptions || {
      type: EShuffleType.TURNED,
      afterMovesCount: 1,
    },
  );

  const areOptionsValid = <K extends keyof IGameOptions>(values: Pick<IGameOptions, K>): boolean => {
    return arePexesoOptionsValid({
      ...options,
      ...values,
    });
  };

  const handleSetChange = useCallback(
    (updatedSet: ESet) => {
      onOptionsChange({
        set: updatedSet,
      });
    },
    [onOptionsChange],
  );

  const handleMatchingCardsCountChange = useCallback(
    (matchingCardsCount: number) => {
      onOptionsChange({
        matchingCardsCount,
      });
    },
    [onOptionsChange],
  );

  const handleDifferentCardsCountChange = useCallback(
    (differentCardsCount: number) => {
      onOptionsChange({
        differentCardsCount,
      });
    },
    [onOptionsChange],
  );

  const handleLayoutChange = useCallback(
    (layout: EFieldLayout) => {
      onOptionsChange({
        layout,
      });
    },
    [onOptionsChange],
  );

  const handlePickRandomImagesChange = useCallback(
    (pickRandomImages: boolean) => {
      onOptionsChange({
        pickRandomImages,
      });
    },
    [onOptionsChange],
  );

  const handleUseImageVariantsChange = useCallback(
    (useImageVariants: boolean) => {
      onOptionsChange({
        useImageVariants,
      });
    },
    [onOptionsChange],
  );

  const handleShuffleCheckboxChange = useCallback(
    (shuffle: boolean) => {
      onOptionsChange({
        shuffleOptions: shuffle ? lastShuffleOptions.current : null,
      });
    },
    [onOptionsChange],
  );

  const handleShuffleAfterMovesCountChange = useCallback(
    (afterMovesCount) => {
      if (!options.shuffleOptions) {
        return;
      }

      onOptionsChange({
        shuffleOptions: {
          ...options.shuffleOptions,
          afterMovesCount,
        },
      });
    },
    [onOptionsChange, options],
  );

  const handleShuffleTypeChange = useCallback(
    (type: EShuffleType) => {
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
        shuffleOptions: newShuffleOptions,
      });
    },
    [onOptionsChange, shuffleCardsCount],
  );

  const handleShuffleCardsCountChange = useCallback(
    (cardsCount: number) => {
      if (!options.shuffleOptions) {
        return;
      }

      setShuffleCardsCount(cardsCount);
      onOptionsChange({
        shuffleOptions: {
          type: EShuffleType.RANDOM,
          afterMovesCount: options.shuffleOptions.afterMovesCount,
          cardsCount,
        },
      });
    },
    [onOptionsChange, options],
  );

  return (
    <Flex className={styles.root} direction="column" between={3}>
      <Select
        label="Сет"
        name="set"
        value={options.set}
        options={Object.values(ESet).map((set) => ({
          value: set,
          text: set,
          disabled: !areOptionsValid({ set }),
        }))}
        onChange={handleSetChange}
      />

      <Select
        label="Количество совпадающих карточек"
        name="matchingCardsCount"
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
        name="differentCardsCount"
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
        name="layout"
        value={options.layout}
        options={Object.values(EFieldLayout).map((layout) => ({
          value: layout,
          text: LAYOUT_NAMES[layout],
          disabled: !areOptionsValid({ layout }),
        }))}
        onChange={handleLayoutChange}
      />

      <Checkbox label="Случайные картинки" checked={options.pickRandomImages} onChange={handlePickRandomImagesChange} />

      <Checkbox
        label="Вариативные карточки"
        checked={options.useImageVariants}
        disabled={!areOptionsValid({ useImageVariants: !options.useImageVariants })}
        onChange={handleUseImageVariantsChange}
      />

      <Checkbox label="Перемешивать" checked={!!options.shuffleOptions} onChange={handleShuffleCheckboxChange} />

      {options.shuffleOptions && (
        <div className={styles.shuffleOptions}>
          <RadioGroup
            options={[
              {
                text: 'перевернутые только что карточки',
                value: EShuffleType.TURNED,
              },
              {
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
                    />{' '}
                    {shuffleCardsCount > 4 ? 'карточек' : 'карточки'}
                  </>
                ),
                value: EShuffleType.RANDOM,
              },
            ]}
            value={options.shuffleOptions.type}
            onChange={handleShuffleTypeChange}
          />

          <div className={styles.shuffleAfterMovesCount}>
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
            />{' '}
            {options.shuffleOptions.afterMovesCount === 1
              ? 'ход'
              : options.shuffleOptions.afterMovesCount > 4
              ? 'ходов'
              : 'хода'}
          </div>
        </div>
      )}
    </Flex>
  );
};

export default React.memo(PexesoGameOptions);
