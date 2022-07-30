import { FC, memo } from 'react';

import { MAP_NAMES } from 'common/constants/games/bombers';

import { EGame } from 'common/types/game';
import { EMap } from 'common/types/bombers';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Flex from 'client/components/common/Flex/Flex';
import Select from 'client/components/common/Select/Select';
import RadioGroup from 'client/components/common/RadioGroup/RadioGroup';

import { ICreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

type TMapType = EMap | 'random';

const MAP_TYPES: TMapType[] = ['random', ...Object.values(EMap)];

const BombersCreateGameOptions: FC<ICreateGameOptionsProps<EGame.BOMBERS>> = (props) => {
  const { options, changeOptions } = props;

  const handleMapChange = useImmutableCallback((mapType: TMapType) => {
    changeOptions({
      mapType: mapType === 'random' ? null : mapType,
    });
  });

  const handleWithAbilitiesChange = useImmutableCallback((withAbilities: boolean) => {
    changeOptions({
      withAbilities,
    });
  });

  return (
    <Flex direction="column" between={3}>
      <Select
        label="Карта"
        value={options.mapType ?? 'random'}
        options={MAP_TYPES.map((mapType) => ({
          text: mapType === 'random' ? 'Случайная' : MAP_NAMES[mapType],
          value: mapType,
        }))}
        onChange={handleMapChange}
      />

      <RadioGroup
        value={options.withAbilities}
        options={[true, false].map((value) => ({ text: value ? 'Со способностями' : 'Без способностей', value }))}
        onChange={handleWithAbilitiesChange}
      />
    </Flex>
  );
};

export default memo(BombersCreateGameOptions);
