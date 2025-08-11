const orderController = {}
const Order = require("../model/order")
const Cart = require("../model/cart")
const Product = require("../model/product")

orderController.createOrder = async (req, res) => {
  try {
    const userId = req.userID
    const { shippingAddress, contact, totalPrice } = req.body
    
    // 디버깅 로그 추가
    console.log('=== 주문 생성 디버깅 ===')
    console.log('요청 헤더:', req.headers)
    console.log('요청된 userId:', userId)
    console.log('요청된 shippingAddress:', shippingAddress)
    console.log('요청된 contact:', contact)
    console.log('요청된 totalPrice:', totalPrice)
    console.log('req.userID 타입:', typeof req.userID)
    console.log('req.userID 값:', req.userID)
    
    // userId 검증 추가
    if (!userId) {
      console.log('userId가 없음:', userId)
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
    console.log('찾은 장바구니:', cart)
    console.log('장바구니 아이템 수:', cart ? cart.items.length : '장바구니 없음')
    
    if (!cart || cart.items.length === 0) {
      console.log('장바구니가 비어있거나 존재하지 않음')
      return res.status(400).json({ success: false, message: "장바구니가 비어있습니다." })
    }

    // 장바구니 아이템 검증
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      console.log(`장바구니 아이템 ${i}:`, item);
      
      if (!item.productId) {
        console.log(`장바구니 아이템 ${i}의 productId가 없음:`, item);
        return res.status(400).json({ 
          success: false, 
          message: `장바구니 아이템 ${i + 1}의 상품 정보를 찾을 수 없습니다.` 
        });
      }
      
      if (!item.productId._id) {
        console.log(`장바구니 아이템 ${i}의 productId._id가 없음:`, item.productId);
        return res.status(400).json({ 
          success: false, 
          message: `장바구니 아이템 ${i + 1}의 상품 ID를 찾을 수 없습니다.` 
        });
      }
      
      if (!item.productId.price) {
        console.log(`장바구니 아이템 ${i}의 productId.price가 없음:`, item.productId);
        return res.status(400).json({ 
          success: false, 
          message: `장바구니 아이템 ${i + 1}의 상품 가격을 찾을 수 없습니다.` 
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
    
    console.log('생성할 주문 데이터:', orderData)

    const order = await Order.create(orderData)
    console.log('생성된 주문:', order)
    

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
    console.error('오류 스택:', error.stack)
    
    // 더 구체적인 에러 메시지 제공
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

    
