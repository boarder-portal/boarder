import { AllHTMLAttributes, FC, memo } from 'react';
import classNames from 'classnames';

import styles from './TableCell.pcss';

interface ITableCellProps extends AllHTMLAttributes<HTMLTableCellElement> {}

const TableCell: FC<ITableCellProps> = (props) => {
  const { children, className, ...rest } = props;

  return (
    <td className={classNames(styles.root, className)} {...rest}>
      {children}
    </td>
  );
};

export default memo(TableCell);
