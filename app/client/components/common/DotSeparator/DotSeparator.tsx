import React from 'react';

import styles from './DotSeparator.pcss';

const DotSeparator: React.FC = () => {
  return <span className={styles.root}>{'  •  '}</span>;
};

export default React.memo(DotSeparator);
