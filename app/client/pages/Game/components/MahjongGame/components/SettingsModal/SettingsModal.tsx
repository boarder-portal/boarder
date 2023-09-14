import { FC, memo } from 'react';

import { GameType } from 'common/types/game';
import { Player } from 'common/types/games/mahjong';

import usePlayerSettings from 'client/pages/Game/hooks/usePlayerSettings';

import Checkbox from 'client/components/common/Checkbox/Checkbox';
import Flex from 'client/components/common/Flex/Flex';
import Modal from 'client/components/common/Modal/Modal';
import Text from 'client/components/common/Text/Text';

import { ChangeSettingCallback } from 'client/pages/Game/Game';

interface SettingsModalProps {
  open: boolean;
  player: Player | null;
  onClose(): void;
  changePlayerSetting: ChangeSettingCallback<GameType.MAHJONG>;
}

const SettingsModal: FC<SettingsModalProps> = (props) => {
  const { open, player, onClose, changePlayerSetting } = props;

  const settings = usePlayerSettings(GameType.MAHJONG);

  return (
    <Modal open={open} onClose={onClose}>
      <Flex direction="column" between={5}>
        <Text size="xxl" weight="bold">
          Настройки
        </Text>

        <Flex direction="column" between={1}>
          {player && (
            <>
              <Checkbox
                checked={settings.autoPass}
                label="Авто-пас"
                onChange={(checked) => changePlayerSetting('autoPass', checked)}
              />

              <Checkbox
                checked={settings.autoReplaceFlowers}
                label="Авто-замена цветов"
                onChange={(checked) => changePlayerSetting('autoReplaceFlowers', checked)}
              />

              <Checkbox
                checked={settings.sortHand}
                label="Авто-сортировка руки"
                onChange={(checked) => changePlayerSetting('sortHand', checked)}
              />

              <Checkbox
                checked={settings.showLosingHand}
                label="Показывать проигрышную руку"
                onChange={(checked) => changePlayerSetting('showLosingHand', checked)}
              />

              <Checkbox
                checked={settings.showCurrentTile}
                label="Показывать текущую кость"
                onChange={(checked) => changePlayerSetting('showCurrentTile', checked)}
              />
            </>
          )}

          <Checkbox
            checked={settings.showTileHints}
            label="Показывать значения костей"
            onChange={(checked) => changePlayerSetting('showTileHints', checked)}
          />

          <Checkbox
            checked={settings.highlightSameTile}
            label="Подсвечивать идентичные кости"
            onChange={(checked) => changePlayerSetting('highlightSameTile', checked)}
          />
        </Flex>
      </Flex>
    </Modal>
  );
};

export default memo(SettingsModal);
