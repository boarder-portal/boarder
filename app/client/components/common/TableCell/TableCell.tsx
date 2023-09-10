import classNames from 'classnames';
import { AllHTMLAttributes, FC, memo } from 'react';

import styles from './TableCell.module.scss';

interface TableCellProps extends AllHTMLAttributes<HTMLTableCellElement> {}

const TableCell: FC<TableCellProps> = (props) => {
  const { children, className, ...rest } = props;

  return (
    <td className={classNames(styles.root, className)} {...rest}>
      {children}
    </td>
  );
};

export default memo(TableCell);
