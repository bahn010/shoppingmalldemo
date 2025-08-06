const express = require("express")
const router = express.Router()
const productController = require("../controller/product.controller")
const authController = require("../controller/auth.controller")

router.post("/", authController.authenticateToken, authController.checkAdminPermission, productController.createProduct)

router.get("/", productController.getProduct)


module.exports = router