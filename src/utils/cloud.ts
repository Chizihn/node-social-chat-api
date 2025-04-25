// middleware/cloudinaryUpload.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'posts', // Optional: name of folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4'],
    resource_type: 'auto', // auto-detect image/video
  },
});

const upload = multer({ storage });

export default upload;


const extractPublicId = (url: string) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${fileName.split('.')[0]}`; // removes .jpg/.mp4
    return publicId;
  };
  