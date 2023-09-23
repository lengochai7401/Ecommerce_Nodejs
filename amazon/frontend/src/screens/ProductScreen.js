import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';

export default function ProductScreen() {
  const params = useParams();
  const slug = params.slug;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState({});

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        setProduct(result.data);
        setLoading(false);
      } catch (error) {
        setError(getError(error));
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    try {
      const { data } = await axios.get(`/api/products/${product._id}`);
      if (data.countInStock < quantity) {
        window.alert('Sorry. Product is out of stock');
        return;
      }

      ctxDispatch({
        type: 'CART_ADD_ITEM',
        payload: { ...product, quantity },
      });
    } catch (error) {
      // Handle the error here if necessary
      window.alert(error.message);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{product.name}</title>
      </Helmet>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
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
                  <h1>{product.name}</h1>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    rating={product.rating}
                    numReviews={product.numReviews}
                  />
                </ListGroup.Item>
                <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
                <ListGroup.Item>
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
                        <Col>${product.price}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Status:</Col>
                        <Col>
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
