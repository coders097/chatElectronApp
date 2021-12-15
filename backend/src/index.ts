import express from 'express';
import cors from 'cors';
import moragn from 'morgan';
import socket from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import socketController from './controllers/socketController';
import mongoose from 'mongoose';

let app=express();


// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(moragn("dev"));
dotenv.config({
    path:"config.env"
});


// ROUTES
import authRouter from './routes/auth';
app.use("/auth",authRouter);
import fetchRouter from './routes/fetch';
app.use("/fetch",fetchRouter);


// Configuring Socket.io
const httpServer = http.createServer(app);
const io = new socket.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET","POST","PATCH","DELETE"]
    }
});
socketController(io);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL!);
const db=mongoose.connection;
db.on('error',()=>console.log("connection error"));
db.once('open',async ()=>{
    console.log("Connected To DB");
});

let PORT=process.env.PORT ? process.env.PORT : 3001;
httpServer.listen(PORT,()=>{
    console.log("Server started at ",PORT);
});
