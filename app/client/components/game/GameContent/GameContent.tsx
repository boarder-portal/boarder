import { ComponentType, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import urls from 'client/constants/urls';

import typedReactMemo from 'client/types/typedReactMemo';
import { GameType } from 'common/types/game';

import { isFullscreenSupported, isInFullscreen, isScreenOrientationSupported } from 'client/utilities/browser';

import useBoolean from 'client/hooks/useBoolean';
import useGlobalListener from 'client/hooks/useGlobalListener';

import Flex from 'client/components/common/Flex/Flex';
import IconButton from 'client/components/common/IconButton/IconButton';
import Modal from 'client/components/common/Modal/Modal';
import Overlay from 'client/components/common/Overlay/Overlay';
import { BaseIconProps } from 'client/components/common/icons/BaseIcon/BaseIcon';
import CrossIcon from 'client/components/common/icons/CrossIcon/CrossIcon';
import FullscreenExitIcon from 'client/components/common/icons/FullscreenExitIcon/FullscreenExitIcon';
import FullscreenIcon from 'client/components/common/icons/FullscreenIcon/FullscreenIcon';
import SettingsIcon from 'client/components/common/icons/SettingsIcon/SettingsIcon';
import { GameStateContext } from 'client/components/game/Game/contexts';

import styles from './GameContent.module.scss';

interface GameContentProps<Game extends GameType> {
  game: Game;
  fullscreenOrientation?: OrientationType | 'landscape' | 'primary';
  toolbarButtons?: (ToolbarButton | null | undefined | false)[];
  children?: ReactNode;
  settings?: ReactNode;
}

export interface ToolbarButton {
  icon: ComponentType<BaseIconProps>;
  onClick(): void;
}

const GameContent = <Game extends GameType>(props: GameContentProps<Game>) => {
  const { game, fullscreenOrientation, toolbarButtons, children, settings } = props;

  const [inFullscreen, setInFullscreen] = useState(isInFullscreen());
  const { value: settingsModalOpen, setTrue: openSettingsModal, setFalse: closeSettingsModal } = useBoolean(false);

  const gameState = useContext(GameStateContext);
  const navigate = useNavigate();

  const fullscreenSupported = useMemo(() => isFullscreenSupported(), []);
  const screenOrientationSupported = useMemo(() => isScreenOrientationSupported(), []);

  const toggleFullscreen = useCallback(async () => {
    if (inFullscreen) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  }, [inFullscreen]);

  const navigateToLobby = useCallback(() => {
    navigate(urls.getLobbyUrl(game));
  }, [game, navigate]);

  const hasSettings = Boolean(settings);

  const allToolbarButtons = useMemo<(ToolbarButton | null | undefined | false)[]>(() => {
    return [
      ...(toolbarButtons ?? []),
      fullscreenSupported && {
        icon: inFullscreen ? FullscreenExitIcon : FullscreenIcon,
        onClick: toggleFullscreen,
      },
      hasSettings && {
        icon: SettingsIcon,
        onClick: openSettingsModal,
      },
      {
        icon: CrossIcon,
        onClick: navigateToLobby,
      },
    ];
  }, [
    fullscreenSupported,
    hasSettings,
    inFullscreen,
    navigateToLobby,
    openSettingsModal,
    toggleFullscreen,
    toolbarButtons,
  ]);

  useGlobalListener('fullscreenchange', document, () => {
    setInFullscreen(isInFullscreen());
  });

  useEffect(() => {
    if (!fullscreenOrientation || !inFullscreen || !screenOrientationSupported) {
      return;
    }

    screen.orientation.lock(fullscreenOrientation).catch(() => {});

    return () => {
      screen.orientation.unlock();
    };
  }, [fullscreenOrientation, inFullscreen, screenOrientationSupported]);

  return (
    <div className={styles.root}>
      <Flex className={styles.content} direction="column">
        {children}
      </Flex>

      <div className={styles.toolbar}>
        {allToolbarButtons.map(
          (button, index) =>
            button && (
              <IconButton key={index} size="s" onClick={button.onClick}>
                <button.icon />
              </IconButton>
            ),
        )}
      </div>

      <Overlay contentClassName={styles.pauseContent} open={gameState.type === 'paused'}>
        Пауза
      </Overlay>

      {hasSettings && (
        <Modal open={settingsModalOpen} title="Настройки" onClose={closeSettingsModal}>
          {settings}
        </Modal>
      )}
    </div>
  );
};

export default typedReactMemo(GameContent);
