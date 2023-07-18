import pkg from 'jsonwebtoken';
const { verify } = pkg;
export default (req, res, next) => {
  try {
    const token = req.headers.token.split(" ")[1];
    if (!token) {
      return res.status(401).json("Authentication failed");
    }
    const decodedToken = verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    
    res.status(403).json("Token is not Valid");
  }
};