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
  const { showToast } = useToast();
  const company = getUserData()?.company_info?.company_name;
  const { t, i18n } = useTranslation("global");
  const lng = i18n.language;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const reportData = await getAPICall('/api/creditReport');
        if(reportData) {
          const filteredData = reportData.filter(r => r.totalPayment != 0 || r.items?.filter(i => i.quantity > 0).length > 0).sort((c1,c2)=> c1.name.localeCompare(c2.name));
          setReport(filteredData);
          setFilteredReport(filteredData);
        }
      } catch (error) {
        showToast('danger', 'Error occurred ' + error);
      }
    };
    fetchReport();
  }, []);

  // if(searchTerm?.length > 0){
  //   filteredReport = report.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  // }

  function onSearchChange(searchTerm) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Execute the filtering logic here
      if(searchTerm?.length > 0){
        setFilteredReport(report.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())));
      }else{
        setFilteredReport(report);
      }
      }, debounceDelay);
  }

  let grandTotal = 0;

  return (
    <CRow>
      <CCol xs={12} style={{ padding: '2px' }}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('LABELS.credit_report')}</strong>
          </CCardHeader>
          <CCardBody>
            {/* ** Search Input Box ** */}
            <CForm>
              <CFormInput 
                type="text" 
                placeholder={t('LABELS.search')} 
                value={searchTerm} 
                onChange={(e) => {setSearchTerm(e.target.value); onSearchChange(e.target.value); e.preventDefault();}} 
              />
            </CForm>
            <div className='table-responsive'>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col" className="d-none d-sm-table-cell">{t('LABELS.id')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.name')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col" className="d-none d-sm-table-cell">{t('LABELS.mobile_number')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.total')} ₹ </CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.return_items')}</CTableHeaderCell>
                    <CTableHeaderCell scope="col">{t('LABELS.actions')}</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredReport.map((p, index) => {
                    grandTotal += p.totalPayment;
                    return (
                      <CTableRow key={p.mobile+'_'+index}>
                        <CTableDataCell className="d-none d-sm-table-cell" scope="row">{index + 1}</CTableDataCell>
                        <CTableDataCell>{p.name}</CTableDataCell>
                        <CTableDataCell className="d-none d-sm-table-cell">{p.mobile}</CTableDataCell>
                        <CTableDataCell>{p.totalPayment > 0 ? <><CBadge color="success">{p.totalPayment}</CBadge> <br /> ({t('LABELS.advance')})</> : <CBadge color="danger">{p.totalPayment * -1}</CBadge>}</CTableDataCell>
                        <CTableDataCell>
                          <table className="table table-sm borderless">
                            <tbody>
                            {
                              p.items?.map(i => (
                                <tr key={i.id}>
                                  <td>{lng === 'en' ? i.product_name : i.product_local_name} {i.quantity + `(${t('LABELS.empty')})`}</td>
                                </tr>
                              ))
                            }
                            </tbody>
                          </table>
                        </CTableDataCell>
                        <CTableDataCell>
                          <a className='btn btn-outline-primary btn-sm' href={"tel:" + p.mobile}>
                            <CIcon icon={cilPhone} />
                          </a>
                          &nbsp;
                          <a className='btn btn-outline-success btn-sm' href={`sms:+${p.mobile}?body=Hello, There is an outstanding payment of Rs. ${p.totalPayment < 0 ? -1 * p.totalPayment : 0}. Kindly pay it. From - ${company}`}>
                            <CIcon icon={cilChatBubble} />
                          </a>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                  <tr>
                    <td className="d-none d-sm-table-cell"></td>
                    <td className="d-none d-sm-table-cell"></td>
                    <td>{t('LABELS.total')} ₹</td>
                    <td>{grandTotal > 0 ? <><CBadge color="success">{grandTotal}</CBadge> <br /> ({t('LABELS.advance')})</> : <CBadge color="danger">{grandTotal * -1}</CBadge>}</td>
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
  )
}

export default CreditReport