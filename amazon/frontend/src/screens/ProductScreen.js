import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';

export default function ProductScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const slug = params.slug;

  // State variables for managing loading, errors, and product data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState({});

  // Access the global state and dispatch function from the context
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;

  const [discount, setDiscount] = useState(product.discount);

  // Fetch product data from the server when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch product data using the provided slug
        const result = await axios.get(`/api/products/slug/${slug}`);
        setProduct(result.data);
        setLoading(false);
      } catch (error) {
        // Handle and display any errors that occur during the fetch
        setError(getError(error));
        setLoading(false);
      }
    };

    fetchData(); // Call the fetchData function
  }, [slug]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (now >= product.expiryDiscount) {
        setDiscount(0);
      } else {
        setDiscount(product.discount);
      }
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [product.expiryDiscount, product.discount]);

  // Function to handle adding the product to the cart
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    try {
      // Fetch additional product data, including stock count
      const { data } = await axios.get(`/api/products/${product._id}`);

      // Check if the product is in stock
      if (data.countInStock < quantity) {
        window.alert('Sorry. Product is out of stock');
        return;
      }

      // Dispatch an action to add the product to the cart
      ctxDispatch({
        type: 'CART_ADD_ITEM',
        payload: { ...product, quantity },
      });
      navigate('/cart');
    } catch (error) {
      // Handle and display any errors that occur during the process
      window.alert(error.message);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{product.name}</title>
      </Helmet>
      {loading ? (
        // Display a loading indicator while fetching data
        <LoadingBox />
      ) : error ? (
        // Display an error message if an error occurred during fetch
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        // Display product details when data is loaded successfully
        <div>
          <Row>
            <Col md={6}>
              <img
                className="img-large"
                src={product.image}
                alt={product.name}
              />
            </Col>
            <Col md={3}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  {/* Display the product name */}
                  <h1>{product.name}</h1>
                </ListGroup.Item>
                <ListGroup.Item>
                  {/* Display product rating and number of reviews */}
                  <Rating
                    rating={product.rating}
                    numReviews={product.numReviews}
                  />
                </ListGroup.Item>
                <ListGroup.Item>
                  {/* Display product price */}
                  Price:{' '}
                  {discount ? (
                    <>
                      <span style={{ textDecoration: 'line-through' }}>
                        ${product.price}
                      </span>{' '}
                      <strong>${product.price * (1 - discount / 100)}</strong>
                    </>
                  ) : (
                    `${product.price}`
                  )}
                </ListGroup.Item>
                <ListGroup.Item>
                  {/* Display product description */}
                  Description: <p>{product.description}</p>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Price:</Col>
                        <Col>
                          $
                          {discount ? (
                            <>
                              <span style={{ textDecoration: 'line-through' }}>
                                ${product.price}
                              </span>{' '}
                              <strong>
                                ${product.price * (1 - discount / 100)}
                              </strong>
                            </>
                          ) : (
                            `${product.price}`
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Status:</Col>
                        <Col>
                          {/* Display product availability */}
                          {product.countInStock > 0 ? (
                            <Badge bg="success">In Stock</Badge>
                          ) : (
                            <Badge bg="danger">Unavailable</Badge>
                          )}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      {product.countInStock > 0 && (
                        // Display "Add to Cart" button if the product is in stock
                        <ListGroup.Item>
                          <div className="d-grid">
                            <Button
                              onClick={addToCartHandler}
                              variant="primary"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </ListGroup.Item>
                      )}
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
