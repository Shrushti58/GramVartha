const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/cloudinary"); 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "notices", 
    allowed_formats: ["jpg", "png", "pdf", "doc", "docx"],
  },
});

const upload = multer({ storage });

module.exports = upload;
