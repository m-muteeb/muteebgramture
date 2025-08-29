import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Row, Col, Card, message, Typography, Tag } from 'antd';
import { ShoppingCartOutlined, RocketOutlined, GiftOutlined, SafetyCertificateOutlined, FireOutlined, StarOutlined, CrownOutlined } from '@ant-design/icons';
import emailjs from '@emailjs/browser';
import img11 from '../assets/images/11.jpg';
import img12 from '../assets/images/12.jpg';
import img9 from '../assets/images/9.jpg';
import imgdeparted from '../assets/images/dear departed.jpg';
import img10 from '../assets/images/10.jpg';
import imgchips from '../assets/images/mr chips.jpg';
import img22 from "../assets/images/store22.jpg";
import img23 from "../assets/images/store23.jpg";
import '../assets/css/gramturestore.css';

const { Meta } = Card;
const { Title, Text } = Typography;

// Products with tags - full names
const products = [
  { id: 1, name: 'English Book Class 11 - Complete Syllabus Guide', price: 699, description: 'Covers all Class 11 chapters with clear and easy language.', image: img11, tags: ['Bestseller', 'Free Delivery'] },
  { id: 2, name: 'English Book Class 12 - Comprehensive Edition', price: 599, description: 'Complete Class 12 guide with solved exercises and tips.', image: img12, tags: ['Free Delivery'] },
  { id: 3, name: 'English Book Class 9 - Standard Edition', price: 699, description: 'Includes textbook content with extra notes and meanings.', image: img9, tags: ['Hot Selling', 'Free Delivery'] },
  { id: 4, name: 'English Book Class 9 - Fine Finished Page Edition', price: 999, description: 'Same syllabus with premium print and smooth paper quality.', image: img9, tags: ['Premium', 'Free Delivery'] },
  { id: 5, name: 'Drama: Dear Departed - Full Play', price: 299, description: 'Complete drama with Urdu explanations and character guide.', image: imgdeparted, tags: ['Success Guarantee', 'Free Delivery'] },
  { id: 6, name: 'English Book Class 10 - Complete Syllabus Guide', price: 599, description: 'Includes lessons, poems, grammar and solved past papers.', image: img10, tags: ['Free Delivery'] },
  { id: 7, name: 'GoodBye Mr. Chips - Novel Edition', price: 499, description: 'Full novel with summaries, translations, and Q&A guide.', image: imgchips, tags: ['Success Guarantee', 'Free Delivery']  },
  { id: 8, name: 'Class 11 Grammar & Composition - Regular Edition', price: 850, description: 'All grammar topics with Urdu rules, practice and formats.', image: img22, tags: ['Success Guarantee', 'Free Delivery']  },
  { id: 9, name: 'Jugnu Smart Book English 11 - Smart Edition', price: 650, description: 'Smart choice for Smart students', image: img23, tags: ['Premium', 'Free Delivery'] }
];

// Offerings
const offerings = [
  { icon: '', title: 'Cost Effective', desc: 'Our books are easy to afford and self-explained.' },
  { icon: '', title: 'Urdu Explanation', desc: 'The explanation of contents in Urdu is the unique property of our books.' },
  { icon: '', title: 'Conceptual Approach', desc: 'We have targeted concepts in an easy to understand way.' },
];

// Features
const features = [
  { icon: <RocketOutlined />, title: 'Fast Delivery', desc: 'Get your books within 2-3 business days' },
  { icon: <GiftOutlined />, title: 'Free Shipping', desc: 'Free delivery on orders' },
  { icon: <SafetyCertificateOutlined />, title: 'Secure Payment', desc: 'Multiple secure payment options' },
];

// Headlines for moving banner
const headlines = [
  " Free Delivery on Orders!",
  " Rated 4.8/5 by 500+ Students",
  "Order before 3PM for same-day dispatch!"
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
  const [currentHeadline, setCurrentHeadline] = useState(0);

  // Rotate headlines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  // Function to render tag with appropriate color
  const renderTag = (tag) => {
    switch(tag) {
      case 'Free Delivery':
        return <Tag color="green" icon={<GiftOutlined />}>{tag}</Tag>;
      case 'Hot Selling':
        return <Tag color="red" icon={<FireOutlined />}>{tag}</Tag>;
      case 'Bestseller':
        return <Tag color="orange" icon={<StarOutlined />}>{tag}</Tag>;
      case 'Premium':
        return <Tag color="gold" icon={<CrownOutlined />}>{tag}</Tag>;
      case 'Success Guarantee':
        return <Tag color="blue" icon={<SafetyCertificateOutlined />}>{tag}</Tag>;
      default:
        return <Tag color="default">{tag}</Tag>;
    }
  };

  return (
    <div className="store-container" style={{ marginTop: '50px' }}>
      {/* Moving Headline Banner */}
      <div className="headline-banner mt-5">
        <div className="headline-container mt-2">
          <div className="headline-text mt-1" key={currentHeadline}>
            {headlines[currentHeadline]}
          </div>
        </div>
      </div>

      <div className="hero-section">
        <Title level={1} className="store-title">Welcome to Gramture Store</Title>
        <Text className="hero-subtitle">Quality Educational Books with Urdu Explanations</Text>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <Row gutter={[24, 24]} justify="center">
          {features.map((feature, idx) => (
            <Col xs={24} sm={8} key={idx}>
              <div className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      <div className="main-content-wrapper">
        <div className="products-section">
          <Title level={2} className="section-heading text-center">Our Products</Title>
          <Row gutter={[24, 24]} justify="start">
            {products.map((product) => (
              <Col xs={24} sm={12} md={8} lg={8} key={product.id}>
                <Card
                  hoverable
                  className="product-card"
                  cover={
                    <div className="product-image-container">
                      <img alt={product.name} src={product.image} className="product-image" />
                      <div className="product-tags">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="product-tag">
                            {renderTag(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                  actions={[
                    <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => handleBuyNow(product)}>
                      Buy Now
                    </Button>
                  ]}
                >
                  <Meta
                    title={<h3 className="product-title">{product.name}</h3>}
                    description={<p className="product-desc">{product.description}</p>}
                  />
                  <p className="price">Rs. {product.price}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Side Panel for larger screens */}
        <div className="side-panel">
          <div className="side-panel-content">
            <Title level={3}>What Makes Our Books Special</Title>
            <div className="offerings-container">
              {offerings.map((offer, idx) => (
                <div className="offering-card" key={idx}>
                  <div className="icon-circle">{offer.icon}</div>
                  <h4>{offer.title}</h4>
                  <p>{offer.desc}</p>
                </div>
              ))}
            </div>

            <div className="testimonials-side">
              <Title level={4}>What Students Say</Title>
              <div className="testimonial-side-card">
                <div className="testimonial-text">
                  "These books helped me score 95% in my English exams! The Urdu explanations made difficult concepts easy to understand."
                </div>
                <div className="testimonial-author">- Ayesha, Lahore</div>
              </div>
              <div className="testimonial-side-card">
                <div className="testimonial-text">
                  "The quality of books is excellent and delivery was super fast. Will definitely order again."
                </div>
                <div className="testimonial-author">- Ali, Karachi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section for mobile */}
      <section className="testimonials-section-mobile">
        <Title level={2} className="section-heading text-center">What Students Say</Title>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "These books helped me score 95% in my English exams! The Urdu explanations made difficult concepts easy to understand."
              </div>
              <div className="testimonial-author">- Ayesha, Lahore</div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "The quality of books is excellent and delivery was super fast. Will definitely order again for my younger brother."
              </div>
              <div className="testimonial-author">- Ali, Karachi</div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="testimonial-card">
              <div className="testimonial-text">
                "Finally found books that explain grammar rules in Urdu. This is exactly what Pakistani students need!"
              </div>
              <div className="testimonial-author">- Usman, Islamabad</div>
            </div>
          </Col>
        </Row>
      </section>

      <Modal
        title="Complete Your Order"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        className="order-modal"
      >
        {selectedProduct && (
          <>
            <div className="modal-product-info">
              <p><strong>Product:</strong> {selectedProduct.name}</p>
              <p><strong>Price:</strong> Rs. {selectedProduct.price}</p>
            </div>

            <div className="form-container">
              <Input name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="form-input" />
              <Input name="email" type="email" placeholder="Your Email" value={formData.email} onChange={handleChange} className="form-input" />
              <Input name="phone" type="tel" placeholder="Your Phone Number" value={formData.phone} onChange={handleChange} className="form-input" />
              <Input.TextArea name="address" placeholder="Delivery Address" value={formData.address} onChange={handleChange} rows={3} className="form-input" />
            </div>

            {!orderConfirmed ? (
              <Button type="primary" onClick={handleOrder} block className="confirm-order-btn" loading={loading}>
                Confirm Order
              </Button>
            ) : (
              <div className="confirmation">
                <div className="success-animation">✓</div>
                <p className="success-message">Order Booked! You will receive it soon.</p>
                <div className="payment-info">
                  <p><strong>Payment Options:</strong></p>
                  <p>📱 JazzCash: <strong>+923036660025</strong></p>
                  <p>🚚 Cash on Delivery available</p>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default GramtureStore;