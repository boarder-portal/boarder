import React from 'react';
import { useParams } from 'react-router-dom';

import { EGame } from 'common/types';

const Lobby: React.FC = () => {
  const { game } = useParams<{ game: EGame }>();

  return (
    <div>
      Игра тут
    </div>
  );
};

export default React.memo(Lobby);
