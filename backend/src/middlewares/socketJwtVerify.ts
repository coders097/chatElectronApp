const jwt_key=process.env.jwt_Key!;
import jwt from 'jsonwebtoken';

let _=(token:string,next:Function,errorFunction:Function)=>{
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