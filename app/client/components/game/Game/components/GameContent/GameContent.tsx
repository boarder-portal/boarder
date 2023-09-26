import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import typedReactMemo from 'client/types/typedReactMemo';
import { GameInfo, GameOptions, GameResult, GameState, GameType } from 'common/types/game';
import { GameClientSocket } from 'common/types/socket';

import { isFullscreenSupported, isScreenOrientationSupported } from 'client/utilities/browser';

import usePlayerSettings from 'client/components/game/Game/hooks/usePlayerSettings';
import useBoolean from 'client/hooks/useBoolean';
import useGlobalListener from 'client/hooks/useGlobalListener';

import Flex from 'client/components/common/Flex/Flex';
import IconButton from 'client/components/common/IconButton/IconButton';
import Modal from 'client/components/common/Modal/Modal';
import Overlay from 'client/components/common/Overlay/Overlay';
import CrossIcon from 'client/components/common/icons/CrossIcon/CrossIcon';
import FullscreenExitIcon from 'client/components/common/icons/FullscreenExitIcon/FullscreenExitIcon';
import FullscreenIcon from 'client/components/common/icons/FullscreenIcon/FullscreenIcon';
import SettingsIcon from 'client/components/common/icons/SettingsIcon/SettingsIcon';
import { GameProps, ToolbarButton } from 'client/components/game/Game/Game';

import styles from './GameContent.module.scss';

interface GameContentProps<Game extends GameType> {
  game: Game;
  io: GameClientSocket<Game>;
  gameOptions: GameOptions<Game>;
  gameInfo: GameInfo<Game>;
  gameResult: GameResult<Game> | null;
  gameState: GameState;
  fullscreenOrientation?: GameProps<Game>['fullscreenOrientation'];
  toolbarButtons?: GameProps<Game>['toolbarButtons'];
  renderContent: GameProps<Game>['renderGameContent'];
  renderSettings?: GameProps<Game>['renderSettings'];
}

const GameContent = <Game extends GameType>(props: GameContentProps<Game>) => {
  const {
    game,
    io,
    gameOptions,
    gameInfo,
    gameResult,
    gameState,
    fullscreenOrientation,
    toolbarButtons,
    renderContent: Content,
    renderSettings: Settings,
  } = props;

  const [inFullscreen, setInFullscreen] = useState(false);
  const { value: settingsModalOpen, setTrue: openSettingsModal, setFalse: closeSettingsModal } = useBoolean(false);

  const history = useHistory();

  const settingsContext = usePlayerSettings(game);

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
    history.push(`/${game}/lobby`);
  }, [game, history]);

  const settings = useMemo(() => {
    if (!Settings) {
      return null;
    }

    return <Settings gameInfo={gameInfo} {...settingsContext} />;
  }, [Settings, gameInfo, settingsContext]);

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
    setInFullscreen(Boolean(document.fullscreenElement));
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
        <Content io={io} gameOptions={gameOptions} gameInfo={gameInfo} gameResult={gameResult} gameState={gameState} />
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
