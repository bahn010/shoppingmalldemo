const express = require("express")
const router = express.Router()
const orderController = require("../controller/order.controller")
const authController = require("../controller/auth.controller")

router.post("/create", authController.authenticateToken, orderController.createOrder)
router.get("/", authController.authenticateToken, orderController.getOrders)
router.get("/admin", authController.authenticateToken, authController.checkAdminPermission, orderController.getAdminOrders)
router.put("/:orderId", authController.authenticateToken, authController.checkAdminPermission, orderController.updateOrder)
router.delete("/:orderId", authController.authenticateToken, authController.checkAdminPermission, orderController.deleteOrder)

module.exports = router