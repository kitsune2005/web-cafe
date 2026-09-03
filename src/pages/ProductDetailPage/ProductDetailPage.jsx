import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext'; 
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

import iconPayment from '../../assets/icon/icon-payment.svg';
import iconOffer from '../../assets/icon/icon-offer.svg';
import iconReturn from '../../assets/icon/icon-return.svg';

export const generateSlug = (str) => {
    if (!str) return '';
    return str.toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-z0-9\s-]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const getYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
        return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const { products, formatPrice } = useProduct();
    const { addToCart } = useCart(); 
    
    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false); 
    
    const [mainImage, setMainImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    
    const trackRef = useRef(null);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    const stopContinuousAction = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const startDecrease = () => {
        const currentStock = product?.stock || 0;
        if (currentStock <= 0) return;
        setQuantity(q => Math.max(1, q - 1));
        
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setQuantity(q => {
                    if (q <= 2) {
                        clearInterval(intervalRef.current);
                        return 1;
                    }
                    return q - 1;
                });
            }, 80); 
        }, 400); 
    };

    const startIncrease = () => {
        const currentStock = product?.stock || 0;
        if (currentStock <= 0) return;
        setQuantity(q => (q < currentStock ? q + 1 : q));
        
        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setQuantity(q => {
                    if (q >= currentStock - 1) {
                        clearInterval(intervalRef.current);
                        return currentStock;
                    }
                    return q + 1;
                });
            }, 80);
        }, 400);
    };

    const relatedProducts = useMemo(() => {
        if (!products || !product) return [];
        const availableProducts = products.filter(p => (p?.stock || 0) > 0);
        const sameCategory = availableProducts.filter(p => p?.category === product?.category && p?.id !== product?.id);
        const sourcePool = sameCategory.length >= 4 ? sameCategory : availableProducts.filter(p => p?.id !== product?.id);
        
        return [...sourcePool].sort(() => 0.5 - Math.random()).slice(0, 8);
    }, [products, product]);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        if (products && products.length > 0) {
            const foundProduct = products.find(p => 
                String(p.id) === String(id) || 
                generateSlug(p.name) === String(id)
            );
            
            if (foundProduct) {
                setProduct(foundProduct);
                setMainImage(foundProduct?.imageFront || foundProduct?.img || 'https://via.placeholder.com/400x400?text=No+Image');
                setQuantity((foundProduct?.stock || 0) > 0 ? 1 : 0);
                setActiveTab('description');
                setNotFound(false);

                const productSlug = generateSlug(foundProduct.name);
                if (String(id) !== productSlug) {
                    window.history.replaceState(null, '', `/product/${productSlug}`);
                }
            } else {
                setNotFound(true); 
            }
        }
    }, [id, products]);

    useEffect(() => {
        return () => stopContinuousAction();
    }, []);

    const parsedStory = useMemo(() => {
        if (!product?.longDesc) return { gallery: [], blocks: [] };
        
        try {
            if (typeof product.longDesc === 'object') {
                return {
                    gallery: Array.isArray(product.longDesc.gallery) ? product.longDesc.gallery : [],
                    blocks: Array.isArray(product.longDesc.blocks) ? product.longDesc.blocks : []
                };
            }
            
            if (typeof product.longDesc === 'string') {
                if (product.longDesc.startsWith('{')) {
                    const parsed = JSON.parse(product.longDesc);
                    return {
                        gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
                        blocks: Array.isArray(parsed.blocks) ? parsed.blocks : []
                    };
                }
                return { gallery: [], blocks: [{ id: 'legacy', type: 'text', content: product.longDesc }] };
            }
        } catch (e) {
            return { gallery: [], blocks: [{ id: 'legacy', type: 'text', content: String(product.longDesc || '') }] };
        }
        
        return { gallery: [], blocks: [] };
    }, [product?.longDesc]);

    if (notFound) {
        return (
            <div className="product-detail-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#6f4323' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '50px', marginBottom: '20px' }}></i>
                    <h2>Sản phẩm không tồn tại hoặc đã bị xóa!</h2>
                    <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 25px', background: '#6f4323', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                        Quay về Trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return <div className="loading-detail" style={{ textAlign: 'center', padding: '100px', color: '#6f4323', fontWeight: 'bold' }}>
            <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu sản phẩm...
        </div>;
    }

    const safeCategory = product?.category || 'Sản phẩm';
    const safeName = product?.name || 'Đang cập nhật';
    const safeStock = product?.stock || 0;
    const safePrice = product?.price || 0;

    const defaultShortDesc = "Là sự kết hợp tinh tế giữa hương vị đặc trưng của cà phê nguyên chất và một chút huyền bí, tạo nên một trải nghiệm cà phê độc đáo và say đắm. Hạt cà phê được lựa chọn cẩn thận từ những vùng trồng cà phê nổi tiếng, được rang một cách tỉ mỉ và chuyên nghiệp để giữ nguyên hương vị tự nhiên và đậm đà.";

    const baseGallery = [product?.imageFront, product?.imageBack].filter(Boolean);
    const fullGallery = [...baseGallery, ...parsedStory.gallery];

    const scrollNext = () => { if (trackRef.current) trackRef.current.scrollBy({ left: 300, behavior: 'smooth' }); };
    const scrollPrev = () => { if (trackRef.current) trackRef.current.scrollBy({ left: -300, behavior: 'smooth' }); };

    const handleAddToCart = () => {
        if (safeStock <= 0) {
            toast.error("Sản phẩm này đã hết hàng rồi Boss ơi!");
            return;
        }

        const imgElement = document.querySelector('.main-image-wrap img');
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
            flyingImg.style.borderRadius = '50%';
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
                addToCart(product, quantity); 
                
                cartIcon.classList.add('shake-cart-anim');
                setTimeout(() => cartIcon.classList.remove('shake-cart-anim'), 400);
            }, 800);
            
        } else {
            addToCart(product, quantity);
        }
    };

    return (
        <div className="product-detail-page">
            <div className="detail-breadcrumb">
                <div className="container">
                    <h1>Sản phẩm</h1>
                    <div className="bread-links">
                        <Link to="/">TRANG CHỦ</Link> <span>&gt;</span>
                        <Link to={`/category/${generateSlug(safeCategory)}`}>
                            {safeCategory.toUpperCase()}
                        </Link> <span>&gt;</span>
                        <strong>{safeName.toUpperCase()}</strong>
                    </div>
                </div>
            </div>

            <div className="container detail-content-wrapper">
                <div className="detail-main">
                    <div className="detail-gallery">
                        <div 
                            className="main-image-wrap" 
                            onClick={() => setIsImageModalOpen(true)}
                            style={{ cursor: 'zoom-in' }}
                            title="Nhấn để phóng to"
                        >
                            <img src={mainImage} alt={safeName} />
                        </div>
                        <div className="thumbnail-list">
                            {fullGallery.map((img, idx) => (
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
                        <h2 className="product-title">{safeName}</h2>
                        
                        <div className="short-desc">
                            {product?.shortDesc ? (
                                 <div dangerouslySetInnerHTML={{ __html: String(product.shortDesc).replace(/\n/g, '<br/>') }} />
                            ) : (
                                <p>{defaultShortDesc}</p>
                            )}
                        </div>
                        
                        <div className="product-price-large">
                            {formatPrice ? formatPrice(safePrice) : `${safePrice.toLocaleString('vi-VN')}₫`}
                        </div>

                        <div className="action-buttons">
                            <button className="icon-action" aria-label="Yêu thích"><i className="fa-regular fa-heart"></i></button>
                            <button className="icon-action" aria-label="Chia sẻ"><i className="fa-solid fa-share-nodes"></i></button>
                        </div>

                        <div className="add-to-cart-area">
                            <div className="quantity-selector">
                                <button 
                                    onPointerDown={startDecrease}
                                    onPointerUp={stopContinuousAction}
                                    onPointerLeave={stopContinuousAction}
                                    onContextMenu={(e) => e.preventDefault()}
                                    disabled={quantity <= 1 || safeStock <= 0}
                                    style={{ userSelect: 'none', touchAction: 'none' }}
                                >-</button>
                                
                                <input 
                                    type="number" 
                                    value={quantity} 
                                    readOnly 
                                    style={{ textAlign: 'center', fontWeight: 'bold' }} 
                                />
                                
                                <button 
                                    onPointerDown={startIncrease}
                                    onPointerUp={stopContinuousAction}
                                    onPointerLeave={stopContinuousAction}
                                    onContextMenu={(e) => e.preventDefault()}
                                    disabled={quantity >= safeStock || safeStock <= 0}
                                    style={{ userSelect: 'none', touchAction: 'none' }}
                                >+</button>
                            </div>

                            <button 
                                className="btn-add-cart" 
                                onClick={handleAddToCart}
                                disabled={safeStock <= 0}
                                style={{ opacity: safeStock <= 0 ? 0.5 : 1, cursor: safeStock <= 0 ? 'not-allowed' : 'pointer' }}
                            >
                                {safeStock <= 0 ? 'HẾT HÀNG' : 'Thêm Vào Giỏ Hàng'}
                            </button>
                        </div>

                        <div className="trust-badges" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', padding: '15px 0', margin: '20px 0', textAlign: 'center' }}>
                            <div className="badge-item" style={{ flex: 1 }}>
                                <img src={iconPayment} alt="Thanh toán an toàn" style={{ width: '36px', height: '36px', marginBottom: '8px', display: 'inline-block' }} />
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', display: 'block' }}>THANH TOÁN AN TOÀN</span>
                            </div>
                            <div className="badge-item" style={{ flex: 1 }}>
                                <img src={iconOffer} alt="Ưu đãi giới hạn" style={{ width: '36px', height: '36px', marginBottom: '8px', display: 'inline-block' }} />
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', display: 'block' }}>ƯU ĐÃI GIỚI HẠN</span>
                            </div>
                            <div className="badge-item" style={{ flex: 1 }}>
                                <img src={iconReturn} alt="Hoàn trả nhanh chóng" style={{ width: '36px', height: '36px', marginBottom: '8px', display: 'inline-block' }} />
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', display: 'block' }}>HOÀN TRẢ NHANH CHÓNG</span>
                            </div>
                        </div>

                        <div className="product-meta">
                            <p>
                                Đã bán: <strong>{product?.sold || 0}</strong> 
                                <span className="divider" style={{ margin: '0 8px', color: '#ddd' }}>|</span> 
                                Còn hàng: <strong style={{ color: safeStock > 0 ? '#0ca678' : '#fa5252' }}>{safeStock}</strong>
                            </p>
                            <div className="meta-grid">
                                <div><span className="meta-label">Sku:</span> TOY05432-2-1-2-1-1-2-{product?.id || 'XXX'}</div>
                                <div><span className="meta-label">Danh mục:</span> {safeCategory}</div>
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
                            <div className="desc-content">
                                {parsedStory.blocks.length > 0 ? (
                                    parsedStory.blocks.map((block, index) => {
                                        const blockKey = block.id || `block-${index}`;
                                        
                                        if (block.type === 'text') {
                                            // 👉 LỚP GIÁP BẢO VỆ: Nếu content không phải chữ, biến nó thành rỗng để không bị sập hàm replace()
                                            const safeContent = typeof block.content === 'string' ? block.content : String(block.content || '');
                                            return <div key={blockKey} className="story-block-text" dangerouslySetInnerHTML={{ __html: safeContent.replace(/\n/g, '<br/>') }} />;
                                        }
                                        if (block.type === 'image') {
                                            return <div key={blockKey} className="story-block-img"><img src={block.content} alt="Story content" /></div>;
                                        }
                                        if (block.type === 'video') {
                                            const embedUrl = getYouTubeEmbedUrl(block.content);
                                            if (!embedUrl) return null;
                                            return (
                                                <div key={blockKey} className="story-block-video">
                                                    <iframe src={embedUrl} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })
                                ) : (
                                    <p>Chưa có nội dung mô tả chi tiết.</p>
                                )}
                            </div>
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
                                <Link to={`/product/${generateSlug(item?.name)}`} key={item.id} className="related-card">
                                    <div className="related-img">
                                        <img src={item?.imageFront || item?.img} alt={item?.name} />
                                        <div className="related-hover">
                                            <button className="icon-btn" aria-label="Xem" onClick={(e) => e.preventDefault()}><i className="fa-regular fa-eye"></i></button>
                                            <button className="icon-btn" aria-label="Mua" onClick={(e) => e.preventDefault()}><i className="fa-solid fa-cart-shopping"></i></button>
                                        </div>
                                    </div>
                                    <div className="related-info">
                                        <div className="rating">
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#f2b200'}}></i>
                                            <i className="fa-solid fa-star" style={{color: '#eae5df'}}></i>
                                        </div>
                                        <h4>{item?.name || 'Đang cập nhật'}</h4>
                                        <p className="price">{formatPrice ? formatPrice(item?.price || 0) : `${(item?.price || 0).toLocaleString('vi-VN')}₫`}</p>
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
                        <img src={mainImage} alt={safeName} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;