const express = require("express")
const router = express.Router()
const cartController = require("../controller/cart.controller")
const authController = require("../controller/auth.controller")


router.post("/", authController.authenticateToken, cartController.createCart)
router.get("/", authController.authenticateToken, cartController.getCart)
router.put("/", authController.authenticateToken, cartController.updateCart)
router.delete("/", authController.authenticateToken, cartController.deleteCart)
router.delete("/clear", authController.authenticateToken, cartController.clearCart)

module.exports = router