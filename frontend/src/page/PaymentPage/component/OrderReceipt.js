import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { currencyFormat } from "../../../utils/number";

const OrderReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartList, totalPrice } = useSelector((state) => state.cart);

  return (
    <div className="receipt-container">
      <h3 className="receipt-title">주문 내역</h3>
      <ul className="receipt-list">
        {cartList.map((item) => (
          <li key={`${item.productId._id}-${item.size}`}>
            <div className="display-flex space-between">
              <div>
                {item.productId.name} ({item.size}) x {item.quantity}
              </div>
              <div>₩ {currencyFormat(item.productId.price * item.quantity)}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="display-flex space-between receipt-title">
        <div>
          <strong>Total:</strong>
        </div>
        <div>
          <strong>₩ {currencyFormat(totalPrice)}</strong>
        </div>
      </div>
      {location.pathname.includes("/cart") && cartList.length > 0 && (
        <>
          {/* 재고 부족 경고 메시지 */}
          {(() => {
            const stockWarnings = cartList.filter(item => 
              item.productId.stock && 
              item.productId.stock[item.size] !== undefined && 
              item.productId.stock[item.size] < item.quantity
            );
            
            if (stockWarnings.length > 0) {
              return (
                <div className="stock-warning" style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffeaa7', 
                  borderRadius: '4px', 
                  padding: '12px', 
                  marginBottom: '16px',
                  color: '#856404'
                }}>
                  <strong>⚠ 재고 부족 경고</strong>
                  <br />
                  {stockWarnings.map(item => 
                    `${item.productId.name} (${item.size}): 재고 ${item.productId.stock[item.size]}개, 요청 ${item.quantity}개`
                  ).join(', ')}
                  <br />
                  <small>결제 시 주문이 실패할 수 있습니다.</small>
                </div>
              );
            }
            return null;
          })()}
          
          <Button
            variant="dark"
            className="payment-button"
            onClick={() => navigate("/payment")}
          >
            결제 계속하기
          </Button>
        </>
      )}

      <div>
        가능한 결제 수단 귀하가 결제 단계에 도달할 때까지 가격 및 배송료는
        확인되지 않습니다.
        <div>
          30일의 반품 가능 기간, 반품 수수료 및 미수취시 발생하는 추가 배송 요금
          읽어보기 반품 및 환불
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;
