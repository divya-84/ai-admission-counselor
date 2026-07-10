import { Response, NextFunction } from 'express';
import * as pdfParse from 'pdf-parse';
import { ragService } from '../services/rag.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import logger from '../config/logger.js';

export class RagController {
  async uploadDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ status: 'error', message: 'PDF file is required' });
        return;
      }

      if (file.mimetype !== 'application/pdf') {
        res.status(400).json({ status: 'error', message: 'Only PDF documents are allowed' });
        return;
      }

      logger.info(`Starting PDF text extraction for: ${file.originalname} (${file.size} bytes)`);

      // 1. Parse PDF text (handle ESM/CJS default export differences safely)
      const parseFunc = ((pdfParse as unknown as { default?: unknown }).default || pdfParse) as (
        buf: Buffer,
      ) => Promise<{ text: string; numpages: number }>;
      const parsedData = await parseFunc(file.buffer);
      const text = parsedData.text;

      if (!text || text.trim().length === 0) {
        res
          .status(400)
          .json({ status: 'error', message: 'PDF document appears to be empty or unscannable' });
        return;
      }

      // 2. Index into local vector store (chunks, embeds, and saves)
      await ragService.addDocument(file.originalname, text);

      res.status(200).json({
        status: 'success',
        message: 'Document successfully uploaded and indexed for RAG operations',
        data: {
          filename: file.originalname,
          size: file.size,
          pages: parsedData.numpages,
        },
      });
    } catch (err) {
      logger.error('Failed to upload/index document:', err);
      next(err);
    }
  }
}

export const ragController = new RagController();
