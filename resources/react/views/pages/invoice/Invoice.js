import React, { useEffect, useState } from 'react'
import './Invoice.css'
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
  CFormSelect,
  CRow,
} from '@coreui/react'
import { cilDelete, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { getAPICall, post } from '../../../util/api'
import { useNavigate } from 'react-router-dom'
import QRCodeModal from '../../common/QRCodeModal'
import { useToast } from '../../common/toast/ToastContext'
import NewCustomerModal from '../../common/NewCustomerModal'
import { useSpinner } from '../../common/spinner/SpinnerProvider'
import { useTranslation } from 'react-i18next'
let debounceTimer;
const Invoice = () => {
  const [validated, setValidated] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [errorMessage, setErrorMessage] = useState()
  const [products, setProducts] = useState()
  const [allProducts, setAllProducts] = useState()
  const [customerHistory, setCustomerHistory] = useState()
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const navigate = useNavigate()
  const { showSpinner, hideSpinner } = useSpinner();
  const timeNow = ()=> `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`;
  const [state, setState] = useState({
    customer_id: 0,
    lat:'',
    long:'',
    payLater: false,
    isSettled: false,
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryTime: timeNow(),
    deliveryDate: new Date().toISOString().split('T')[0],
    invoiceType: 1,
    items: [
      {
        product_id: undefined,
        product_sizes_id: 0,
        product_name: '',
        product_unit: '',
        product_local_name: '',
        size_name: '',
        size_local_name: '',
        oPrice: 0,
        bPrice: 0,
        dPrice: 0,
        dQty: 0,
        eQty: 0,
        qty: 0,
        total_price: 0,
        returnable: 0,
      },
    ],
    orderStatus: 1,
    totalAmount: 0,
    discount: 0,
    balanceAmount: 0,
    paidAmount: 0,
    finalAmount: 0,
    paymentType: 0,
  })
  
  const { showToast } = useToast();
   const { t, i18n } = useTranslation("global")
    const lng = i18n.language;
  const [customerName, setCustomerName] = useState({});
  const [suggestions, setSuggestions] = useState([]);
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
  const debouncedSearchCustomer = debounce(searchCustomer, 750);

  const handleNameChange = (event) => {
    const value = event.target.value;
    setCustomerName({name : value});
    // Filter suggestions based on input
    if (value) {
      debouncedSearchCustomer(value)
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCustomerName(suggestion);
    setState((pre)=>({...pre, customer_id: suggestion.id}))
    const updatedProducts = discountedPrices([...allProducts], suggestion.discount)
    setAllProducts(updatedProducts);
    calculateTotal(updatedProducts);
    setSuggestions([]);
    getCustomerHistory(suggestion.id);
  };

  const onCustomerAdded = (customer) => {
    handleSuggestionClick(customer);
    setShowCustomerModal(false);
  }

  const getDiscountedPrice = (p, discount) =>{
    const value = p.sizes[0].oPrice;
    const price = value - (value * (discount || (customerName.discount ?? 0)) /100);    
    return Math.round(price);
  }

  const discountedPrices = (products, discount) =>{
    products.forEach(p=>{
      p.sizes[0].dPrice = getDiscountedPrice(p, discount)
    })
    return products;
  }

  const getCustomerHistory = async (customer_id)=>{
    try {
      //customerHistory
      const response = await getAPICall('/api/customerHistory?id=' + customer_id);
      if (response) {
        setCustomerHistory(response);
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  }

  const fetchProduct = async () => {
    showSpinner();
    const response = await getAPICall('/api/product')
    hideSpinner();
    setAllProducts(discountedPrices([...response.filter((p) => p.show == 1)]));
    const options = ['Select Product']
    options.push(
      ...response
        .filter((p) => p.show == 1)
        .map((p) => {
          return {
            label: p.name,
            value: p.id,
            disabled: p.show === 0,
          }
        }),
    )
    setProducts(options)
  }

  const handleAddProductRow = () => {
    setState((prev) => {
      const old = { ...prev }
      old.items.push({
        product_id: undefined,
        product_sizes_id: 0,
        product_name: '',
        product_unit: '',
        product_local_name: '',
        size_name: '',
        size_local_name: '',
        oPrice: 0,
        dPrice: 0,
        bPrice: 0,
        qty: 0,
        dQty: 0,
        eQty: 0,
        total_price: 0,
        returnable: 0,
      })
      return { ...old }
    })
  }

  const calculateTotal = (items) => {
    let total = 0
    items.forEach((item) => {
      total += item.total_price
    })
    return total
  }

  const handleRemoveProductRow = (index) => {
    setState((prev) => {
      const old = { ...prev }
      old.items.splice(index, 1)
      return { ...old }
    })
  }

  useEffect(() => {
    fetchProduct()
  }, [])

  const calculateFinalAmount = (old) => {
    old.finalAmount = old.totalAmount - ((old.totalAmount * old.discount) / 100 || 0)
    old.balanceAmount = 0
    old.paidAmount = old.finalAmount
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'discount') {
      setState((prev) => {
        const old = { ...prev }
        old.discount = value
        calculateFinalAmount(old)
        return { ...old }
      })
    } else if (name === 'paidAmount') {
      setState((prev) => {
        const old = { ...prev }
        old.paidAmount = value
        old.balanceAmount = old.finalAmount - old.paidAmount
        return { ...old }
      })
    } else {
      setState({ ...state, [name]: value })
    }
  }

  const handleProductChange = (e, index) => {
    const { value } = e.target
    const p = allProducts.find((p) => p.id == value)
    if (p && p.sizes[0]) {
      setState((prev) => {
        const old = { ...prev }
        old.items[index].product_id = value
        old.items[index].id = value
        old.items[index].product_sizes_id = p.sizes[0].id
        old.items[index].name = p.sizes[0].name
        old.items[index].localName = p.sizes[0].localName
        old.items[index].unit = p.unit
        old.items[index].product_name = p.name
        old.items[index].size_name = p.sizes[0].name
        old.items[index].size_local_name = p.sizes[0].localName
        old.items[index].product_local_name = p.localName
        old.items[index].oPrice = p.sizes[0].oPrice
        old.items[index].dQty = 0
        old.items[index].eQty = 0
        old.items[index].dPrice = p.sizes[0].dPrice
        old.items[index].bPrice = p.sizes[0].bPrice
        old.items[index].returnable = p.sizes[0].returnable
        old.items[index].total_price = p.sizes[0].dPrice * old.items[index].dQty
        old.totalAmount = calculateTotal(old.items)
        calculateFinalAmount(old)
        return { ...old }
      })
    }
  }

  const handleQtyChange = (e, index) => {
    const { value } = e.target
    setState((prev) => {
      const old = { ...prev }
      old.items[index].dQty = value
      old.items[index].total_price = old.items[index].dPrice * old.items[index].dQty
      old.totalAmount = calculateTotal(old.items)
      calculateFinalAmount(old)
      return { ...old }
    })
  }

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      event.stopPropagation();
  
      // Validation
      let isInvalid = false;
  
      // Determine the correct order status based on invoice type
      const orderStatus = state.invoiceType === 1 ? 1 : 2;
  
      // Prepare the data for submission
      const clonedState = {
        ...state,
        orderStatus,
        finalAmount: state.totalAmount, // Ensure the finalAmount is aligned with totalAmount
        deliveryTime: timeNow(), // Update delivery time
      };
  
      // Validate required fields
      if (clonedState.customer_id === 0) {
        isInvalid = true;
        showToast('warning', 'Please select or add a customer.');
      }
  
      // Check for valid paid amount for Online/UPI payments
      if (clonedState.paymentType === 1 && clonedState.paidAmount <= 0) {
        isInvalid = true;
        showToast('warning', 'For online/UPI payment, paid amount must be greater than zero.');
      }
  
      // Ensure at least one product with a quantity greater than zero
      if (clonedState.items.length === 0 || clonedState.items.every((item) => item.dQty === 0)) {
        isInvalid = true;
        showToast('warning', 'Please add at least one product with a quantity greater than zero.');
      }
  
      // Submit if no validation errors
      if (!isInvalid) {
        showSpinner();
        const res = await post('/api/order', clonedState);
  
        if (res) {
          handleClear();
  
          if (res.id) {
            const toastMessage =
              orderStatus === 1
                ? 'Order is delivered.'
                : 'Order is created as pending (Advanced Booking).';
            showToast('success', toastMessage);
  
            // If online payment, you can show QR or perform other actions
            if (clonedState.paymentType === 1) {
              setShowQR(true); // Show QR for Online/UPI payment
            }
  
            navigate('/invoice-details/' + res.id);
          } else {
            showToast('danger', 'Error occurred while processing the order.');
          }
        }
      } else {
        setValidated(true);
      }
    } catch (error) {
      showToast('danger', 'Error while placing the order.');
    } finally {
      hideSpinner();
    }
  };
  
  const handleClear = async () => {
    setState({
      customer_id: 0,
      lat:'',
      long:'',
      payLater: false,
      isSettled: false,
      invoiceDate: new Date().toISOString().split('T')[0],
      deliveryTime: timeNow(),
      deliveryDate: new Date().toISOString().split('T')[0],
      invoiceType: 1,
      items: [
        {
          product_id: undefined,
          product_sizes_id: 0,
          product_name: '',
          product_unit: '',
          product_local_name: '',
          size_name: '',
          size_local_name: '',
          oPrice: 0,
          dPrice: 0,
          bPrice: 0,
          qty: 0,
          total_price: 0,
        },
      ],
      totalAmount: 0,
      discount: 0,
      balanceAmount: 0,
      paidAmount: 0,
      finalAmount: 0,
      paymentType: 1,
    })
  }
  return (
    <CRow>
      <NewCustomerModal onSuccess={onCustomerAdded} visible={showCustomerModal} setVisible={setShowCustomerModal} />
      <QRCodeModal visible={showQR} setVisible={setShowQR}></QRCodeModal>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{t('invoice.new_invoice')}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm noValidate validated={validated} onSubmit={handleSubmit}>
              <div className="row mb-2">
                <div className="col-9">
                  <CFormInput
                    type="text"
                    id="pname"
                    placeholder={t('invoice.customer_name')}
                    name="customerName"
                    value={customerName.name}
                    onChange={handleNameChange}
                    autoComplete="off"
                    required
                  />
                  {customerName.name?.length > 0 && (
                    <ul className="suggestions-list">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion.name + ' (' + suggestion.mobile + ')'}
                        </li>
                      ))}
                      {!customerName.id && (
                        <li>
                          <CBadge role="button" color="danger" onClick={() => setShowCustomerModal(true)}>
                            {t('invoice.new_customer')}
                          </CBadge>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="col-3">
                  <CBadge role="button" color="danger" onClick={() => setShowCustomerModal(true)}>
                    {t('invoice.new_customer')}
                  </CBadge>
                </div>
              </div>
              {customerName.id && (
                <div className="row">
                  <div className="col-sm-12 mt-1">
                    <CAlert color="success">
                      <p>
                        <strong>{t('invoice.name')}:</strong> {customerName.name} ({customerName.mobile}) <br />
                        {customerName.address && (
                          <>
                            <strong>{t('invoice.address')}: </strong> {customerName.address}
                          </>
                        )}
                        {customerHistory && (
                          <>
                            {customerHistory.pendingPayment > 0 && (
                              <>
                                <br />
                                {t('invoice.credit')}{' '}
                                <strong className="text-danger">{customerHistory.pendingPayment}</strong> {t('invoice.rs')}
                              </>
                            )}
                            {customerHistory.pendingPayment < 0 && (
                              <>
                                <br />
                                {t('invoice.balance')} ({t('invoice.advance')}){' '}
                                <strong className="text-success">{customerHistory.pendingPayment * -1}</strong> {t('invoice.rs')}
                              </>
                            )}
                            {customerHistory.returnEmptyProducts
                              .filter((p) => p.quantity > 0)
                              .map((p) => (
                                <>
                                  <br />
                                  {t('invoice.collect')}{' '}
                                  <strong className="text-danger"> {p.quantity} </strong> {t('invoice.empty')} <strong className="text-danger"> {p.product_name} </strong>
                                </>
                              ))}
                          </>
                        )}
                      </p>
                    </CAlert>
                  </div>
                </div>
              )}
              <div className="row">
                <div className="col-sm-4">
                  <div className="mb-3">
                    <CFormLabel htmlFor="invoiceType">{t('invoice.invoice_type')}</CFormLabel>
                    <CFormSelect
                      aria-label={t('invoice.select_invoice_type')}
                      name="invoiceType"
                      value={state.invoiceType}
                      options={[
                        {
                          label: t('invoice.regular'),
                          value: 1,
                        },
                        {
                          label: t('invoice.advance_booking'),
                          value: 2,
                        },
                      ]}
                      onChange={handleChange}
                      required
                      feedbackInvalid={t('invoice.select_type')}
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="mb-3">
                    <CFormLabel htmlFor="invoiceDate">{t('invoice.invoice_date')}</CFormLabel>
                    <CFormInput
                      type="date"
                      id="invoiceDate"
                      placeholder={t('invoice.pune')}
                      name="invoiceDate"
                      value={state.invoiceDate}
                      onChange={handleChange}
                      required
                      feedbackInvalid={t('invoice.select_date')}
                    />
                  </div>
                </div>
                <div className="col-sm-4">
                  {state.invoiceType == 2 && (
                    <div className="mb-3">
                      <CFormLabel htmlFor="deliveryDate">{t('invoice.delivery_date')}</CFormLabel>
                      <CFormInput
                        type="date"
                        id="deliveryDate"
                        placeholder={t('invoice.pune')}
                        name="deliveryDate"
                        value={state.deliveryDate}
                        onChange={handleChange}
                        required={state.invoiceType == 2}
                        feedbackInvalid={t('invoice.select_date')}
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Products table */}
              <div className="row">
                <div className="col-4">
                  <div className="mb-1">
                    <b>{t('invoice.product')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('invoice.price')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('invoice.quantity')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('invoice.total')}</b>
                  </div>
                </div>
                <div className="col-2">
                  <div className="mb-1">
                    <b>{t('invoice.action')}</b>
                  </div>
                </div>
              </div>
  
              {state.items?.map((oitem, index) => (
                <div key={index} className="row">
                  <div className="col-4">
                    <div className="mb-1">
                      <CFormSelect
                        aria-label={t('invoice.select_product')}
                        value={oitem.product_id}
                        options={products}
                        onChange={() => handleProductChange(event, index)}
                        invalid={oitem.notSelected == true}
                        required
                        feedbackInvalid={t('invoice.select_product')}
                      />
                    </div>
                  </div>
                  <div className="col-2">
                    <p>{oitem.dPrice + (oitem.unit ? ' / ' + oitem.unit : '')}</p>
                  </div>
                  <div className="col-2">
                    <CFormInput
                      type="number"
                      value={oitem.dQty}
                      invalid={oitem.invalidQty == true}
                      required
                      feedbackInvalid={`${t('invoice.max')} ${oitem.stockQty}`}
                      onChange={() => handleQtyChange(event, index)}
                    />
                  </div>
                  <div className="col-2">
                    <p>{oitem.total_price}</p>
                  </div>
                  <div className="col-2">
                    {state.items.length > 1 && (
                      <CButton color="" onClick={() => handleRemoveProductRow(index)}>
                        <CIcon icon={cilDelete} size="xl" style={{ '--ci-primary-color': 'red' }} />
                      </CButton>
                    )}
                    &nbsp;
                    {index === state.items.length - 1 && (
                      <CButton onClick={handleAddProductRow} color="">
                        <CIcon icon={cilPlus} size="xl" style={{ '--ci-primary-color': 'green' }} />
                      </CButton>
                    )}
                  </div>
                </div>
              ))}
              <div className="row">
                <div className="col-1">
                  <div className="mb-1"> </div>
                </div>
                <div className="col-3">
                  <div className="mb-1"></div>
                </div>
                <div className="col-2"></div>
                <div className="col-2">
                  <b>{t('invoice.total')}</b>
                </div>
                <div className="col-2">{state.totalAmount}</div>
                <div className="col-2"></div>
              </div>
              {/* Payment and Final Actions */}
              <div>
                <CRow>
                  <CCol xs={12} md={6}>
                    <CFormLabel htmlFor="paymentType">{t('invoice.payment_type')}</CFormLabel>
                    <CFormSelect
                      id="paymentType"
                      name="paymentType"
                      value={state.paymentType}
                      onChange={handleChange}
                    >
                      <option value={0}>{t('invoice.cash')}</option>
                      <option value={1}>{t('invoice.online')}</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
              </div>
              {/* Payment info */}
              <div className="row">
                <div className="col-sm-2">
                  <div className="mb-3">
                    <CFormLabel htmlFor="discount">{t('invoice.discount')} (%)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="discount"
                      placeholder="0"
                      name="discount"
                      value={state.discount === 0 ? '' : state.discount} // Blank when discount is 0
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Math.max(0, Math.min(100, e.target.value)); // Blank when empty, otherwise limit between 0 and 100
                        handleChange({ target: { name: 'discount', value } });
                      }}
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="mb-3">
                    <CFormLabel htmlFor="paidAmount">{t('invoice.paid_amount')} (Rs)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="paidAmount"
                      placeholder=""
                      name="paidAmount"
                      value={state.paidAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="mb-3">
                    <CFormLabel htmlFor="paidAmount">{t('invoice.balance_amount')} (Rs)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="balanceAmount"
                      placeholder=""
                      readOnly
                      name="balanceAmount"
                      value={state.balanceAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-sm-2">
                  <div className="mb-3">
                    <CFormLabel htmlFor="finalAmount">{t('invoice.final_amount')} (Rs)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="finalAmount"
                      placeholder=""
                      name="finalAmount"
                      readOnly
                      value={state.finalAmount}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div>
                {errorMessage && (
                  <CRow>
                    <CAlert color="danger">{errorMessage}</CAlert>
                  </CRow>
                )}
              </div>
              <div className="mb-3 mt-3">
                <CButton color="success" type="submit">
                  {t('invoice.submit')}
                </CButton>
                &nbsp;
                <CButton color="secondary" onClick={handleClear}>
                  {t('invoice.clear')}
                </CButton>
                &nbsp;
                {state.paymentType == 1 && (
                  <CButton className="mr-20" type="button" onClick={() => setShowQR(true)} color="primary">
                    {t('invoice.view_qr')}
                  </CButton>
                )}
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Invoice;
