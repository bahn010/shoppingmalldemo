import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearOrderNum } from "../../features/order/orderSlice";
import "../PaymentPage/style/paymentPage.style.css";

const OrderCompletePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderNum } = useSelector((state) => state.order);
  
  useEffect(() => {
    // 주문번호가 없으면 메인페이지로 리다이렉트
    if (!orderNum) {
      navigate("/");
      return;
    }

    // 페이지를 떠날 때 orderNum 초기화
    return () => {
      dispatch(clearOrderNum());
    };
  }, [orderNum, navigate, dispatch]);
  
  if (!orderNum) {
    return null; // 리다이렉트 중일 때는 아무것도 렌더링하지 않음
  }
  
  return (
    <Container className="confirmation-page">
      <img
        src="/image/greenCheck.png"
        width={100}
        className="check-image"
        alt="greenCheck.png"
      />
      <h2>주문이 완료되었습니다!</h2>
      <div>주문번호: {orderNum}</div>
      <div>
        주문 확인은 내 주문 메뉴에서 확인해주세요
        <div className="text-align-center">
          <Link to={"/account/purchase"}>내 주문 바로가기</Link>
        </div>
      </div>
    </Container>
  );
};

export default OrderCompletePage;
