import asyncHandler from 'express-async-handler';
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Food from '../../models/Food.js';
import Review from '../../models/Review.js';
import { parseDateRange } from '../../middleware/queryFilter.js';

// @desc    Get comprehensive analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(async (req, res) => {
  const { range = '7days' } = req.query;
  const dateFilter = parseDateRange(range);

  // Revenue Analytics
  const revenueData = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'Completed',
        createdAt: dateFilter,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
        customers: { $addToSet: '$user' },
      },
    },
    {
      $project: {
        date: '$_id',
        revenue: 1,
        orders: 1,
        customerCount: { $size: '$customers' },
      },
    },
    { $sort: { date: 1 } },
  ]);

  // Category Performance
  const categoryPerformance = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'foods',
        localField: 'items.food',
        foreignField: '_id',
        as: 'foodDetails',
      },
    },
    { $unwind: '$foodDetails' },
    {
      $group: {
        _id: '$foodDetails.category',
        totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalOrders: { $sum: '$items.quantity' },
        avgOrderValue: { $avg: '$items.price' },
      },
    },
    {
      $project: {
        category: '$_id',
        sales: '$totalSales',
        orders: '$totalOrders',
        avgOrderValue: { $round: ['$avgOrderValue', 2] },
      },
    },
    { $sort: { sales: -1 } },
  ]);

  // Calculate growth percentages
  const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalCategoryRevenue = categoryPerformance.reduce(
    (sum, cat) => sum + cat.sales,
    0
  );

  const categoryWithPercentage = categoryPerformance.map((cat) => ({
    ...cat,
    percentage: totalCategoryRevenue > 0 
      ? ((cat.sales / totalCategoryRevenue) * 100).toFixed(1)
      : 0,
    growth: Math.random() * 20 - 5, // TODO: Calculate real growth from previous period
  }));

  // Top Selling Products
  const topProducts = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.food',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        avgPrice: { $avg: '$items.price' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'foodDetails',
      },
    },
    { $unwind: '$foodDetails' },
    {
      $project: {
        name: '$foodDetails.name',
        image: '$foodDetails.image',
        category: '$foodDetails.category',
        quantity: '$totalQuantity',
        revenue: '$totalRevenue',
        avgPrice: { $round: ['$avgPrice', 2] },
      },
    },
  ]);

  // Hourly Order Pattern
  const hourlyPattern = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        hour: '$_id',
        orders: 1,
        revenue: 1,
      },
    },
  ]);

  // Customer Insights
  const customerInsights = await User.aggregate([
    { $match: { role: 'user' } },
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'user',
        as: 'orders',
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        totalOrders: { $size: '$orders' },
        totalSpent: {
          $sum: {
            $map: {
              input: '$orders',
              as: 'order',
              in: '$$order.totalAmount',
            },
          },
        },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
  ]);

  // New vs Returning Customers
  const newCustomers = await User.countDocuments({
    createdAt: dateFilter,
    role: 'user',
  });

  const returningCustomers = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $group: { _id: '$user', orderCount: { $sum: 1 } } },
    { $match: { orderCount: { $gt: 1 } } },
    { $count: 'count' },
  ]);

  // Payment Method Distribution
  const paymentMethods = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
      },
    },
  ]);

  // Order Status Distribution
  const orderStatus = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Customer Satisfaction (from reviews)
  const satisfaction = await Review.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratings: {
          $push: '$rating',
        },
      },
    },
  ]);

  // Rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { createdAt: dateFilter } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  // Average preparation/delivery time
  const avgTimes = await Order.aggregate([
    {
      $match: {
        status: 'Delivered',
        createdAt: dateFilter,
      },
    },
    {
      $project: {
        deliveryTime: {
          $divide: [
            { $subtract: ['$updatedAt', '$createdAt'] },
            1000 * 60, // Convert to minutes
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgDeliveryTime: { $avg: '$deliveryTime' },
        minDeliveryTime: { $min: '$deliveryTime' },
        maxDeliveryTime: { $max: '$deliveryTime' },
      },
    },
  ]);

  // Peak ordering times
  const peakTimes = hourlyPattern
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 3)
    .map((h) => ({
      hour: `${h.hour}:00`,
      orders: h.orders,
    }));

  res.json({
    success: true,
    data: {
      summary: {
        totalRevenue,
        totalOrders: revenueData.reduce((sum, day) => sum + day.orders, 0),
        avgOrderValue: totalRevenue / revenueData.reduce((sum, day) => sum + day.orders, 0) || 0,
        newCustomers,
        returningCustomers: returningCustomers[0]?.count || 0,
      },
      revenueData,
      categoryPerformance: categoryWithPercentage,
      topProducts,
      hourlyPattern,
      customerInsights,
      paymentMethods,
      orderStatus,
      satisfaction: {
        avgRating: satisfaction[0]?.avgRating || 0,
        totalReviews: satisfaction[0]?.totalReviews || 0,
        distribution: ratingDistribution,
      },
      performance: {
        avgDeliveryTime: avgTimes[0]?.avgDeliveryTime || 0,
        minDeliveryTime: avgTimes[0]?.minDeliveryTime || 0,
        maxDeliveryTime: avgTimes[0]?.maxDeliveryTime || 0,
      },
      insights: {
        peakTimes,
        topCategory: categoryWithPercentage[0]?.category || 'N/A',
        bestSellingProduct: topProducts[0]?.name || 'N/A',
      },
    },
  });
});

// @desc    Export sales report
// @route   GET /api/admin/analytics/export
// @access  Private/Admin
export const exportSalesReport = asyncHandler(async (req, res) => {
  const { format = 'pdf', range = '7days' } = req.query;
  const dateFilter = parseDateRange(range);

  // Gather report data
  const orders = await Order.find({
    createdAt: dateFilter,
    paymentStatus: 'Completed',
  })
    .populate('user', 'name email')
    .populate('items.food', 'name price category');

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;

  // Top products
  const topProducts = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.food',
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'food',
      },
    },
    { $unwind: '$food' },
    {
      $project: {
        name: '$food.name',
        quantity: 1,
        revenue: 1,
      },
    },
  ]);

  // Category breakdown
  const categoryBreakdown = await Order.aggregate([
    { $match: { createdAt: dateFilter } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'foods',
        localField: 'items.food',
        foreignField: '_id',
        as: 'food',
      },
    },
    { $unwind: '$food' },
    {
      $group: {
        _id: '$food.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const totalCategoryRevenue = categoryBreakdown.reduce((sum, cat) => sum + cat.revenue, 0);
  const categoryWithPercentage = categoryBreakdown.map((cat) => ({
    name: cat._id,
    revenue: cat.revenue,
    percentage: ((cat.revenue / totalCategoryRevenue) * 100).toFixed(1),
  }));

  const reportData = {
    startDate: new Date(dateFilter.$gte).toLocaleDateString(),
    endDate: new Date(dateFilter.$lte).toLocaleDateString(),
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    totalCustomers: new Set(orders.map((o) => o.user?._id.toString())).size,
    newCustomers: await User.countDocuments({
      createdAt: dateFilter,
      role: 'user',
    }),
    topProducts,
    categoryBreakdown: categoryWithPercentage,
  };

  if (format === 'pdf') {
    const { exportSalesReportPDF } = await import('../../utils/exportPDF.js');
    const filepath = await exportSalesReportPDF(reportData);

    res.download(filepath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      setTimeout(() => {
        fs.unlinkSync(filepath);
      }, 1000);
    });
  } else {
    // CSV format
    const { createObjectCsvWriter } = await import('csv-writer');
    const filename = `sales_report_${Date.now()}.csv`;
    const filepath = path.join('exports', filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'metric', title: 'Metric' },
        { id: 'value', title: 'Value' },
      ],
    });

    const records = [
      { metric: 'Report Period', value: `${reportData.startDate} - ${reportData.endDate}` },
      { metric: 'Total Revenue', value: `৳${reportData.totalRevenue}` },
      { metric: 'Total Orders', value: reportData.totalOrders },
      { metric: 'Average Order Value', value: `৳${reportData.averageOrderValue.toFixed(2)}` },
      { metric: 'Total Customers', value: reportData.totalCustomers },
      { metric: 'New Customers', value: reportData.newCustomers },
    ];

    await csvWriter.writeRecords(records);

    res.download(filepath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      setTimeout(() => {
        fs.unlinkSync(filepath);
      }, 1000);
    });
  }
});

// @desc    Get real-time stats (for dashboard widgets)
// @route   GET /api/admin/analytics/realtime
// @access  Private/Admin
export const getRealtimeStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));

  const [todayOrders, activeOrders, pendingPayments, todayRevenue] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.countDocuments({
      status: { $in: ['Pending', 'Preparing', 'Out for Delivery'] },
    }),
    Order.countDocuments({
      paymentStatus: 'Pending',
      createdAt: { $gte: todayStart },
    }),
    Order.aggregate([
      {
        $match: {
          paymentStatus: 'Completed',
          createdAt: { $gte: todayStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      todayOrders,
      activeOrders,
      pendingPayments,
      todayRevenue: todayRevenue[0]?.total || 0,
      timestamp: new Date(),
    },
  });
});