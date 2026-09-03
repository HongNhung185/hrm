const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { queryOne } = require('../db/connection');

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    // Không dùng chuỗi cố định nữa (dễ đoán vì nằm sẵn trong code).
    // Sinh secret ngẫu nhiên mỗi lần khởi động - token sẽ hết hiệu lực khi restart server,
    // nhưng vẫn an toàn hơn nhiều so với secret công khai.
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  CẢNH BÁO: Chưa đặt JWT_SECRET trong file .env - đang dùng secret ngẫu nhiên tạm thời.');
    console.warn('   Token đăng nhập sẽ mất hiệu lực mỗi khi server khởi động lại.');
    console.warn('   Vui lòng thêm JWT_SECRET=<chuỗi bí mật dài, ngẫu nhiên> vào file .env trước khi triển khai thật.');
}

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập hoặc thiếu token xác thực.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // KHÔNG fallback sang jwt.decode() hay tài khoản mặc định nữa -
            // token không hợp lệ / hết hạn / bị giả mạo phải bị từ chối thẳng.
            return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' });
        }
        req.user = decoded;
        next();
    });
};

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng.' });
        }

        const userRole = req.user.roleName;

        // Administrator always has full access
        if (userRole === 'Administrator') {
            return next();
        }

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Bạn không có quyền thực hiện chức năng này. Yêu cầu quyền: ${allowedRoles.join(', ')}`
        });
    };
};

module.exports = {
    JWT_SECRET,
    authenticateToken,
    authorizeRole
};