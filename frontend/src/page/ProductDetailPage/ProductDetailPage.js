import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { ColorRing } from "react-loader-spinner";
import { currencyFormat } from "../../utils/number";
import "./style/productDetail.style.css";
import { getProductDetail } from "../../features/product/productSlice";
import { addToCart } from "../../features/cart/cartSlice";

const ProductDetail = () => {
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector((state) => state.product);
  const [size, setSize] = useState("");
  const { id } = useParams();
  const [sizeError, setSizeError] = useState(false);
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

 
  const isSoldOut = () => {
    if (!selectedProduct?.stock || typeof selectedProduct.stock !== 'object') return false;

    return Object.values(selectedProduct.stock).every(quantity => quantity <= 0);
  };


  const isSizeSoldOut = (sizeName) => {
    if (!selectedProduct?.stock || !sizeName) return false;
    return selectedProduct.stock[sizeName] <= 0;
  };

  const addItemToCart = () => {
  
    if (size === "") {
      setSizeError(true);
      return;
    }
    

    if (isSizeSoldOut(size)) {
      return;
    }
    

    if (!user) {
      navigate("/login");
      return;
    }
    

    dispatch(addToCart({ 
      productId: selectedProduct._id, 
      size: size, 
      quantity: 1 
    }));
  };
  
  const selectSize = (value) => {

    if (sizeError) setSizeError(false);
    setSize(value);
  };

  useEffect(() => {
    dispatch(getProductDetail(id));
  }, [id, dispatch]);

  if (loading || !selectedProduct)
    return (
      <Container className="display-center" style={{ minHeight: "400px" }}>
        <ColorRing
          visible={true}
          height="60"
          width="60"
          ariaLabel="loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={["#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"]}
        />
      </Container>
    );
  return (
    <Container className="product-detail-card">
      <Row>
        <Col sm={6}>
          <img src={selectedProduct.image} className="w-100" alt="image" />
        </Col>
        <Col className="product-info-area" sm={6}>
          <div className="product-info">{selectedProduct.name}</div>
          <div className="product-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>₩ {currencyFormat(selectedProduct.price)}</span>
            {isSoldOut() && (
              <span style={{ 
                color: '#6b7280', 
                fontSize: '16px', 
                fontWeight: '500' 
              }}>
                SOLD OUT
              </span>
            )}
          </div>
          <div className="product-info">{selectedProduct.description}</div>

          <Dropdown
            className="drop-down size-drop-down"
            title={size}
            align="start"
            onSelect={(value) => selectSize(value)}
          >
            <Dropdown.Toggle
              className="size-drop-down"
              variant={sizeError ? "outline-danger" : "outline-dark"}
              id="dropdown-basic"
              align="start"
            >
              {size === "" ? "사이즈 선택" : size.toUpperCase()}
            </Dropdown.Toggle>

            <Dropdown.Menu className="size-drop-down">
              {Object.keys(selectedProduct.stock).length > 0 &&
                Object.keys(selectedProduct.stock).map((item, index) =>
                  selectedProduct.stock[item] > 0 ? (
                    <Dropdown.Item eventKey={item} key={index}>
                      {item.toUpperCase()}
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item eventKey={item} disabled={true} key={index}>
                      {item.toUpperCase()}
                    </Dropdown.Item>
                  )
                )}
            </Dropdown.Menu>
          </Dropdown>
          <div className="warning-message">
            {sizeError && "사이즈를 선택해주세요."}
          </div>
          <Button 
            variant="dark" 
            className="add-button" 
            onClick={addItemToCart}
            disabled={isSoldOut() || isSizeSoldOut(size)}
          >
            {isSoldOut() ? "품절" : "추가"}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
