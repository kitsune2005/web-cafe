import React, { useState, useEffect } from 'react';
import './ScrollTop.css';

const ScrollTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <button className={`scroll-top ${visible ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Lên đầu trang">
            <i className="fa-solid fa-arrow-up"></i>
        </button>
    );
};

export default ScrollTop;