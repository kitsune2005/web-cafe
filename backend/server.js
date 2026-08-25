const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'users.json');

// Middleware cho phép frontend gọi API
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Hàm đọc dữ liệu từ file JSON
const readUsers = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

// Hàm ghi dữ liệu vào file JSON
const writeUsers = (users) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// API: Đăng ký thường
app.post('/api/register', (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
  }

  const users = readUsers();
  
  // Kiểm tra trùng lặp
  const existingEmail = users.find((user) => user.email === email);
  const existingUsername = users.find((user) => user.username === username);

  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
  }
  if (existingUsername) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập này đã có người sử dụng!' });
  }

  const newUser = {
    id: Date.now(),
    name,
    username,
    email,
    password,
    role: 'customer',
    avatar: '',
    provider: 'local',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ success: true, message: 'Đăng ký thành công!', user: newUser });
});

// API: Đăng nhập thường
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu!' });
  }

  const users = readUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng!' });
  }

  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công!',
    user: { 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        avatar: user.avatar 
    }
  });
});

// API: Đăng nhập bằng Google
app.post('/api/google-login', (req, res) => {
  const { name, email, googleId, avatar } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email Google không hợp lệ!' });
  }

  const users = readUsers();
  let user = users.find((u) => u.email === email);

  if (!user) {
    user = {
      id: Date.now(),
      name: name || 'Google User',
      username: email.split('@')[0], 
      email: email,
      password: '',
      role: 'customer',
      avatar: avatar || '',
      googleId: googleId || '',
      provider: 'google',
      createdAt: new Date().toISOString()
    };

    users.push(user);
    writeUsers(users);

    return res.status(200).json({
      success: true,
      isNewUser: true,
      message: 'Tài khoản Google mới đã được tạo và đăng nhập thành công!',
      user: { 
          id: user.id, 
          name: user.name, 
          username: user.username, 
          email: user.email, 
          role: user.role, 
          avatar: user.avatar 
      }
    });
  }

  return res.status(200).json({
    success: true,
    isNewUser: false,
    message: 'Đăng nhập Google thành công!',
    user: { 
        id: user.id, 
        name: user.name, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        avatar: user.avatar 
    }
  });
});

// ==========================================
// API MỚI: CẬP NHẬT THÔNG TIN VÀ AVATAR
// ==========================================
app.put('/api/update-profile', (req, res) => {
  const { id, name, email, avatar } = req.body;

  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
  }

  // Cập nhật tên và avatar
  users[userIndex].name = name || users[userIndex].name;
  users[userIndex].avatar = avatar || users[userIndex].avatar;

  try {
    writeUsers(users);
    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật thành công!',
      user: users[userIndex]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống khi lưu dữ liệu!' });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Backend đang chạy tại: http://localhost:${PORT}`);
});