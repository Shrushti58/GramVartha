const express=require('express')
const cors=require('cors')
const db=require('./config/mongoose-connection')

const app=express();
app.use(cors());
app.use(express.json());

app.use(express.json());



app.use('/admin',require('./routes/adminRoutes'))
app.use('/officials',require('./routes/officalsRoutes'))

const PORT=3000;
app.listen(PORT,()=>{
    console.log("Server Running!!")
})