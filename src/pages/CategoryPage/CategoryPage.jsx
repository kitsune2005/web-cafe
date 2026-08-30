import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCart } from "../../context/CartContext"; 
import '../ProductsPage/ProductsPage.css';

const CategoryPage = () => {
  const { slug } = useParams();
  const { products, formatPrice } = useProduct();
  const { addToCart } = useCart(); // 👉 KÉO HÀM TỪ CONTEXT

  const categoryConfig = useMemo(() => ({
    'nguyen-chat': {
      title: 'Cà phê Nguyên Chất',
      subtitle: '100% hạt cà phê mộc, không tẩm ướp, giữ trọn hương vị nguyên bản.',
      bannerImg: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1600&h=400&fit=crop',
      dbCategoryName: 'Cà phê nguyên chất'
    },
    'dong-goi': {
      title: 'Cà phê Đóng Gói',
      subtitle: 'Tiện lợi, nhanh chóng, đồng hành cùng bạn mọi lúc mọi nơi.',
      bannerImg: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=1600&h=400&fit=crop',
      dbCategoryName: 'Cà phê đóng gói'
    },
    'phin': {
      title: 'Cà phê phin',
      subtitle: 'Tuyển chọn từ những nông trại tốt nhất, hoàn hảo cho máy pha Espresso.',
      bannerImg: 'https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?w=1600&h=400&fit=crop',
      dbCategoryName: 'Cà phê phin'
    }
  }), []);

  const currentCategory = categoryConfig[slug];

  if (!currentCategory) {
    return <Navigate to="/products" replace />;
  }

  const filteredProducts = products.filter(product => product.category === currentCategory.dbCategoryName);

  // 👉 HÀM THÊM GIỎ HÀNG CÓ HIỆU ỨNG BAY MỚI NHẤT
  const handleAddFromCard = (e, item) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    const cardElement = e.currentTarget.closest('.shop-product-card');
    const imgElement = cardElement ? cardElement.querySelector('.front') : null;
    const cartIcon = document.querySelector('.cart-btn i'); 

    if (imgElement && cartIcon) {
        const imgRect = imgElement.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const flyingImg = imgElement.cloneNode(true);
        flyingImg.style.position = 'fixed';
        flyingImg.style.zIndex = '999999';
        flyingImg.style.top = `${imgRect.top}px`;
        flyingImg.style.left = `${imgRect.left}px`;
        flyingImg.style.width = `${imgRect.width}px`;
        flyingImg.style.height = `${imgRect.height}px`;
        flyingImg.style.objectFit = 'cover';
        flyingImg.style.borderRadius = '8px';
        flyingImg.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
        flyingImg.style.pointerEvents = 'none';

        document.body.appendChild(flyingImg);

        requestAnimationFrame(() => {
            flyingImg.style.top = `${cartRect.top - 15}px`;
            flyingImg.style.left = `${cartRect.left - 15}px`;
            flyingImg.style.width = '30px';
            flyingImg.style.height = '30px';
            flyingImg.style.opacity = '0.1';
            flyingImg.style.transform = 'scale(0.2)';
        });

        setTimeout(() => {
            flyingImg.remove();
            addToCart(item, 1); 
            
            cartIcon.classList.add('shake-cart-anim');
            setTimeout(() => cartIcon.classList.remove('shake-cart-anim'), 400);
        }, 800);
    } else {
        addToCart(item, 1);
    }
  };

  return (
    <div className="category-page products-page">
      
      {/* ================= BANNER ĐỘNG ================= */}
      <div 
        className="page-banner" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${currentCategory.bannerImg})`,
          padding: '120px 0 80px', 
          textAlign: 'center',
          color: '#fff',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>
            {currentCategory.title}
          </h1>
          <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: '#e0e0e0' }}>
            {currentCategory.subtitle}
          </p>
          <div className="breadcrumb" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <Link to="/products">Sản phẩm</Link>
            <span>/</span>
            <span style={{ color: '#c5a880' }}>{currentCategory.title}</span>
          </div>
        </div>
      </div>

      {/* ================= LƯỚI SẢN PHẨM ================= */}
      <div className="container section" style={{ padding: '60px 24px' }}>
        
        <div className="shop-top-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px', fontSize: '14px', color: '#888' }}>
          Hiển thị {filteredProducts.length} kết quả
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products" style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>
            <i className="fa-solid fa-mug-hot" style={{ fontSize: '40px', marginBottom: '16px', color: '#ddd' }}></i>
            <h3>Chưa có sản phẩm nào trong danh mục này</h3>
          </div>
        ) : (
          <div className="shop-products grid-3">
            {filteredProducts.map(product => (
              <article className="shop-product-card" key={product.id}>
                
                <div className="shop-product-image">
                  {product.discount > 0 && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}

                  <img
                    className="front"
                    src={product.imageFront || product.img}
                    alt={product.name}
                  />

                  <img
                    className="back"
                    src={product.imageBack || product.imageFront || product.img}
                    alt={`${product.name} mặt sau`}
                  />

                  <div className="product-hover-actions">
                    <button type="button" title="Yêu thích">
                      <i className="fa-regular fa-heart"></i>
                    </button>
                    <Link to={`/product/${product.id}`} title="Xem chi tiết">
                      <i className="fa-regular fa-eye"></i>
                    </Link>
                    {/* 👉 GẮN HÀM MỚI VÀO NÚT NÀY */}
                    <button type="button" title="Thêm vào giỏ" onClick={(e) => handleAddFromCard(e, product)}>
                      <i className="fa-solid fa-cart-shopping"></i>
                    </button>
                  </div>
                </div>

                <div className="shop-product-info">
                  <div className="shop-rating">
                    {[...Array(5)].map((_, index) => (
                      <i
                        key={index}
                        className={index < Number(product.rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
                      ></i>
                    ))}
                  </div>

                  <h3>
                    <Link to={`/product/${product.id}`} style={{color: 'inherit'}}>
                      {product.name}
                    </Link>
                  </h3>

                  <div className="shop-price">
                    {product.oldPrice && (
                      <del>{formatPrice(product.oldPrice)}</del>
                    )}
                    <span>{formatPrice(product.price)}</span>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 'bold' }}>
                    {product.stock === 0 ? (
                      <span style={{ color: '#fa5252' }}>
                        <i className="fa-solid fa-xmark"></i> Hết hàng
                      </span>
                    ) : product.stock <= 5 ? (
                      <span style={{ color: '#fd7e14' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Gần hết hàng (còn {product.stock})
                      </span>
                    ) : (
                      <span style={{ color: '#0ca678' }}>
                        <i className="fa-solid fa-check"></i> Còn hàng
                      </span>
                    )}
                  </div>

                </div>

              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;