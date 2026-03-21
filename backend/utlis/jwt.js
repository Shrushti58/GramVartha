const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
      village: user.village   
    },
    process.env.JWT_SECRET || "supersecret",
     
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
    return res.status(401).json({ message: "No token" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
}

module.exports = { generateToken, verifyToken };
