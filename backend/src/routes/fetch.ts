import express from 'express';
let router=express.Router();
import controller from '../controllers/fetch';

// configuring multer
import multer from "multer";
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
});

// @type  GET
// @route /fetch/getUserPic
// @desc  for getting user's pic
// @access PUBLIC
router.get("/getUserPic",controller.getUserPic);

// @type  GET
// @route /fetch/getPostPic
// @desc  for getting post pic
// @access PRIVATE
router.get("/getPostPic",controller.getPostPic);

// @type  GET
// @route /fetch/getAttachment
// @desc  for getting post attachment
// @access PRIVATE
router.get("/getAttachment",controller.getAttachment);

// @type  POST
// @route /fetch/uploadAttachment 
// @desc  for uploading Attachment
// @access PRIVATE
router.post("/uploadAttachment",upload.any(),controller.uploadAttachment); 

// @type  POST
// @route /fetch/uploadPic
// @desc  for uploading Post pic
// @access PRIVATE
router.post("/uploadPic",upload.any(),controller.uploadPic); 

export default router;
 