const express = require("express")
const router = express.Router()
const orderController = require("../controller/order.controller")
const authController = require("../controller/auth.controller")

router.post("/create", authController.authenticateToken, orderController.createOrder)
router.get("/", authController.authenticateToken, orderController.getOrders)
router.put("/:orderId", authController.authenticateToken, orderController.updateOrder)
router.delete("/:orderId", authController.authenticateToken, orderController.deleteOrder)

module.exports = router