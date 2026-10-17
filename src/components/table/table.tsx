import { PropsWithChildren } from 'react';
import './table.scss';
import clsx from 'clsx';

type Props = {
  headers: string[];
  className?: string;
};

export function Table({
  headers,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="bh-table-scroll">
      <table className={clsx('bh-table', className)}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
