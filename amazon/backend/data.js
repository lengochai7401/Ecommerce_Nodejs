import bcrypt from 'bcrypt';

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
    },
  ],
};

export default data;
