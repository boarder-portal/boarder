import { AllHTMLAttributes, FC, memo } from 'react';

interface ITableRowProps extends AllHTMLAttributes<HTMLTableRowElement> {}

const TableRow: FC<ITableRowProps> = (props) => {
  const { children, ...rest } = props;

  return <tr {...rest}>{children}</tr>;
};

export default memo(TableRow);
