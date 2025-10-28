const express=require('express')
const cors=require('cors')
const db=require('./config/mongoose-connection')
const cookieParser = require("cookie-parser");

const app=express();
const allowedOrigins = [
  "http://localhost:5173", // dev frontend
   "https://gramvartha.vercel.app", // deployed frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // if you’re sending cookies
}));
app.use(express.json());
app.use(cookieParser());;





app.use('/admin',require('./routes/adminRoutes'))
app.use('/officials',require('./routes/officalsRoutes'))
app.use('/notice',require('./routes/noticeRoutes'))
app.use('/citizen',require('./routes/citizenRoutes'))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
