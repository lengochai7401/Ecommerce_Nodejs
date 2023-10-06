import express, { query } from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAdmin, isAuth } from '../utils.js';

const productRouter = express.Router();

// Route này trả về tất cả sản phẩm
productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

const PAGE_SIZE = 3;

// Route này được sử dụng để tìm kiếm sản phẩm dựa trên các tham số truy vấn
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    // Xây dựng các bộ lọc dựa trên các tham số truy vấn
    const queryFilter =
      searchQuery && searchQuery !== 'all' // searchQuery tồn tại và khác 'all'
        ? {
            name: {
              $regex: searchQuery, // so sánh tên sản phẩm với searchQuery
              $options: 'i', // tìm kiếm không phân biệt chữ hoa chữ thường
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating), // lọc các sản phẩm có xếp hạng lớn hơn hoặc bằng giá trị của biến rating
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              // lọc các sản phẩm có giá nằm trong khoảng min-max
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    // Truy vấn CSDL để lấy danh sách sản phẩm
    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    // Đếm tổng số sản phẩm phù hợp với bộ lọc
    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// Route này để admin quản lí các product
productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1)) // bỏ qua các product trước đó và lấy các sản phẩm hiện tại
      .limit(pageSize); // giới hạn lấy pageSize sản phẩm trên 1 trang
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// Route này để thêm mới 1 product
productRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: 'sample name ' + Date.now(),
      slug: 'sample-name-' + Date.now(),
      image: '/images/p1.jpg',
      price: 0,
      category: 'sample category',
      brand: 'sample brand',
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: 'sample description',
    });
    const product = await newProduct.save();
    res.send({ message: 'Product Created', product });
  })
);

// Route này trả về danh sách các danh mục sản phẩm
productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    try {
      const categories = await Product.find().distinct('category');
      res.send(categories);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  })
);

// Route này trả về sản phẩm dựa trên slug
productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) res.send(product);
  else res.status(404).send({ message: 'Product not found' });
});
productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

export default productRouter;
