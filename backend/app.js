const express=require('express')
const cors=require('cors')
const db=require('./config/mongoose-connection')

const app=express();
app.use(cors());
app.use(express.json());


const PORT=3000;
app.listen(PORT,()=>{
    console.log("Server Running!!")
})