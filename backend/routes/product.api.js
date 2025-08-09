const express = require("express")
const router = express.Router()
const productController = require("../controller/product.controller")
const authController = require("../controller/auth.controller")

router.post("/", authController.authenticateToken, authController.checkAdminPermission, productController.createProduct)

router.get("/", productController.getProduct)

router.get("/check-sku", productController.checkSkuDuplicate)

router.get("/:id", productController.getProductById)

router.put("/:id", authController.authenticateToken, authController.checkAdminPermission, productController.updateProduct)

router.delete("/:id", authController.authenticateToken, authController.checkAdminPermission, productController.deleteProduct)


module.exports = router