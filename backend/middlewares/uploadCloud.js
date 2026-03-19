const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// Storage for notices
const noticeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "notices",
    allowed_formats: ["jpg", "png", "pdf", "doc", "docx","heic"],
  },
});

// Storage for official profiles
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "official-profiles",
    allowed_formats: ["jpg", "png", "jpeg", "heic"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// Storage for village registration documents (images only)
const villageDocStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "village-documents",
    allowed_formats: ["jpg", "png", "jpeg", "heic"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const issueStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "issues",
    allowed_formats: ["jpg", "png", "jpeg", "heic"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

const uploadNotice = multer({ storage: noticeStorage });
const uploadProfile = multer({ storage: profileStorage });
const uploadVillageDoc = multer({ storage: villageDocStorage });
const uploadIssue = multer({ storage: issueStorage });

module.exports = uploadNotice;
module.exports.uploadNotice = uploadNotice;
module.exports.uploadProfile = uploadProfile;
module.exports.uploadVillageDoc = uploadVillageDoc;
module.exports.uploadIssue = uploadIssue;