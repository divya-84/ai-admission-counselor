import { Router, RequestHandler } from 'express';
import multer from 'multer';
import { chatController } from '../controllers/chat.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.get('/history', authenticateJWT as RequestHandler, chatController.getHistory);
router.post('/stream', authenticateJWT as RequestHandler, chatController.streamChat);

// Cloud Speech Audio APIs
router.post(
  '/speech-to-text',
  authenticateJWT as RequestHandler,
  upload.single('file') as RequestHandler,
  chatController.speechToText as RequestHandler,
);

router.post(
  '/text-to-speech',
  authenticateJWT as RequestHandler,
  chatController.textToSpeech as RequestHandler,
);

export default router;
