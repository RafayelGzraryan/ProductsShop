const PdfDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

module.exports = (req, res, order) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PdfDocument();
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.image('data/invoices/invoice.png', {
        fit: [250, 50],
        align: 'center',
        valign: 'center'
    });
    pdfDoc
        .fontSize(12)
        .fillColor('blue')
        .text('(374) 93 694 002', 448, 70)
        .text('www.RafayelGzraryan.com', 396, 90)
        .text('Rafaye.g@mail.ru', 443, 110);
    pdfDoc
        .fontSize(16)
        .font('Courier-Bold')
        .fillColor('blue')
        .text('Udemy Shop', 120, 160);
    pdfDoc
        .fontSize(12)
        .fillColor('blue')
        .text("User Account: " + req.user.email, 120, 185);
    pdfDoc
        .fontSize(14)
        .font('Courier-Bold')
        .fillColor('black')
        .text('Product Name', 110, 230)
        .text('Price', 255, 230)
        .text('Quantity', 340, 230)
        .text('Total', 455, 230)
        .underline(100, 230, 430, 30, { color: '#0000FF'})
    let row = 290;
    let totalPrice = 0;
    order.products.forEach(p => {
        const totalProdPrice = p.quantity * p.product.price;
        totalPrice += totalProdPrice;
        pdfDoc
            .fontSize(12)
            .fillColor('black')
            .text(p.product.title, 110, row)
            .text('$' + p.product.price, 260, row)
            .text(p.quantity, 370, row)
            .text('$' + totalProdPrice, 460, row);
        row += 30;
    });
    pdfDoc.underline(100, row, 430, 5, { color: '#0000FF'})
    row += 30;
    pdfDoc
        .fontSize(14)
        .font('Courier-Bold')
        .fillColor('blue')
        .text('Total Price:', 340, row)
        .text('$' + totalPrice, 458, row);
    pdfDoc.end();
};