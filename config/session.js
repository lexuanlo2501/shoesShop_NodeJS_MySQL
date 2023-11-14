const session = require('express-session');

const sessionConfig = {
  secret: 'mySecretKey', // Khóa bí mật (có thể thay đổi)
  resave: false,
  saveUninitialized: true
};

module.exports = session(sessionConfig);