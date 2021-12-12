import express from 'express';
import E from '../middlewares/errors';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
const jwt_key=process.env.jwt_Key!;
import jwtVerify from '../middlewares/jwtAuthentication';
let saltRounds=14;


let login=async (req:express.Request,res:express.Response)=>{
    const { password, email } = req.body;
    if (!email || !password) {
      E.dataMissingError(res);
      return;
    }
    let userMatch = await User.findOne({ email: email });
    if (userMatch) {
      let submittedPass = password;
      let savedPass = userMatch.password;
      const comparePassword = bcrypt.compareSync(submittedPass, savedPass);
      if (comparePassword === true) {
        let timeInMinutes = 120;
        let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
        let token = jwt.sign(
          {
            name: userMatch.name,
            _id: userMatch._id,
            exp: expires,
          },
          jwt_key
        );
        res.status(200).send({
          success: true,
          data: {
            _id: userMatch._id,
            name: userMatch.name,
            email: userMatch.email,
            pic: userMatch.pic,
            token: token,
          },
        });
      } else {
        E.authenticationError(res);
      }
    } else {
      E.authenticationError(res);
    }
}

let signup=async (req:express.Request,res:express.Response)=>{
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    E.dataMissingError(res);
    return;
  }
  let userMatch = await User.findOne({ email: email });
  if (userMatch) {
    res.status(401).send({
      success: false,
      error: "Email present!",
    });
  } else {
    const temp_password = bcrypt.hashSync(password, saltRounds);
    let pic_name = `${name}_${Date.now()}.jpg`;
    let pic_present = false;
    if ((req.files as Express.Multer.File[])[0]) {
    //   await cloudStorage.file(pic_name).createWriteStream().end(req.files[0].buffer);
      fs.writeFileSync(
        path.join(__dirname, "../../storage/user/",pic_name),
        (req.files as Express.Multer.File[])[0].buffer
      );
      pic_present = true;
    } else pic_name = pic;

    const new_user = new User({
      name: name,
      email: email,
      password: temp_password,
      pic: pic_name,
    });
    new_user.save(async (err:Error, user:typeof User) => {
      if (err) {
        console.log(err);
        if (pic_present) {
          try {
            // await cloudStorage.file(pic_name).delete();
            fs.unlinkSync(path.join(__dirname, "../../storage/user/",pic_name));
          } catch (e) {}
        }
        E.serverError(res);
      } else {
        res.status(200).json({
          success: true,
        });
      }
    });
  }
}

let editProfile=async (req:express.Request,res:express.Response)=>{
    jwtVerify(req, res, () => {
        console.log("Verified!");
        let { id, name, email, password } = req.body;
        if(!password){
            E.dataMissingError(res);
            return;
        }
        User.findById(id)
          .then(async (user) => {
            // Password check
            let __password=bcrypt.hashSync(password, saltRounds);
            if(__password===user.password){
                let oldPic = user.pic;
                let newPic = oldPic;
                if (req.files && req.files.length != 0) {
                  newPic = `${user.name}_${Date.now()}.jpg`;
                  fs.writeFileSync(
                    path.join(__dirname, "../../storage/user/", newPic),
                    (req.files as Express.Multer.File[])[0].buffer
                  );
                //   await cloudStorage.file(newPic).createWriteStream().end(req.files[0].buffer);
                  user.pic = newPic;
                }
                if (name) {
                  user.name = name;
                }
                if (email) {
                  user.email = email;
                }
                if (password) {
                  const temp_password = bcrypt.hashSync(password, saltRounds);
                  user.password = temp_password;
                }
                user
                  .save()
                  .then(async () => {
                    res.status(200).json({
                      success: true,
                      data: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        pic: user.pic,
                      },
                    });
                    if (oldPic !== newPic) {
                      if ((oldPic !== "avatar1.jpg") &&
                          (oldPic !== "avatar2.jpg") &&
                          (oldPic !== "avatar3.jpg") &&
                          (oldPic !== "avatar4.jpg") &&
                          (oldPic !== "avatar5.jpg")) {
                        try {
                          fs.unlinkSync(path.join(__dirname, "../../storage/user/", oldPic));
                        //   await cloudStorage.file(oldPic).delete();
                        } catch (E) {
                          console.log("ADMIN PROBLEM 4002:", oldPic);
                        }
                      }
                    }
                  })
                  .catch(() => {
                    E.serverError(res);
                  });
              }
          })
          .catch((err) => {
            console.log(err);
            E.authenticationError(res);
          });
      });
}

let deleteProfile=async (req:express.Request,res:express.Response)=>{
    let { id,password } = req.body;
    // Password checking
    let _user=await User.findById(id);
    if(_user){
        const temp_password = bcrypt.hashSync(password, saltRounds);
        if(temp_password===_user.password){
            User.findByIdAndDelete(id)
            .then(async (user) => {
              res.status(200).json({
                success: true,
              });
              try {
                if ((user.pic !== "avatar1.jpg") &&
                    (user.pic !== "avatar2.jpg") &&
                    (user.pic !== "avatar3.jpg") &&
                    (user.pic !== "avatar4.jpg") &&
                    (user.pic !== "avatar5.jpg"))
                  fs.unlinkSync(path.join(__dirname, "../../storage/user/", user.pic));
                //   await cloudStorage.file(user.pic).delete();
              } catch (E) {
                console.log("ADMIN PROBLEM 4002:", user.pic);
              }
            })
            .catch((err) => {
              E.serverError(res);
            });
        }
    } 
}

export default {
    login,signup,editProfile,deleteProfile
};