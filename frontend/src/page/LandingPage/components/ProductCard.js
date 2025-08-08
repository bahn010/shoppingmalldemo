import React from "react";
import { useNavigate } from "react-router-dom";
import { currencyFormat } from "../../../utils/number";

const ProductCard = ({ item }) => {
  const navigate = useNavigate();
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
      <div>₩ {currencyFormat(item?.price)}</div>
    </div>
  );
};

export default ProductCard;
