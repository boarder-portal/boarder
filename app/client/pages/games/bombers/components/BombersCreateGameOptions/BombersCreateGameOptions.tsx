import { FC, memo } from 'react';

import { MAP_NAMES } from 'common/constants/games/bombers';

import { MapType } from 'common/types/bombers';
import { GameType } from 'common/types/game';

import useImmutableCallback from 'client/hooks/useImmutableCallback';

import Flex from 'client/components/common/Flex/Flex';
import RadioGroup from 'client/components/common/RadioGroup/RadioGroup';
import Select from 'client/components/common/Select/Select';

import { CreateGameOptionsProps } from 'client/pages/Lobby/Lobby';

type SelectMapType = MapType | 'random';

const MAP_TYPES: SelectMapType[] = ['random', ...Object.values(MapType)];

const BombersCreateGameOptions: FC<CreateGameOptionsProps<GameType.BOMBERS>> = (props) => {
  const { options, changeOptions } = props;

  const handleMapChange = useImmutableCallback((mapType: SelectMapType) => {
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
