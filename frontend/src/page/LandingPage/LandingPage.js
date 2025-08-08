import React, { useEffect } from "react";
import ProductCard from "./components/ProductCard";
import { Row, Col, Container } from "react-bootstrap";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faAngleDoubleLeft, faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { ColorRing } from "react-loader-spinner";
import { getProductList } from "../../features/product/productSlice";

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query] = useSearchParams();

  const productList = useSelector((state) => state.product.productList);
  const totalPageNum = useSelector((state) => state.product.totalPageNum);
  const loading = useSelector((state) => state.product.loading);
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

  // 로딩 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </Container>
    );
  }

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
              <h2></h2>
            ) : (
              <h2></h2>
            )}
          </div>
        )}
      </Row>
      
      {totalPageNum > 1 && productList.length > 0 && (
        <ReactPaginate
          nextLabel={<FontAwesomeIcon icon={faChevronRight} />}
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={totalPageNum}
          forcePage={parseInt(page) - 1}
          previousLabel={<FontAwesomeIcon icon={faChevronLeft} />}
          firstLabel={<FontAwesomeIcon icon={faAngleDoubleLeft} />}
          lastLabel={<FontAwesomeIcon icon={faAngleDoubleRight} />}
          renderOnZeroPageCount={null}
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          firstClassName="page-item"
          firstLinkClassName="page-link"
          lastClassName="page-item"
          lastLinkClassName="page-link"
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
