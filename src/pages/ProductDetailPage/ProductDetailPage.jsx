import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext'; // 👉 KẾT NỐI BỘ NÃO GIỎ HÀNG
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { products, formatPrice } = useProduct();
    const { addToCart } = useCart(); // 👉 RÚT HÀM THÊM VÀO GIỎ HÀNG RA SỬ DỤNG
    
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const trackRef = useRef(null);

    // 1. TẠO SỐ "ĐÃ BÁN" CỐ ĐỊNH THEO ID
    const soldCount = useMemo(() => {
        if (!product) return 0;
        return (product.id * 37 % 87) + 12; 
    }, [product?.id]);

    // 2. THUẬT TOÁN CAROUSEL RANDOM (CỐ ĐỊNH KHÔNG BỊ NHẢY)
    const relatedProducts = useMemo(() => {
        if (!products || !product) return [];
        
        // Bước 1: Lọc sản phẩm cùng danh mục, trừ đi cái đang xem
        const sameCategory = products.filter(p => p.category === product.category && p.id !== product.id);
        
        // Bước 2: Nếu danh mục này nghèo nàn quá (ít hơn 4 món), thì bốc đại random từ toàn bộ kho
        const sourcePool = sameCategory.length >= 4 ? sameCategory : products.filter(p => p.id !== product.id);
        
        // Bước 3: Xáo bài ngẫu nhiên và lấy 8 món
        return [...sourcePool].sort(() => 0.5 - Math.random()).slice(0, 8);
    }, [products, product?.id]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (products && products.length > 0) {
            const foundProduct = products.find(p => p.id === parseInt(id));
            if (foundProduct) {
                setProduct(foundProduct);
                setMainImage(foundProduct.imageFront || foundProduct.img);
                setQuantity(1);
                setActiveTab('description');
            }
        }
    }, [id, products]);

    if (!product) {
        return <div className="loading-detail">Đang tải dữ liệu sản phẩm...</div>;
    }

    const defaultShortDesc = "Là sự kết hợp tinh tế giữa hương vị đặc trưng của cà phê nguyên chất và một chút huyền bí, tạo nên một trải nghiệm cà phê độc đáo và say đắm. Hạt cà phê được lựa chọn cẩn thận từ những vùng trồng cà phê nổi tiếng, được rang một cách tỉ mỉ và chuyên nghiệp để giữ nguyên hương vị tự nhiên và đậm đà.";
    const defaultLongDesc = `<p>Đặc biệt, "Cà phê Ngôn" mang đến một hương thơm quyến rũ, mềm mại và ngọt ngào, như một giấc mơ dịu dàng tựa như làn sương mai lướt qua những cánh đồng cà phê xanh ngát. Khi thưởng thức, bạn sẽ cảm nhận được vị đắng thanh của cà phê hòa quyện với vị ngọt tự nhiên, tạo nên một cảm giác hài hòa và bền vững trên đầu lưỡi.</p><br/><p>"Cà phê Ngôn" không chỉ là một thức uống bình thường mà còn là một trải nghiệm tinh thần, giúp bạn thư giãn sau những giờ làm việc căng thẳng, hoặc đơn giản là để tận hưởng những khoảnh khắc riêng tư và yên bình. Hãy để "Cà phê Ngôn" làm cho mỗi ngày của bạn trở nên đặc biệt hơn, mỗi giọt cà phê là một chuyến phiêu lưu mới đầy mơ mộng và đầy hứng khởi.</p><br/><p>Hãy để "Cà phê Ngôn" là người bạn đồng hành tin cậy, luôn sẵn sàng chia sẻ với bạn những khoảnh khắc đẹp nhất và những cảm xúc tinh tế nhất trong cuộc sống hàng ngày. Mỗi giọt cà phê Dreamy là một chuyến phiêu lưu tinh thần, một cơ hội để tận hưởng hương vị và tận hưởng cuộc sống một cách trọn vẹn và sâu sắc.</p>`;

    const gallery = [product.imageFront, product.imageBack].filter(Boolean);

    // Hàm điều khiển trượt Carousel
    const scrollNext = () => {
        if (trackRef.current) trackRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    };
    const scrollPrev = () => {
        if (trackRef.current) trackRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    };

    // 👉 THAY THẾ TOÀN BỘ HÀM handleAddToCart CŨ BẰNG HÀM CÓ HIỆU ỨNG NÀY:
    const handleAddToCart = () => {
        // 1. Tìm vị trí của ảnh sản phẩm và cái túi Giỏ hàng trên Header
        const imgElement = document.querySelector('.main-image-wrap img');
        const cartIcon = document.querySelector('.cart-btn i'); 

        if (imgElement && cartIcon) {
            const imgRect = imgElement.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();

            // 2. Tạo một ảnh ảo nhân bản để bay lên trời
            const flyingImg = imgElement.cloneNode(true);
            flyingImg.style.position = 'fixed';
            flyingImg.style.zIndex = '999999';
            flyingImg.style.top = `${imgRect.top}px`;
            flyingImg.style.left = `${imgRect.left}px`;
            flyingImg.style.width = `${imgRect.width}px`;
            flyingImg.style.height = `${imgRect.height}px`;
            flyingImg.style.objectFit = 'cover';
            flyingImg.style.borderRadius = '50%';
            flyingImg.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            flyingImg.style.pointerEvents = 'none';

            document.body.appendChild(flyingImg);

            // 3. Cho ảnh bay về phía cái túi trên Header
            requestAnimationFrame(() => {
                flyingImg.style.top = `${cartRect.top - 15}px`;
                flyingImg.style.left = `${cartRect.left - 15}px`;
                flyingImg.style.width = '30px';
                flyingImg.style.height = '30px';
                flyingImg.style.opacity = '0.1';
                flyingImg.style.transform = 'scale(0.2)';
            });

            // 4. Đợi ảnh bay tới nơi thì xóa ảnh đi, rung cái túi và lưu dữ liệu
            setTimeout(() => {
                flyingImg.remove();
                addToCart(product, quantity); // Lưu vào Context + Gọi Toast xanh xanh
                
                // Hiệu ứng giỏ hàng rung lắc (Đã khai báo CSS bên kia)
                cartIcon.classList.add('shake-cart-anim');
                setTimeout(() => cartIcon.classList.remove('shake-cart-anim'), 400);
            }, 800);
            
        } else {
            // Đề phòng lỗi trình duyệt, lưu thẳng vào giỏ không cần bay
            addToCart(product, quantity);
        }
    };

    return (
        <div className="product-detail-page">
            {/* 1. BREADCRUMB */}
            <div className="detail-breadcrumb">
                <div className="container">
                    <h1>Sản phẩm</h1>
                    <div className="bread-links">
                        <Link to="/">TRANG CHỦ</Link> <span>&gt;</span>
                        <Link to={`/category/${product.category.toLowerCase().replace(/ /g, '-')}`}>
                            {product.category.toUpperCase()}
                        </Link> <span>&gt;</span>
                        <strong>{product.name.toUpperCase()}</strong>
                    </div>
                </div>
            </div>

            <div className="container detail-content-wrapper">
                {/* 2. MAIN INFO */}
                <div className="detail-main">
                    <div className="detail-gallery">
                        <div 
                            className="main-image-wrap" 
                            onClick={() => setIsImageModalOpen(true)}
                            style={{ cursor: 'zoom-in' }}
                            title="Nhấn để phóng to"
                        >
                            <img src={mainImage} alt={product.name} />
                        </div>
                        <div className="thumbnail-list">
                            {gallery.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className={`thumb-item ${mainImage === img ? 'active' : ''}`}
                                    onClick={() => setMainImage(img)}
                                >
                                    <img src={img} alt={`Thumb ${idx}`} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="detail-info">
                        <h2 className="product-title">{product.name}</h2>
                        
                        <div className="short-desc">
                            {product.shortDesc ? (
                                 <div dangerouslySetInnerHTML={{ __html: product.shortDesc }} />
                            ) : (
                                <p>{defaultShortDesc}</p>
                            )}
                        </div>
                        
                        <div className="product-price-large">
                            {formatPrice ? formatPrice(product.price) : `${product.price.toLocaleString('vi-VN')}₫`}
                        </div>

                        <div className="action-buttons">
                            <button className="icon-action" aria-label="Yêu thích"><i className="fa-regular fa-heart"></i></button>
                            <button className="icon-action" aria-label="Chia sẻ"><i className="fa-solid fa-share-nodes"></i></button>
                        </div>

                        <div className="add-to-cart-area">
                            <div className="quantity-selector">
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1 || product.stock === 0}
                                >-</button>
                                
                                <input type="number" value={quantity} readOnly />
                                
                                <button 
                                    onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)}
                                    disabled={quantity >= product.stock || product.stock === 0}
                                >+</button>
                            </div>
                            <button 
                                className="btn-add-cart" 
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                style={{ opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                {product.stock === 0 ? 'HẾT HÀNG' : 'Thêm Vào Giỏ Hàng'}
                            </button>
                        </div>

                        <div className="trust-badges">
                            <div className="badge-item">
                                <i className="fa-regular fa-credit-card"></i>
                                <span>THANH TOÁN AN TOÀN</span>
                            </div>
                            <div className="badge-item">
                                <i className="fa-solid fa-ticket"></i>
                                <span>ƯU ĐÃI GIỚI HẠN</span>
                            </div>
                            <div className="badge-item">
                                <i className="fa-solid fa-box-open"></i>
                                <span>HOÀN TRẢ NHANH CHÓNG</span>
                            </div>
                        </div>

                        <div className="product-meta">
                            <p>Đã bán: <strong>{soldCount}</strong> <span className="divider">|</span> Còn hàng: <strong>{product.stock}</strong></p>
                            <div className="meta-grid">
                                <div><span className="meta-label">Sku:</span> TOY05432-2-1-2-1-1-2-{product.id}</div>
                                <div><span className="meta-label">Danh mục:</span> {product.category}</div>
                                <div><span className="meta-label">Từ khóa:</span> Cà phê ngon, Cà phê sạch</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. TABS MÔ TẢ & ĐÁNH GIÁ */}
                <div className="detail-tabs">
                    <div className="tab-headers">
                        <button 
                            className={activeTab === 'description' ? 'active' : ''} 
                            onClick={() => setActiveTab('description')}
                        >
                            MÔ TẢ
                        </button>
                        <button 
                            className={activeTab === 'reviews' ? 'active' : ''} 
                            onClick={() => setActiveTab('reviews')}
                        >
                            ĐÁNH GIÁ (0)
                        </button>
                    </div>
                    <div className="tab-content">
                        {activeTab === 'description' ? (
                            <div 
                                className="desc-content" 
                                dangerouslySetInnerHTML={{ __html: product.longDesc || defaultLongDesc }}
                            ></div>
                        ) : (
                            <div className="review-content">
                                <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. ĐỀ XUẤT SẢN PHẨM RANDOM CAROUSEL */}
                {relatedProducts.length > 0 && (
                    <div className="related-products">
                        <div className="related-header">
                            <h3>SẢN PHẨM LIÊN QUAN</h3>
                            <div className="related-nav">
                                <button onClick={scrollPrev}><i className="fa-solid fa-arrow-left"></i></button>
                                <button onClick={scrollNext}><i className="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </div>
                        
                        <div className="related-carousel" ref={trackRef}>
                            {relatedProducts.map(item => (
                                <Link to={`/product/${item.id}`} key={item.id} className="related-card">
                                    <div className="related-img">
                                        <img src={item.imageFront || item.img} alt={item.name} />
                                        <div className="related-hover">
                                            <button className="icon-btn" aria-label="Xem"><i className="fa-regular fa-eye"></i></button>
                                            <button className="icon-btn" aria-label="Mua"><i className="fa-solid fa-cart-shopping"></i></button>
                                        </div>
                                    </div>
                                    <div className="related-info">
                                        {/* Hàng ngôi sao */}
                                        <div className="rating">
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#eae5df'}}></i>
                                        </div>
                                        <h4>{item.name}</h4>
                                        <p className="price">{formatPrice ? formatPrice(item.price) : `${item.price.toLocaleString('vi-VN')}₫`}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* POPUP PHÓNG TO ẢNH */}
            {isImageModalOpen && (
                <div className="image-zoom-overlay" onClick={() => setIsImageModalOpen(false)}>
                    <button className="image-zoom-close" onClick={() => setIsImageModalOpen(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <div className="image-zoom-content" onClick={(e) => e.stopPropagation()}>
                        <img src={mainImage} alt={product.name} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;