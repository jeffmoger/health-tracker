const jwt = require('jsonwebtoken');

const verify = async (req, res, next) => {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      isAuthenticated = false;
      res.redirect('/view/users/login');
      return
    }
    const decrypt = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decrypt.id,
      email: decrypt.email,
      first_name: decrypt.first_name,
    };
    isAuthenticated = true;
    next();
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};

module.exports = verify;