import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // For demo purposes, we'll use a hardcoded user ID
      req.userId = 'demo-user-123';
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // For demo purposes, allow requests without token
    req.userId = 'demo-user-123';
    next();
  }
};

export default auth;