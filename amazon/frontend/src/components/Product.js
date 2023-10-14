import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Rating from './Rating';
import axios from 'axios';
import { Store } from '../Store';
import Badge from 'react-bootstrap/Badge';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);

    // Check if the product is in stock
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }

    // Dispatch an action to add the product to the cart
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(product.expiryDiscount)
  );
  const [discount, setDiscount] = useState(product.discount);

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingTime = calculateTimeRemaining(product.expiryDiscount);
      setTimeRemaining(remainingTime);
      if (remainingTime === 'Discount expired') {
        setDiscount(0);
      } else {
        setDiscount(product.discount);
      }
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [product.expiryDiscount, product.discount]);

  // Function to calculate time remaining
  function calculateTimeRemaining(expiryDiscount) {
    const now = new Date().getTime() / 1000; // Get current timestamp in seconds

    const timeDifference = expiryDiscount - now;
    if (timeDifference <= 0) {
      return 'Discount expired';
    }

    const days = Math.floor(timeDifference / (60 * 60 * 24));
    const hours = Math.floor((timeDifference % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((timeDifference % (60 * 60)) / 60);
    const seconds = Math.floor(timeDifference % 60);

    return {
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }

  return (
    <Card>
      <Link to={`/product/${product.slug}`}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{ maxWidth: '300px' }}
        />
      </Link>
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Rating rating={product.rating} numReviews={product.numReviews} />

        {discount > 0 ? (
          <>
            <Card.Text>
              <Row>
                <Col>
                  <span style={{ textDecoration: 'line-through' }}>
                    ${product.price}
                  </span>{' '}
                  <strong>${product.price * (1 - discount / 100)}</strong>
                </Col>
                <Col xs="auto">
                  <Badge bg="danger" className="float-right">
                    {discount}% - {timeRemaining.days}d{timeRemaining.hours}h
                    {timeRemaining.minutes}m{timeRemaining.seconds}s
                  </Badge>
                </Col>
              </Row>
            </Card.Text>
          </>
        ) : (
          <>
            <Card.Text>${product.price}</Card.Text>
          </>
        )}
        <Card.Text>Sold: {product.sold}</Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to Cart</Button>
        )}
      </Card.Body>
    </Card>
  );
}
