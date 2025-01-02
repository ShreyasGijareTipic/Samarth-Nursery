import './CustomerReport.css'
import { useTranslation } from 'react-i18next'
import React, { useState } from 'react'
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
import { generatePDFReport } from './CustomerReportPdf';
import CIcon from '@coreui/icons-react'
import { cilArrowCircleBottom, cilArrowCircleTop } from '@coreui/icons'
let debounceTimer;
const CustomerReport = () => {
  const [validated, setValidated] = useState(false)
  const [report, setReport] = useState([])
  const [groupReport, setGroupReport] = useState([])
  const [expandedRows, setExpandedRows] = useState({});
  const { showToast } = useToast();
  const { t, i18n } = useTranslation("global")
  const lng = i18n.language;
  const [state, setState] = useState({
    name: '',
    customer_id:'',
    start_date: '',
    end_date: '',
  })
  const [suggestions, setSuggestions] = useState([]);


  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const groupDataByCustomer = (data) => {
    const groupedData = {};
  
    data.forEach(item => {
      const customerName = item.customer.name;
      if (!groupedData[customerName]) {
        groupedData[customerName] = {
          customer: item.customer,
          totalPaid: 0,
          totalUnpaid: 0,
          grandTotal: 0,
          details: [],
          productTotals: {} // To hold product-wise quantities
        };
      }
  
      // Update totals
      groupedData[customerName].totalPaid += item.paidAmount;
      groupedData[customerName].totalUnpaid += (item.totalAmount - item.paidAmount);
      groupedData[customerName].grandTotal += item.totalAmount;
      groupedData[customerName].details.push(item);
  
      // Aggregate product quantities
      item.items.forEach(product => {
        const productName = lng === 'en' ? product.product_name : product.product_local_name; // or product.product_local_name based on your requirement
        if (!groupedData[customerName].productTotals[productName]) {
          groupedData[customerName].productTotals[productName] = {
            dQty: 0,
            eQty: 0
          };
        }
        groupedData[customerName].productTotals[productName].dQty += product.dQty;
        groupedData[customerName].productTotals[productName].eQty += product.eQty;
      });
    });
  
    return Object.values(groupedData);
  };

  const fetchReport = async () => {
    try {
      const reportData = await getAPICall(`/api/customerReport?id=${state.customer_id}&startDate=${state.start_date}&endDate=${state.end_date}`);
      if (reportData) {
        console.log(groupDataByCustomer(reportData));
        setGroupReport(groupDataByCustomer(reportData));
        setExpandedRows({});
        setReport(reportData);
      }else{
        setReport([]);
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  const handleSubmit = async (event) => {
    try {
      const form = event.currentTarget
      event.preventDefault()
      event.stopPropagation()
      setValidated(true)
      if (form.checkValidity()) {
        await fetchReport()
      }
    } catch (e) {
      showToast('danger', 'Error occured ' + error);
    }
  }


  const debounce = (func, delay) => {
      return function(...args) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
              func.apply(this, args);
          }, delay);
      };
  };

  const searchCustomer = async (value) => {
    try {
      const customers = await getAPICall('/api/searchCustomer?searchQuery=' + value);
      if (customers?.length) {
        setSuggestions(customers);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  // Wrap the searchCustomer function with debounce
  const debouncedSearchCustomer = debounce(searchCustomer, 200);

  const handleNameChange = (event) => {
    const value = event.target.value;
    setState((pre)=>({...pre, name: value, customer_id: value ? pre.customer_id : ''}));
    // Filter suggestions based on input
    if (value) {
      debouncedSearchCustomer(value)
    } else {
      setTimeout( ()=>setSuggestions([]),200);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setState((pre)=>({...pre, customer:suggestion, name: suggestion.name, customer_id: suggestion.id}))
    setSuggestions([]);
    setReport([]);
  };

  let grandTotalBill = 0;
  let grandTotalCollection = 0;
  const productTotals = {};

  const handleDownload = () => {
    if(report.length > 0){
      generatePDFReport(grandTotalBill, state, report, (grandTotalBill - grandTotalCollection));
    }else{
      showToast('danger', 'No report fetched to download');
    }
  };

  const formatDate = (dateString) => {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
      
      // Split the formatted date to rearrange it
      const [month, day, year] = formattedDate.split(' ');
      return `${day} ${month} ${year}`;
  };

  function convertTo12HourFormat(time) {
      // Split the time into hours and minutes
      let [hours, minutes] = time.split(':').map(Number);
      
      // Determine AM or PM suffix
      const suffix = hours >= 12 ? 'PM' : 'AM';
      
      // Convert hours from 24-hour format to 12-hour format
      hours = hours % 12 || 12; // Convert 0 to 12 for midnight

      // Return the formatted time
      return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  };

  const handleRowToggle = (customerName) => {
    console.log("Data:", customerName);
    setExpandedRows(prev => ({
      ...prev,
      [customerName]: !prev[customerName]
    }));
  };
  console.log("Reexecuted");

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t("LABELS.customer_report")}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
              <div className="row">
              <div className="col-sm-3">
                  <div className="mb-1">
                    <CFormLabel htmlFor="invoiceDate">{t("LABELS.customer_name")}</CFormLabel>
                    <CFormInput
                      type="text"
                      id="pname"
                      placeholder={t('MSG.enter_customer_name_msg')}
                      name="customerName"
                      value={state.name}
                      onChange={handleNameChange}
                      autoComplete='off'
                    />
                    {suggestions.length > 0 && (
                      <ul className="suggestions-list">
                        {suggestions.map((suggestion, index) => (
                          <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="mb-1">
                    <CFormLabel htmlFor="invoiceDate">{t('LABELS.start_date')}</CFormLabel>
                    <CFormInput
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={state.start_date}
                      onChange={handleChange}
                      required
                      feedbackInvalid={t('MSG.please_select_date_msg')}
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="mb-1">
                    <CFormLabel htmlFor="invoiceDate">{t('LABELS.end_date')}</CFormLabel>
                    <CFormInput
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={state.end_date}
                      onChange={handleChange}
                      required
                      feedbackInvalid={t('MSG.please_select_date_msg')}
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="mb-1 pt-2 mt-4">
                    <CButton color="success" type="submit">
                    {t("LABELS.submit")}
                    </CButton>
                    &nbsp;
                    {report.length > 0 && <CButton onClick={handleDownload} color="primary">
                    {t('LABELS.download')}
                    </CButton>}
                  </div>
                </div>
              </div>
              {state.customer && state.customer_id && <div className="row">
                <div className="col-sm-12 mt-1">
                <CAlert color="success">
                  <p>
                    <strong>{t("LABELS.name")}:</strong> {state.customer.name} ({state.customer.mobile}) <br/>
                    {state.customer.address && <><strong>{t("LABELS.address")}: </strong> {state.customer.address}</>}
                  </p>
                </CAlert>
                </div>
              </div>}
            </CForm>
            <hr />
            <div className='table-responsive'>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">{t('LABELS.id')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.name')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.products')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.paid')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.credit')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.total')}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {groupReport.map((p, index) => {
                    grandTotalBill+= p.grandTotal;
                    grandTotalCollection+= p.totalPaid;
                    Object.keys(p.productTotals).forEach(key => {
                        if (productTotals[key]) {
                            productTotals[key].dQty += p.productTotals[key].dQty; 
                            productTotals[key].eQty += p.productTotals[key].eQty; 
                        } else {
                            productTotals[key] = {dQty: p.productTotals[key].dQty, eQty: p.productTotals[key].eQty};
                        }
                    });
                    return (<>
                      <CTableRow key={p.customer.id}>
                        <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                        <CTableDataCell>
                          <a className='text-primary'>
                            <CIcon onClick={() => handleRowToggle(p.customer.name)} icon={expandedRows[p.customer.name] ?  cilArrowCircleTop : cilArrowCircleBottom} />
                          </a>  
                        {p.customer.name}
                        </CTableDataCell>
                        <CTableDataCell>
                          {Object.keys(p.productTotals).length >0 ? <table className="table table-sm borderless">
                            <tbody>
                            {
                              Object.keys(p.productTotals).map(i=>(<tr key={i}>
                                <td>{i}</td>
                                <td>{p.productTotals[i].dQty> 0 ? p.productTotals[i].dQty : '' }</td>
                                <td>{p.productTotals[i].eQty > 0 ? p.productTotals[i].eQty + '('+t('LABELS.collected')+')' : ''}</td>
                              </tr>))
                            }
                            </tbody>
                          </table> : 'Only cash collected'}
                        </CTableDataCell>
                        <CTableDataCell>
                              {p.totalPaid > 0 ? <CBadge color="success">{p.totalPaid.toFixed(2)}</CBadge> : 0}
                            </CTableDataCell>
                            <CTableDataCell>
                              {p.totalUnpaid > 0 ? <CBadge color="danger">{p.totalUnpaid.toFixed(2)}</CBadge> : 0}
                            </CTableDataCell>
                        <CTableDataCell>{p.grandTotal}</CTableDataCell>
                      </CTableRow>
                      {expandedRows[p.customer.name] && (
                        <CTableRow>
                          <CTableDataCell colSpan={6}>
                            <CTable>
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell>{t('LABELS.date')}</CTableHeaderCell>
                                  <CTableHeaderCell>{t('LABELS.time')}</CTableHeaderCell>
                                  <CTableHeaderCell>{t('LABELS.products')}</CTableHeaderCell>
                                  <CTableHeaderCell>{t('LABELS.paid')}</CTableHeaderCell>
                                  <CTableHeaderCell>{t('LABELS.credit')}</CTableHeaderCell>
                                  <CTableHeaderCell>{t('LABELS.total')}</CTableHeaderCell>
                                  <CTableHeaderCell>{t('LABELS.delivered_by')}</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {p.details.map(detail => (
                                        <CTableRow key={detail.id}>
                                          <CTableDataCell>{formatDate(detail.deliveryDate)}</CTableDataCell>
                                          <CTableDataCell>{convertTo12HourFormat(detail.deliveryTime)}</CTableDataCell> 
                                          <CTableDataCell>
                                          {detail.items.length >0 ? <table className="table table-sm borderless">
                                            <tbody>
                                            {
                                              detail.items.map(i=>(<tr key={i.id}>
                                                <td>{lng === 'en' ? i.product_name : i.product_local_name}</td>
                                                <td>{i.dQty> 0 ? i.dQty +' X '+i.dPrice + '₹': '' }</td>
                                                <td>{i.eQty > 0 ? i.eQty + '('+t('LABELS.collected')+')' : ''}</td>
                                              </tr>))
                                            }
                                            </tbody>
                                        </table> : 'Only cash collected'}
                                    </CTableDataCell>
                                    <CTableDataCell>{detail.paidAmount}</CTableDataCell>
                                    <CTableDataCell className='text-danger'>{detail.totalAmount - detail.paidAmount}</CTableDataCell>
                                    <CTableDataCell>{detail.totalAmount}</CTableDataCell>
                                    <CTableDataCell>{detail.user.name}</CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                            </CTable>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                      </>
                    )
                  })}

                  <tr>
                    <td className="text-end" colSpan={2}>
                      {t('LABELS.total')}
                    </td>
                    <td className="text-center">
                      <table className="table table-sm borderless">
                        <tbody>
                        {/* <tr>
                            <td>{t('LABELS.products')}</td>
                            <td>{t('LABELS.filled')}</td>
                            <td>{t('LABELS.empty')}</td>
                        </tr> */}
                        {
                          Object.keys(productTotals).map(key => (
                            <tr key={key}>
                              <td>{key}</td>
                              <td>{productTotals[key].dQty + ' (' + t('LABELS.given') + ')'}</td>
                              <td>{productTotals[key].eQty > 0 ? (productTotals[key].eQty + ' (' + t('LABELS.collected') + ')') : ''}</td>
                            </tr>
                          ))
                        }
                        </tbody>
                      </table>
                    </td>
                    <td><CBadge color="success">{grandTotalCollection}</CBadge></td>
                    <td><CBadge color="danger">{grandTotalBill - grandTotalCollection}</CBadge></td>
                    <td><CBadge color="primary">{grandTotalBill}</CBadge></td>
                  </tr>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CustomerReport
