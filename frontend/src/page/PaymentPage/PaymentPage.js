import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import OrderReceipt from "./component/OrderReceipt";
import PaymentForm from "./component/PaymentForm";
import "./style/paymentPage.style.css";
import { cc_expires_format } from "../../utils/number";
import { createOrder, clearOrderNum } from "../../features/order/orderSlice";

const PaymentPage = () => {
  const dispatch = useDispatch();
  const { orderNum, loading } = useSelector((state) => state.order);
  const { cartList } = useSelector((state) => state.cart);
  const [cardValue, setCardValue] = useState({
    cvc: "",
    expiry: "",
    focus: "",
    name: "",
    number: "",
  });
  const navigate = useNavigate();
  const [firstLoading, setFirstLoading] = useState(true);
  const [shipInfo, setShipInfo] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    address: "",
    city: "",
    zip: "",
  });

  useEffect(() => {
    // 주문번호가 생성되면 주문완료 페이지로 이동
    if (orderNum) {
      navigate("/order-complete");
      // dispatch(clearOrderNum()); // 주문번호 초기화 - OrderCompletePage에서 처리
    }
  }, [orderNum, navigate, dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // 배송 정보와 결제 정보가 모두 입력되었는지 확인
    if (!shipInfo.firstName || !shipInfo.lastName || !shipInfo.contact || 
        !shipInfo.address || !shipInfo.city || !shipInfo.zip) {
      alert("모든 배송 정보를 입력해주세요.");
      return;
    }

    if (!cardValue.number || !cardValue.expiry || !cardValue.cvc || !cardValue.name) {
      alert("모든 결제 정보를 입력해주세요.");
      return;
    }

    // 장바구니에 상품이 있는지 확인
    if (!cartList || cartList.length === 0) {
      alert("장바구니에 상품이 없습니다.");
      navigate("/cart");
      return;
    }

    // 장바구니 데이터 구조 확인 및 totalPrice 계산
    let totalPrice = 0;
    for (const item of cartList) {
      if (!item.productId || !item.productId.price) {
        console.error('상품 정보가 제대로 로드되지 않음:', item);
        alert("상품 정보를 불러오는 중 오류가 발생했습니다. 장바구니를 다시 확인해주세요.");
        return;
      }
      totalPrice += item.productId.price * item.quantity;
    }

    try {
      // 주문 데이터 준비
      const orderData = {
        shippingAddress: `${shipInfo.address}, ${shipInfo.city} ${shipInfo.zip}`,
        contact: shipInfo.contact,
        totalPrice: totalPrice
      };

      console.log('전송할 주문 데이터:', orderData);
      console.log('장바구니 목록:', cartList);
      console.log('계산된 총 가격:', totalPrice);

      // 주문 생성
      await dispatch(createOrder(orderData)).unwrap();
    } catch (error) {
      console.error("주문 생성 실패:", error);
      let errorMessage = "주문 생성 중 오류가 발생했습니다.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`주문 생성 실패: ${errorMessage}`);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setShipInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInfoChange = (event) => {
    const { name, value } = event.target;
    setCardValue(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputFocus = (e) => {
    setCardValue({ ...cardValue, focus: e.target.name });
  };

  // 장바구니에 상품이 없다면 장바구니 페이지로 이동
  if (!cartList || cartList.length === 0) {
    if (firstLoading) {
      return (
        <Container>
          <div className="text-center py-5">
            <h3>장바구니 정보를 불러오는 중...</h3>
          </div>
        </Container>
      );
    }
    navigate("/cart");
    return null;
  }

  return (
    <Container>
      <Row>
        <Col lg={7}>
          <div>
            <h2 className="mb-2">배송 주소</h2>
            <div>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="lastName">
                    <Form.Label>성</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={handleFormChange}
                      required
                      name="lastName"
                      value={shipInfo.lastName}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="firstName">
                    <Form.Label>이름</Form.Label>
                    <Form.Control
                      type="text"
                      onChange={handleFormChange}
                      required
                      name="firstName"
                      value={shipInfo.firstName}
                    />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridAddress1">
                  <Form.Label>연락처</Form.Label>
                  <Form.Control
                    placeholder="010-xxx-xxxxx"
                    onChange={handleFormChange}
                    required
                    name="contact"
                    value={shipInfo.contact}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridAddress2">
                  <Form.Label>주소</Form.Label>
                  <Form.Control
                    placeholder="Apartment, studio, or floor"
                    onChange={handleFormChange}
                    required
                    name="address"
                    value={shipInfo.address}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridCity">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      onChange={handleFormChange}
                      required
                      name="city"
                      value={shipInfo.city}
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formGridZip">
                    <Form.Label>Zip</Form.Label>
                    <Form.Control
                      onChange={handleFormChange}
                      required
                      name="zip"
                      value={shipInfo.zip}
                    />
                  </Form.Group>
                </Row>

                <div className="mobile-receipt-area">
                  {/* <OrderReceipt /> */}
                </div>
                <div>
                  <h2 className="payment-title">결제 정보</h2>
                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="cardName">
                      <Form.Label>카드 소유자명</Form.Label>
                      <Form.Control
                        type="text"
                        onChange={handlePaymentInfoChange}
                        required
                        name="name"
                        value={cardValue.name}
                      />
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="cardNumber">
                      <Form.Label>카드 번호</Form.Label>
                      <Form.Control
                        type="text"
                        onChange={handlePaymentInfoChange}
                        required
                        name="number"
                        value={cardValue.number}
                        placeholder="1234-5678-9012-3456"
                      />
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} controlId="cardExpiry">
                      <Form.Label>만료일</Form.Label>
                      <Form.Control
                        type="text"
                        onChange={handlePaymentInfoChange}
                        required
                        name="expiry"
                        value={cardValue.expiry}
                        placeholder="MM/YY"
                      />
                    </Form.Group>
                    <Form.Group as={Col} controlId="cardCvc">
                      <Form.Label>CVC</Form.Label>
                      <Form.Control
                        type="text"
                        onChange={handlePaymentInfoChange}
                        required
                        name="cvc"
                        value={cardValue.cvc}
                        placeholder="123"
                      />
                    </Form.Group>
                  </Row>
                </div>
                <div>
                  <Button
                    variant="dark"
                    className="payment-button pay-button"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "처리중..." : "결제하기"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </Col>
        <Col lg={5} className="receipt-area">
          {/* <OrderReceipt  /> */}
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
