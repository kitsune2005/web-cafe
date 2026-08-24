const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const DB_FILE = path.join(__dirname, 'users.json');

// Middleware cho phép frontend gọi API
app.use(cors());
app.use(express.json());

// Hàm đọc dữ liệu từ file JSON
const readUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        return [];
    }
};

// Hàm ghi dữ liệu vào file JSON
const writeUsers = (users) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
};

// API: Đăng ký
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    const users = readUsers();
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
        return res.status(400).json({ message: 'Email này đã được đăng ký!' });
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'Đăng ký thành công!', user: newUser });
});

// API: Đăng nhập
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu!' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
    }

    res.status(200).json({ message: 'Đăng nhập thành công!', user: { id: user.id, name: user.name, email: user.email } });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`✅ Backend đang chạy tại: http://localhost:${PORT}`);
});