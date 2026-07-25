import multer from "multer";
import path from "path";

/* ==========================
   STORAGE CONFIGURATION
========================== */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

/* ==========================
   AVATAR UPLOAD (IMAGE ONLY)
========================== */

const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for avatar"), false);
  }
};

const avatarUpload = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/* ==========================
   PROJECT FILE UPLOAD
(images, docs, video, audio)
========================== */

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // images
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",

    // documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // video
    "video/mp4",
    "video/mpeg",
    "video/quicktime",

    // audio
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const fileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

/* ==========================
   EXPORT
========================== */

export { avatarUpload, fileUpload };
  
  









  

// import multer from 'multer';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/temp/'); // specify the directory to save uploaded files
//   },
//   filename: function (req, file, cb) {
//     // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     // cb(null, uniqueSuffix + '-' + file.originalname); // create a unique filename
//     cb(null, file.originalname); // use the original filename
//   }
// });

// const upload = multer({ storage });

// export { upload };
