import React, { useState, useEffect, useRef } from 'react';  // Import useRef
import { useParams } from 'react-router-dom';  // Import useParams
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CButton,
  CFormSelect
} from '@coreui/react';
import { getAPICall, postFormData, put } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';

function EditCompany() {
  const { companyId } = useParams();  // Use useParams to extract companyId from the URL
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    land_mark: '',
    Tal: '',
    Dist: '',
    pincode: '',
    phone_no: '',
    bank_name: '',
    account_no: '',
    IFSC_code: '',
    logo: '',
    sign: '',
    paymentQRCode: '',
    appMode: 'advance',
  });
  const logoInputRef = useRef(null);  // Create ref for logo input
  const signInputRef = useRef(null);  // Create ref for sign input
  const paymentQRCodeInputRef = useRef(null);  // Create ref for paymentQRCode input
  const [validated, setValidated] = useState(false);

  // Fetch existing company details
  const fetchCompanyDetails = async () => {
    console.log(`Fetching details for companyId: ${companyId}`); // Debugging log
    try {
      const response = await getAPICall(`/api/company/${companyId}`);
      console.log('Company data:', response);  // Debugging log for response

      setFormData({
        companyName: response.company_name || '',
        land_mark: response.land_mark || '',
        Tal: response.Tal || '',
        Dist: response.Dist || '',
        pincode: response.pincode || '',
        phone_no: response.phone_no || '',
        bank_name: response.bank_name || '',
        account_no: response.account_no || '',
        IFSC_code: response.IFSC_code || '',
        logo: response.logo || '',
        sign: response.sign || '',
        paymentQRCode: response.paymentQRCode || '',
        appMode: response.appMode || 'advance',
      });
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast('danger', 'Failed to fetch company details.');
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    } else {
      console.log('No companyId found');
    }
  }, [companyId]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files.length > 0) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const appModes = [
    { label: 'Basic', value: 'basic' },
    // { label: 'Balance', value: 'balance' },
    { label: 'Advance', value: 'advance' },
  ];
  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidated(true);

    try {
      // Handle file uploads for logo, sign, and paymentQRCode
      const logoData = new FormData();
      if (formData.logo instanceof File) {
        logoData.append('file', formData.logo);
        logoData.append('dest', 'invoice');
        const responseLogo = await postFormData('/api/fileUpload', logoData);
        formData.logo = responseLogo.fileName;
      }

      const signData = new FormData();
      if (formData.sign instanceof File) {
        signData.append('file', formData.sign);
        signData.append('dest', 'invoice');
        const responseSign = await postFormData('/api/fileUpload', signData);
        formData.sign = responseSign.fileName;
      }

      const paymentQRCodeData = new FormData();
      if (formData.paymentQRCode instanceof File) {
        paymentQRCodeData.append('file', formData.paymentQRCode);
        paymentQRCodeData.append('dest', 'invoice');
        const responseQRCode = await postFormData('/api/fileUpload', paymentQRCodeData);
        formData.paymentQRCode = responseQRCode.fileName;
      }

      // Submit the updated company data
      const response = await put(`/api/company/${companyId}`, formData, { method: 'PUT' });
      console.log('Company updated successfully:', response); // Debugging log
      showToast('success', 'Company details updated successfully.');
    } catch (error) {
      console.error('Error updating company:', error);
      showToast('danger', 'Error occurred: ' + error.message);
    }
  };

  return (
      <CRow>
        <CCol xs={12}>
          <CCard className='mb-3'>
            <CCardHeader>
              <strong>New Company</strong>
            </CCardHeader>
            <CCardBody>
              <CForm noValidate validated={validated} onSubmit={handleSubmit} encType='multipart/form-data'>
                <div className='row'>
                 <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="land_mark">Company Name</CFormLabel>
                      <CFormInput
                        type='text'
                        name='companyName'
                        id='companyName'
                        maxLength="32"
                        value={formData.companyName}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="land_mark">Address/Land Mark</CFormLabel>
                      <CFormInput
                        type='text'
                        name='land_mark'
                        id='land_mark'
                        maxLength="32"
                        value={formData.land_mark}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="Tal">Tal</CFormLabel>
                      <CFormInput
                        type='text'
                        name='Tal'
                        id='Tal'
                        maxLength='32'
                        value={formData.Tal}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="Dist">Dist</CFormLabel>
                      <CFormInput
                        type='text'
                        name='Dist'
                        id='Dist'
                        maxLength='32'
                        value={formData.Dist}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="pincode">Pin code</CFormLabel>
                      <CFormInput
                        type='text'
                        name='pincode'
                        id='pincode'
                        value={formData.pincode}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="phone_no">Phone No</CFormLabel>
                      <CFormInput
                        type='number'
                        name='phone_no'
                        id='phone_no'
                        value={formData.phone_no}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                 </div>
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="bank_name">Bank Name</CFormLabel>
                      <CFormInput
                        type='text'
                        name='bank_name'
                        id='bank_name'
                        value={formData.bank_name}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="account_no">Account No</CFormLabel>
                      <CFormInput
                        type='number'
                        name='account_no'
                        id='account_no'
                        value={formData.account_no}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="IFSC_code">IFSC_code</CFormLabel>
                      <CFormInput
                        type='text'
                        name='IFSC_code'
                        id='IFSC_code'
                        value={formData.IFSC_code}
                        onChange={handleChange}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                 </div>
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="logo">Logo (PNG, max 2MB)</CFormLabel>
                      <CFormInput
                        type='file'
                        name='logo'
                        id='logo'
                        accept='image/png/jpeg'
                        onChange={handleChange}
                        ref={logoInputRef}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div> 
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                      <CFormLabel htmlFor="sign">Sign (PNG, max 2MB)</CFormLabel>
                      <CFormInput
                        type='file'
                        name='sign'
                        id='sign'
                        accept='image/png/jpeg'
                        onChange={handleChange}
                        ref={signInputRef}
                        feedbackInvalid="Please provide valid data."
                        required
                      />
                    </div>
                  </div>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                        <CFormLabel htmlFor="paymentQRCode">QR Code (PNG, max 2MB)</CFormLabel>
                        <CFormInput
                          type='file'
                          name='paymentQRCode'
                          id='paymentQRCode'
                          accept='image/png/jpeg'
                          onChange={handleChange}
                          ref={paymentQRCodeInputRef}
                          feedbackInvalid="Please provide valid data."
                          required
                        />
                    </div>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-sm-4'>
                    <div className='mb-3'>
                    <CFormLabel htmlFor="appMode">Application Mode</CFormLabel>
                      <CFormSelect
                        aria-label="Select Application Mode"
                        value={formData.appMode}
                        id="appMode"
                        name="appMode"
                        options={appModes}
                        onChange={handleChange}
                        required
                        feedbackInvalid="Select an application mode."
                      />
                    </div>
                  </div>
                </div>
                <CButton type="submit" color="primary">Submit</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

export default EditCompany;
