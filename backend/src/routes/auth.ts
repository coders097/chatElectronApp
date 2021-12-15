import express from 'express';
let router=express.Router();
import controller from '../controllers/auth';
import jwt from '../middlewares/jwtAuthentication';


// configuring multer
import multer from "multer";
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
});


// @type  POST
// @route /auth/login
// @desc  for login user
// @access PUBLIC
router.post("/login",controller.login);


// @type  POST
// @route /auth/signup
// @desc  for registering user
// @access PUBLIC 
router.post("/signup", upload.any(),controller.signup);


// @type  POST
// @route /auth/checkValidity
// @desc  for checking user's validity
// @access PRIVATE
router.post("/checkValidity", jwt, (req, res) => {
    res.status(200).json({
        success: true,
    });
});


// @type  POST
// @route /auth/editProfile
// @desc  for editing user's profile
// @access PRIVATE
router.post("/editProfile",upload.any(),controller.editProfile);


// @type  DELETE
// @route /auth/deleteProfile
// @desc  for deleting user's profile
// @access PRIVATE
router.delete("/deleteProfile",jwt,controller.deleteProfile);

// @type  POST
// @route /auth/refreshToken
// @desc  for refreshing user token
// @access PRIVATE
router.post("/refreshToken",jwt,controller.refreshToken);


export default router;
