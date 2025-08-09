const productController = {}
const Product = require("../model/product")

productController.createProduct = async (req, res) => {
  try {
    const { sku, name, description, stock, image, price, category, status } = req.body
    
    // SKU 중복 체크
    const existingProduct = await Product.findOne({ sku: sku.trim() })
    if (existingProduct) {
      return res.status(400).json({ 
        status: "fail", 
        error: "중복된 상품코드가 존재합니다. 다른 SKU를 사용해주세요." 
      })
    }

    const product = new Product({ sku, name, description, stock, image, price, category, status })
    await product.save()
    res.status(200).json({ status: "success", data: product })
  } catch (err) {
    // MongoDB 중복 키 에러 처리
    if (err.code === 11000 && err.keyPattern && err.keyPattern.sku) {
      return res.status(400).json({ 
        status: "fail", 
        error: "중복된 상품코드가 존재합니다. 다른 SKU를 사용해주세요." 
      })
    }
    res.status(400).json({ status: "fail", error: err.message })
  }
}

productController.getProduct = async (req, res) => {
  const limit = 5;
  try {
    const { page,name } = req.query

    const cond = name? { name: { $regex: name, $options: "i" } } : {}
    const query = Product.find(cond)
    if (page) {
      query.skip((page - 1) * limit).limit(limit)
    }

    const productList = await query.exec()
    const totalCount = await Product.countDocuments(cond)
    const totalPageNum = Math.ceil(totalCount / limit)
    res.status(200).json({ status: "success", data: productList, totalPageNum })

  } catch (err) {

    res.status(400).json({ status: "fail", error: err.message })
  }
}

productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id
    const product = await Product.findById(productId)
    
    if (!product) {
      return res.status(404).json({ status: "fail", error: "제품을 찾을 수 없습니다." })
    }
    
    res.status(200).json({ status: "success", data: product })
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message })
  }
}

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const {sku, name, description, stock, image, price, category, status } = req.body
    
    // SKU 중복 체크 (현재 상품 제외)
    if (sku) {
      const existingProduct = await Product.findOne({ 
        sku: sku.trim(), 
        _id: { $ne: productId } 
      })
      if (existingProduct) {
        return res.status(400).json({ 
          status: "fail", 
          error: "중복된 상품코드가 존재합니다. 다른 SKU를 사용해주세요." 
        })
      }
    }

    const product = await Product.findByIdAndUpdate(
      {_id: productId},
      { sku, name, description, stock, image, price, category, status },
      { new: true }
    )
    res.status(200).json({ status: "success", data: product })
  } catch (err) {
    // MongoDB 중복 키 에러 처리
    if (err.code === 11000 && err.keyPattern && err.keyPattern.sku) {
      return res.status(400).json({ 
        status: "fail", 
        error: "중복된 상품코드가 존재합니다. 다른 SKU를 사용해주세요." 
      })
    }
    res.status(400).json({ status: "fail", error: err.message })
  }
}

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    await Product.findByIdAndDelete(productId)
    res.status(200).json({ status: "success", message: "상품이 삭제되었습니다." })
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message })
  }
}

module.exports = productController