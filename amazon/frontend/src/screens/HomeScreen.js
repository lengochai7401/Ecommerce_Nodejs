import React, { useEffect, useState } from 'react';
// import data from '../data';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(6, discountedProducts.length), // Limit to the number of available products
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, discountedProducts.length), // Limit to the number of available products
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(1, discountedProducts.length), // Limit to the number of available products
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await axios.get('/api/products');
        setProducts(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch products with a discount greater than 0
        const result = await axios.get('/api/products/with-discount');
        setDiscountedProducts(result.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Home Page</title>
      </Helmet>
      {/* Display horizontal sliding component for products with discount */}
      {discountedProducts && discountedProducts.length > 0 && (
        <>
          <h1>On sale</h1>
          <Slider {...settings} className="mb-5">
            {discountedProducts.map((item, index) => (
              <div key={index}>
                <Product product={item}></Product>
              </div>
            ))}
          </Slider>
        </>
      )}
      <h1>Feature Product</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
