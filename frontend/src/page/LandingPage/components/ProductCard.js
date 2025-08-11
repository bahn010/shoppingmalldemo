import React from "react";
import { useNavigate } from "react-router-dom";
import { currencyFormat } from "../../../utils/number";

const ProductCard = ({ item }) => {
  const navigate = useNavigate();
  
  // 재고 상태 확인 함수
  const isSoldOut = () => {
    if (!item.stock || typeof item.stock !== 'object') return false;
    // 모든 사이즈의 재고가 0인지 확인
    return Object.values(item.stock).every(quantity => quantity <= 0);
  };

  const showProduct = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div 
      className="card" 
      onClick={() => showProduct(item._id)}
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      <img src={item?.image} alt={item?.name} />
      <div>{item?.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>₩ {currencyFormat(item?.price)}</span>
        {isSoldOut() && (
          <span style={{ 
            color: '#6b7280', 
            fontSize: '14px', 
            fontWeight: '500' 
          }}>
            SOLD OUT
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
