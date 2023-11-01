import jwt from 'jsonwebtoken';

export default (req, resp, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret123');

      req.userId = decoded._id;

      next();
    } catch (error) {
      console.log(error);
      return resp.status(403).json({
        message: 'No permission',
      });
    }
  } else {
    return resp.status(403).json({
      message: 'No permission',
    });
  }
};
