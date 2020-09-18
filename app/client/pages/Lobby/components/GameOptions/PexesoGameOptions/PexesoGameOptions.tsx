import React, { useCallback } from 'react';

import { EPexesoSet, IPexesoRoomOptions } from 'common/types/pexeso';

import Box from 'client/components/common/Box/Box';
import Select from 'client/components/common/Select/Select';

interface IPexesoGameOptionsProps {
  options: IPexesoRoomOptions;
  onOptionsChange(options: IPexesoRoomOptions): void;
}

const PexesoGameOptions: React.FC<IPexesoGameOptionsProps> = (props) => {
  const { options, onOptionsChange } = props;

  const handleSetChange = useCallback((updatedSet: EPexesoSet) => {
    onOptionsChange({
      set: updatedSet,
    });
  }, [onOptionsChange]);

  return (
    <Box>
      <Select
        label="Сет"
        name="pexesoSet"
        value={options.set}
        options={Object.values(EPexesoSet).map((name) => ({
          value: name,
          text: name,
        }))}
        onChange={handleSetChange as any}
      />
    </Box>
  );
};

export default React.memo(PexesoGameOptions);
