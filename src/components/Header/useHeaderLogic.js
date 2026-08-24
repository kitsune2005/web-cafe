import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import Swal from 'sweetalert2';

export const useHeaderLogic = () => {
  const { currentUser, logout, loading } = useAuth();

  // States
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navDropdown, setNavDropdown] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Refs
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navRef = useRef(null);

  // 1. Sticky Header khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const headerHeight = 84;
      const threshold = Math.max(heroHeight - headerHeight, 40);
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Đóng Search Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // 3. Đóng User Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutsideUser = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutsideUser);
    return () => document.removeEventListener('click', handleClickOutsideUser);
  }, []);

  // 4. Đóng Nav Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutsideNav = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutsideNav);
    return () => document.removeEventListener('click', handleClickOutsideNav);
  }, []);

  // Luồng Đăng xuất: Hỏi -> Loading -> Toast thành công
  const handleLogout = () => {
    setUserDropdownOpen(false);
    setProfileOpen(false);

    Swal.fire({
      title: 'Đăng xuất tài khoản?',
      text: 'Bạn có chắc chắn muốn đăng xuất không?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6f4323',
      cancelButtonColor: '#888',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy bỏ',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Đang đăng xuất...',
          text: 'Vui lòng chờ trong giây lát',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
            setTimeout(() => {
              logout();
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Đã đăng xuất thành công!',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
              });
            }, 600);
          }
        });
      }
    });
  };

  const menuItems = [
    { label: 'Giới thiệu', link: '#', dropdown: null },
    { 
      label: 'Sản phẩm', 
      link: '#',
      dropdown: [
        { label: 'Cà phê nguyên chất', link: '#' },
        { label: 'Cà phê đóng gói', link: '#' },
        { label: 'Cà phê hạt', link: '#' },
      ]
    },
    { label: 'Tin tức', link: '#', dropdown: null },
    { label: 'Liên hệ', link: '#', dropdown: null },
  ];

  return {
    currentUser,
    loading,
    scrolled,
    searchOpen,
    setSearchOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    authModalOpen,
    setAuthModalOpen,
    userDropdownOpen,
    setUserDropdownOpen,
    navDropdown,
    setNavDropdown,
    profileOpen,
    setProfileOpen,
    searchRef,
    userMenuRef,
    navRef,
    handleLogout,
    menuItems
  };
};