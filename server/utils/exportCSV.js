import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

export const exportOrdersToCSV = async (orders) => {
  const filename = `orders_${Date.now()}.csv`;
  const filepath = path.join('exports', filename);

  // Ensure exports directory exists
  if (!fs.existsSync('exports')) {
    fs.mkdirSync('exports');
  }

  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'orderId', title: 'Order ID' },
      { id: 'customerName', title: 'Customer Name' },
      { id: 'customerEmail', title: 'Customer Email' },
      { id: 'customerPhone', title: 'Customer Phone' },
      { id: 'items', title: 'Items' },
      { id: 'totalAmount', title: 'Total Amount (৳)' },
      { id: 'paymentMethod', title: 'Payment Method' },
      { id: 'paymentStatus', title: 'Payment Status' },
      { id: 'orderStatus', title: 'Order Status' },
      { id: 'hall', title: 'Hall' },
      { id: 'department', title: 'Department' },
      { id: 'orderDate', title: 'Order Date' },
    ],
  });

  const records = orders.map(order => ({
    orderId: order._id.toString(),
    customerName: order.user?.name || 'N/A',
    customerEmail: order.user?.email || 'N/A',
    customerPhone: order.deliveryDetails?.phone || 'N/A',
    items: order.items?.map(item => `${item.food?.name} (x${item.quantity})`).join(', ') || 'N/A',
    totalAmount: order.totalAmount,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    hall: order.deliveryDetails?.hall || 'N/A',
    department: order.deliveryDetails?.department || 'N/A',
    orderDate: new Date(order.createdAt).toLocaleString(),
  }));

  await csvWriter.writeRecords(records);

  return filepath;
};

export const exportUsersToCSV = async (users) => {
  const filename = `users_${Date.now()}.csv`;
  const filepath = path.join('exports', filename);

  if (!fs.existsSync('exports')) {
    fs.mkdirSync('exports');
  }

  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'hall', title: 'Hall' },
      { id: 'department', title: 'Department' },
      { id: 'role', title: 'Role' },
      { id: 'isActive', title: 'Active' },
      { id: 'joinedDate', title: 'Joined Date' },
    ],
  });

  const records = users.map(user => ({
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    hall: user.hall || 'N/A',
    department: user.department || 'N/A',
    role: user.role,
    isActive: user.isActive ? 'Yes' : 'No',
    joinedDate: new Date(user.createdAt).toLocaleDateString(),
  }));

  await csvWriter.writeRecords(records);

  return filepath;
};

export const exportTransactionsToCSV = async (transactions) => {
  const filename = `transactions_${Date.now()}.csv`;
  const filepath = path.join('exports', filename);

  if (!fs.existsSync('exports')) {
    fs.mkdirSync('exports');
  }

  const csvWriter = createObjectCsvWriter({
    path: filepath,
    header: [
      { id: 'transactionId', title: 'Transaction ID' },
      { id: 'orderId', title: 'Order ID' },
      { id: 'customerName', title: 'Customer' },
      { id: 'amount', title: 'Amount (৳)' },
      { id: 'paymentMethod', title: 'Payment Method' },
      { id: 'status', title: 'Status' },
      { id: 'date', title: 'Date' },
    ],
  });

  const records = transactions.map(txn => ({
    transactionId: txn.transactionId || 'N/A',
    orderId: txn.order?._id || 'N/A',
    customerName: txn.user?.name || 'N/A',
    amount: txn.amount,
    paymentMethod: txn.paymentMethod,
    status: txn.status,
    date: new Date(txn.createdAt).toLocaleString(),
  }));

  await csvWriter.writeRecords(records);

  return filepath;
};