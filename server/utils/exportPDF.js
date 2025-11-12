import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const exportOrdersToPDF = async (orders, stats) => {
  return new Promise((resolve, reject) => {
    const filename = `orders_report_${Date.now()}.pdf`;
    const filepath = path.join('exports', filename);

    // Ensure exports directory exists
    if (!fs.existsSync('exports')) {
      fs.mkdirSync('exports');
    }

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc
      .fontSize(20)
      .text('Food Lab - Orders Report', { align: 'center' })
      .moveDown();

    doc
      .fontSize(10)
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);

    // Summary Statistics
    doc.fontSize(14).text('Summary', { underline: true }).moveDown(0.5);

    doc.fontSize(10);
    doc.text(`Total Orders: ${stats.totalOrders || orders.length}`);
    doc.text(`Total Revenue: ৳${stats.totalRevenue || 0}`);
    doc.text(`Average Order Value: ৳${stats.averageOrderValue || 0}`);
    doc.text(`Pending Orders: ${stats.pendingOrders || 0}`);
    doc.text(`Completed Orders: ${stats.completedOrders || 0}`);
    doc.moveDown(2);

    // Orders Table Header
    doc.fontSize(14).text('Orders Details', { underline: true }).moveDown(0.5);

    // Table settings
    const tableTop = doc.y;
    const itemHeight = 25;
    const pageHeight = doc.page.height - doc.page.margins.bottom;

    // Table headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Order ID', 50, tableTop, { width: 80 });
    doc.text('Customer', 130, tableTop, { width: 100 });
    doc.text('Items', 230, tableTop, { width: 50 });
    doc.text('Amount', 280, tableTop, { width: 60 });
    doc.text('Status', 340, tableTop, { width: 80 });
    doc.text('Date', 420, tableTop, { width: 100 });

    // Draw line under header
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    doc.font('Helvetica');

    // Table rows
    let currentY = tableTop + 20;
    let totalAmount = 0;

    orders.forEach((order, index) => {
      // Check if we need a new page
      if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 50;
      }

      const orderId = order._id.toString().slice(-8);
      const customer = order.user?.name || 'N/A';
      const items = order.items?.length || 0;
      const amount = `৳${order.totalAmount}`;
      const status = order.status;
      const date = new Date(order.createdAt).toLocaleDateString();

      doc.fontSize(8);
      doc.text(orderId, 50, currentY, { width: 80 });
      doc.text(customer, 130, currentY, { width: 100 });
      doc.text(items.toString(), 230, currentY, { width: 50 });
      doc.text(amount, 280, currentY, { width: 60 });
      doc.text(status, 340, currentY, { width: 80 });
      doc.text(date, 420, currentY, { width: 100 });

      totalAmount += order.totalAmount;
      currentY += itemHeight;

      // Draw separator line every 5 rows
      if ((index + 1) % 5 === 0) {
        doc
          .moveTo(50, currentY - 5)
          .lineTo(550, currentY - 5)
          .stroke();
      }
    });

    // Footer
    doc.fontSize(10).font('Helvetica-Bold');
    currentY += 20;
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = 50;
    }

    doc
      .moveTo(50, currentY)
      .lineTo(550, currentY)
      .stroke();

    currentY += 10;
    doc.text(`Total: ৳${totalAmount}`, 280, currentY);

    // Footer note
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(
        'This is a computer-generated report. For queries, contact support@foodlab.com',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    doc.end();

    stream.on('finish', () => {
      resolve(filepath);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};

export const exportSalesReportPDF = async (data) => {
  return new Promise((resolve, reject) => {
    const filename = `sales_report_${Date.now()}.pdf`;
    const filepath = path.join('exports', filename);

    if (!fs.existsSync('exports')) {
      fs.mkdirSync('exports');
    }

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('Food Lab', { align: 'center' })
      .fontSize(16)
      .text('Sales Report', { align: 'center' })
      .moveDown();

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Period: ${data.startDate} - ${data.endDate}`, { align: 'center' })
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(2);

    // Key Metrics
    doc.fontSize(14).font('Helvetica-Bold').text('Key Metrics').moveDown(0.5);

    const metrics = [
      ['Total Revenue', `৳${data.totalRevenue?.toLocaleString() || 0}`],
      ['Total Orders', data.totalOrders || 0],
      ['Average Order Value', `৳${data.averageOrderValue || 0}`],
      ['Total Customers', data.totalCustomers || 0],
      ['New Customers', data.newCustomers || 0],
    ];

    metrics.forEach(([label, value]) => {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(label, 50, doc.y, { width: 200, continued: true })
        .font('Helvetica-Bold')
        .text(value, { align: 'right' });
      doc.moveDown(0.3);
    });

    doc.moveDown();

    // Top Products
    if (data.topProducts && data.topProducts.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Top Selling Products').moveDown(0.5);

      doc.fontSize(9).font('Helvetica-Bold');
      const tableTop = doc.y;
      doc.text('Product', 50, tableTop);
      doc.text('Quantity', 300, tableTop);
      doc.text('Revenue', 400, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(500, tableTop + 15)
        .stroke();

      doc.font('Helvetica');
      let y = tableTop + 20;

      data.topProducts.forEach((product) => {
        doc.fontSize(9);
        doc.text(product.name, 50, y, { width: 240 });
        doc.text(product.quantity.toString(), 300, y);
        doc.text(`৳${product.revenue.toLocaleString()}`, 400, y);
        y += 20;
      });

      doc.moveDown(2);
    }

    // Category Breakdown
    if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Sales by Category').moveDown(0.5);

      data.categoryBreakdown.forEach((category) => {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(category.name, 50, doc.y, { width: 200, continued: true })
          .text(`৳${category.revenue.toLocaleString()}`, { align: 'right' })
          .text(`(${category.percentage}%)`, { align: 'right' });
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text(
        '© Food Lab CUET. All rights reserved.',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    doc.end();

    stream.on('finish', () => {
      resolve(filepath);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
};