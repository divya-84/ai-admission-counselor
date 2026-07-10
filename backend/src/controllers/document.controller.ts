import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { ocrService } from '../services/ocr.service.js';
import logger from '../config/logger.js';

interface CustomRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class DocumentController {
  // 1. Upload and run OCR on a document
  async uploadDocument(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const { documentType } = req.body;

      if (!file) {
        res.status(400).json({ status: 'error', message: 'No file uploaded' });
        return;
      }

      if (!documentType) {
        res.status(400).json({ status: 'error', message: 'documentType is required' });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      // Query student ID associated with user ID
      const student = await prisma.student.findUnique({
        where: { userId },
      });

      if (!student) {
        res.status(404).json({ status: 'error', message: 'Student profile not found' });
        return;
      }

      // Execute OCR Extraction on file buffer
      logger.info(`Running OCR extraction on ${file.originalname} for ${documentType}`);
      const ocrResult = await ocrService.extractMetadata(
        file.buffer,
        file.originalname,
        documentType,
      );

      // Create Document database record
      // Storing JSON-serialized OCR results inside existing notes field to avoid schema migration crashes
      const document = await prisma.document.create({
        data: {
          studentId: student.id,
          type: documentType,
          name: file.originalname,
          url: `/uploads/${file.filename || 'mock-file.pdf'}`,
          verificationStatus: 'PENDING',
          notes: JSON.stringify(ocrResult.parsedData),
        },
      });

      res.status(201).json({
        status: 'success',
        data: {
          document: {
            ...document,
            ocrMetadata: ocrResult.parsedData,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // 2. List all uploaded documents for a student
  async listDocuments(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const student = await prisma.student.findUnique({
        where: { userId },
      });

      if (!student) {
        res.status(404).json({ status: 'error', message: 'Student profile not found' });
        return;
      }

      const docs = await prisma.document.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
      });

      // Deserialize OCR notes metadata
      const formattedDocs = docs.map((doc) => {
        let ocrMetadata = {};
        try {
          if (doc.notes) {
            ocrMetadata = JSON.parse(doc.notes);
          }
        } catch {
          // ignore
        }
        return {
          ...doc,
          ocrMetadata,
        };
      });

      res.status(200).json({
        status: 'success',
        data: {
          documents: formattedDocs,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // 3. Verify/Reject a document (Admins and Counselors)
  async verifyDocument(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body; // status is VERIFIED or REJECTED

      if (!['VERIFIED', 'REJECTED'].includes(status)) {
        res.status(400).json({ status: 'error', message: 'Invalid verification status' });
        return;
      }

      const doc = await prisma.document.findUnique({
        where: { id },
      });

      if (!doc) {
        res.status(404).json({ status: 'error', message: 'Document not found' });
        return;
      }

      const updatedDoc = await prisma.document.update({
        where: { id },
        data: {
          verificationStatus: status,
          notes: notes || doc.notes,
        },
      });

      res.status(200).json({
        status: 'success',
        data: {
          document: updatedDoc,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const documentController = new DocumentController();
