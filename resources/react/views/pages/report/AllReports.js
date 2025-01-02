import { CButton, CFormSelect, CTabs, CTabList, CTabPanel, CTabContent, CTab, CFormInput } from '@coreui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { Year, Custom, Months, Quarter, Week } from './Dates';
import { getAPICall } from '../../../util/api';
import All_Tables from './AllTables';
import { Button,Dropdown } from '/resources/react/views/pages/report/ButtonDropdowns';
import { MantineProvider } from '@mantine/core';
import { useToast } from '../../common/toast/ToastContext';

function All_Reports() {
  const [selectedOption, setSelectedOption] = useState('3');
  const [stateCustom, setStateCustom] = useState({ start_date: '', end_date: '' });
  const [stateMonth, setStateMonth] = useState({ start_date: '', end_date: '' });
  const [stateQuarter, setStateQuarter] = useState({ start_date: '', end_date: '' });
  const [stateYear, setStateYear] = useState({ start_date: '', end_date: '' });
  const [activeTab1, setActiveTab] = useState('Year');
  const [stateWeek, setStateWeek] = useState({ start_date: '', end_date: '' });
  const { showToast } = useToast();
  
  const ReportOptions = [
    { label: 'Sales', value: '1' },
    { label: 'Expense', value: '2' },
    { label: 'Profit & Loss', value: '3' },
  ];

  //for Sales Report 
  const [salesData, setSalesData] = useState({
    data: [],
    totalSales: 0,
    totalPaid: 0,
    totalRemaining: 0
  });

  //for Expence Report
  const [expenseData, setExpenseData] = useState({
    data: [],
    totalExpense: 0
  });
  const [expenseType, setExpenseType] = useState({})

  //Profit & Loss
  const [pnlData, setPnLData] = useState({
    Data: [],
    totalSales: 0,
    totalExpenses: 0,
    totalProfitOrLoss: 0
  });

  const handleTabChange = (value) => {
   
    setActiveTab(value);
  
  };

  const fetchReportData = async() => {
    try {
      let date = {};
      let rawSalesData = [];
      let rawExpenseData = [];
      switch (activeTab1) {
        case 'Custom':
          date = stateCustom;
          break;
        case 'Month':
          date = stateMonth;
          break;
        case 'Quarter':
          date = stateQuarter;
          break;
        case 'Year':
          date = stateYear;
          break;
        case 'Week':
          date = stateWeek;
          break;
        default:
          break;
      }

      if (!date.start_date || !date.end_date) {
        alert("Please select dates before fetching data.");
        return;
      }
      if (selectedOption === '1' || selectedOption === '3') {
        const resp = await getAPICall(
          '/api/reportSales?startDate=' + date.start_date + '&endDate=' + date.end_date,
        )
        if (resp) {
          const groupedSales = resp.reduce((acc, sale) => {
            if (!acc[sale.invoiceDate]) {
              acc[sale.invoiceDate] = {
                invoiceDate: sale.invoiceDate,
                totalAmount: 0,
                paidAmount: 0,
              }
            }
            acc[sale.invoiceDate].totalAmount += sale.totalAmount
            acc[sale.invoiceDate].paidAmount += sale.paidAmount
            return acc
          }, {})

          const salesArray = Object.values(groupedSales).map(sale => ({
            ...sale,
            totalAmount: Math.round(sale.totalAmount),
            paidAmount: Math.round(sale.paidAmount),
            remainingAmount: Math.round(sale.totalAmount - sale.paidAmount)
          }))

          //TODO: Samir to fix this raw sales data mapping
          rawSalesData = [...salesArray];
          const totalSales = salesArray.reduce((acc, current) => acc + current.totalAmount, 0)
          const totalPaid = salesArray.reduce((acc, current) => acc + current.paidAmount, 0)
          const totalRemaining = salesArray.reduce((acc, current) => acc + current.remainingAmount, 0)
          setSalesData((prev) => {
            return {
              ...prev,
              data: salesArray,
              totalSales: Math.round(totalSales),
              totalPaid: Math.round(totalPaid),
              totalRemaining: Math.round(totalRemaining)
            }
          })
          
        } else {
          showToast('danger', 'Failed to fetch records');
        }
      }

      if (selectedOption === '2' || selectedOption === '3') {
        const resp = await getAPICall(
          '/api/expense?startDate=' + date.start_date + '&endDate=' + date.end_date,
        )

        if (resp) {
          rawExpenseData = [...resp];
          const totalExp = resp.reduce((acc, current) => {
            if (current.show) {
              return acc + current.total_price
            }
            return acc
          }, 0)
          setExpenseData(prev => {
            return {
              ...prev,
              data: resp,
              totalExpense: Math.round(totalExp)
            }
          })

          // Grouping expenses by expense_date and summing total_price
          const groupedExpenses = resp.reduce((acc, expense) => {
            if (!acc[expense.expense_date]) {
              acc[expense.expense_date] = {
                expense_date: expense.expense_date,
                totalExpense: 0,
              }
            }
            acc[expense.expense_date].totalExpense += expense.total_price
            return acc
          }, {})

          const expensesArray = Object.values(groupedExpenses)

        } else {
          showToast('danger', 'Failed to fetch records');
        }

      }

      if (selectedOption === '3') {
        calculatePnL(rawExpenseData, rawSalesData);
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };
 
  const calculatePnL = (rawExpenseData, rawSalesData) => {
    try {
      const combinedData = [...rawExpenseData, ...rawSalesData]
      const groupedData = combinedData.reduce((acc, entry) => {
        const date = entry.invoiceDate || entry.expense_date
        if (!acc[date]) {
          acc[date] = {
            date,
            totalSales: 0,
            totalExpenses: 0,
          }
        }
        if (entry.totalAmount) {
          acc[date].totalSales += entry.totalAmount
        }
        if (entry.total_price) {
         
          acc[date].totalExpenses += entry.total_price;
        }
        ;
        return acc
      }, {})

      // Convert the grouped data into an array and calculate profit or loss
      const pnlData = Object.values(groupedData).map(data => ({
        ...data,
        profitOrLoss: data.totalSales - data.totalExpenses,
      }));
  
      // Calculate total sales, expenses, and profit/loss
      const totalSales = pnlData.reduce((acc, current) => acc + current.totalSales, 0);
      const totalExpenses = pnlData.reduce((acc, current) => acc + current.totalExpenses, 0);
      const totalProfitOrLoss = pnlData.reduce((acc, current) => acc + current.profitOrLoss, 0);
  
      // Set the PnL data
      setPnLData(prev => ({
        ...prev,
        Data: pnlData,
        totalSales: totalSales,
        totalExpenses: totalExpenses,
        totalProfitOrLoss: totalProfitOrLoss,
      }));
    } catch (error) {
      showToast('danger',error.message);
    }
  }
  
  return (
    <>
     <MantineProvider withGlobalStyles withNormalizeCSS>
      <CTabs activeItemKey={activeTab1} onChange={handleTabChange}>
        <CTabList variant="tabs">
          <CTab itemKey="Year">Year</CTab>
          <CTab itemKey="Quarter">Quarter</CTab>
          <CTab itemKey="Month">Month</CTab>
          <CTab itemKey="Week">Week</CTab>
          <CTab itemKey="Custom" default>Custom</CTab>
        </CTabList>
  <CTabContent>

  <CTabPanel className="p-3" itemKey="Custom">

  <div className="d-flex mb-3 justify-content-between ">
  <div className="d-flex mx-1">
    <Custom setStateCustom={setStateCustom} />

    <div className="flex-fill mx-2 mt-1 col-sm-3">
      <h1></h1>
      <br/>
     
    
    <Dropdown
      setSelectedOption={setSelectedOption}
      ReportOptions={ReportOptions}
      selectedOption={selectedOption}
    />
    </div>
  </div>

  <div className="flex-fill px-0 mt-1  ">
  <h1></h1>
  <br/>
  <Button fetchReportData={fetchReportData} />
  </div>
  </div>

<div className="mt-3">
  <All_Tables
    selectedOption={selectedOption}
    salesData={salesData}
    expenseData={expenseData}
    pnlData={pnlData}
    expenseType={expenseType}
  />
</div>

</CTabPanel>
 <CTabPanel className="p-3" itemKey="Week">
   
    <div className="d-flex mb-3 m">

    <Week setStateWeek={setStateWeek}/>
      <div className='mx-1 '>
      <Dropdown
          setSelectedOption={setSelectedOption}
          ReportOptions={ReportOptions}
          selectedOption={selectedOption}
          fetchReportData={fetchReportData}
        />

      </div>
        
        <div className='mx-1 '>

<Button fetchReportData={fetchReportData}/>
        </div>
         
      </div>
      <div className="mt-3">
      
        <All_Tables
          selectedOption={selectedOption}
          salesData={salesData}
          expenseData={expenseData}
          pnlData={pnlData}
          expenseType={expenseType}
        />
      </div>
             
</CTabPanel>

<CTabPanel className="p-3" itemKey="Month">
<div className="d-flex mb-3 justify-content-between">
  <div className="flex-fill mx-1">
    <Months setStateMonth={setStateMonth} />
  </div>
  <div className="flex-fill mx-1">
    <Dropdown
      setSelectedOption={setSelectedOption}
      ReportOptions={ReportOptions}
      selectedOption={selectedOption}
    />
  </div>
  <div className="flex-fill mx-1">
    <Button fetchReportData={fetchReportData} />
  </div>
</div>

      <div className="mt-3">
        <All_Tables
          selectedOption={selectedOption}
          salesData={salesData}
          expenseData={expenseData}
          pnlData={pnlData}
          expenseType={expenseType}
        />
      </div>
</CTabPanel>

 <CTabPanel className="p-3" itemKey="Quarter">
           
     <div className="d-flex mb-3 col-md-10">
     <Quarter  setStateQuarter={setStateQuarter} />
        <Dropdown
          setSelectedOption={setSelectedOption}
          ReportOptions={ReportOptions}
          selectedOption={selectedOption}
          fetchReportData={fetchReportData}
        />
        <div className='px-2'>
        <Button fetchReportData={fetchReportData}/>
        </div>
        
         
      </div>
      <div className="mt-3">
        <All_Tables
          selectedOption={selectedOption}
          salesData={salesData}
          expenseData={expenseData}
          pnlData={pnlData}
          expenseType={expenseType}
        />
      </div>
  </CTabPanel>

  <CTabPanel className="p-3" itemKey="Year">
      <div className="d-flex mb-3 m">

      <Year setStateYear={setStateYear} />
      <div className='mx-1 mt-2'>
      <Dropdown
          setSelectedOption={setSelectedOption}
          ReportOptions={ReportOptions}
          selectedOption={selectedOption}
          fetchReportData={fetchReportData}
        />

      </div>
        
        <div className='mx-1 mt-2'>

<Button fetchReportData={fetchReportData}/>
        </div>
         
      </div>
      <div className="mt-3">
        <All_Tables
          selectedOption={selectedOption}
          salesData={salesData}
          expenseData={expenseData}
          pnlData={pnlData}
          expenseType={expenseType}
        />
      </div>
    </CTabPanel>
   </CTabContent>
  </CTabs>
  </MantineProvider>
      
    </>
  );
}

export default All_Reports;
