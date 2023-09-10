import React, { useCallback, useRef, useState } from 'react';

import {
  DIFFERENT_CARDS_COUNTS,
  LAYOUT_NAMES,
  MATCHING_CARDS_COUNTS,
  SHUFFLE_AFTER_MOVES_COUNTS,
  SHUFFLE_CARDS_COUNTS,
} from 'common/constants/games/pexeso';

import { GameType } from 'common/types/game';
import { FieldLayoutType, GameOptions, SetType, ShuffleOptions, ShuffleType } from 'common/types/games/pexeso';

import { arePexesoOptionsValid } from 'common/utilities/pexeso';

import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Flex from 'client/components/common/Flex/Flex';
import RadioGroup from 'client/components/common/RadioGroup/RadioGroup';
import Select from 'client/components/common/Select/Select';

import { CreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

import styles from './PexesoCreateGameOptions.module.scss';

const PexesoCreateGameOptions: React.FC<CreateGameOptionsProps<GameType.PEXESO>> = (props) => {
  const { options, changeOptions } = props;

  const [shuffleCardsCount, setShuffleCardsCount] = useState(2);
  const lastShuffleOptions = useRef<NonNullable<ShuffleOptions>>(
    options.shuffleOptions || {
      type: ShuffleType.TURNED,
      afterMovesCount: 1,
    },
  );

  const areOptionsValid = <K extends keyof GameOptions>(values: Pick<GameOptions, K>): boolean => {
    return arePexesoOptionsValid({
      ...options,
      ...values,
    });
  };

  const handleSetChange = useCallback(
    (updatedSet: SetType) => {
      changeOptions({
        set: updatedSet,
      });
    },
    [changeOptions],
  );

  const handleMatchingCardsCountChange = useCallback(
    (matchingCardsCount: number) => {
      changeOptions({
        matchingCardsCount,
      });
    },
    [changeOptions],
  );

  const handleDifferentCardsCountChange = useCallback(
    (differentCardsCount: number) => {
      changeOptions({
        differentCardsCount,
      });
    },
    [changeOptions],
  );

  const handleLayoutChange = useCallback(
    (layout: FieldLayoutType) => {
      changeOptions({
        layout,
      });
    },
    [changeOptions],
  );

  const handlePickRandomImagesChange = useCallback(
    (pickRandomImages: boolean) => {
      changeOptions({
        pickRandomImages,
      });
    },
    [changeOptions],
  );

  const handleUseImageVariantsChange = useCallback(
    (useImageVariants: boolean) => {
      changeOptions({
        useImageVariants,
      });
    },
    [changeOptions],
  );

  const handleShuffleCheckboxChange = useCallback(
    (shuffle: boolean) => {
      changeOptions({
        shuffleOptions: shuffle ? lastShuffleOptions.current : null,
      });
    },
    [changeOptions],
  );

  const handleShuffleAfterMovesCountChange = useCallback(
    (afterMovesCount) => {
      if (!options.shuffleOptions) {
        return;
      }

      changeOptions({
        shuffleOptions: {
          ...options.shuffleOptions,
          afterMovesCount,
        },
      });
    },
    [changeOptions, options],
  );

  const handleShuffleTypeChange = useCallback(
    (type: ShuffleType) => {
      let newShuffleOptions: NonNullable<ShuffleOptions>;

      if (type === ShuffleType.TURNED) {
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

      changeOptions({
        shuffleOptions: newShuffleOptions,
      });
    },
    [changeOptions, shuffleCardsCount],
  );

  const handleShuffleCardsCountChange = useCallback(
    (cardsCount: number) => {
      if (!options.shuffleOptions) {
        return;
      }

      setShuffleCardsCount(cardsCount);
      changeOptions({
        shuffleOptions: {
          type: ShuffleType.RANDOM,
          afterMovesCount: options.shuffleOptions.afterMovesCount,
          cardsCount,
        },
      });
    },
    [changeOptions, options],
  );

  return (
    <Flex direction="column" between={3}>
      <Select
        label="Сет"
        value={options.set}
        options={Object.values(SetType).map((set) => ({
          value: set,
          text: set,
          disabled: !areOptionsValid({ set }),
        }))}
        onChange={handleSetChange}
      />

      <Select
        label="Количество совпадающих карточек"
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
        value={options.layout}
        options={Object.values(FieldLayoutType).map((layout) => ({
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
            value={options.shuffleOptions.type}
            options={[
              {
                text: 'перевернутые только что карточки',
                value: ShuffleType.TURNED,
              },
              {
                text: (
                  <>
                    случайные{' '}
                    <Select
                      className={styles.shuffleCardsCountSelect}
                      value={shuffleCardsCount}
                      options={SHUFFLE_CARDS_COUNTS.map((cardsCount) => ({
                        value: cardsCount,
                        text: cardsCount,
                      }))}
                      onChange={handleShuffleCardsCountChange}
                    />{' '}
                    {shuffleCardsCount > 4 ? 'карточек' : 'карточки'}
                  </>
                ),
                value: ShuffleType.RANDOM,
              },
            ]}
            onChange={handleShuffleTypeChange}
          />

          <div className={styles.shuffleAfterMovesCount}>
            {options.shuffleOptions.afterMovesCount === 1 ? 'каждый' : 'каждые'}{' '}
            <Select
              className={styles.shuffleAfterMovesCountSelect}
              value={options.shuffleOptions.afterMovesCount}
              options={SHUFFLE_AFTER_MOVES_COUNTS.map((afterMovesCount) => ({
                value: afterMovesCount,
                text: afterMovesCount,
              }))}
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

export default React.memo(PexesoCreateGameOptions);
