import jwt from 'jsonwebtoken';
const jwt_key=process.env.jwt_Key!;
import express from 'express';

function jwtCheckToken(req:express.Request,res:express.Response,next:express.NextFunction){
    let header=req.header('Authorization');
    if(!header) header=req.headers['Authorization'] as (string | undefined);
    if(!header){
        res.status(401).send({
            success:false,
            error:'Invalid Token!'
        });
        return;
    }
    const [type,token] = header.split(' ');
    if(type === 'Bearer' && typeof token!=='undefined'){
        try{
            let data:any=jwt.verify(token,jwt_key);
            // data to be manipulated *************
            // if(!req.body.name) req.body.name=data['name'];
            req.body._id=data['_id'];
            //********************************** */ 
            next();
        }catch(e){
            console.log("EXPIRED TOKEN");
            res.status(401).send({
                success:false,
                error:'Invalid or expired Token!'
            });
        }
    }else{
        console.log("INVALID TOKEN");
        res.status(401).send({
            success:false,
            error:'Invalid Token!'
        });
    }
}

export default jwtCheckToken;