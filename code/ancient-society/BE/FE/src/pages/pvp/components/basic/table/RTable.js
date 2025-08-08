import './rtable.scss';

import {
  useEffect,
  useMemo,
} from 'react';

import {
  usePagination,
  useTable,
} from 'react-table';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import RPaginationPanel from './RPaginationPanel';

function RTable({ className, style, columns, data, userLeague, tabName, RPageSize, setPage, onRowClick, address }) {

  // basic attr className|style
  const RClassName = useMemo(() => className, [className])
  const RStyle = useMemo(() => { return { ...style } }, [style])

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    headerGroups,
    page,
    prepareRow,
    setHiddenColumns,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable({
    columns,
    data,
    initialState: { pageIndex: setPage, pageSize: RPageSize },
  }, usePagination)

  //Hidden Columns
  useEffect(() => {
    setHiddenColumns(
      columns.filter(column => column.hidden).map(column => column.accessor)
    );
  }, [setHiddenColumns, columns]);
  // Render the UI for your table
  return (<>
    <div className={`rtable ${RClassName || ""}`} style={RStyle || {}}>
      <div className='rtable-body'>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableCell {...column.getHeaderProps([
                    { className: column.className },
                  ])}>
                    {column.render('Header')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {page.length == 0 ?
              <tr>
                <td className='empty-row' colSpan={7}>No display data.</td>
              </tr>
              : page.map((row, i) => {
                prepareRow(row)
                return (
                  <TableRow className={row.original?.isUser ? 'my-info' : ''} {...row.getRowProps([
                    { onClick: () => { onRowClick(row.values) } }
                  ])}>
                    {row.cells.map(cell => {
                      return (
                        <TableCell {...cell.getCellProps()}>
                          {cell.render('Cell')}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      {/* Customized Pagination Bar */}
      {page.length != 0 && <RPaginationPanel canPreviousPage={canPreviousPage} canNextPage={canNextPage} onNext={nextPage} onPrev={previousPage} totalCount={data.length} pageIndex={pageIndex} pageSize={pageSize} />}
    </div>
  </>
  )
}

export default RTable