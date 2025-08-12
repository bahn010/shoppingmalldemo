import React from "react";
import { Row, Col, Badge } from "react-bootstrap";
import { badgeBg } from "../../../constants/order.constants";
import { currencyFormat } from "../../../utils/number";

const OrderStatusCard = ({ orderItem }) => {

  return (
    <div>
      <Row className="status-card">
        <Col xs={2}>
          {/* 상품 이미지 - 에러 처리 추가 */}
          {orderItem.items[0]?.productId?.image ? (
            <img
              src={orderItem.items[0].productId.image}
              alt={orderItem.items[0].productId.name || "상품 이미지"}
              height={96}
              style={{ objectFit: 'cover', borderRadius: '8px', width: '100%' }}
            />
          ) : (
            <div 
              style={{ 
                height: 96, 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6c757d'
              }}
            >
              이미지 없음
            </div>
          )}
        </Col>
        <Col xs={8} className="order-info">
          <div>
            <strong>주문번호: {orderItem.orderNum}</strong>
          </div>

          <div className="text-12">{orderItem.createdAt.slice(0, 10)}</div>

          {/* 상품명 표시 개선 */}
          <div className="product-info">
            {orderItem.items[0]?.productId?.name ? (
              <>
                <strong>{orderItem.items[0].productId.name}</strong>
                {orderItem.items.length > 1 && (
                  <span className="additional-items"> 외 {orderItem.items.length - 1}개</span>
                )}
              </>
            ) : (
              <span style={{ color: '#dc3545' }}>상품명을 불러올 수 없습니다</span>
            )}
          </div>
          
          <div className="total-price">
            <strong>총 주문금액: ₩{currencyFormat(orderItem.totalPrice)}</strong>
          </div>
        </Col>
        <Col md={2} className="vertical-middle">
          <div className="text-align-center text-12">주문상태</div>
          <Badge bg={badgeBg[orderItem.status]}>{orderItem.status}</Badge>
        </Col>
      </Row>
    </div>
  );
};

export default OrderStatusCard;
