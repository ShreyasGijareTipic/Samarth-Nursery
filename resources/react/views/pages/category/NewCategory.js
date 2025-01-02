import React, { useState } from 'react'
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
  CRow,
} from '@coreui/react'
import { post } from '../../../util/api'
import { useToast } from '../../common/toast/ToastContext';

const NewCategory = () => {
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { showToast } = useToast()
  const [state, setState] = useState({
    name: '',
    slug: '',
    localName: '',
    show: true,
    image: 'NA',
  })

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
    data.slug = data.name.replace(/[^\w]/g, '_')
    try {
      const resp = await post('/api/category', data)
      if (resp) {
        showToast('success','Category added successfully');
      } else {
        showToast('danger', 'Failed to add category');
      }
      handleClear()
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
      setErrorMessage(error.message ?? 'Please provide valid data')
    }
  }

  const handleClear = () => {
    setState({
      name: '',
      slug: '',
      localName: '',
      image: 'NA',
      show: true,
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create New Category</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="needs-validation" noValidate onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="pname">Category Name</CFormLabel>
                <CFormInput
                  type="text"
                  pattern="^[a-zA-Z ]+$"
                  id="pname"
                  placeholder="Category Name"
                  name="name"
                  value={state.name}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">Please provide a valid category name (letters and spaces only).</div>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="plname">Category Local Name</CFormLabel>
                <CFormInput
                  type="text"
                  pattern="^[a-zA-Z ]+$"
                  id="plname"
                  placeholder="Category Local Name"
                  name="localName"
                  value={state.localName}
                  onChange={handleChange}
                  required
                />
                <div className="invalid-feedback">Please provide a valid local name (letters and spaces only).</div>
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
              <div>
                {successMessage && (
                  <CRow>
                    <CAlert color="success">{successMessage}</CAlert>
                  </CRow>
                )}
                {errorMessage && (
                  <CRow>
                    <CAlert color="danger">{errorMessage}</CAlert>
                  </CRow>
                )}
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

export default NewCategory
