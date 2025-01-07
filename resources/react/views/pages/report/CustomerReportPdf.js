import html2pdf from "html2pdf.js";
import { getUserData } from '../../../util/session';
import { marathiFont } from '../../common/font';

const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
    
    const [month, day, year] = formattedDate.split(' ');
    return `${day} ${month} ${year}`;
};

function convertTo12HourFormat(time) {
    let [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

export function generatePDFReport(grandTotal, state, report, remainingAmount) {
    const ci = getUserData()?.company_info;

    // Create HTML structure for the invoice
    const htmlContent = `
    <div style="font-family: 'NotoSansDevanagari', sans-serif; font-size: 12px;">
        <div style="text-align: center;">
            <img src="img/${ci.logo}" alt="Logo" style="width: 40px; height: 40px; margin-bottom: 10px;">
            <h2 style="color: green;">Order Report</h2>
        </div>
        
        <div style="text-align: right;">
            <p><strong>${ci.company_name}</strong></p>
            <p>${ci.land_mark}</p>
            <p>${ci.Tal}, ${ci.Dist}, ${ci.pincode}</p>
            <p>Phone: ${ci.phone_no}</p>
        </div>
        
        <div>
            <h3>Invoice to:</h3>
            <p>Customer Name: ${state.customer?.name || "NA"}</p>
            <p>Customer Address: ${state.customer?.address || "NA"}</p>
            <p>Mobile Number: ${state.customer?.mobile || "NA"}</p>
            <p>Invoice No: NA</p>
            <p>Start Date: ${formatDate(state.start_date)}</p>
            <p>End Date: ${formatDate(state.end_date)}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
            <thead>
                <tr style="background-color: #f2f2f2; text-align: center;">
                    <th style="border: 1px solid #ddd; padding: 5px;">Sr No</th>
                    <th style="border: 1px solid #ddd; padding: 5px;">Delivery Date & Time</th>
                    <th style="border: 1px solid #ddd; padding: 5px;">Items</th>
                    <th style="border: 1px solid #ddd; padding: 5px;">Paid (Rs)</th>
                    <th style="border: 1px solid #ddd; padding: 5px;">Pending (Rs)</th>
                    <th style="border: 1px solid #ddd; padding: 5px;">Total (Rs)</th>
                    <th style="border: 1px solid #ddd; padding: 5px;">Delivered By</th>
                </tr>
            </thead>
            <tbody>
                ${report.map((p, index) => {
                    return `
                    <tr style="text-align: center;">
                        <td style="border: 1px solid #ddd; padding: 5px;">${index + 1}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${formatDate(p.deliveryDate)} (${convertTo12HourFormat(p.deliveryTime)})</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">
                            ${p.items.map(i => `
                                ${i.product_name} ${i.dQty > 0 ? `(${i.dQty} Delivered)` : ''} ${i.eQty > 0 ? `(${i.eQty} Collected)` : ''}
                            `).join("<br>")}
                        </td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${p.paidAmount}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${(p.totalAmount - p.paidAmount)}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${p.totalAmount}</td>
                        <td style="border: 1px solid #ddd; padding: 5px;">${p.user.name}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>

        <div style="margin-top: 20px;">
            <h4>Grand Total</h4>
            <p>Amount Paid: ${(grandTotal - remainingAmount).toFixed(2)} /-</p>
            <p>Balance Amount: ${remainingAmount.toFixed(2)} /-</p>
        </div>

        <div style="margin-top: 20px;">
            <h4>Bank Details</h4>
            <p>Bank Name: ${ci.bank_name}</p>
            <p>Account No: ${ci.account_no}</p>
            <p>IFSC Code: ${ci.IFSC_code}</p>
            <div style="float: right; font-weight: bold; text-align: center;">
                <p>E-SIGNATURE</p>
                <img src="img/${ci.sign}" alt="Signature" style="width: 35px; height: 20px;">
                <p>Authorized Signature</p>
            </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 10px;">
            <p>This bill has been computer-generated and is authorized.</p>
        </div>
    </div>`;

    // Convert HTML to PDF using html2pdf
    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    // Set options for html2pdf
    const options = {
        margin: [10, 10, 10, 10],
        filename: `${state.customer?.name?.replace(" ", "-")}-${new Date().getTime()}.pdf`,
        html2canvas: { scale: 4 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    // Generate PDF from HTML
    html2pdf()
        .from(element)
        .set(options)
        .save();
}
