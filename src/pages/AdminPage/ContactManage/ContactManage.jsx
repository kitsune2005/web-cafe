import React from "react";

import {
  useContact
} from "../../../context/ContactContext";

import "./ContactManage.css";

const ContactManage = () => {
  const {
    contacts,
    loading,
    markAsRead,
    deleteContact
  } = useContact();


  const unreadCount =
    contacts.filter(
      item =>
        item.status === "unread"
    ).length;


  const formatDate = (date) => {
    return new Date(
      date
    ).toLocaleString(
      "vi-VN"
    );
  };


  const handleRead =
    async (id) => {

      try {
        await markAsRead(id);

      } catch (error) {
        alert(error.message);
      }
    };


  const handleDelete =
    async (id) => {

      if (
        !window.confirm(
          "Bạn có chắc muốn xóa liên hệ này?"
        )
      ) {
        return;
      }

      try {
        await deleteContact(id);

      } catch (error) {
        alert(error.message);
      }
    };


  if (loading) {
    return (
      <div className="contact-admin-loading">
        Đang tải liên hệ...
      </div>
    );
  }


  return (
    <div className="contact-manage-page">

      {/* =====================
          TRÁI
      ===================== */}

      <div className="contact-list-section">

        <div className="contact-admin-header">

          <div>

            <h3>
              Contact List
            </h3>

            <p>
              Home &gt; Contact &gt; Contact list
            </p>

          </div>

        </div>


        <div className="contact-table-wrap">

          <table className="contact-table">

            <thead>

              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Nội dung</th>
                <th>Ngày gửi</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>

            </thead>

            <tbody>

              {contacts.map(item => (

                <tr
                  key={item.id}
                  className={
                    item.status === "unread"
                      ? "unread-row"
                      : ""
                  }
                >

                  <td>

                    <strong>
                      {item.name}
                    </strong>

                  </td>

                  <td>

                    <div className="contact-customer-info">

                      <span>
                        <i className="fa-solid fa-phone"></i>

                        {item.phone}
                      </span>

                      <span>
                        <i className="fa-regular fa-envelope"></i>

                        {item.email}
                      </span>

                    </div>

                  </td>

                  <td className="contact-message-cell">
                    {item.message}
                  </td>

                  <td>
                    {formatDate(
                      item.createdAt
                    )}
                  </td>

                  <td>

                    <span
                      className={`contact-status ${item.status}`}
                    >
                      {item.status === "unread"
                        ? "Chưa xem"
                        : "Đã xem"}
                    </span>

                  </td>

                  <td>

                    <div className="contact-actions">

                      {item.status ===
                        "unread" && (

                        <button
                          className="read-btn"
                          onClick={() =>
                            handleRead(
                              item.id
                            )
                          }
                          title="Đánh dấu đã xem"
                        >
                          <i className="fa-regular fa-eye"></i>
                        </button>

                      )}

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            item.id
                          )
                        }
                        title="Xóa"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================
          PHẢI
      ===================== */}

      <div className="contact-stats-section">

        <div className="contact-stat-card">

          <p>
            Tổng liên hệ
          </p>

          <h2>
            {contacts.length}
          </h2>

          <span>
            Tin nhắn
          </span>

        </div>


        <div className="contact-stat-card">

          <p>
            Chưa xem
          </p>

          <h2 className="unread-number">
            {unreadCount}
          </h2>

          <span>
            Tin nhắn mới
          </span>

        </div>

      </div>

    </div>
  );
};

export default ContactManage;