import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
} from '@coreui/react'
import { getAPICall, post, put } from '../../../util/api'
import { useParams } from 'react-router-dom'
import { getUserData } from '../../../util/session'
import { useToast } from '../../common/toast/ToastContext';

const EditCustomer = () => {
  const params = useParams()
  const { showToast } = useToast();
  const [state, setState] = useState({
    name: '',
    mobile: '',
    discount: 0,
    company_id: 0,
    show: true,
  })
  const user = getUserData()
  //customer
  const [companyList, setCompanyList] = useState([])

  useEffect(()=>{
    try {
      loadCustomerData();
      getAPICall('/api/company').then((resp) => {
        // Super Admin => All company
        // Admin => self company
        if (resp) {
          const mappedList = resp.map(itm => ({ label: itm.company_name, value: itm.company_id }));
          if (user.type === 0) {
            setCompanyList(mappedList);
          } else {
            setCompanyList(mappedList.filter(e => e.value === user.company_id));
          }
        }
      })
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  },[]);

  const loadCustomerData = async () => {
    try {
      const data = await getAPICall('/api/customer/' + params.id)
      setState({
        id: data.id,
        name: data.name,
        mobile: data.mobile,
        discount: data.discount,
        company_id: data.company_id,
        show: data.show,
        address: data.address,
      })
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleCBChange = (e) => {
    const { name, checked } = e.target
    setState({ ...state, [name]: checked })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    let data = { ...state }
    try {
      const resp = await put('/api/customer/' + data.id, data)
      if (resp?.id) {
        showToast('success','Customer updated successfully');
      } else {
        showToast('danger','Error occured, please try again later.');
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const handleClear = () => {
    setState({
      name: '',
      mobile: '',
      discount: 0,
      company_id: state.company_id,
      show: true,
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Edit Customer Details</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="needs-validation" noValidate onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="pname">Customer Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="pname"
                  placeholder="Customer Name"
                  name="name"
                  value={state.name}
                  onChange={handleChange}
                  required
                  feedbackInvalid="Please provide name."
                      feedbackValid="Looks good!"
                />
                <div className="invalid-feedback">Name is required</div>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="plmobile">Mobile Number</CFormLabel>
                <CFormInput
                  type="text"
                  id="plmobile"
                  placeholder="Mobile Number"
                  name="mobile"
                  value={state.mobile}
                  onChange={handleChange}
                  required
                  feedbackInvalid="Please provide mobile number."
                      feedbackValid="Looks good!"
                />
                <div className="invalid-feedback">Mobile number is required</div>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="categoryId">Company </CFormLabel>
                <CFormSelect
                  aria-label="Select Category"
                  name="company_id"
                  value={state.company_id}
                  options={companyList}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">Please select a company</div>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="address">Address</CFormLabel>
                <CFormTextarea
                  id="address"
                  rows={2}
                  name="address"
                  value={state.address}
                  onChange={handleChange}
                ></CFormTextarea>
              </div>
              <div className="mb-3">
                <CFormCheck
                  id="flexCheckDefault"
                  label="Show for invoicing"
                  name="show"
                  checked={state.show}
                  onChange={handleCBChange}
                />
              </div>
              <div className="mb-3">
                <CButton color="success" type="submit">
                  Submit
                </CButton>
                &nbsp;
                <CButton color="secondary" onClick={handleClear}>
                  Clear
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditCustomer;
