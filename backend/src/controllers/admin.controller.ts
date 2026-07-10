import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { Role, VerificationStatus } from '@prisma/client';

export class AdminController {
  // 1. Settings (AI + Rules)
  async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const aiSettings = await adminService.getAISettings();
      const admissionRules = await adminService.getAdmissionRules();
      res.status(200).json({
        status: 'success',
        data: { aiSettings, admissionRules },
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAISettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const updated = await adminService.updateAISettings(req.body);
      res.status(200).json({ status: 'success', data: { aiSettings: updated } });
    } catch (err) {
      next(err);
    }
  }

  async updateAdmissionRules(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const updated = await adminService.updateAdmissionRules(req.body);
      res.status(200).json({ status: 'success', data: { admissionRules: updated } });
    } catch (err) {
      next(err);
    }
  }

  // 2. User Controls
  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await adminService.listUsers();
      res.status(200).json({ status: 'success', data: { users } });
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updated = await adminService.updateUserRole(id, role as Role);
      res.status(200).json({ status: 'success', data: { user: updated } });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);
      res.status(200).json({ status: 'success', message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  }

  // 3. Departments
  async listDepartments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const departments = await adminService.listDepartments();
      res.status(200).json({ status: 'success', data: { departments } });
    } catch (err) {
      next(err);
    }
  }

  async createDepartment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, description } = req.body;
      const dept = await adminService.createDepartment(name, description);
      res.status(201).json({ status: 'success', data: { department: dept } });
    } catch (err) {
      next(err);
    }
  }

  async deleteDepartment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await adminService.deleteDepartment(id);
      res.status(200).json({ status: 'success', message: 'Department deleted' });
    } catch (err) {
      next(err);
    }
  }

  // 4. Courses
  async listCourses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await adminService.listCourses();
      res.status(200).json({ status: 'success', data: { courses } });
    } catch (err) {
      next(err);
    }
  }

  async createCourse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await adminService.createCourse(req.body);
      res.status(201).json({ status: 'success', data: { course } });
    } catch (err) {
      next(err);
    }
  }

  async deleteCourse(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await adminService.deleteCourse(id);
      res.status(200).json({ status: 'success', message: 'Course deleted' });
    } catch (err) {
      next(err);
    }
  }

  // 5. Scholarships
  async listScholarships(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const scholarships = await adminService.listScholarships();
      res.status(200).json({ status: 'success', data: { scholarships } });
    } catch (err) {
      next(err);
    }
  }

  async createScholarship(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const scholarship = await adminService.createScholarship(req.body);
      res.status(201).json({ status: 'success', data: { scholarship } });
    } catch (err) {
      next(err);
    }
  }

  async deleteScholarship(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      await adminService.deleteScholarship(id);
      res.status(200).json({ status: 'success', message: 'Scholarship deleted' });
    } catch (err) {
      next(err);
    }
  }

  // 6. Documents Audit
  async listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const documents = await adminService.listDocuments();
      res.status(200).json({ status: 'success', data: { documents } });
    } catch (err) {
      next(err);
    }
  }

  async verifyDocument(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const doc = await adminService.verifyDocument(id, status as VerificationStatus, notes);
      res.status(200).json({ status: 'success', data: { document: doc } });
    } catch (err) {
      next(err);
    }
  }

  // 7. RAG Knowledge Base
  async listKnowledgeBaseChunks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const chunks = await adminService.listKnowledgeBaseChunks();
      res.status(200).json({ status: 'success', data: { chunks } });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
