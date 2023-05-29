"use client";

import { FC } from "react";
import { Table as T } from "@geist-ui/core";
type TableOnRowClick<T> = (rowData: T, rowIndex: number) => void
interface TableProps {
  tableData: any;
  tableColumn: TableColumnType[];
  onClick: TableOnRowClick<any>;
}

export interface TableColumnType {
  prop: string;
  label: string;
  render?: any;
}

export const Table: FC<TableProps> = (props) => {
  return (
    <T data={props.tableData} onRow={props.onClick}>
      {props.tableColumn.map((column) => (
        <T.Column
          key={column.label}
          prop={column.prop}
          label={column.label}
          render={column?.render}
        />
      ))}
    </T>
  );
};
