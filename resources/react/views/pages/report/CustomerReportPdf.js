import html2pdf from "html2pdf.js";
import { getUserData } from "../../../util/session";

const formatDate = (dateString) => {
    const options = { day: "numeric", month: "short", year: "numeric" };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options).replace(",", "");

    const [month, day, year] = formattedDate.split(" ");
    return `${day} ${month} ${year}`;
};

function convertTo12HourFormat(time) {
    let [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

function convertToWords(amount) {
    const words = [
        "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (amount < 20) return words[amount];
    if (amount < 100) return tens[Math.floor(amount / 10)] + (amount % 10 ? ` ${words[amount % 10]}` : "");
    if (amount < 1000) return words[Math.floor(amount / 100)] + " Hundred" + (amount % 100 ? ` ${convertToWords(amount % 100)}` : "");
    return amount.toString();
}

export function generatePDFReport(grandTotal, state, report, remainingAmount) {
    const ci = getUserData()?.company_info;

   
    if (!ci) {
        console.error("Company information is missing.");
        return;
    }

    
    const htmlContent = `

    <div style="margin: 5px 0; background-color: #e8f5e9; padding: 10px; text-align: center; font-size: 16px;">
            <strong>Order Report</strong>
        </div>

    <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333; padding: 5px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <img src="img/${ci.logo}" alt="Logo" style="width: 150px; height: 150px;">
            <div style="text-align: right;">
                <h2 style="color: #4caf50; font-size: 24px; margin: 0;">${ci.company_name}</h2>
                <p style="margin: 0;">${ci.land_mark}, ${ci.Tal}, ${ci.Dist}, ${ci.pincode}</p>
                <p>Phone: ${ci.phone_no}</p>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="border: 1px solid #ddd; padding: 10px; width: 48%; background-color: #e3f2fd;">
                <p><strong>Customer Name:</strong> ${state.customer?.name || "NA"}</p>
                <p><strong>Customer Address:</strong> ${state.customer?.address || "NA"}</p>
                <p><strong>Mobile Number:</strong> ${state.customer?.mobile || "NA"}</p>
            </div>
            <div style="border: 1px solid #ddd; padding: 10px; width: 48%; background-color: #f1f8e9;">
                <p><strong>Invoice Type:</strong> ${state.invoice || "NA"} </p>
                <p><strong>Invoice start Date:</strong> ${state?.start_date}</p>
                <p><strong>Invoice End Date:</strong> ${state?.end_date}</p>
            </div>
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
        <div style="padding: 10px; border: 1px solid #ddd; background-color: #f1f8e9; margin-bottom: 20px;">
            <p><strong>Amount Paid:</strong> ${grandTotal - remainingAmount} /-</p>
            <p><strong>Remaining Amount:</strong> ${remainingAmount} /-</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 20px; border: 1px solid #ddd; padding: 10px; ">
            <div style="width: 48%;">
                <p><strong>Bank:</strong> ${ci.bank_name}</p>
                <p><strong>Account Number:</strong> ${ci.account_no}</p>
                <p><strong>IFSC Code:</strong> ${ci.IFSC_code}</p>
            </div>
            <div style="width: 48%; text-align: center;">
                <p><strong>E-Signature</strong></p>
                <img src="img/${ci.sign}" alt="Signature" style="width: 100px;">
                <p>Authorized Signature</p>
            </div>
        </div>
    </div>`;

    const options = {
        margin: [10, 10, 20, 10],
        filename: `${state.customer?.name?.replace(" ", "-")}-${new Date().getTime()}.pdf`,
        html2canvas: { scale: 4 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { avoid: "tr" }
    };

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    const pdf = html2pdf().from(element).set(options);

    
    pdf.toPdf().get("pdf").then((pdfDoc) => {
        const totalPages = pdfDoc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdfDoc.setPage(i);
    
           
            pdfDoc.setFontSize(10);
    
            const centerText = "This invoice is computer-generated and valid.";
            const textWidth = pdfDoc.getTextWidth(centerText);
            const centerX = (pdfDoc.internal.pageSize.getWidth() - textWidth) / 2;
            pdfDoc.text(centerText, centerX, pdfDoc.internal.pageSize.getHeight() - 10);
    
            
            const pageNumberText = `Page ${i} of ${totalPages}`;
            pdfDoc.text(pageNumberText, pdfDoc.internal.pageSize.getWidth() - 10, pdfDoc.internal.pageSize.getHeight() - 10, {
                align: "right"
            });
        }
    }).save();
}
