import React, { useState } from 'react';
import { Modal, Button, Input, Row, Col, Card, message } from 'antd';
import emailjs from '@emailjs/browser';
import img11 from '../assets/images/11.jpg';
import img12 from '../assets/images/12.jpg';
import img9 from '../assets/images/9.jpg';
import imgdeparted from '../assets/images/dear departed.jpg';
import img10 from '../assets/images/10.jpg';
import imgchips from '../assets/images/mr chips.jpg';
import '../assets/css/gramturestore.css';

const { Meta } = Card;

// Products
const products = [
  { id: 1, name: 'English Book Class 11 - Complete Syllabus Guide', price: 699, description: 'Covers all Class 11 chapters with clear and easy language.', image: img11 },
  { id: 2, name: 'English Book Class 12 - Comprehensive Edition', price: 599, description: 'Complete Class 12 guide with solved exercises and tips.', image: img12 },
  { id: 3, name: 'English Book Class 9 - Standard Edition', price: 699, description: 'Includes textbook content with extra notes and meanings.', image: img9 },
  { id: 4, name: 'English Book Class 9 - Fine Finished Page Edition', price: 999, description: 'Same syllabus with premium print and smooth paper quality.', image: img9 },
  { id: 5, name: 'Drama: Dear Departed - Full Play', price: 299, description: 'Complete drama with Urdu explanations and character guide.', image: imgdeparted },
  { id: 6, name: 'English Book Class 10 - Complete Syllabus Guide', price: 599, description: 'Includes lessons, poems, grammar and solved past papers.', image: img10 },
  { id: 7, name: 'GoodBye Mr. Chips - Novel Edition', price: 499, description: 'Full novel with summaries, translations, and Q&A guide.', image: imgchips },
  { id: 8, name: 'Grammar & Composition - Regular Edition', price: 999, description: 'All grammar topics with Urdu rules, practice and formats.', image: 'https://via.placeholder.com/200' },
  { id: 9, name: 'Grammar & Composition - Fine Finished Page Edition', price: 1599, description: 'Same content as regular with fine glossy print and binding.', image: 'https://via.placeholder.com/200' }
];

// Offerings
const offerings = [
  { icon: '💰', title: 'Cost Effective', desc: 'Our books are easy to afford and self-explained.' },
  { icon: '📘', title: 'Urdu Explanation', desc: 'The explanation of contents in Urdu is the unique property of our books.' },
  { icon: '📚', title: 'Conceptual Approach', desc: 'We have targeted concepts in an easy to understand way.' },
];

// Replace with your actual EmailJS values
const SERVICE_ID = 'service_njg2ewf';
const TEMPLATE_ID_ADMIN = 'template_7cevk2n';
const TEMPLATE_ID_CUSTOMER = 'template_dtpepqo';
const PUBLIC_KEY = '7ccJc1R9BkPNUUzHn';

const GramtureStore = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
    setOrderConfirmed(false);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrder = () => {
    const { name, email, phone, address } = formData;

    if (name && email && phone && address && selectedProduct) {
      setLoading(true);

      const commonParams = {
        name,
        email,
        phone,
        address,
        product_name: selectedProduct.name,
        price: selectedProduct.price,
        message: 'Customer placed an order for ' + selectedProduct.name,
        time: new Date().toLocaleString(),
      };

      // Send to Admin
      emailjs.send(SERVICE_ID, TEMPLATE_ID_ADMIN, commonParams, PUBLIC_KEY)
        .then(() => {
          // Send confirmation to Customer
          emailjs.send(SERVICE_ID, TEMPLATE_ID_CUSTOMER, commonParams, PUBLIC_KEY)
            .then(() => {
              setOrderConfirmed(true);
              message.success('Order confirmed and email sent!');
              setLoading(false);
            })
            .catch((error) => {
              console.error('Customer email failed:', error);
              message.error('Error sending confirmation to customer.');
              setLoading(false);
            });
        })
        .catch((error) => {
          console.error('Admin email failed:', error);
          message.error('Failed to place order. Please try again.');
          setLoading(false);
        });
    } else {
      message.error('Please fill in all fields.');
    }
  };

  return (
    <div className="store-container">
      <h1 className="store-title">Welcome to Gramture Store</h1>

      <section className="offerings-section" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 className="section-heading text-center">What We Offer</h2>
        <div className="offerings-container">
          {offerings.map((offer, idx) => (
            <div className="offering-card" key={idx}>
              <div className="icon-circle">{offer.icon}</div>
              <h3>{offer.title}</h3>
              <p>{offer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Row gutter={[24, 24]} justify="start">
        {products.map((product) => (
          <Col xs={24} sm={12} md={8} key={product.id}>
            <Card
              hoverable
              className="product-card"
              cover={<img alt={product.name} src={product.image} className="product-image" />}
            >
              <Meta
                title={<h3 style={{ fontSize: '1rem' }}>{product.name}</h3>}
                description={<p>{product.description}</p>}
              />
              <p className="price">Rs. {product.price}</p>
              <Button type="primary" block className="btn-buy" onClick={() => handleBuyNow(product)}>
                Buy Now
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="Complete Your Order"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
      >
        {selectedProduct && (
          <>
            <p><strong>Product:</strong> {selectedProduct.name}</p>
            <p><strong>Price:</strong> Rs. {selectedProduct.price}</p>

            <Input name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} />
            <Input name="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} style={{ marginTop: 10 }} />
            <Input name="phone" type="tel" placeholder="Your Phone Number" value={formData.phone} onChange={handleChange} style={{ marginTop: 10 }} />
            <Input.TextArea name="address" placeholder="Delivery Address" value={formData.address} onChange={handleChange} rows={3} style={{ marginTop: 10 }} />

            {!orderConfirmed ? (
              <Button type="primary" onClick={handleOrder} block style={{ marginTop: 20 }} loading={loading}>
                Confirm Order
              </Button>
            ) : (
              <div className="confirmation">
                <p>✅ Order Booked! You will receive it soon.</p>
                <p>💰 Payment Options:</p>
                <p>📱 JazzCash: <strong>+923036660025</strong></p>
                <p>🚚 Cash on Delivery available</p>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default GramtureStore;
