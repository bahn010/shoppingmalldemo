import React, { useState, useEffect, useCallback } from "react";
import { Form, Modal, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import CloudinaryUploadWidget from "../../../utils/CloudinaryUploadWidget";
import { CATEGORY, STATUS, SIZE } from "../../../constants/product.constants";
import "../style/adminProduct.style.css";
import {
  clearError,
  createProduct,
  editProduct,
  checkSkuDuplicate,
  clearSkuValidation,
} from "../../../features/product/productSlice";

const InitialFormData = {
  name: "",
  sku: "",
  stock: {},
  image: "",
  description: "",
  category: [],
  status: "active",
  price: 0,
};

const NewItemDialog = ({ mode, showDialog, setShowDialog, searchQuery }) => {
  const { error, success, selectedProduct, skuValidation } = useSelector(
    (state) => state.product
  );
  const [formData, setFormData] = useState(
    mode === "new" ? { ...InitialFormData } : selectedProduct
  );
  const [stock, setStock] = useState([]);
  const dispatch = useDispatch();
  const [stockError, setStockError] = useState(false);
  const [stockErrorMessage, setStockErrorMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  
  // SKU 검증 관련 상태
  const [skuCheckTimeout, setSkuCheckTimeout] = useState(null);

  // SKU 중복 검사를 debounce로 처리하는 함수
  const debouncedSkuCheck = useCallback((sku) => {
    if (skuCheckTimeout) {
      clearTimeout(skuCheckTimeout);
    }
    
    if (!sku || sku.trim() === '') {
      dispatch(clearSkuValidation());
      return;
    }

    const timeout = setTimeout(() => {
      const productId = mode === "edit" ? selectedProduct?._id : null;
      dispatch(checkSkuDuplicate({ sku: sku.trim(), productId }));
    }, 500); // 500ms 후에 검사 실행

    setSkuCheckTimeout(timeout);
  }, [dispatch, mode, selectedProduct?._id, skuCheckTimeout]);

  useEffect(() => {
    if (success) {
      setShowDialog(false);
      dispatch(clearError()); // success 상태도 함께 초기화
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error || !success) {
      dispatch(clearError());
    }
    if (showDialog) {
      // SKU 검증 상태 초기화
      dispatch(clearSkuValidation());
      
      if (mode === "edit") {
        setFormData(selectedProduct);
        // 객체형태로 온 stock을  다시 배열로 세팅해주기
        const sizeArray = Object.keys(selectedProduct.stock).map((size) => [
          size,
          selectedProduct.stock[size],
        ]);
        setStock(sizeArray);
      } else {
        setFormData({ ...InitialFormData });
        setStock([]);
      }
    }
  }, [showDialog, dispatch, mode, selectedProduct]);

  const handleClose = () => {
    //모든걸 초기화시키고;
    setFormData({ ...InitialFormData });
    setStock([]);
    setStockError(false);
    setStockErrorMessage("");
    setImageError(false);
    // SKU 검증 상태 초기화
    dispatch(clearSkuValidation());
    // timeout 정리
    if (skuCheckTimeout) {
      clearTimeout(skuCheckTimeout);
      setSkuCheckTimeout(null);
    }
    // success 상태도 초기화
    dispatch(clearError());
    // 다이얼로그 닫아주기
    setShowDialog(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // 재고 유효성 검사
    if (stock.length === 0) {
      setStockError(true);
      setStockErrorMessage("재고를 추가해주세요.");
      return;
    }
    
    // 재고가 0 이하인지 확인
    const hasInvalidStock = stock.some(item => {
      const stockValue = parseInt(item[1]) || 0;
      return stockValue < 0;
    });
    
    if (hasInvalidStock) {
      setStockError(true);
      setStockErrorMessage("재고가 0 이하일 수 없습니다.");
      return;
    }
    
    // 이미지 유효성 검사
    if (!formData.image || formData.image.trim() === "") {
      setImageError(true);
      return;
    }
    
    // 재고를 배열에서 객체로 바꿔주기
    const stockObject = stock.reduce((total,item) => {
      return {...total,[item[0]]:parseInt(item[1])}
    }, {});

    if (mode === "new") {
      //새 상품 만들기
      dispatch(createProduct({ formData: {...formData, stock: stockObject}, searchQuery }));
    } else {
      // 상품 수정하
      dispatch(editProduct({...formData, stock: stockObject, searchQuery}));
    }
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    
    // SKU 필드 변경 시 중복 에러 초기화 및 실시간 검증
    if (id === "sku") {
      if (error && error.includes("중복된 상품코드")) {
        dispatch(clearError());
      }
      // 실시간 SKU 중복 검사
      debouncedSkuCheck(value);
    }
    
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const addStock = () => {
    setStock([...stock, []]);
  };

  const deleteStock = (idx) => {
    const newStock = stock.filter((_, index) => index !== idx);
    setStock(newStock);
  };

  const handleSizeChange = (value, index) => {
    const newStock = [...stock];
    newStock[index][0] = value;
    setStock(newStock);
  };

  const handleStockChange = (value, index) => {
    const newStock = [...stock];
    // 재고가 0 이하로 설정되지 않도록 제한
    const stockValue = Math.max(0, parseInt(value) || 0);
    newStock[index][1] = stockValue;
    setStock(newStock);
    
    // 재고가 유효한 값이면 에러 초기화
    if (stockValue >= 0) {
      setStockError(false);
      setStockErrorMessage("");
    }
  };

  const onHandleCategory = (event) => {
    // 카테고리가 이미 추가되어있으면 제거, 아니면 새로 추가
    if (formData.category.includes(event.target.value)) {
      const newCategory = formData.category.filter(
        (item) => item !== event.target.value
      );
      setFormData({
        ...formData,
        category: [...newCategory],
      });
    } else {
      setFormData({
        ...formData,
        category: [...formData.category, event.target.value],
      });
    }
  };

  const uploadImage = (url) => {
    setFormData({
      ...formData,
      image: url,
    });
    setImageError(false); // 이미지 업로드 시 에러 초기화
  };

  return (
    <Modal show={showDialog} onHide={handleClose} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        {mode === "new" ? (
          <Modal.Title style={{ color: '#495057', fontWeight: '600' }}>상품 생성</Modal.Title>
        ) : (
          <Modal.Title style={{ color: '#495057', fontWeight: '600' }}>상품 수정</Modal.Title>
        )}
      </Modal.Header>
      {error && (
        <div style={{ padding: '15px 30px 0' }}>
          <Alert variant="danger" style={{ border: '1px solid #f5c6cb', backgroundColor: '#f8d7da' }}>{error}</Alert>
        </div>
      )}
      <Form className="form-container" onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="sku">
            <Form.Label>Sku</Form.Label>
            <div className="position-relative">
              <Form.Control
                onChange={handleChange}
                type="string"
                placeholder="Enter Sku"
                required
                value={formData.sku}
                isInvalid={(error && error.includes("중복된 상품코드")) || skuValidation.isDuplicate}
                isValid={skuValidation.isValid && !skuValidation.isChecking}
              />
              {skuValidation.isChecking && (
                <div className="sku-validation-icon">
                  <Spinner animation="border" size="sm" className="spinner-border-sm" />
                </div>
              )}
              {!skuValidation.isChecking && skuValidation.isValid && (
                <div className="sku-validation-icon validation-icon-success">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              )}
              {!skuValidation.isChecking && skuValidation.isDuplicate && (
                <div className="sku-validation-icon validation-icon-error">
                  <FontAwesomeIcon icon={faTimes} />
                </div>
              )}
            </div>
            {error && error.includes("중복된 상품코드") && (
              <Form.Control.Feedback type="invalid">
                {error}
              </Form.Control.Feedback>
            )}
            {skuValidation.message && (
              <div className={`mt-1 small ${skuValidation.isDuplicate ? 'text-danger' : 'text-success'}`}>
                {skuValidation.message}
              </div>
            )}
          </Form.Group>

          <Form.Group as={Col} controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              onChange={handleChange}
              type="string"
              placeholder="Name"
              required
              value={formData.name}
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="string"
            placeholder="Description"
            as="textarea"
            onChange={handleChange}
            rows={3}
            value={formData.description}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="stock">
          <Form.Label className="mr-1">Stock</Form.Label>
          {stockError && (
            <span className="error-message">{stockErrorMessage}</span>
          )}
          <Button className="btn-add-stock" size="sm" onClick={addStock}>
            Add +
          </Button>
          <div className="mt-2">
            {stock.map((item, index) => (
              <div key={index} className="stock-row">
                <Row>
                  <Col sm={4}>
                    <Form.Select
                      onChange={(event) =>
                        handleSizeChange(event.target.value, index)
                      }
                      required
                      defaultValue={item[0] ? item[0].toLowerCase() : ""}
                    >
                      <option value="" disabled selected hidden>
                        Please Choose...
                      </option>
                      {SIZE.map((item, index) => (
                        <option
                          inValid={true}
                          value={item.toLowerCase()}
                          disabled={stock.some(
                            (size) => size[0] === item.toLowerCase()
                          )}
                          key={index}
                        >
                          {item}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col sm={6}>
                    <Form.Control
                      onChange={(event) =>
                        handleStockChange(event.target.value, index)
                      }
                      type="number"
                      placeholder="number of stock"
                      value={item[1]}
                      required
                      min="0"
                    />
                  </Col>
                  <Col sm={2}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteStock(index)}
                      style={{ border: '1px solid #dc3545', color: '#dc3545' }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3" controlId="Image" required>
          <Form.Label>Image</Form.Label>
          {imageError && (
            <div className="error-message">이미지를 선택해주세요</div>
          )}
          <div className="image-upload-section">
            <CloudinaryUploadWidget uploadImage={uploadImage} />
            {formData.image ? (
              <img
                id="uploadedimage"
                src={formData.image}
                className="upload-image"
                alt="uploadedimage"
              />
            ) : (
              <div className="upload-image-placeholder">
                이미지를 업로드해주세요
              </div>
            )}
          </div>
        </Form.Group>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="price">
            <Form.Label>Price</Form.Label>
            <Form.Control
              value={formData.price}
              required
              onChange={handleChange}
              type="number"
              placeholder="0"
            />
          </Form.Group>

          <Form.Group as={Col} controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Control
              as="select"
              multiple
              onChange={onHandleCategory}
              value={formData.category}
              required
            >
              {CATEGORY.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group as={Col} controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={handleChange}
              required
            >
              {STATUS.map((item, idx) => (
                <option key={idx} value={item.toLowerCase()}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Row>
        <div className="d-flex justify-content-end">
          {mode === "new" ? (
            <Button 
              className="btn-submit"
              type="submit"
              disabled={skuValidation.isChecking || skuValidation.isDuplicate}
            >
              Submit
            </Button>
          ) : (
            <Button 
              className="btn-submit"
              type="submit"
              disabled={skuValidation.isChecking || skuValidation.isDuplicate}
            >
              Edit
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default NewItemDialog;
