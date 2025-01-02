import React from 'react';
import html2pdf from "html2pdf.js";
import { getUserData } from '../../../util/session';

export function generatePDF(grandTotal, invoiceNo, customerName, formData, remainingAmount, totalAmountWords) {
    const ci = getUserData()?.company_info;

    if (!ci) {
        console.error("Company Info not found.");
        return;
    }

    // Invoice HTML structure
    const invoiceContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="width: 40%;">
                    <img src="img/${ci.logo}" alt="Company Logo" style="width: 100px;" />
                </div>
                <div style="text-align: right; width: 60%;">
                    <h2 style="margin: 0; font-size: 16px;">${ci.company_name}</h2>
                    <p style="margin: 5px 0; font-size: 14px;">${ci.land_mark}, ${ci.Tal}, ${ci.Dist}, ${ci.pincode}</p>
                    <p style="margin: 5px 0; font-size: 14px;">Phone: ${ci.phone_no}</p>
                </div>
            </div>

            <!-- Status Section -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="background-color: #d1e7dd; padding: 10px; border: 1px solid #b2d8cc; margin: 0; font-size: 16px;">${formData.InvoiceStatus}</h3>
            </div>

            <!-- Customer and Invoice Details -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div style="width: 48%; padding: 10px; background-color: #f0f8ff; border: 1px solid #add8e6;">
                    <p style="font-size: 16px;"><strong>ग्राहकाचे नाव:</strong> <span style="font-size: 14px;">${formData.customer.name}</span></p>
                    <p style="font-size: 16px;"><strong>ग्राहकाचा पत्ता:</strong> <span style="font-size: 14px;">${formData.customer.address}</span></p>
                    <p style="font-size: 16px;"><strong>मोबाईल क्रमांक:</strong> <span style="font-size: 14px;">${formData.customer.mobile}</span></p>
                </div>
                <div style="width: 48%; padding: 10px; background-color: #fff7e6; border: 1px solid #ffcc99;">
                    <p style="font-size: 16px;"><strong>चलन क्रमांक:</strong> <span style="font-size: 14px;">${invoiceNo}</span></p>
                    <p style="font-size: 16px;"><strong>चलन तारीख:</strong> <span style="font-size: 14px;">${formData.date.split("-").reverse().join("-")}</span></p>
                    ${
                        formData.InvoiceType === 2
                            ? `<p style="font-size: 16px;"><strong>डिलीव्हरी तारीख:</strong> <span style="font-size: 14px;">${formData.DeliveryDate.split("-").reverse().join("-")}</span></p>`
                            : ""
                    }
                </div>
            </div>

            <!-- Products Table -->
            <h3 style="font-size: 16px;">उत्पादने</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">अनुक्रमांक</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">वस्तूचे नाव</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">किंमत (₹)</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">प्रमाण</th>
                        <th style="border: 1px solid #ddd; padding: 8px; font-size: 16px;">एकूण (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${formData.products
                        .map((product, index) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${index + 1}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.product_name}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.dPrice} /-</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.dQty}</td>
                                <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${product.total_price} /-</td>
                            </tr>
                        `)
                        .join("")}
                    <tr style="background-color: #f8f9fa;">
                        <td colspan="4" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-size: 16px;"><strong>एकूण</strong></td>
                        <td style="border: 1px solid #ddd; padding: 8px; font-size: 14px;">${grandTotal} /-</td>
                    </tr>
                </tbody>
            </table>

            <!-- Additional Details -->
            <div style="margin-bottom: 20px; padding: 10px; background-color: #e6ffe6; border: 1px solid #ccffcc;">
                <p style="font-size: 16px;"><strong>रक्कम भरलेली:</strong> <span style="font-size: 14px;">${formData.amountPaid.toFixed(2)} /-</span></p>
                <p style="font-size: 16px;"><strong>शिल्लक रक्कम:</strong> <span style="font-size: 14px;">${remainingAmount.toFixed(2)} /-</span></p>
                <p style="font-size: 16px;"><strong>पेमेंट मोड:</strong> <span style="font-size: 14px;">${formData.paymentMode}</span></p>
            </div>

            <p style="font-size: 16px;"><strong>रक्कम शब्दांत:</strong> <span style="font-size: 14px;">${totalAmountWords} फक्त</span></p>

            <!-- Footer Section -->
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div style="width: 48%;">
                    <h4 style="font-size: 16px;">बँक तपशील</h4>
                    <p style="font-size: 14px;"><strong>बँक:</strong> ${ci.bank_name}</p>
                    <p style="font-size: 14px;"><strong>खाते क्रमांक:</strong> ${ci.account_no}</p>
                    <p style="font-size: 14px;"><strong>IFSC कोड:</strong> ${ci.IFSC_code}</p>
                </div>
                <div style="text-align: center; width: 48%;">
                    <p style="font-size: 16px;"><strong>ई-स्वाक्षरी</strong></p>
                    <img src="img/${ci.sign}" alt="Signature" style="width: 100px; height: 50px;" />
                    <p style="font-size: 14px;">अधिकृत स्वाक्षरी</p>
                </div>
            </div>

            <hr style="border: 1px solid #ddd; margin: 20px 0;" />
            <p style="text-align: center; font-size: 14px;">हे चलन संगणकाद्वारे तयार केले आहे आणि अधिकृत आहे.</p>
        </div>
    `;

    // Create the element and generate PDF
    const element = document.createElement("div");
    element.innerHTML = invoiceContent;

    const options = {
        margin: [10, 10, 10, 10],
        filename: `${invoiceNo}-${customerName}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
}

function InvoicePdf() {
    return (
        <div>
            <button onClick={() => {
                const formData = {
                    customer: {
                        name: "श्रेया ग",
                        address: "कर्वेनगर",
                        mobile: "1234567890",
                    },
                    date: "2024-12-31",
                    InvoiceStatus: "डिलिव्हर्ड ऑर्डर",
                    InvoiceType: 2,
                    DeliveryDate: "2025-01-01",
                    products: [
                        { product_name: "सफरचंद", dPrice: 100, dQty: 2, total_price: 200 },
                        { product_name: "केळी", dPrice: 50, dQty: 4, total_price: 200 },
                    ],
                    amountPaid: 300,
                    paymentMode: "ऑनलाइन",
                    discount: 10,
                };

                generatePDF(400, "INV-001", "श्रेया ग", formData, 100, "चारशे");
            }}>
                चलन डाउनलोड करा
            </button>
        </div>
    );
}

export default InvoicePdf;
