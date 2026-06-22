const jwt = require("jsonwebtoken");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return process.env.JWT_SECRET;
}

function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      village: user.village   
    },
    getJwtSecret(),
     
    { expiresIn: "1d" }
  );
}

function verifyToken(req, res, next) {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.warn("[auth] Missing token", {
      method: req.method,
      path: req.originalUrl,
    });
    return res.status(401).json({ message: "No token" });
  }

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) {
      console.warn("[auth] Invalid token", {
        method: req.method,
        path: req.originalUrl,
        message: err.message,
      });
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = { generateToken, verifyToken };
