const express=require('express')
const cors=require('cors')
const db=require('./config/mongoose-connection')
const cookieParser = require("cookie-parser");

const app=express();
app.use(
  cors({
    origin: "https://gramvartha.vercel.app", 
    credentials: true,               
  })
);
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
