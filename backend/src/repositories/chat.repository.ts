import { ChatMessage } from '@prisma/client';
import prisma from '../config/database.js';

export class ChatRepository {
  async saveMessage(data: {
    senderId: string;
    message: string;
    isBot?: boolean;
    sessionToken?: string;
  }): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data: {
        senderId: data.senderId,
        message: data.message,
        isBot: data.isBot ?? false,
        sessionToken: data.sessionToken ?? null,
      },
    });
  }

  async getConversationHistory(userId: string): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      where: {
        senderId: userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

export const chatRepository = new ChatRepository();
