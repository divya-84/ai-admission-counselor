import { Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service.js';
import { speechService } from '../services/speech.service.js';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import logger from '../config/logger.js';

export class ChatController {
  async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const history = await chatService.getHistory(userId);

      res.status(200).json({
        status: 'success',
        data: {
          history: history.map((h) => ({
            id: h.id,
            message: h.message,
            isBot: h.isBot,
            sessionToken: h.sessionToken,
            createdAt: h.createdAt,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async streamChat(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { message, sessionToken } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ status: 'error', message: 'Message is required' });
      return;
    }

    try {
      // 1. Save user's message to database
      await chatService.saveUserMessage(userId, message, sessionToken);

      // 2. Setup Server-Sent Events (SSE) headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx if any

      // Flush headers
      res.flushHeaders();

      // 3. Stream back the completion response
      await chatService.streamChatResponse(
        userId,
        message,
        sessionToken,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        },
        (_fullText) => {
          res.write('data: [DONE]\n\n');
          res.end();
        },
      );
    } catch (err) {
      logger.error('Error during chatbot stream:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown chatbot exception';
      res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
      res.end();
    }
  }

  // 3. Speech-to-Text (Whisper Cloud)
  async speechToText(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ status: 'error', message: 'No audio file uploaded' });
        return;
      }
      const language = req.query.language as string | undefined;
      const text = await speechService.speechToText(
        req.file.buffer,
        req.file.originalname,
        language,
      );
      res.status(200).json({
        status: 'success',
        data: { text },
      });
    } catch (err) {
      next(err);
    }
  }

  // 4. Text-to-Speech (OpenAI TTS)
  async textToSpeech(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, voice } = req.body;
      if (!text) {
        res.status(400).json({ status: 'error', message: 'Text is required for synthesis' });
        return;
      }
      const audioBuffer = await speechService.textToSpeech(text, voice);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.status(200).send(audioBuffer);
    } catch (err) {
      next(err);
    }
  }
}

export const chatController = new ChatController();
