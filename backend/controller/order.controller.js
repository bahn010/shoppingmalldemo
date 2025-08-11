const orderController = {}
const Order = require("../model/order")
const Cart = require("../model/cart")
const Product = require("../model/product")

orderController.createOrder = async (req, res) => {
  try {
    const userId = req.userID
    const { shippingAddress, contact, totalPrice } = req.body
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "사용자 인증이 필요합니다." 
      })
    }
    
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: '_id name price stock'
    })
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "장바구니가 비어있습니다." })
    }

    // 장바구니 아이템 검증
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      
      if (!item.productId) {
        return res.status(400).json({ 
          success: false, 
          message: `장바구니 아이템 ${i + 1}의 상품 정보를 찾을 수 없습니다.` 
        });
      }
      
      if (!item.productId._id) {
        return res.status(400).json({ 
          success: false, 
          message: `장바구니 아이템 ${i + 1}의 상품 ID를 찾을 수 없습니다.` 
        });
      }
      
      if (!item.productId.price) {
        return res.status(400).json({ 
          success: false, 
          message: `장바구니 아이템 ${i + 1}의 상품 가격을 찾을 수 없습니다.` 
        });
      }

      if (!item.size) {
        return res.status(400).json({ 
          success: false, 
          message: `장바구니 아이템 ${i + 1}의 사이즈 정보가 없습니다.` 
        });
      }
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

    // 상품 재고 업데이트
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product && product.stock && product.stock[item.size]) {
        product.stock[item.size] -= item.quantity;
        await product.save();
      }
    }
    
    // 장바구니 비우기
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: "주문이 성공적으로 생성되었습니다.",
      order,
      updatedCart // 업데이트된 장바구니 정보 포함
    })

  } catch (error) {
    console.error('주문 생성 오류:', error)
    
    let errorMessage = "주문 생성 중 오류가 발생했습니다."
    
    if (error.name === 'ValidationError') {
      errorMessage = "주문 데이터 검증에 실패했습니다."
    } else if (error.name === 'CastError') {
      errorMessage = "잘못된 데이터 형식입니다."
    }
    
    res.status(400).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
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

    
