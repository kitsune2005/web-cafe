import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import localData from '../../../data/data.json';
import './Journey.css';

const Journey = ({ steps: propSteps }) => {
  const trackRef = useRef(null);
  const [steps, setSteps] = useState([]);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const loadFallbackData = () => {
      const fallback = propSteps || localData.journeySteps || localData.journey || [
        {
          id: 1,
          title: "Trồng Và Thu Hoạch",
          description: "Quy trình bắt đầu với việc chọn lựa những quả cà phê chín màu đỏ đậm, sau đó tiến hành thu hoạch cẩn thận để đảm bảo chất lượng cao.",
          image: "https://images.unsplash.com/photo-1524350876685-274059332603?q=80&w=600&auto=format&fit=crop"
        },
        {
          id: 2,
          title: "Xử Lý Hạt Cà Phê",
          description: "Sau khi thu hoạch, hạt cà phê được tách chất bã và vỏ thông qua quá trình xử lý ướt hoặc phơi khô tự nhiên dưới ánh nắng mặt trời.",
          image: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=600&auto=format&fit=crop"
        },
        {
          id: 3,
          title: "Rang Xay Nghệ Thuật",
          description: "Những hạt cà phê tuyển chọn được rang xay ở nhiệt độ tiêu chuẩn để giải phóng trọn vẹn hương thơm và vị đậm đà nguyên bản.",
          image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"
        }
      ];
      setSteps(fallback);
    };

    const fetchJourney = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/journey');
        if (response.ok) {
          const data = await response.json();
          setSteps(data.steps || data);
        } else {
          loadFallbackData();
        }
      } catch (error) {
        loadFallbackData();
      }
    };

    fetchJourney();
  }, [propSteps]);

  // Mỗi trang hiển thị 2 bước -> tính tổng số dot
  const totalPages = Math.ceil(steps.length / 2) || 1;

  const scrollToPage = (pageIndex) => {
    if (trackRef.current) {
      const containerWidth = trackRef.current.clientWidth;
      trackRef.current.scrollTo({
        left: pageIndex * containerWidth,
        behavior: 'smooth'
      });
      setActiveDot(pageIndex);
    }
  };

  const handleScroll = () => {
    if (trackRef.current) {
      const scrollLeft = trackRef.current.scrollLeft;
      const containerWidth = trackRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      if (newIndex !== activeDot && newIndex < totalPages) {
        setActiveDot(newIndex);
      }
    }
  };

  return (
    <section className="journey-section">
      {/* LƯỢN SÓNG TRÊN */}
      <svg className="wave wave-top" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
      </svg>

      <div className="container">
        {/* TIÊU ĐỀ */}
        <div className="journey-head">
          <h2 className="journey-title">HÀNH TRÌNH SẢN XUẤT CÀ PHÊ</h2>
          <p className="journey-desc">
            Khám phá quy trình chất lượng hàng đầu của sản phẩm cà phê tại cửa hàng của chúng tôi.
          </p>
        </div>

        {/* CAROUSEL HIỂN THỊ CHUẨN 2 CỘT */}
        <div className="journey-carousel-wrapper">
          <div 
            className="journey-track" 
            ref={trackRef}
            onScroll={handleScroll}
          >
            {steps.map((step) => (
              <article className="journey-card" key={step.id}>
                <div className="journey-card-img">
                  <img src={step.image} alt={step.title} loading="lazy" />
                </div>
                <div className="journey-card-body">
                  <h3 className="journey-card-title">{step.title}</h3>
                  <p className="journey-card-text">{step.description}</p>
                  <Link to="/about" className="journey-btn">
                    Khám phá
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* DOTS CHUYỂN TRANG */}
        <div className="journey-dots">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`dot ${activeDot === i ? 'active' : ''}`}
              onClick={() => scrollToPage(i)}
              aria-label={`Trang ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* LƯỢN SÓNG DƯỚI */}
      <svg className="wave wave-bottom" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z" />
      </svg>
    </section>
  );
};

export default Journey;