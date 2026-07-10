import fs from 'fs';
import path from 'path';
import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { Role, VerificationStatus } from '@prisma/client';

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface AdmissionRules {
  minPercentage: number;
  minAge: number;
  requiredSubjects: string[];
  cutoffRank: number;
}

const settingsPath = path.resolve('src/config/admin_settings.json');

export class AdminService {
  // Read local settings
  private readSettings() {
    try {
      if (fs.existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      logger.error('Error reading settings file:', err);
    }
    return {
      aiSettings: {
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 1024,
        systemPrompt:
          'You are Antigravity, an AI admission counselor assistant for AKTU. Be helpful, professional, and explain AKTU admission procedures clearly.',
      },
      admissionRules: {
        minPercentage: 50,
        minAge: 17,
        requiredSubjects: ['Physics', 'Chemistry', 'Mathematics'],
        cutoffRank: 50000,
      },
    };
  }

  // Write local settings
  private writeSettings(settings: { aiSettings: AISettings; admissionRules: AdmissionRules }) {
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
      return true;
    } catch (err) {
      logger.error('Error writing settings file:', err);
      return false;
    }
  }

  // 1. Get/Set AI Settings
  async getAISettings(): Promise<AISettings> {
    return this.readSettings().aiSettings;
  }

  async updateAISettings(settings: AISettings): Promise<AISettings> {
    const current = this.readSettings();
    current.aiSettings = settings;
    this.writeSettings(current);
    logger.info('[Admin settings]: AI Model parameters updated.');
    return settings;
  }

  // 2. Get/Set Admission Rules
  async getAdmissionRules(): Promise<AdmissionRules> {
    return this.readSettings().admissionRules;
  }

  async updateAdmissionRules(rules: AdmissionRules): Promise<AdmissionRules> {
    const current = this.readSettings();
    current.admissionRules = rules;
    this.writeSettings(current);
    logger.info('[Admin settings]: Admission requirements cutoff/eligibility limits updated.');
    return rules;
  }

  // 3. User Management
  async listUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });
  }

  async updateUserRole(id: string, role: Role) {
    logger.info(`[Admin Console]: Updating user role for ${id} to ${role}`);
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async deleteUser(id: string) {
    logger.info(`[Admin Console]: Deleting user ID: ${id}`);
    return prisma.user.delete({
      where: { id },
    });
  }

  // 4. Department Management
  async listDepartments() {
    return prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(name: string, description?: string) {
    logger.info(`[Admin Console]: Creating department: ${name}`);
    return prisma.department.create({
      data: { name, description },
    });
  }

  async deleteDepartment(id: string) {
    logger.info(`[Admin Console]: Deleting department ID: ${id}`);
    return prisma.department.delete({
      where: { id },
    });
  }

  // 5. Course Management
  async listCourses() {
    return prisma.course.findMany({
      include: { department: true },
      orderBy: { code: 'asc' },
    });
  }

  async createCourse(payload: {
    code: string;
    name: string;
    description?: string;
    durationYears: number;
    tuitionFee: number;
    requirements?: string;
    departmentId: string;
  }) {
    logger.info(`[Admin Console]: Adding course: ${payload.code}`);
    return prisma.course.create({
      data: {
        code: payload.code,
        name: payload.name,
        description: payload.description,
        durationYears: payload.durationYears,
        tuitionFee: payload.tuitionFee,
        requirements: payload.requirements,
        departmentId: payload.departmentId,
      },
    });
  }

  async deleteCourse(id: string) {
    logger.info(`[Admin Console]: Deleting course ID: ${id}`);
    return prisma.course.delete({
      where: { id },
    });
  }

  // 6. Scholarship Management
  async listScholarships() {
    return prisma.scholarship.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createScholarship(payload: {
    name: string;
    description?: string;
    amount: number;
    requirements?: string;
  }) {
    logger.info(`[Admin Console]: Creating scholarship: ${payload.name}`);
    return prisma.scholarship.create({
      data: {
        name: payload.name,
        description: payload.description,
        amount: payload.amount,
        requirements: payload.requirements,
      },
    });
  }

  async deleteScholarship(id: string) {
    logger.info(`[Admin Console]: Deleting scholarship ID: ${id}`);
    return prisma.scholarship.delete({
      where: { id },
    });
  }

  // 7. Document Audit
  async listDocuments() {
    return prisma.document.findMany({
      include: {
        student: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyDocument(id: string, status: VerificationStatus, notes?: string) {
    logger.info(`[Admin Console]: Updating verification status for Document: ${id} to ${status}`);
    return prisma.document.update({
      where: { id },
      data: {
        verificationStatus: status,
        notes: notes || undefined,
      },
    });
  }

  // 8. RAG Knowledge Base index audit
  async listKnowledgeBaseChunks() {
    // Simulated index list representing chunks loaded in FAISS / vector store
    return [
      {
        id: 'chunk_001',
        fileName: 'aktu_ug_guidelines_2026.pdf',
        sizeBytes: 154200,
        chunksCount: 42,
        embeddingDimension: 1536,
        status: 'Indexed',
      },
      {
        id: 'chunk_002',
        fileName: 'aktu_scholarship_announcement.pdf',
        sizeBytes: 89400,
        chunksCount: 18,
        embeddingDimension: 1536,
        status: 'Indexed',
      },
      {
        id: 'chunk_003',
        fileName: 'aktu_reservation_criteria.pdf',
        sizeBytes: 67100,
        chunksCount: 12,
        embeddingDimension: 1536,
        status: 'Indexed',
      },
    ];
  }
}

export const adminService = new AdminService();
