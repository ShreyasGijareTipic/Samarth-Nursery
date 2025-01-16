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
    <div style="font-family: 'NotoSansDevanagari', sans-serif; font-size: 12px; color: #333;">
        <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f1f8e9; padding: 10px;">
            <img src="img/${ci.logo}" alt="Logo" style="width: 50px; height: 50px;">
            <h2 style="color: #4caf50; font-size: 24px; margin: 0; text-align: right;">${ci.company_name}</h2>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
            <div style="text-align: right; font-size: 14px;">
                <p style="font-weight: bold; color: #4caf50;">${ci.company_name}</p>
                <p>${ci.land_mark}, ${ci.Tal}, ${ci.Dist}, ${ci.pincode}</p>
                <p>Phone: ${ci.phone_no}</p>
            </div>

            <div style="margin-top: 20px;">
                <h3 style="font-size: 18px; color: #333;">Invoice to:</h3>
                <p>Customer Name: ${state.customer?.name || "NA"}</p>
                <p>Customer Address: ${state.customer?.address || "NA"}</p>
                <p>Mobile Number: ${state.customer?.mobile || "NA"}</p>
                <p>Invoice No: NA</p>
                <p>Start Date: ${formatDate(state.start_date)}</p>
                <p>End Date: ${formatDate(state.end_date)}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #4caf50; color: white; text-align: center;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Sr No</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Delivery Date & Time</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Items</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Paid (Rs)</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Pending (Rs)</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Total (Rs)</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Delivered By</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.map((p, index) => {
                        const rowColor = index % 2 === 0 ? '#fafafa' : '#ffffff';
                        return `
                        <tr style="background-color: ${rowColor}; text-align: center;">
                            <td style="padding: 10px; border: 1px solid #ddd;">${index + 1}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${formatDate(p.deliveryDate)} (${convertTo12HourFormat(p.deliveryTime)})</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">
                                ${p.items.map(i => `
                                    ${i.product_name} ${i.dQty > 0 ? `(${i.dQty} Delivered)` : ''} ${i.eQty > 0 ? `(${i.eQty} Collected)` : ''}
                                `).join("<br>")}
                            </td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${p.paidAmount}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${(p.totalAmount - p.paidAmount)}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${p.totalAmount}</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${p.user.name}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>

            <div style="margin-top: 30px; background-color: #f1f8e9; padding: 10px;">
                <h4 style="color: #4caf50;">Grand Total</h4>
                <p>Amount Paid: ${(grandTotal - remainingAmount).toFixed(2)} /-</p>
                <p>Balance Amount: ${remainingAmount.toFixed(2)} /-</p>
            </div>

            <div style="margin-top: 20px;">
                <h4 style="color: #4caf50;">Bank Details</h4>
                <p>Bank Name: ${ci.bank_name}</p>
                <p>Account No: ${ci.account_no}</p>
                <p>IFSC Code: ${ci.IFSC_code}</p>
            </div>

            <div style="float: right; font-weight: bold; text-align: center; margin-top: 30px;">
                <p>E-SIGNATURE</p>
                <img src="img/${ci.sign}" alt="Signature" style="width: 120px; height: 70px;">
                <p>Authorized Signature</p>
            </div>

            <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #999;">
                <p>This bill has been computer-generated and is authorized.</p>
            </div>

            <div style="width: 100%; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 10px; color: #666;">
                <p>Page Generated on: ${new Date().toLocaleString()}</p>
            </div>
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
