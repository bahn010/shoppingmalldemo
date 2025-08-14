const orderController = {}
const Order = require("../model/order")
const Cart = require("../model/cart")
const Product = require("../model/product")

orderController.createOrder = async (req, res) => {
  try {
    const userId = req.userID
    const { shippingAddress, contact, totalPrice } = req.body
       
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: '_id name price stock'
    })

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "장바구니가 비어있습니다."
      })
    }

    // 재고 확인 로직
    const stockErrors = []
    
    for (const item of cart.items) {
      const product = item.productId
      const currentStock = product.stock[item.size] || 0
      
      if (currentStock < item.quantity) {
        stockErrors.push({
          productName: product.name,
          size: item.size,
          requestedQuantity: item.quantity,
          availableStock: currentStock
        })
      }
    }

    // 재고 부족한 상품이 있으면 에러 반환
    if (stockErrors.length > 0) {
      const errorMessage = stockErrors.map(error => {
        if (error.error) {
          return `${error.productName} (${error.size}): ${error.error}`
        }
        return `${error.productName} (${error.size}): 요청수량 ${error.requestedQuantity}개, 재고 ${error.availableStock}개`
      }).join('\n')
      
      console.log('재고 부족으로 주문 차단:', stockErrors)
      
      return res.status(400).json({
        success: false,
        message: "재고가 부족한 상품이 있습니다.",
        stockErrors,
        details: errorMessage
      })
    }
    
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

    const order = await Order.create(orderData)

    // 재고 차감
    for (const item of order.items) {
      try {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { [`stock.${item.size}`]: -item.quantity } }
        );
      } catch (error) {
        console.error('재고 차감 중 오류 발생:', error)
      }
    }
    

    await Cart.findOneAndDelete({ userId })

    res.status(200).json({
      success: true,
      message: "주문이 성공적으로 생성되었습니다.",
      order
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
    const orders = await Order.find({ userId: req.userID }).populate({
      path: 'items.productId',
      model: 'Product',
      select: '_id name price image stock'
    })
    res.status(200).json({ success: true, orders })
  } catch (error) {
    res.status(400).json({ success: false, message: "주문 조회 중 오류가 발생했습니다." })
  }
}

orderController.getAdminOrders = async (req, res) => {
  try {
    const { page = 1, ordernum = "", limit = 10 } = req.query;
    const limitNum = parseInt(limit);
    const skip = (page - 1) * limitNum;
    
    let query = {};
    if (ordernum) {
      query.orderNum = { $regex: ordernum, $options: 'i' };
    }
    
    const orders = await Order.find(query)
      .populate({
        path: 'userId',
        model: 'User',
        select: 'name email'
      })
      .populate({
        path: 'items.productId',
        model: 'Product',
        select: '_id name price image'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limitNum);
    
    res.status(200).json({ 
      success: true, 
      orders,
      totalPages,
      currentPage: parseInt(page),
      totalOrders
    });
  } catch (error) {
    console.error('Admin 주문 조회 오류:', error);
    res.status(400).json({ success: false, message: "주문 조회 중 오류가 발생했습니다." });
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

    
