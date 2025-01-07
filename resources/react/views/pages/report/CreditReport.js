import React, { useEffect, useState } from 'react';
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
} from '@coreui/react';
import { getAPICall, put } from '../../../util/api'; // Ensure put API function is available
import { useToast } from '../../common/toast/ToastContext';
import CIcon from '@coreui/icons-react';
import { cilChatBubble, cilPhone } from '@coreui/icons';
import { getUserData } from '../../../util/session';
import { useTranslation } from 'react-i18next';

let debounceTimer;
const debounceDelay = 300;

const CreditReport = () => {
  const [report, setReport] = useState([]);
  const [filteredReport, setFilteredReport] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [returnMoney, setReturnMoney] = useState({}); // State to manage return money inputs
  const { showToast } = useToast();
  const company = getUserData()?.company_info?.company_name;
  const { t, i18n } = useTranslation('global');
  const lng = i18n.language;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const reportData = await getAPICall('/api/creditReport');
        if (reportData) {
          const filteredData = reportData
            .filter(
              (r) =>
                r.totalPayment !== 0 ||
                r.items?.filter((i) => i.quantity > 0).length > 0
            )
            .sort((c1, c2) => c1.name.localeCompare(c2.name));
          setReport(filteredData);
          setFilteredReport(filteredData);
        }
      } catch (error) {
        showToast('danger', 'Error occurred ' + error);
      }
    };
    fetchReport();
  }, []);

  const onSearchChange = (searchTerm) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (searchTerm?.length > 0) {
        setFilteredReport(
          report.filter((r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        setFilteredReport(report);
      }
    }, debounceDelay);
  };

  const handleReturnMoneyChange = (e, customerId) => {
    const { value } = e.target;
    setReturnMoney((prevState) => ({
      ...prevState,
      [customerId]: value,
    }));
  };

  const handleReturnMoneySubmit = async (customerId) => {
    const returnAmount = parseFloat(returnMoney[customerId] || 0);
    if (isNaN(returnAmount) || returnAmount <= 0) {
      showToast('warning', 'Invalid return amount');
      return;
    }
  
    try {
      // Make PUT request to update the amount in the payment tracker
      const updatedData = await put(`/api/paymentTracker/${customerId}`, {
        returnAmount: -returnAmount,  // Send a negative amount to subtract
      });
  
      if (updatedData) {
        showToast('success', 'Payment updated successfully');
  
        // Update report state by subtracting the returnAmount
        setReport((prevReport) =>
          prevReport.map((r) =>
            r.customerId === customerId
              ? { ...r, totalPayment: r.totalPayment + returnAmount } // Subtract from totalPayment
              : r
          )
        );
        setFilteredReport((prevFilteredReport) =>
          prevFilteredReport.map((r) =>
            r.customerId === customerId
              ? { ...r, totalPayment: r.totalPayment + returnAmount } // Subtract from totalPayment
              : r
          )
        );
  
        // Clear the returnMoney input
        setReturnMoney((prevState) => ({
          ...prevState,
          [customerId]: '',
        }));
      }
    } catch (error) {
      showToast('danger', 'Error occurred: ' + error.message);
    }
  };

  let grandTotal = 0;

  return (
    <CRow>
      <CCol xs={12} style={{ padding: '2px' }}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('LABELS.credit_report')}</strong>
          </CCardHeader>
          <CCardBody>
            {/* Search Input Box */}
            <CForm>
              <CFormInput
                type="text"
                placeholder={t('LABELS.search')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearchChange(e.target.value);
                  e.preventDefault();
                }}
              />
            </CForm>
            <div className="table-responsive">
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col" className="d-none d-sm-table-cell">
                      {t('LABELS.id')}
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.name')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="d-none d-sm-table-cell">
                      {t('LABELS.customer_id')}
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.total')} ₹</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.return_items')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.actions')}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredReport.map((p, index) => {
                    grandTotal += p.totalPayment;
                    return (
                      <CTableRow key={p.customerId + '_' + index}>
                        <CTableDataCell className="d-none d-sm-table-cell" scope="row">
                          {index + 1}
                        </CTableDataCell>
                        <CTableDataCell>{p.name}</CTableDataCell>
                        <CTableDataCell className="d-none d-sm-table-cell">
                          {p.customerId}
                        </CTableDataCell>
                        <CTableDataCell>
                          {p.totalPayment > 0 ? (
                            <>
                              <CBadge color="success">{p.totalPayment}</CBadge> <br />
                              ({t('LABELS.advance')})
                            </>
                          ) : (
                            <CBadge color="danger">{p.totalPayment * -1}</CBadge>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CFormInput
                              type="number"
                              
                              step="0.01"
                              placeholder="Enter return money"
                              value={returnMoney[p.customerId] || ''}
                              onChange={(e) => handleReturnMoneyChange(e, p.customerId)}
                              style={{ width: '100px', marginRight: '8px' }} // Resized text field
                            />
                            <CButton
                              size="sm"
                              color="warning"
                              onClick={() => handleReturnMoneySubmit(p.customerId)}
                            >
                              {t('LABELS.update_return')}
                            </CButton>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <a
                            className="btn btn-outline-primary btn-sm"
                            href={'tel:' + p.mobile}
                          >
                            <CIcon icon={cilPhone} />
                          </a>
                          &nbsp;
                          <a
                            className="btn btn-outline-success btn-sm"
                            href={`sms:+${p.mobile}?body=Hello, There is an outstanding payment of Rs. ${
                              p.totalPayment < 0 ? -1 * p.totalPayment : 0
                            }. Kindly pay it. From - ${company}`}
                          >
                            <CIcon icon={cilChatBubble} />
                          </a>
                        </CTableDataCell>
                      </CTableRow>
                    );
                  })}
                  <tr>
                    <td className="d-none d-sm-table-cell"></td>
                    <td className="d-none d-sm-table-cell"></td>
                    <td>{t('LABELS.total')} ₹</td>
                    <td>
                      {grandTotal > 0 ? (
                        <>
                          <CBadge color="success">{grandTotal}</CBadge> <br />
                          ({t('LABELS.advance')})
                        </>
                      ) : (
                        <CBadge color="danger">{grandTotal * -1}</CBadge>
                      )}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default CreditReport;
