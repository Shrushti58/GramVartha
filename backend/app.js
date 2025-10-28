const express=require('express')
const cors=require('cors')
const db=require('./config/mongoose-connection')
const cookieParser = require("cookie-parser");

const app=express();

app.use(express.json());
app.use(cookieParser());;
const allowedOrigins = [
  "http://localhost:5173", // dev frontend
   "https://gramvartha.vercel.app", // deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);







app.use('/admin',require('./routes/adminRoutes'))
app.use('/officials',require('./routes/officalsRoutes'))
app.use('/notice',require('./routes/noticeRoutes'))
app.use('/citizen',require('./routes/citizenRoutes'))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
