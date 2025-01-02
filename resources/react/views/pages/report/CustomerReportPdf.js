import jsPDF from "jspdf";
import "jspdf-autotable";
import { getUserData } from '../../../util/session';
import { marathiFont } from '../../common/font';

const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', options).replace(',', '');
    
    // Split the formatted date to rearrange it
    const [month, day, year] = formattedDate.split(' ');
    return `${day} ${month} ${year}`;
};

function convertTo12HourFormat(time) {
    // Split the time into hours and minutes
    let [hours, minutes] = time.split(':').map(Number);
    
    // Determine AM or PM suffix
    const suffix = hours >= 12 ? 'PM' : 'AM';
    
    // Convert hours from 24-hour format to 12-hour format
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight

    // Return the formatted time
    return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

export function generatePDFReport(grandTotal, state, report,remainingAmount) {
    // PDF generation logic
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        filters: ['ASCIIHexEncode']
    });
    
    pdf.addFileToVFS("NotoSansDevanagari.ttf", marathiFont);
    pdf.addFont("NotoSansDevanagari.ttf", "NotoSansDevanagari", "normal");
    pdf.setFont("NotoSansDevanagari");

    const ci = getUserData()?.company_info;

    const fontSize = 10;
    pdf.setFontSize(fontSize);
    // pdf.setLineWidth(0.5);
    pdf.setDrawColor("#333");
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), "S");

    const img = new Image();
    img.src = 'img/'+ci.logo;
    pdf.addImage(img, "PNG", 15, 10, 40, 40);
    pdf.setFontSize(15);
    pdf.setTextColor("#000");

    const INVOICE = "Order Report";
    const headingX = pdf.internal.pageSize.getWidth() / 2;
    
    // Set font to bold and increase size by 1.5 times
    pdf.setFont( "bold");
    // "helvetica"
    
    pdf.setFontSize(17);
    
    // Set color
    pdf.setTextColor(0, 128, 0); // Green
    pdf.text(`${INVOICE}`, headingX, 10, { align: "center" });
    
    // Reset the font size to original after use if needed
    pdf.setFontSize(10);
    pdf.setFont("normal");
    pdf.setTextColor("#000"); // Reset to default color

    pdf.text(ci.company_name, pdf.internal.pageSize.getWidth() - 65, 20);
    pdf.text(ci.land_mark, pdf.internal.pageSize.getWidth() - 65, 25);
    pdf.text(ci.Tal+" , "+ci.Dist+" , "+ci.pincode, pdf.internal.pageSize.getWidth() - 65, 30);
    pdf.text("Phone: "+ci.phone_no, pdf.internal.pageSize.getWidth() - 65, 35);

    pdf.setTextColor("#000");
    pdf.setFontSize(13);
    pdf.text(`Invoice to:`, 15, 60);
    pdf.setFont("normal");
    pdf.setFontSize(11);
    pdf.text(`Customer Name    : ${state.customer?.name || "NA"}`, 15, 70);
    pdf.text(`Customer Address : ${state.customer?.address || "NA"}`, 15, 75);
    pdf.text(`Mobile Number     : ${state.customer?.mobile || "NA"} `, 15, 80);
    pdf.text(`Invoice No: NA`, 145, 70);

    const formattedDate = state.start_date;
    pdf.text(`Start Date: ${formattedDate}`, 145, 75);
    const formattedDeliveryDate = state.end_date;
    pdf.text(`End Date: ${formattedDeliveryDate}`, 145, 80);
    pdf.setFontSize(10);
    const grandTotalRow = (state.customer?.name?.length > 0) ? 
    ["","", "Grand Total", grandTotal - remainingAmount, remainingAmount , grandTotal + " /-"] :
    ["", "","", "Grand Total", grandTotal - remainingAmount, remainingAmount , grandTotal + " /-"];

    pdf.autoTable({
        startY: 90,
        head: [(state.customer?.name?.length > 0) ?
            ["Sr No", "Delivery Date & Time", "Items", "Paid (Rs)", "Pending (Rs)", "Total (Rs)", "Delivered By"] :
            ["Sr No","Name", "Delivery Date & Time", "Items", "Paid (Rs)", "Pending (Rs)", "Total (Rs)", "Delivered By"]
        ],
        body: [
            ...report.map((p, index) => {
                //customer
                // Create a row for the main table
                let mainRow = [
                    index + 1,
                    formatDate(p.deliveryDate) + "\n ( " + convertTo12HourFormat(p.deliveryTime) + " )",
                    p.items.map(i => [
                        i.product_name,
                        i.dQty > 0 ? i.dQty + '(Delivered '+i.dPrice+' Rs each)' : '',
                        i.eQty > 0 ? i.eQty + '(Collected)' : ''
                    ]),
                    p.paidAmount,
                    (p.totalAmount - p.paidAmount),
                    p.totalAmount,
                    p.user.name,
                ];

                if(!state.customer?.name?.length){
                    mainRow.splice(1, 0, p.customer.name);
                }

                // Save the current Y position for the inner table
                // const currentY = pdf.autoTable.previous.finalY;

                // // Draw the inner table for p.items
                // pdf.autoTable({
                //     startY: currentY + 10, // Adjust Y position for the inner table
                //     body: [],
                //     theme: "grid",
                //     styles: { halign: "left", valign: "middle", fontSize: 10, lineWidth: 0.1, lineColor: [0, 0, 0] },
                //     margin: { left: 15 }, // Optional: Adjust margin for inner table
                // });

                return mainRow;
            }),
            grandTotalRow,
        ],
        theme: "grid",
        styles: { halign: "center", valign: "middle", fontSize: 10, lineWidth: 0.1, lineColor: [0, 0, 0] },
        columnStyles: {
            0: { halign: "center" },
            3: { halign: "center" },
            4: { halign: "center" },
        },
    });

    // Prepare additional details data
    const additionalDetailsData = [];

    additionalDetailsData.push(
        ["Amount Paid:",`${ (grandTotal - remainingAmount).toFixed(2)}`+" /-"],
        ["Balance Amount:",`${remainingAmount.toFixed(2)}`+" /-" ]
    );

    pdf.autoTable({
        body: additionalDetailsData,
        // startY: y,
        margin: { top: 10, bottom: 20 },
        theme: "grid",
        styles: { halign: "left", valign: "middle", fontSize: 10, lineWidth: 0.1, lineColor: [0, 0, 0] },
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    let bankDetailsY = pdf.autoTable.previous.finalY + 10;

    const bankDetailsHeight = 40; // Adjust this value based on the height of the "Bank Details" section
    if (bankDetailsY + bankDetailsHeight > pageHeight) {
        pdf.addPage(); // Add a new page if not enough space
    }

    bankDetailsY = pageHeight - 50;

    pdf.setFont("normal");
    pdf.setLineWidth(0.2);
    pdf.setDrawColor("#000");
    pdf.rect(13.5, bankDetailsY, pdf.internal.pageSize.getWidth() - 28.5, 40, "S");
    pdf.setFontSize(12);

    pdf.text("Bank Details", 20, bankDetailsY + 9);
    pdf.setFontSize(10);
    pdf.setFont("normal");
    pdf.text(ci.bank_name, 20, bankDetailsY + 20);
    pdf.text('Account No: '+ci.account_no, 20, bankDetailsY + 25);
    pdf.text('IFSC code  : '+ci.IFSC_code, 20, bankDetailsY + 30);
    pdf.setFont("bold");
    pdf.text(
        "E-SIGNATURE",
        pdf.internal.pageSize.width - 84,
        bankDetailsY + 8
    );
    pdf.addImage(
        'img/'+ci.sign,
        "JPG",
        pdf.internal.pageSize.width - 72,
        bankDetailsY + 9,
        35,
        20
    );
    pdf.setFontSize(10);
    pdf.text(
        "Authorized Signature",
        pdf.internal.pageSize.width - 70,
        bankDetailsY + 36
    );

    const additionalMessage = "This bill has been computer-generated and is authorized.";
    const additionalMessageWidth = pdf.getStringUnitWidth(additionalMessage) * 6;
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setDrawColor(0);
    pdf.rect(0, 0, pageWidth, pageHeight);
    pdf.setFontSize(10);
    const shiftRight = 15;
    const textXAdditional = (pageWidth - additionalMessageWidth) / 1.3 + shiftRight;
    const textY = pageHeight - 5;
    pdf.text(additionalMessage, textXAdditional, textY);

    pdf.save(`${state.customer?.name?.replace(" ","-")}-${new Date().getTime()}.pdf`);
}