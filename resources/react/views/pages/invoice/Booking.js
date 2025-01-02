import './Invoice.css'
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
  CFormSelect,
  CRow,
} from '@coreui/react'
import { getAPICall, post } from '../../../util/api'
import QRCodeModal from '../../common/QRCodeModal'
import NewCustomerModal from '../../common/NewCustomerModal'
import { useToast } from '../../common/toast/ToastContext'
import { useTranslation } from 'react-i18next'
import { useSpinner } from '../../common/spinner/SpinnerProvider'

let debounceTimer;
const Booking = () => {
  const [validated, setValidated] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [customerHistory, setCustomerHistory] = useState()
  const { showToast } = useToast();
  const [state, setState] = useState({
    customer_id: 0,
    lat:'',
    long:'',
    payLater: false,
    isSettled: false,
    invoiceDate: new Date().toISOString().split('T')[0],
    deliveryTime: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`,
    deliveryDate: '',
    invoiceType: 2,
    items: [],
    totalAmount: 0,
    orderStatus: 2,
    discount: 0,
    balanceAmount: 0,
    paidAmount: 0,
    finalAmount: 0,
    paymentType: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showSpinner, hideSpinner } = useSpinner();

  const [customerName, setCustomerName] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const { t } = useTranslation("global")

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
    setAllProducts(updatedProducts)
    calculateTotal(updatedProducts)
    setSuggestions([]);
    getCustomerHistory(suggestion.id);
  };

  const onCustomerAdded = (customer) => {
    handleSuggestionClick(customer);
    setShowCustomerModal(false);
  }

  const getCustomerHistory = async (customer_id)=>{
    try {
      //customerHistory
      showSpinner();
      const response = await getAPICall('/api/customerHistory?id=' + customer_id);
      if (response) {
        setCustomerHistory(response);
      }
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
    hideSpinner();
  }

  const discountedPrices = (products, discount) =>{
    products.forEach(p=>{
      p.sizes[0].dPrice = getDiscountedPrice(p, discount)
    })
    return products;
  }
  const getDiscountedPrice = (p, discount) => {
      const value = p.sizes[0].oPrice ?? 0; // Use 0 if oPrice is undefined
      const discountValue = discount || (customerName.discount ?? 0); // Default to 0 if discount is undefined
      const price = value - (value * discountValue / 100);
      return Math.round(price);
  }

  const fetchProduct = async () => {
    showSpinner();
    try {
      const response = await getAPICall('/api/product');
      setAllProducts(discountedPrices([...response.filter((p) => p.show == 1 && p.showOnHome == 1)]));
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
    hideSpinner();
  }

  const calculateTotal = (items) => {
    //update function with code.
    let total = 0
    items.forEach((item) => {
      total += (item.dQty ?? 0) * (item.sizes[0].dPrice ?? 0);
    })
    setState((prev)=>({...prev, totalAmount: total}));
  }

  //Disabled location fetching
  // useEffect(()=>{
  //   var options = {
  //     enableHighAccuracy: true,
  //     timeout: 5000,
  //     maximumAge: 0,
  //   };

  //   function success(pos) {
  //     var crd = pos.coords;
  //     console.log("Your current position is:",`Lat: ${crd.latitude}`,`Long: ${crd.longitude}`,`${crd.accuracy} meters`);
  //     setState((pre)=>({...pre, lat: crd.latitude, long: crd.longitude}))
  //   }
  
  //   function errors(err) {
  //     console.warn(`ERROR(${err.code}): ${err.message}`);
  //   }

  //   navigator.geolocation.getCurrentPosition(success, errors, options);
  // },[])

  useEffect(() => {
    fetchProduct();
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setState({ ...state, [name]: value })
  }

  const handleSubmit = async (event) => {
    try {
      event.preventDefault()
      event.stopPropagation()
      // Step 2: Check if already submitting
      if (isSubmitting) return; // Prevent multiple submissions
      setIsSubmitting(true);
      //Valdation
      let isInvalid = false
      let clonedState = { 
        ...state,
        deliveryDate: state.invoiceDate,
        finalAmount: state.totalAmount, 
        items: [] 
      };
      allProducts.forEach((p)=>{
        if(p.dQty > 0 || p.eQty > 0){
          const sz = p.sizes[0];
          let item = {
            ...p,
            product_sizes_id: sz.id,
            size_name: sz.name,
            size_local_name: sz.localName,
            oPrice: sz.oPrice,
            bPrice: sz.bPrice,
            dPrice: sz.dPrice,
            total_price: sz.dPrice * p.dQty
          };
          clonedState.items.push({...item});
        }
      })

      if(clonedState.invoiceType == 1){
        clonedState.orderStatus = 1;
      }

      //Cusetomer name
      const eligibleToSubmit = clonedState.customer_id > 0 && (clonedState.paidAmount > 0 || clonedState.items.length)

      if (!isInvalid && eligibleToSubmit) {
        showSpinner();
        const res = await post('/api/order', { ...clonedState })
        if(res.id){
          showToast('success',t("MSG.booking_is_done_msg"));
          handleClear();
        }else{
          showToast('danger','t("MSG.error_occured_msg")');
        }
      } else {
        setValidated(true)
        setState(clonedState)
        showToast('warning',t("MSG.provide_valid_data_msg"));
      }
    } catch (error) {
      showToast('danger','Error occured '+error);
    }
    hideSpinner();
    setIsSubmitting(false);
  }

  const handleClear = async () => {
    setState({
      customer_id: 0,
      lat:'',
      long:'',
      payLater: false,
      isSettled: false,
      invoiceDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      deliveryTime: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`,
      invoiceType: 2,
      items: [],
      totalAmount: 0,
      discount: 0,
      balanceAmount: 0,
      paidAmount: 0,
      finalAmount: 0,
      paymentType: 1,
      orderStatus: 2,
    })
    const allProductsCopy = [...allProducts];
    allProductsCopy.forEach(p=>{
      p['eQty'] = 0;
      p['dQty'] = 0;
    });
    setAllProducts([...allProductsCopy]);
    setCustomerName({name: ''});
    setCustomerHistory(undefined);
    setValidated(false);
  }
  const handleQuantityChange = (index, qty, key) => {
    const allProductsCopy = [...allProducts];
    allProductsCopy[index][key] = qty;
    setAllProducts([...allProductsCopy]);
    calculateTotal(allProductsCopy);
  }
  return (
    <CRow>
      <NewCustomerModal hint={customerName.name} onSuccess={onCustomerAdded} visible={showCustomerModal} setVisible={setShowCustomerModal}/>
      <QRCodeModal visible={showQR} setVisible={setShowQR}></QRCodeModal>
    <CCol xs={12}>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>{t("LABELS.booking")}</strong>
        </CCardHeader>
        <CCardBody>
          <CForm noValidate validated={validated} onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-8">
                <CFormInput
                  type="text"
                  id="pname"
                  placeholder={t('LABELS.customer_name')}
                  name="customerName"
                  value={customerName.name}
                  onChange={handleNameChange}
                  autoComplete='off'
                  feedbackInvalid={t('MSG.please_provide_name')}
                  required
                />
                {customerName.name?.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                        {suggestion.name}
                      </li>
                    ))}
                    {!customerName.id && <li>
                      <CBadge
                        role="button"
                        color="danger"
                        onClick={() => setShowCustomerModal(true)}
                      >
                        {t("LABELS.new_customer")}
                      </CBadge>
                    </li>}
                  </ul>
                )}
              </div>
              <div className="col-4">
                {/* <CButton color="success"
                onClick={() => setShowCustomerModal(true)}
                >
                  {t("LABELS.new")}
                </CButton> */}
                <CBadge
                  role="button"
                  color="danger"
                  style={{
                    padding: '10px 8px',
                    float: 'right'
                  }}
                  onClick={() => setShowCustomerModal(true)}
                >
                  {t("LABELS.new")}
                </CBadge>
              </div>
            </div>
            {customerName.id && <div className="row">
              <div className="col-sm-12 mt-1">
              <CAlert color="success">
                <p>
                  <strong>{t("LABELS.name")}:</strong> {customerName.name} ({customerName.mobile}) <br/>
                  {customerName.address && <><strong>{t("LABELS.address")}: </strong> {customerName.address}</>}
                  {customerHistory && <>
                  {
                    customerHistory.pendingPayment > 0 && <><br/>{t("LABELS.credit")} <strong className="text-danger">{customerHistory.pendingPayment}</strong> {t("LABELS.rs")}.</>
                  }
                  {
                    customerHistory.returnEmptyProducts.filter(p=>p.quantity>0).map(p=>(<>
                    <br/>{t("LABELS.collect")} <strong className="text-danger"> {p.quantity} </strong> {t("LABELS.empty")}  <strong className="text-danger"> {p.product_name} </strong>
                    </>))
                  }
                  </>}
                </p>
              </CAlert>
              </div>
            </div>}
              <div className="row mt-2">
                <div className="col-sm-4 mb-3">
                  <CFormLabel htmlFor="invoiceDate">{t("LABELS.delivery_date")}</CFormLabel>
                  <CFormInput
                    type="date"
                    id="invoiceDate"
                    placeholder="Pune"
                    name="invoiceDate"
                    date= {new Date()}
                    //max={today}
                    value={state.invoiceDate}
                    onChange={handleChange}
                    required
                    feedbackInvalid={t("MSG.please_select_date_msg")}
                  />
                </div>
                <div className="col-sm-4 mb-3 pr-5">
                  <CFormLabel htmlFor="deliveryTime">{t("LABELS.delivery_time")}</CFormLabel>
                  {/* <label htmlFor="deliveryTime">Delivery Time</label> */}
                  <div className="input-group date" id="timePicker">
                      <input 
                        type="time" 
                        id="deliveryTime"
                        name="deliveryTime"
                        className="form-control timePicker"
                        value={state.deliveryTime}
                        onChange={handleChange}
                      />
                  </div>
                </div>
                <div className="col-sm-4 mb-3 pr-5">
                  <CFormLabel htmlFor="invoiceType">{t("LABELS.order_type")}</CFormLabel>
                  <CFormSelect
                    aria-label="Select Product Type"
                    name="invoiceType"
                    value={state.invoiceType}
                    options={[
                      {
                        label: 'Regular',
                        value: 1,
                      },
                      {
                        label: 'Advance Booking',
                        value: 2,
                      },
                    ]}
                    onChange={handleChange}
                    required
                    feedbackInvalid="Please select type."
                  />
                </div>
              </div>
                {
                  allProducts.map((p, index)=> (<div key={p.id} className="row bottom-border">
                    <div className="col-6 mb-3 pr-5">
                      <CFormLabel htmlFor="product">
                        {/* {t("LABELS.filled")}  */}
                        {p.name}
                      </CFormLabel>
                      <div className="input-group">
                      <button 
                        className="btn btn-danger" 
                        type="button" 
                        onClick={() => {
                          handleQuantityChange(index, Math.max(0, (p.dQty ?? 1) - 1),'dQty')
                        }}
                      >
                        -
                      </button>
                      <CFormInput
                        type="number"
                        id="dQty"
                        placeholder="0"
                        name="dQty"
                        value={p.dQty}
                        onChange={(e)=>{
                          handleQuantityChange(index, parseInt(e.target.value ?? '0'),'dQty')
                        }}
                        min="0"
                      />
                      <button 
                        className="btn btn-success" 
                        type="button" 
                        onClick={() => {
                          handleQuantityChange(index, Math.max(0, (p.dQty ?? 0) + 1),'dQty')
                        }}
                      >
                        +
                      </button>
                      </div>
                    </div>
                    <div className="col-3 mb-3 pr-5 d-none">
                      <CFormLabel htmlFor="product">{t("LABELS.rate")}</CFormLabel>
                      <CFormInput
                        type="number"
                        readOnly
                        disabled
                        value={p.sizes[0].oPrice}
                      />
                    </div>
                    <div className="col-3 mb-3 pr-5">
                      <CFormLabel htmlFor="product">{t("LABELS.rate")}</CFormLabel>
                      <br/>
                      {getDiscountedPrice(p)}
                      {/* <CFormInput
                        type="number"
                        disabled
                        value={getDiscountedPrice(p)}
                      /> */}
                    </div>
                    <div className="col-3 mb-3 pr-5">
                      <CFormLabel htmlFor="product">{t("LABELS.total")}</CFormLabel>
                      <br/>
                      {(getDiscountedPrice(p) * p.dQty) || 0}
                      {/* <CFormInput
                        type="number"
                        id="bPrice"
                        placeholder="0"
                        name="bPrice"
                        disabled
                        value={(getDiscountedPrice(p) * p.dQty)}
                        onChange={handleChange}
                      /> */}
                    </div>
                    {p.sizes[0].returnable === 1 && <div className="col-6 mb-3 pr-5 d-none" >
                      <CFormLabel htmlFor="product">{t("LABELS.empty")} {p.name} {t("LABELS.collected")}</CFormLabel>
                      <div className="input-group">
                        <button 
                          className="btn btn-danger" 
                          type="button" 
                          onClick={() => handleQuantityChange(index, Math.max(0, (p.eQty ?? 0) - 1),'eQty')}
                        >
                          -
                        </button>
                        <CFormInput
                          type="number"
                          id="eQty"
                          placeholder="0"
                          name="eQty"
                          value={p.eQty ?? 0}
                          onChange={(e)=>{
                            handleQuantityChange(index, parseInt(e.target.value ?? '0'),'eQty')
                          }}
                          min="0"
                        />
                        <button 
                          className="btn btn-success" 
                          type="button" 
                          onClick={() => handleQuantityChange(index, Math.max(0, (p.eQty ?? 0) + 1),'eQty')}
                        >
                          +
                        </button>
                      </div>
                    </div>}
                    </div>))
                }

              <div className="side-by-side">
                <div className="col-sm-3 mb-3 pr-5">
                  <CFormLabel htmlFor="totalAmount">{t("LABELS.total_amount")}</CFormLabel>
                  <CFormInput
                    type="number"
                    id="totalAmount"
                    placeholder="0"
                    name="totalAmount"
                    readOnly
                    disabled
                    value={state.totalAmount}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-sm-3 mb-3 pr-5">
                  <CFormLabel htmlFor="bPrice">{t("LABELS.cash_collected")}</CFormLabel>
                  <CFormInput
                    type="number"
                    id="paidAmount"
                    placeholder="0"
                    name="paidAmount"
                    value={state.paidAmount}
                    onChange={handleChange}
                  />
                </div>
              </div>

            <div className="side-by-side">
              <CButton type="submit" color="success">{t("LABELS.submit")}</CButton>
              &nbsp; &nbsp;
              <CButton className='mr-20' type="button" onClick={handleClear} color="danger">{t("LABELS.clear")}</CButton> 
              &nbsp; &nbsp;
              <CButton className='mr-20' type="button" onClick={()=>{setShowQR(true)}} color="primary">{t("LABELS.view_QR")}</CButton>
            </div>
           
          </CForm>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
  )
}

export default Booking
