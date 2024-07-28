const path = require('path');

exports.renderResetPasswordPage = (req, res) => {
  const token = req.params.token;
  res.sendFile(path.join(__dirname, '../public/reset-password.html'));
};
