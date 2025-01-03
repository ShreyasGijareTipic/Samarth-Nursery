import './style.css';
import { CButton, CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react';
import React, { useState, useEffect } from 'react';
import { generatePDF as generateMarathiPDF } from './InvoicePdf';
import { generatePDF as generateEnglishPDF } from './InvoicePdfEnglish';
import { getAPICall } from '../../../util/api';
import { useParams } from 'react-router-dom';
import { getUserData } from '../../../util/session';
import { useToast } from '../../common/toast/ToastContext';

const InvoiceDetails = () => {
  const ci = getUserData()?.company_info;
  const param = useParams();
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalAmountWords, setTotalAmountWords] = useState('');
  const [grandTotal, setGrandTotal] = useState(0);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    customer: {},
    date: '',
    products: [],
    discount: '',
    amountPaid: 0,
    paymentMode: '',
    InvoiceStatus: '',
    finalAmount: 0,
    InvoiceNumber: '',
    status: '',
    DeliveryDate: '',
    InvoiceType: '',
  });

  const numberToWords = (number) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (number === 0) return 'Zero';

    let words = '';
    if (number >= 100000) {
      words += numberToWords(Math.floor(number / 1000)) + ' Lakh ';
      number %= 100000;
    }
    if (number >= 1000) {
      words += numberToWords(Math.floor(number / 1000)) + ' Thousand ';
      number %= 1000;
    }
    if (number >= 100) {
      words += units[Math.floor(number / 100)] + ' Hundred ';
      number %= 100;
    }
    if (number >= 20) {
      words += tens[Math.floor(number / 10)] + ' ';
      number %= 10;
    }
    if (number >= 10) {
      words += teens[number - 10] + ' ';
      number = 0;
    }
    if (number > 0) {
      words += units[number] + ' ';
    }
    return words.trim();
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchOrder = async () => {
    try {
      const response = await getAPICall('/api/order/' + param.id);

      let paymentModeString = response.paymentType === 0 ? 'Cash' : 'Online (UPI/Bank Transfer)';

      let orderStatusString = '';
      switch (response.orderStatus) {
        case 0:
          orderStatusString = 'Canceled Order';
          break;
        case 1:
          orderStatusString = 'Delivered Order';
          break;
        case 2:
          orderStatusString = 'Order Pending';
          break;
        default:
          orderStatusString = 'Unknown Status';
          break;
      }

      let discountValue = response.discount || -1;
      let finalAmount = Math.round(response.finalAmount);
      let remaining = finalAmount - response.paidAmount;
      setRemainingAmount(Math.max(0, remaining));

      setFormData({
        customer: response.customer,
        date: response.invoiceDate,
        products: response.items,
        discount: discountValue,
        amountPaid: response.paidAmount,
        paymentMode: paymentModeString,
        InvoiceStatus: orderStatusString,
        finalAmount: finalAmount,
        InvoiceNumber: response.id,
        status: response.orderStatus,
        DeliveryDate: response.deliveryDate,
        InvoiceType: response.invoiceType,
      });

      setGrandTotal(finalAmount);
      setTotalAmountWords(numberToWords(finalAmount));
    } catch (error) {
      showToast('danger', 'Error occurred ' + error);
      console.error('Error fetching product data:', error);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [param.id]);

  const handleDownload = (language) => {
    const invoiceNo = formData.InvoiceNumber;
    const isMarathi = language === 'marathi';

    if (isMarathi) {
      generateMarathiPDF(
        grandTotal,
        invoiceNo,
        formData.customer.name,
        formData,
        remainingAmount,
        totalAmountWords,
        isMarathi
      );
    } else {
      generateEnglishPDF(
        grandTotal,
        invoiceNo,
        formData.customer.name,
        formData,
        remainingAmount,
        totalAmountWords
      );
    }
  };

  let invoiceName;
  if (formData.status === 0) {
    invoiceName = <h5 className='text-danger '>{formData.InvoiceStatus}</h5>;
  } else if (formData.status === 1) {
    invoiceName = <h5 className='text-success '>{formData.InvoiceStatus}</h5>;
  } else if (formData.status === 2) {
    invoiceName = <h5 className='text-warning '>{formData.InvoiceStatus}</h5>;
  }

  return (
    <CCard className="mb-4">
      <CCardHeader className='no-print'>
        <strong>Invoice</strong>
      </CCardHeader>
      <CCardBody>
        <CContainer className="container-md invoice-content">
          <div className='row'>
            <div className='col-4'></div>
            <div className='col-4 text-center'>{invoiceName}</div>
            <div className='col-4'></div>
          </div>
          <div className="d-flex flex-row mb-3">
            <div className="flex-fill">
              <img src={'img/' + ci.logo} width="150" height="150" alt="Logo" />
            </div>
            <div className="flex-fill"></div>
            <div className="ml-3">
              <p>{ci.company_name}</p>
              <p>{ci.land_mark}</p>
              <p>{ci.Tal}, {ci.Dist}, {ci.pincode}</p>
              <p>Phone: {ci.phone_no}</p>
            </div>
          </div>

          <div className="row mt-10">
            <div className="flex-fill col-6">
              <div className="col-md-6">
                <h6 style={{ fontWeight: 'bold' }}>Invoice To:</h6>
                <p style={{ fontWeight: 'bold' }}>Customer Name: <span>{formData.customer?.name}</span></p>
                <p style={{ fontWeight: 'bold' }}>Customer Address: <span>{formData.customer?.address}</span></p>
                <p style={{ fontWeight: 'bold' }}>Mobile Number: <span>{formData.customer?.mobile}</span></p>
              </div>
            </div>
            <div className='col-2'></div>
            <div className='col-4'>
              <div className="flex-fill col-md-8">
                <h6 style={{ fontWeight: 'bold' }}>Invoice No: {formData.InvoiceNumber}</h6>
                <p style={{ fontWeight: 'bold' }}>Invoice Date: <span>{formData.date}</span></p>
                {formData.InvoiceType === 2 && <p style={{ fontWeight: 'bold' }}>Delivery Date: <span>{formData.DeliveryDate}</span></p>}
              </div>
            </div>
          </div>

          <div className="row section">
            <div className="col-md-12">
              <table className="table table-bordered border-black">
                <thead className='table-success border-black'>
                  <tr>
                    <th className='text-center'>Sr No</th>
                    <th className='text-center'>Item Name</th>
                    <th className='text-center'>Price (Rs)</th>
                    <th className='text-center'>Quantity</th>
                    <th className='text-center'>Total (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.products.map((product, index) => (
                    <tr key={index}>
                      <td className='text-center'>{index + 1}</td>
                      <td className='text-center'>{product.product_name}</td>
                      <td className='text-center'>{product.dPrice}&nbsp;₹ {product.product_unit ? ` per ${product.product_unit}` : ''}</td>
                      <td className='text-center'>{product.dQty}{product.product_unit ? ` ${product.product_unit}` : ''}</td>
                      <td className='text-center'>{product.total_price}&nbsp;₹</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="4">Grand Total</td>
                    <td className='text-center'>{formData.finalAmount}&nbsp;₹</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="row section">
            <div className="col-md-12 flex">
              <p>
                Total Amount (In Words): &nbsp;
                <span>{totalAmountWords} Rupees Only </span>
              </p>
            </div>
          </div>

          <div className="row section">
            <div className="col-md-12">
              <table className="table table-bordered border-black">
                <tbody>
                  {formData.discount > 0 && (
                    <tr>
                      <td>Discount (%):</td>
                      <td>{formData.discount}&nbsp;%</td>
                    </tr>
                  )}
                  <tr>
                    <td>Amount Paid:</td>
                    <td>{formData.amountPaid}&nbsp;₹</td>
                  </tr>
                  <tr>
                    <td>Balance Amount:</td>
                    <td>{remainingAmount.toFixed(2)}&nbsp;₹</td>
                  </tr>
                  <tr>
                    <td>Payment Mode:</td>
                    <td>{formData.paymentMode}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex border p-3 border-black">
            <div className='flex-fill'>
              <div className="d-flex flex-column mb-3">
                <h6>Bank Details</h6>
                <p>{ci.bank_name}</p>
                <p>Account No: {ci.account_no}</p>
                <p>IFSC code: {ci.IFSC_code}</p>
              </div>
            </div>

            <div className='flex-fill'>
              <div className="d-flex flex-column align-items-center text-center ">
                <h6>E-SIGNATURE</h6>
                <img height="100" width="200" src={'img/' + ci.sign} alt="signature" />
                <p>Authorized Signature</p>
              </div>
            </div>
          </div>

          <div className="row section mt-3">
            <div className="col-md-12 text-center">
              <p>This bill has been computer-generated and is authorized.</p>
            </div>
          </div>

          <div className='d-flex justify-content-center'>
            <CButton color="primary" variant="outline" onClick={handlePrint} className='d-print-none me-2'>Print</CButton>
            <CButton color="success" variant="outline" onClick={() => handleDownload('marathi')} className='d-print-none me-2'>Download (Marathi)</CButton>
            <CButton color="success" variant="outline" onClick={() => handleDownload('english')} className='d-print-none'>Download (English)</CButton>
          </div>
        </CContainer>
      </CCardBody>
    </CCard>
  );
};

export default InvoiceDetails;
