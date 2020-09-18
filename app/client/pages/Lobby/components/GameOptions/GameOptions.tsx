import React from 'react';

import { EGame } from 'common/types';
import { IPexesoRoomOptions } from 'common/types/pexeso';

import PexesoGameOptions from 'client/pages/Lobby/components/GameOptions/PexesoGameOptions/PexesoGameOptions';

interface IGameOptionsProps {
  game: EGame;
  options: IPexesoRoomOptions;
  onOptionsChange(options: IPexesoRoomOptions): void;
}

const GameOptions: React.FC<IGameOptionsProps> = (props) => {
  const { game, options, onOptionsChange } = props;

  if (game === EGame.PEXESO) {
    return (
      <PexesoGameOptions
        options={options}
        onOptionsChange={onOptionsChange}
      />
    );
  }

  return null;
};

export default React.memo(GameOptions);
