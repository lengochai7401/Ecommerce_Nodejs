import bcrypt from 'bcrypt';

function calculateExpiryDate(days, hours, minutes) {
  // Get the current date and time
  const now = new Date();

  // Calculate the expiry duration in milliseconds
  const expiryDurationInSeconds =
    days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60;

  // Calculate the expiry date in seconds
  const expiryInSeconds = Math.floor(
    now.getTime() / 1000 + expiryDurationInSeconds
  );

  return expiryInSeconds;
}

const data = {
  users: [
    {
      name: 'Hai',
      email: 'lengochai.07042001@gmail.com',
      password: bcrypt.hashSync('0985685612hai', 10),
      isAdmin: true,
    },
    {
      name: 'John',
      email: 'john@gmail.com',
      password: bcrypt.hashSync('123456', 10),
    },
  ],
  products: [
    {
      name: 'Nike shirt',
      slug: 'Nike-shirt',
      category: 'shirts',
      image: '/images/p1.jpg',
      price: 120,
      countInStock: 10,
      brand: 'Nike',
      rating: 4.5,
      numReviews: 10,
      description: 'high quality shirt',
      sold: 10,
      discount: 10,
      expiryDiscount: calculateExpiryDate(1, 2, 3),
    },
    {
      name: 'Adidas shirt',
      slug: 'Adidas-shirt',
      category: 'shirts',
      image: '/images/p2.jpg',
      price: 150,
      countInStock: 10,
      brand: 'Adidas',
      rating: 4.3,
      numReviews: 10,
      description: 'high quality shirt',
      sold: 20,
      discount: 5,
      expiryDiscount: calculateExpiryDate(2, 2, 3),
    },
    {
      name: 'Nike Pant',
      slug: 'Nike-Pant',
      category: 'pants',
      image: '/images/p3.jpg',
      price: 200,
      countInStock: 10,
      brand: 'Nike',
      rating: 4,
      numReviews: 10,
      description: 'high quality pant',
      sold: 0,
      discount: 20,
      expiryDiscount: calculateExpiryDate(0, 0, 1),
    },
    {
      name: 'Adidas Pant',
      slug: 'Adidas-Pant',
      category: 'pants',
      image: '/images/p4.jpg',
      price: 190,
      countInStock: 0,
      brand: 'Nike',
      rating: 4.4,
      numReviews: 10,
      description: 'high quality pant',
      sold: 30,
      discount: 0,
      expiryDiscount: 0,
    },
  ],
};

export default data;
