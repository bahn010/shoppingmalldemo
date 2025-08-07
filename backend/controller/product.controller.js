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

module.exports = productController