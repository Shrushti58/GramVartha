const express=require('express')
const cors=require('cors')
const db=require('./config/mongoose-connection')
const cookieParser = require("cookie-parser");

const app=express();
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,               
  })
);
app.use(express.json());
app.use(cookieParser());;





app.use('/admin',require('./routes/adminRoutes'))
app.use('/officials',require('./routes/officalsRoutes'))
app.use('/notice',require('./routes/noticeRoutes'))

const PORT=3000;
app.listen(PORT,()=>{
    console.log("Server Running!!")
})