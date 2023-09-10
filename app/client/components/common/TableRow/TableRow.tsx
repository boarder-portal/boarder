import { AllHTMLAttributes, FC, memo } from 'react';

interface TableRowProps extends AllHTMLAttributes<HTMLTableRowElement> {}

const TableRow: FC<TableRowProps> = (props) => {
  const { children, ...rest } = props;

  return <tr {...rest}>{children}</tr>;
};

export default memo(TableRow);
