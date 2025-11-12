import asyncHandler from 'express-async-handler';

export const advancedFilter = (model, populate = null) => {
  return asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, $lt, $lte, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Parse query
    query = model.find(JSON.parse(queryStr));

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      
      // Define searchable fields based on model
      let searchFields = [];
      
      if (model.modelName === 'Food') {
        searchFields = ['name', 'description', 'category'];
      } else if (model.modelName === 'User') {
        searchFields = ['name', 'email', 'phone'];
      } else if (model.modelName === 'Order') {
        searchFields = ['_id', 'user.name'];
      }
      
      const searchQuery = searchFields.map(field => ({
        [field]: searchRegex,
      }));
      
      query = query.or(searchQuery);
    }

    // Date range filtering
    if (req.query.startDate || req.query.endDate) {
      const dateFilter = {};
      
      if (req.query.startDate) {
        dateFilter.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }
      
      query = query.find({ createdAt: dateFilter });
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort by newest
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate
    if (populate) {
      query = query.populate(populate);
    }

    // Execute query
    const results = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.advancedResults = {
      success: true,
      count: results.length,
      total,
      pagination,
      data: results,
    };

    next();
  });
};

// Date range helper
export const parseDateRange = (range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case '7days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '30days':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    case '90days':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 7));
  }

  return {
    $gte: startDate,
    $lte: new Date(),
  };
};