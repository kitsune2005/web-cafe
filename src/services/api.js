// Ví dụ trong AuthContext.jsx
const register = async (name, email, password) => {
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      // Lưu user vào localStorage hoặc state
      return { success: true, message: data.message };
    }
    return { success: false, message: data.message };
  };