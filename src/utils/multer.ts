// import multer from "multer";
// import path from "path";

// // Define the storage configuration for multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");  // Directory to save the uploaded files
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));  // Use a unique filename
//   },
// });

// // Initialize multer with the storage configuration
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },  // Limit file size to 5MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);  // Accept the file
//     } else {
//       cb(new Error("Only images are allowed"), false);  // Reject the file
//     }
//   },
// });

// export default upload;
