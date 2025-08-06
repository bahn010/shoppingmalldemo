const productController = {}
const Product = require("../model/product")

productController.createProduct = async (req, res) => {
  try {
    const { sku, name, description, stock, image, price, category, status } = req.body
    const product = new Product({ sku, name, description, stock, image, price, category, status })
    await product.save()
    res.status(200).json({ status: "success", data: product })
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message })
  }
}

productController.getProduct = async (req, res) => {
  try {
    const { page = 1, name = "" } = req.query;
    const limit = 10; // 페이지당 상품 수
    const skip = (page - 1) * limit;
    
    // 검색 조건 구성
    const searchCondition = {};
    if (name) {
      searchCondition.name = { $regex: name, $options: 'i' };
    }
    
    // 전체 상품 수 조회 (페이지네이션용)
    const totalCount = await Product.countDocuments(searchCondition);
    const totalPages = Math.ceil(totalCount / limit);
    
    // 페이지네이션된 상품 목록 조회
    const products = await Product.find(searchCondition)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // 최신 상품부터 정렬
    
    res.status(200).json({ 
      status: "success", 
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalCount: totalCount,
        limit: limit
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message })
  }
}

module.exports = productController