import React, { useEffect, useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import { getAPICall, post } from '../../../util/api';
import { useToast } from '../../common/toast/ToastContext';

function BulkQuantity() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [productStates, setProductStates] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getAPICall('/api/products');
      setProducts(response);
      // Initialize product states based on fetched products
      const initialStates = response.map(product => ({
        id: product.sizes?.[0]?.id,
        newQty: '',
      }));
      setProductStates(initialStates);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (productId, newQty) => {
    const qty = newQty === '' ? '' : parseInt(newQty, 10);
    setProductStates(prevStates =>
      prevStates.map(productState =>
        productState.id === productId
          ? { ...productState, newQty: isNaN(qty) ? '' : qty }
          : productState
      )
    );
  };

  const handleSubmit = async () => {
    try {
      for (const productState of productStates) {
        if (productState.newQty !== '') {
          const data = {
            id: productState.id,
            qty: productState.newQty,
          };
          await post('/api/product/updateQty', data);
        }
      }
      setSubmitStatus('Submitted successfully');
      // Optionally, refetch updated data here if needed
      fetchProducts();
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
      console.error('Error submitting data:', error);
      setSubmitStatus('Submission failed');
    }
  };

  const isFormValid = () => {
    return productStates.every(productState => productState.newQty === '' || productState.newQty >= 0);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Bulk Quantity</strong>
          </CCardHeader>
          <CCardBody>
            <div className='table-responsive'>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Current Quantity</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Add Quantity</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {products.map((p) => {
                    const productState = productStates.find(ps => ps.id === p.sizes?.[0]?.id) || {};
                    return (
                      <CTableRow key={p.id}>
                        <CTableHeaderCell scope="row">{p.id}</CTableHeaderCell>
                        <CTableDataCell>{p.name}</CTableDataCell>
                        <CTableDataCell>{p.sizes[0]?.qty}</CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            type="number"
                            value={productState.newQty}
                            onChange={(e) => handleInputChange(productState.id, e.target.value)}
                            size="lg"
                            placeholder="Enter quantity"
                            min="0"
                            aria-label="Quantity input"
                          />
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </div>
            <CButton color="primary" onClick={handleSubmit} disabled={!isFormValid()}>Submit</CButton>
            {submitStatus && <div>{submitStatus}</div>}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}

export default BulkQuantity;
