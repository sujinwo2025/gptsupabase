import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import { uploadFile, getFile, listFiles, deleteFile } from '../controllers/fileController.js';

const router = express.Router();

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Validate file types if needed
    cb(null, true);
  },
});

// Protected routes - require authentication
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/:id', getFile);
router.get('/', authMiddleware, listFiles);
router.delete('/:id', authMiddleware, deleteFile);

export default router;
