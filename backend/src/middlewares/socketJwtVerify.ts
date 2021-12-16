const jwt_key="dam0c2cab24w0x70hyhu29jeef5yzz";
import jwt from 'jsonwebtoken';

let _=(token:string,next:Function,errorFunction:Function)=>{
    console.log(token,jwt_key);
    try{
        let data:any=jwt.verify(token,jwt_key);
        // data to be manipulated *************
        // if(!req.body.name) req.body.name=data['name'];
        //********************************** */ 
        next();
    }catch(e){
        errorFunction('Invalid or expired Token!');
    }
}
export default _;