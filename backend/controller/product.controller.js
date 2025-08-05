const productController = {}
const Product = require("../model/product.model")

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

module.exports = productController