import React, { useContext, useEffect, useState } from 'react';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState({});

  const [loadingPay, setLoadingPay] = useState(false);
  const [successPay, setSuccessPay] = useState(false);

  const [loadingDeliver, setLoadingDeliver] = useState(false);
  const [successDeliver, setSuccessDeliver] = useState(false);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, action) {
    return action.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderId) => {
        return orderId;
      });
  }

  function onApprove(data, action) {
    return action.order.capture().then(async function (details) {
      try {
        setLoadingPay(true);
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        setLoadingPay(false);
        setSuccessPay(true);
        toast.success('Order is paid successfully');
      } catch (error) {
        setLoading(false);
        setError(getError(error));
        setLoadingPay(false);
        toast.error(getError(error));
      }
    });
  }

  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    try {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          setError('');
          const { data } = await axios.get(`/api/orders/${orderId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          setLoading(false);
          setError('');
          setOrder(data);
        } catch (err) {
          setLoading(false);
          setError(getError(err));
        }
      };

      if (!userInfo) {
        navigate('/login');
      }
      if (
        !order._id ||
        successPay ||
        successDeliver ||
        (order._id && order._id !== orderId)
      ) {
        fetchOrder();
        if (successPay) {
          setLoadingPay(false);
          setSuccessPay(false);
        }
        if (successDeliver) {
          setSuccessDeliver(false);
          setLoadingDeliver(false);
        }
      } else {
        const loadPaypalScript = async () => {
          const { data: clientId } = await axios.get('/api/keys/paypal', {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          paypalDispatch({
            type: 'resetOptions',
            value: {
              'client-id': clientId,
              currency: 'USD',
            },
          });
          paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
        };
        loadPaypalScript();
      }
    } catch (error) {
      window.location.reload();
    }
  }, [
    userInfo,
    navigate,
    order,
    orderId,
    paypalDispatch,
    successPay,
    loadingDeliver,
    successDeliver,
  ]);

  async function deliverOrderHandler() {
    try {
      setLoadingDeliver(true);
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoadingDeliver(false);
      setSuccessDeliver(true);
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      setLoadingDeliver(false);
    }
  }

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Order {orderId}</title>
      </Helmet>
      <h1 className="my-3">Order {orderId}</h1>
      {order && (
        <>
          <Row>
            <Col md={8}>
              <Card className="md-3">
                <Card.Body>
                  <Card.Title>Shipping</Card.Title>
                  <Card.Text>
                    <strong>Name:</strong> {order.shippingAddress.fullname}{' '}
                    <br />
                    <strong>Address:</strong> {order.shippingAddress.address}{' '}
                    <br />
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode},{' '}
                    {order.shippingAddress.country}
                    &nbsp;
                    {order.shippingAddress.location &&
                      order.shippingAddress.location.lat && (
                        <a
                          target="_new"
                          href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
                        >
                          Show On Map
                        </a>
                      )}
                  </Card.Text>
                  {order.isDelivered ? (
                    <MessageBox variant="success">
                      Delivered at {order.deliveredAt}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">No Delivered</MessageBox>
                  )}
                </Card.Body>
              </Card>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Payment</Card.Title>
                  <Card.Text>
                    <strong>Method:</strong> {order.paymentMethod}
                  </Card.Text>
                  {order.isPaid ? (
                    <MessageBox variant="success">
                      Paid at {order.paidAt}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Paid</MessageBox>
                  )}
                </Card.Body>
              </Card>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Items</Card.Title>
                  <ListGroup variant="flush">
                    {order.orderItems.map((item) => (
                      <ListGroup.Item key={item._id}>
                        <Row className="align-items-center">
                          <Col md={6}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="img-fluid rounded img-thumbnail"
                            ></img>{' '}
                            <Link to={`product/${item.slug}`}>{item.name}</Link>
                          </Col>
                          <Col md={3}>
                            <span>{item.quantity}</span>
                          </Col>
                          <Col md={3}>
                            $
                            {item.discount ? (
                              <>
                                <span
                                  style={{ textDecoration: 'line-through' }}
                                >
                                  {item.price * item.quantity}
                                </span>{' '}
                                <strong>
                                  $
                                  {item.price *
                                    item.quantity *
                                    (1 - item.discount / 100)}
                                </strong>
                              </>
                            ) : (
                              `${item.price}`
                            )}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Order Summary</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Items</Col>
                        <Col>{order.itemsPrice.toFixed(2)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Shipping</Col>
                        <Col>{order.shippingPrice.toFixed(2)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Tax</Col>
                        <Col>{order.taxPrice.toFixed(2)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <strong>Order Total</strong>
                        </Col>
                        <Col>
                          <strong>{order.totalPrice.toFixed(2)}</strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    {!order.isPaid && (
                      <ListGroup.Item>
                        {isPending ? (
                          <LoadingBox />
                        ) : (
                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          />
                        )}
                        {loadingPay && <LoadingBox />}
                      </ListGroup.Item>
                    )}
                    {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                      <ListGroup.Item>
                        {loadingDeliver && <LoadingBox></LoadingBox>}
                        <div className="d-grid">
                          <Button type="button" onClick={deliverOrderHandler}>
                            Deliver Order
                          </Button>
                        </div>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
