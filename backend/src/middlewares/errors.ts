/* STATUS CODES
404 ::FILE NOT FOUND
401 ::Authentication Failed
400 ::Missing Data From Client
500 ::SERVER Error

*/
let notFoundError=(res:any)=>{
    res.status(404).json({
        success:false,
        error:"Not Found!"
    });
}

let dataMissingError=(res:any)=>{
    res.status(400).json({
        success:false,
        error:"Invalid Parameters!"
    });
}

let authenticationError=(res:any)=>{
    res.status(401).json({
        success:false,
        error:"Authentication Failed!"
    });
}

let serverError=(res:any)=>{
    res.status(500).json({
        success:false,
        error:"Server Problem!"
    });
}

let resorucePresentError=(res:any)=>{
    res.status(409).json({
        success:false,
        error:"Already Present!"
    });
}


export default {
    notFoundError,
    dataMissingError,
    authenticationError,
    serverError,
    resorucePresentError
}