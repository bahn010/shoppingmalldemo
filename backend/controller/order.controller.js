const orderController = {}
const Order = require("../model/order")
const Cart = require("../model/cart")
const User = require("../model/user")
const Product = require("../model/product")

orderController.createOrder = async (req, res) => {
  try {
    const userId = req.userID
    const { shippingAddress, contact, totalPrice } = req.body
    
    const cart = await Cart.findOne({ userId }).populate('items.productId')
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "장바구니가 비어있습니다." })
    }

    // 주문 데이터 준비
    const orderData = {
      userId,
      shippingAddress,
      contact,
      totalPrice,
      status: "preparing",
      items: cart.items.map(item => ({
        productId: item.productId._id,
        size: item.size,
        quantity: item.quantity,
        price: item.productId.price
      }))
    }

    // 주문 생성
    const order = await Order.create(orderData)
    

    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product && product.stock && product.stock[item.size]) {
        product.stock[item.size] -= item.quantity;
        await product.save();
      }
    }
    

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    )

    res.status(200).json({
      success: true,
      message: "주문이 성공적으로 생성되었습니다.",
      order
    })

  } catch (error) {
    console.error('주문 생성 오류:', error)
    res.status(400).json({ success: false, message: "주문 생성 중 오류가 발생했습니다." })
  }
}

orderController.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userID })
    res.status(200).json({ success: true, orders })
  } catch (error) {
    res.status(400).json({ success: false, message: "주문 조회 중 오류가 발생했습니다." })
  }
}

orderController.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
    res.status(200).json({ success: true, order })
  } catch (error) {
    res.status(400).json({ success: false, message: "주문 수정 중 오류가 발생했습니다." })
  }
}

orderController.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    await Order.findByIdAndDelete(orderId)
    res.status(200).json({ success: true, message: "주문이 성공적으로 삭제되었습니다." })
  } catch (error) {
    res.status(400).json({ success: false, message: "주문 삭제 중 오류가 발생했습니다." })
  }
}

module.exports = orderController

    
