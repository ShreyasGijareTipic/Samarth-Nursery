import { CButton, CFormInput, CFormLabel, CToast, CToastBody, CToastClose } from '@coreui/react';
import React, { useState } from 'react';
import './UpdatePopUp.css';
import { useSearchParams } from 'react-router-dom';

function UpdatePopUp({ isVisible, onClose, orderData }) {
   
    const [payAmount,setAmount]=useState(0);
    return (
        isVisible && (
            <div className="modal-overlay">
                <CToast autohide={false} visible={true} className="toast-centered">
                    <CToastBody>
                        <h5>Update Payment</h5>
                        {orderData && (
                           
                            <div className='container'>
    <div className='row'>
    <div className="col-sm-4">
               <div className="mb-3">
                    <CFormLabel htmlFor="customerMobile" className='text-secondary'>Invoice Number</CFormLabel>
                    <CFormInput
                         type="text"
                         maxLength="10"
                         minLength = "10"
                         pattern="[0-9]*"
                         id="customerMobile"
                         placeholder="9123456780"
                         name="customerMobile"
                        value={orderData.id}
                        readOnly
                    
                       />
               </div>
    </div>
    <div className="col-sm-4">
               <div className="mb-3">
                    <CFormLabel htmlFor="customerMobile" >Customer Name</CFormLabel>
                    <CFormInput
                         type="text"
                         className='text-secondary'
                         maxLength="10"
                         minLength = "10"
                         pattern="[0-9]*"
                         id="customerMobile"
                         placeholder="9123456780"
                         name="customerMobile"
                        value={orderData.customerName}
                        readOnly
                    
                       />
               </div>
    </div>
     <div className="col-sm-4">
                <div className="mb-3">
                    <CFormLabel htmlFor="customerMobile">Mobile Number</CFormLabel>
                    <CFormInput
                         type="text"
                         className='text-secondary'
                         maxLength="10"
                         minLength = "10"
                         pattern="[0-9]*"
                         id="customerMobile"
                         name="customerMobile"
                        value={orderData.customerMobile}
                        
                         required
                         readOnly
                       />
                </div>
     </div>
      
    </div>
    <div className='row'>

     <div className="col-sm-4">
                <div className="mb-3">
                    <CFormLabel htmlFor="customerMobile" >Total Amount</CFormLabel>
                    <CFormInput
                         type="text"
                         className='text-secondary'
                         pattern="[0-9]*"
                         id="customTotal AmounterMobile"
                         name="Total Amount"
                        value={orderData.finalAmount}
                        
                         required
                         readOnly
                       />
                </div>
     </div>
     <div className="col-sm-4">
                <div className="mb-3">
                    <CFormLabel htmlFor="customerMobile" className='text-success'>Paid till date </CFormLabel>
                    <CFormInput className='text-success'
                         type="text"
                        
                         pattern="[0-9]*"
                         id="Total Amount"
                         name="Total Amount"
                        value={orderData.paidAmount}
                        
                         required
                         readOnly
                       />
                </div>
     </div>
     <div className="col-sm-4">
                <div className="mb-3">
                    <CFormLabel htmlFor="customerMobile" className='text-danger'>Remaining Amount </CFormLabel>
                    <CFormInput className='text-danger'
                         type="text"
                         maxLength="10"
                         minLength = "10"
                         pattern="[0-9]*"
                         id="customerMobile"
                         placeholder="9123456780"
                         name="customerMobile"
                         value={orderData.balance}
                         required
                         readOnly
                       />
                </div>
     </div>
    </div>
    <div className='row'>
    <div className="col-sm-4">
           <div className="mb-6">
              {/* <CFormLabel htmlFor="enter Amount" className='text-danger'>Enter Amount </CFormLabel> */}
                    <CFormInput className='text-danger'
                         type="number"
                         pattern="[0-9]*"

                         id="enter Amount"
                         placeholder="Pay Amount"
                         name="enteramount"
                         onSelect={true}
                         required
                         
                       />
                 </div>
                </div>

    
        <div className="col-sm-6">     
              <div className='d-flex'>
                <CButton type="button" color="primary"  size="sm" className='mx-1'>
                                Full Payment 
                </CButton>
               
  
                <CButton type="button" color="secondary" size="sm" className='mx-1'>
                                Clear
              </CButton>
              </div>
        </div>
    </div>


        </div>
   
                            
                        )}
                        
                  
                        <div className="mt-4 pt-2 border-top">
                            <CButton type="button" color="success" size="md" className='mx-2'>
                                Update 
                            </CButton>
                            <CToastClose as={CButton} color="danger" size="md" className="mx-2" onClick={onClose}>
                                Close
                            </CToastClose>
                        </div>
                    </CToastBody>
                </CToast>
            </div>
        )
    );
}

export default UpdatePopUp;
