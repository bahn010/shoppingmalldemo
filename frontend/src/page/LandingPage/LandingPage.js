import React, { useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import { getProductList } from "../../features/product/productSlice";

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query] = useSearchParams();

  const productList = useSelector((state) => state.product.productList);
  const totalPageNum = useSelector((state) => state.product.totalPageNum);
  const name = query.get("name") || "";
  const page = query.get("page") || 1;

  useEffect(() => {
    dispatch(
      getProductList({
        name,
        page,
      })
    );
  }, [name, page, dispatch]);

  const handlePageClick = ({ selected }) => {
    const newPage = selected + 1;
    const searchParams = new URLSearchParams();
    if (name) searchParams.set("name", name);
    searchParams.set("page", newPage);
    navigate(`?${searchParams.toString()}`);
  };

  return (
    <Container>
      <Row>
        {productList.length > 0 ? (
          productList.map((item) => (
            <Col md={3} sm={12} key={item._id}>
              <ProductCard item={item} />
            </Col>
          ))
        ) : (
          <div className="text-align-center empty-bag">
            {name === "" ? (
              <h2>등록된 상품이 없습니다!</h2>
            ) : (
              <h2>{name}과 일치한 상품이 없습니다!</h2>
            )}
          </div>
        )}
      </Row>
      
      {totalPageNum > 1 && productList.length > 0 && (
        <ReactPaginate
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={totalPageNum}
          forcePage={parseInt(page) - 1}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakLabel="..."
          breakClassName="page-item"
          breakLinkClassName="page-link"
          containerClassName="pagination"
          activeClassName="active"
          className="display-center list-style-none"
        />
      )}
    </Container>
  );
};

export default LandingPage;
