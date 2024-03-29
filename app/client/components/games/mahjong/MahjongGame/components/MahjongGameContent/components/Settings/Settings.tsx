import { FC, memo } from 'react';

import { GameType } from 'common/types/game';
import { Player } from 'common/types/games/mahjong';

import usePlayerSettings from 'client/components/game/Game/hooks/usePlayerSettings';

import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Flex from 'client/components/common/Flex/Flex';

export interface SettingsProps {
  player: Player | null;
}

const Settings: FC<SettingsProps> = (props) => {
  const { player } = props;

  const { settings, changeSetting } = usePlayerSettings(GameType.MAHJONG);

  return (
    <Flex direction="column" between={5}>
      <Flex direction="column" between={1}>
        {player && (
          <>
            <Checkbox
              checked={settings.autoPass}
              label="Авто-пас"
              onChange={(checked) => changeSetting('autoPass', checked)}
            />

            <Checkbox
              checked={settings.autoReplaceFlowers}
              label="Авто-замена цветов"
              onChange={(checked) => changeSetting('autoReplaceFlowers', checked)}
            />

            <Checkbox
              checked={settings.sortHand}
              label="Авто-сортировка руки"
              onChange={(checked) => changeSetting('sortHand', checked)}
            />

            <Checkbox
              checked={settings.showLosingHand}
              label="Показывать проигрышную руку"
              onChange={(checked) => changeSetting('showLosingHand', checked)}
            />

            <Checkbox
              checked={settings.showCurrentTile}
              label="Показывать текущую кость"
              onChange={(checked) => changeSetting('showCurrentTile', checked)}
            />
          </>
        )}

        <Checkbox
          checked={settings.showTileHints}
          label="Показывать значения костей"
          onChange={(checked) => changeSetting('showTileHints', checked)}
        />

        <Checkbox
          checked={settings.highlightSameTile}
          label="Подсвечивать идентичные кости"
          onChange={(checked) => changeSetting('highlightSameTile', checked)}
        />
      </Flex>
    </Flex>
  );
};

export default memo(Settings);
