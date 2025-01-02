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
  CRow,
} from '@coreui/react'
import { getAPICall, put } from '../../../util/api'
import { useParams } from 'react-router-dom'
import { useToast } from '../../common/toast/ToastContext'

const EditCategory = () => {
  const params = useParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { showToast } = useToast();
  const [state, setState] = useState({
    id: 0,
    name: '',
    slug: '',
    localName: '',
    image: 'NA',
    show: true,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleCBChange = (e) => {
    const { name, checked } = e.target
    setState({ ...state, [name]: checked })
  }

  const loadCategoryData = async () => {
    try {
      const data = await getAPICall('/api/category/' + params.id)
      setState({
        id: data.id,
        name: data.name,
        localName: data.localName,
        slug: data.slug,
        show: data.show == 1,
        image: data.image,
      })
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  useEffect(() => {
    loadCategoryData()
  }, [])

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
      const resp = await put('/api/category/' + data.id, data)
      if (resp) {
        showToast('success','Category updated successfully');
      } else {
        showToast('danger', 'Failed to update category');
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
      setErrorMessage(error.message ?? 'Please provide valid data')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Edit Category</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="needs-validation" noValidate onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="pname">Category Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="pname"
                  pattern="^[a-zA-Z ]+$"
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
                  id="plname"
                  pattern="^[a-zA-Z ]+$"
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
                  Update
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditCategory
