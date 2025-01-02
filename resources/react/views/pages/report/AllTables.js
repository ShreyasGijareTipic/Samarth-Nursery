import React from 'react';
import { MantineReactTable,useMantineReactTable } from 'mantine-react-table';
import { CBadge } from '@coreui/react';

function All_Tables({ selectedOption, salesData, expenseData, pnlData, expenseType }) {
  const salesColumns = [
    { accessorKey: 'invoiceDate', header: 'Invoice Date' },
    { accessorKey: 'totalAmount', header: 'Total Amount' },
    { accessorKey: 'paidAmount', header: 'Paid Amount' },
    { accessorKey: 'remainingAmount', header: 'Remaining Amount' },
  ];

  const expenseColumns = [
  
    { accessorKey: 'expense_date', header: 'Date' },

    { accessorKey: 'name', header: 'Details' },
    { accessorKey: 'qty', header: 'Quantity' },
    { accessorKey: 'price', header: 'Price Per Unit' },
    { accessorKey: 'total_price', header: 'Total Cost' },

  ];

  const pnlColumns = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'totalSales', header: 'Total Sales' },
    { accessorKey: 'totalExpenses', header: 'Total Expenses' },
    {
      accessorKey: 'profitOrLoss',
      header: 'Profit/Loss',
      Cell: ({ cell }) => (
        <CBadge color={cell.getValue() >= 0 ? 'success' : 'danger'}>
          {cell.getValue()}
        </CBadge>
      ),
    },
  ];

  return (
    <div>
      {selectedOption === '1' && (
        <MantineReactTable columns={salesColumns} data={salesData.data} enableFullScreenToggle={false}/>
      )}
      {selectedOption === '2' && (
        <MantineReactTable columns={expenseColumns} data={expenseData.data} enableFullScreenToggle={false}/>
      )}
      {selectedOption === '3' && (
        <MantineReactTable columns={pnlColumns} data={pnlData.Data} enableFullScreenToggle={false} />
      )}
    </div>
  );
}

export default All_Tables;
