import React, { useState } from "react";
import { useParams, Link } from 'react-router-dom';
import { useContact } from "../../context/ContactContext";
import toast from 'react-hot-toast'; // 👉 Thêm Toasts báo lỗi
import Swal from 'sweetalert2'; // 👉 Thêm SweetAlert2 báo thành công xịn xò
import "./ContactPage.css";

const ContactPage = () => {
  const { sendContact } = useContact();
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 👉 THAY THẾ ALERT BẰNG TOAST KHI NHẬP THIẾU
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.message
    ) {
      toast.error("Boss vui lòng điền đầy đủ thông tin nhé! 🦊", {
        position: "bottom-right",
        style: { fontWeight: 600 }
      });
      return;
    }

    try {
      setSending(true);

      await sendContact(formData);

      // 👉 THAY THẾ ALERT BẰNG POPUP SWEETALERT2 KHI THÀNH CÔNG
      Swal.fire({
        title: 'Gửi thành công! 🎉',
        text: 'Cảm ơn Boss đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất!',
        icon: 'success',
        confirmButtonText: 'Tuyệt vời!',
        confirmButtonColor: '#6f4323', // Màu nâu cafe tone-sur-tone
        background: '#fff',
        borderRadius: '12px'
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: ""
      });

    } catch (error) {
      toast.error(`Lỗi: ${error.message}`, {
        position: "bottom-right",
        style: { fontWeight: 600 }
      });
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="contact-page">

      {/* ======================
          BANNER
      ====================== */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Liên Hệ</h1>
          <p>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.
          </p>
          <div className="contact-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span className="current">Liên hệ</span>
          </div>
        </div>
      </section>

      {/* ======================
          CONTACT
      ====================== */}
      <section className="contact-section">
        <div className="container contact-layout">

          {/* ==================
              TRÁI
          ================== */}
          <aside className="contact-info">
            <div className="contact-info-item">
              <h3>ĐỊA CHỈ</h3>
              <p>144 Hoàng Văn Thụ, P.Đức Nhuận, TP.HCM</p>
            </div>
            <div className="contact-info-item">
              <h3>HOTLINE</h3>
              <p>(+84) 02345 - 678 - 900</p>
            </div>
            <div className="contact-info-item">
              <h3>EMAIL</h3>
              <p>info@thecoffee.vn</p>
            </div>
            <div className="contact-info-item">
              <h3>GIỜ LÀM VIỆC</h3>
              <p>08:00 - 22:00 (Thứ 2 - CN)</p>
            </div>
          </aside>

          {/* ==================
              FORM
          ================== */}
          <div className="contact-form-wrapper">
            <h2>LIÊN HỆ</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-row">
                <input
                  type="text"
                  placeholder="Họ tên*"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Số điện thoại*"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value
                    })
                  }
                />
                <input
                  type="email"
                  placeholder="Email*"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                />
              </div>

              <textarea
                rows="6"
                placeholder="Nội dung"
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value
                  })
                }
              />

              <button type="submit" disabled={sending}>
                {sending ? "ĐANG GỬI..." : "GỬI LIÊN HỆ"}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ======================
          MAP
      ====================== */}
      <section className="contact-map">
        <iframe
          title="Bản đồ"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1528781550696!2d106.6740409740879!3d10.799600758767752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d7d95aa9f7%3A0xd576fc99e12c8b18!2zMTQ0IMSQLiBIb8OgbmcgVsSDbiBUaOG7pSwgxJDhu6ljIE5odeG6rW4sIEjhu5MgQ2jDrSBNaW5oIDcwMDAwMCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1788089629386!5m2!1svi!2s"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

    </div>
  );
};

export default ContactPage;