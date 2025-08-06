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
    console.log("🔍 GET /api/product 요청 받음");
    console.log("📋 요청 쿼리:", req.query);
    
    const products = await Product.find({})
    console.log("✅ 상품 조회 성공 - 총 상품 수:", products.length);
    console.log("📦 조회된 상품들:", products.map(p => ({ id: p._id, name: p.name, price: p.price })));
    
    res.status(200).json({ status: "success", data: products })
  } catch (err) {
    console.log("❌ 상품 조회 실패:", err.message);
    res.status(400).json({ status: "fail", error: err.message })
  }
}

module.exports = productController