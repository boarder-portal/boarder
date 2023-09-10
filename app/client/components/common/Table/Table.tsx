import { AllHTMLAttributes, FC, memo, ReactNode } from 'react';
import classNames from 'classnames';

import TableRow from 'client/components/common/TableRow/TableRow';

import styles from './Table.module.scss';

interface ITableProps extends AllHTMLAttributes<HTMLTableElement> {
  className?: string;
  bordered?: boolean;
  fullWidth?: boolean;
  layout?: 'fixed' | 'auto';
  header?: ReactNode;
  footer?: ReactNode;
}

const Table: FC<ITableProps> = (props) => {
  const { className, children, bordered, fullWidth, layout = 'auto', header, footer, ...rest } = props;

  return (
    <table
      className={classNames(
        styles.root,
        styles[`layout_${layout}`],
        { [styles.bordered]: bordered, [styles.fullWidth]: fullWidth },
        className,
      )}
      {...rest}
    >
      {header && (
        <thead>
          <TableRow>{header}</TableRow>
        </thead>
      )}

      <tbody>{children}</tbody>

      {footer && (
        <tfoot>
          <TableRow>{footer}</TableRow>
        </tfoot>
      )}
    </table>
  );
};

export default memo(Table);
