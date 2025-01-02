import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { getAPICall } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext';

const PnLReport = () => {
  const [state, setState] = useState({
    start_date: '',
    end_date: '',
  })
  const [pnlData, setPnLData] = useState([])
  const [validated, setValidated] = useState(false)
  const [totalSales, setTotalSales] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalProfitOrLoss, setTotalProfitOrLoss] = useState(0)
  const { showToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const fetchSales = async () => {
    try {
      const resp = await getAPICall(
        `/api/reportSales?startDate=${state.start_date}&endDate=${state.end_date}`
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

        return Object.values(groupedSales).map(sale => ({
          ...sale,
          remainingAmount: sale.totalAmount - sale.paidAmount
        }))
      } else {
        showToast('danger', 'Failed to fetch sales records');
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const fetchExpenses = async () => {
    try {
      const resp = await getAPICall(
        `/api/expense?startDate=${state.start_date}&endDate=${state.end_date}`
      )
      if (resp) {
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

        return Object.values(groupedExpenses)
      } else {
        showToast('danger', 'Failed to fetch expense records');
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const fetchPnL = async () => {
    try {
      const sales = await fetchSales()
      const expenses = await fetchExpenses()

      const combinedData = [...sales, ...expenses]
     
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
        if (entry.totalExpense) {
         acc[date].totalExpenses += entry.totalExpense
        }
        return acc
      }, {})

      const pnlData = Object.values(groupedData).map(data => ({
        ...data,
        profitOrLoss: data.totalSales - data.totalExpenses,
      }))

      const totalSales = pnlData.reduce((acc, current) => acc + current.totalSales, 0)
      const totalExpenses = pnlData.reduce((acc, current) => acc + current.totalExpenses, 0)
      const totalProfitOrLoss = pnlData.reduce((acc, current) => acc + current.profitOrLoss, 0)

      setPnLData(pnlData)
      setTotalSales(totalSales)
      setTotalExpenses(totalExpenses)
      setTotalProfitOrLoss(totalProfitOrLoss)
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    setValidated(true)
    if (event.currentTarget.checkValidity()) {
      await fetchPnL()
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Profit and Loss Report</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} noValidate validated={validated}>
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-1">
                    <CFormLabel htmlFor="start_date">Start Date</CFormLabel>
                    <CFormInput
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={state.start_date}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please select date."
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-1">
                    <CFormLabel htmlFor="end_date">End Date</CFormLabel>
                    <CFormInput
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={state.end_date}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please select date."
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-1 mt-4">
                    <CButton color="success" type="submit">
                      Submit
                    </CButton>
                  </div>
                </div>
              </div>
            </CForm>
            <hr />
            <div className='table-responsive'>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Total Sales</CTableHeaderCell>
                    <CTableHeaderCell>Total Expenses</CTableHeaderCell>
                    <CTableHeaderCell>Profit/Loss</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {pnlData.map((data, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{data.date}</CTableDataCell>
                      <CTableDataCell>{data.totalSales}</CTableDataCell>
                      <CTableDataCell>{data.totalExpenses}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={data.profitOrLoss >= 0 ? 'success' : 'danger'}>
                          {data.profitOrLoss}
                        </CBadge>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  <CTableRow>
                    <CTableHeaderCell>Total</CTableHeaderCell>
                    <CTableHeaderCell>{totalSales}</CTableHeaderCell>
                    <CTableHeaderCell>{totalExpenses}</CTableHeaderCell>
                    <CTableHeaderCell>
                      <CBadge color={totalProfitOrLoss >= 0 ? 'success' : 'danger'}>
                        {totalProfitOrLoss}
                      </CBadge>
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PnLReport
