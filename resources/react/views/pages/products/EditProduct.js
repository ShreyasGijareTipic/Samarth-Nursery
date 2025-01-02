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
import { useToast } from '../../common/toast/ToastContext';

const EditProduct = () => {
  const params = useParams()
  const { showToast } = useToast();
  const [state, setState] = useState({
    id: 0,
    name: '',
    localName: '',
    slug: '',
    categoryId: 0,
    incStep: 1,
    desc: '',
    multiSize: false,
    show: true,
    showOnHome: true,
    returnable: true,
    qty: 0,
    oPrice: 0,
    bPrice: 0,
    media: [],
    sizes: [],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleCBChange = (e) => {
    const { name, checked } = e.target
    setState({ ...state, [name]: checked })
  }

  const loadProductData = async () => {
    try {
      const data = await getAPICall('/api/product/' + params.id)
      setState({
        id: data.id,
        name: data.name,
        localName: data.localName,
        slug: data.slug,
        categoryId: data.categoryId,
        incStep: data.incStep,
        desc: data.desc,
        multiSize: data.multiSize,
        show: data.show,
        returnable: data.sizes[0].returnable,
        showOnHome: data.showOnHome,
        unit: data.unit,
        qty: parseInt(data.sizes[0].qty),
        oPrice: parseFloat(data.sizes[0].oPrice),
        bPrice: parseFloat(data.sizes[0].bPrice),
        media: data.media,
        sizes: data.sizes,
      })
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }
  useEffect(() => {
    loadProductData()
  }, [])

  const handleSubmit = async () => {
    let data = { ...state }
    data.slug = data.name.replace(/[^\w]/g, '_')
    if (!state.multiSize) {
      data.sizes[0].name = data.name
      data.sizes[0].localName = data.localName
      data.sizes[0].qty = parseInt(data.qty)
      data.sizes[0].oPrice = parseFloat(data.oPrice)
      data.sizes[0].bPrice = parseFloat(data.bPrice)
      data.sizes[0].dPrice = -1
      data.sizes[0].show = true
      data.sizes[0].returnable = data.returnable
      data.sizes[0].showOnHome = data.showOnHome
      delete data.oPrice
      delete data.bPrice
      delete data.qty
    }
    try {
      const resp = await put('/api/product/' + data.id, data)
      if (resp?.id) {
        showToast('success','Product updated successfully');
      } else {
        showToast('danger','Error occured, please try again later.');
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Edit Product</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
            <div className="row mb-2">
                <div className="col-6">
                    <CFormLabel htmlFor="pname">Product Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="pname"
                      placeholder="Product Name"
                      name="name"
                      value={state.name}
                      onChange={handleChange}
                      required
                      feedbackInvalid="Please provide name."
                      feedbackValid="Looks good!"
                    />
                    <div className="invalid-feedback">Product name is required</div>
                </div>
                <div className="col-6">
                  <CFormLabel htmlFor="plname">Local Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="plname"
                    placeholder="Local Name"
                    name="localName"
                    value={state.localName}
                    onChange={handleChange}
                    required
                    feedbackInvalid="Please provide Local name."
                    feedbackValid="Looks good!"
                  />
                  <div className="invalid-feedback">Local name is required</div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4">
                  <CFormLabel htmlFor="qty">Product Quantity</CFormLabel>
                  <CFormInput
                    type="number"
                    id="qty"
                    placeholder="0"
                    min="1"
                    name="qty"
                    value={state.qty}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">Quantity must be greater than 0</div>
                </div>
                <div className="col-4">
                  <CFormLabel htmlFor="bPrice">Base Price</CFormLabel>
                  <CFormInput
                    type="number"
                    id="bPrice"
                    placeholder="0"
                    min="1"
                    name="bPrice"
                    value={state.bPrice}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">Base price must be greater than 0</div>
                </div>
                <div className="col-4">
                  <CFormLabel htmlFor="oPrice">Selling Price</CFormLabel>
                  <CFormInput
                    type="number"
                    id="oPrice"
                    placeholder="0"
                    min="1"
                    name="oPrice"
                    value={state.oPrice}
                    onChange={handleChange}
                    required
                  />
                  <div className="invalid-feedback">Selling price must be greater than 0</div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-6">
                  <CFormCheck
                    id="show"
                    label="Show for invoicing"
                    name="show"
                    checked={state.show}
                    value={state.show}
                    onChange={handleCBChange}
                  />
                </div>
                {/* <div className="col-6">
                  <CFormCheck
                    id="returnable"
                    label="Collect empty jar/box"
                    name="returnable"
                    checked={state.returnable}
                    value={state.returnable}
                    onChange={handleCBChange}
                  />
                </div> */}
              </div>
              <div className="row mb-2">
                <div className="col-sm-3">
                  <CFormCheck
                    id="showOnHome"
                    label="Can deliver"
                    name="showOnHome"
                    checked={state.showOnHome}
                    value={state.showOnHome}
                    onChange={handleCBChange}
                  />
                </div>
                <div className="col-9">
                    <CFormInput
                      type="text"
                      id="unit"
                      placeholder="Unit e.g KM, Day, Month etc"
                      name="unit"
                      value={state.unit}
                      onChange={handleChange}
                    />
                </div>
              </div>
              <div className="mb-3">
                <CButton color="success" onClick={handleSubmit}>
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

export default EditProduct
