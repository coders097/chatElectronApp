import express from 'express';
import fs from 'fs';
import path from 'path';
import jwtVerify from '../middlewares/jwtAuthentication';
import E from '../middlewares/errors';

let getUserPic=async (req:express.Request,res:express.Response)=>{
    let {pic}=req.query;
    if(!pic){
        res.status(404).send();
        return;
    }
    try{
        if(pic && (pic!='undefined')){
            let stream=fs.createReadStream(path.join(__dirname,"../../storage/user/",pic as string));
            stream.pipe(res);
        }
    }catch(e){
        res.status(404).send();
    }
}

let getPostPic=async (req:express.Request,res:express.Response)=>{
    let {pic,token}=req.query;
    if(!pic || (pic=='undefined') || !token || (token=='undefined')){
        res.status(404).send();
        return;
    }
    req.headers['Authorization']=`Bearer ${token}`;
    jwtVerify(req,res,()=>{
        try{
            if(pic){
                let stream=fs.createReadStream(path.join(__dirname,"../../storage/post/",pic as string));
                stream.pipe(res);
            }
        }catch(e){
            res.status(404).send();
        }
    });
}

let getAttachment=async (req:express.Request,res:express.Response)=>{
    let {fileName,token}=req.query;
    if(!fileName || (fileName=='undefined') || !token || (token=='undefined')){
        res.status(404).send();
        return;
    }
    req.headers['Authorization']=`Bearer ${token}`;
    jwtVerify(req,res,()=>{
        try{
            if(fileName){
                let stream=fs.createReadStream(path.join(__dirname,"../../storage/attachments/",fileName as string));
                stream.pipe(res);
            }
        }catch(e){
            res.status(404).send();
        }
    });
}

let uploadAttachment=async (req:express.Request,res:express.Response)=>{
    jwtVerify(req,res,()=>{
        let {_id}=req.body;
        if(req.files && req.files.length>0){
            let names:string[]=[];
            let size:number=(req.files as Express.Multer.File[]).length;
            let i=0;
            while(size-->0){
                let file=(req.files as Express.Multer.File[])[i++];
                let name=`${_id}_attachment_${Date.now()}_${file.fieldname}.${file.mimetype.split("/")[1]}`;
                fs.writeFileSync(
                    path.join(__dirname, "../../storage/attachments/",name),
                    file.buffer
                );
                names.push(name);
            }
            res.status(200).json({
                success:true,
                data:names
            });
        }else{
            E.dataMissingError(res);
        }
    });
}

export default {
    getUserPic,getPostPic,getAttachment,uploadAttachment
}; 