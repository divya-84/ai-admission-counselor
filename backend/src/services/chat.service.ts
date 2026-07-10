import { chatRepository } from '../repositories/chat.repository.js';
import { getChatStream, ChatMessageParam } from '../config/openai.js';
import { ragService } from './rag.service.js';

export class ChatService {
  async getHistory(userId: string) {
    return chatRepository.getConversationHistory(userId);
  }

  async saveUserMessage(userId: string, message: string, sessionToken?: string) {
    return chatRepository.saveMessage({
      senderId: userId,
      message,
      isBot: false,
      sessionToken,
    });
  }

  async streamChatResponse(
    userId: string,
    userMessage: string,
    sessionToken: string | undefined,
    onChunk: (chunk: string) => void,
    onEnd: (fullResponse: string) => void,
  ): Promise<void> {
    // 1. Fetch relevant academic context from RAG
    const contextMatches = await ragService.search(userMessage, 3);
    const contextText = contextMatches
      .map((m) => `[Source: ${m.documentName}] ${m.text}`)
      .join('\n\n');

    // 2. Fetch past conversation history
    const history = await chatRepository.getConversationHistory(userId);

    // 3. Format history into OpenAI Message structures (limit to last 20 messages for context window efficiency)
    const recentHistory = history.slice(-20);

    let systemInstruction = `You are the premium AI Admission Counselor for our University. 
Your goal is to guide prospective students on courses, application processes, tuition fees, and scholarship criteria.
Respond in professional, clean, and engaging Markdown format. 
Keep your replies informative but concise. Avoid generic statements and use formatting (bullet points, bold text) to make responses easily readable.`;

    if (contextText) {
      systemInstruction += `\n\nHere is university-specific context retrieved from reference files:\n${contextText}\n\nUse the above context to answer the student's question accurately. If the context does not contain the answer, use your general knowledge but clearly state that it is general information.`;
    }

    const messages: ChatMessageParam[] = [
      {
        role: 'system',
        content: systemInstruction,
      },
    ];

    for (const msg of recentHistory) {
      messages.push({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.message,
      });
    }

    // 3. Add the latest user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    // 4. Trigger streaming
    await getChatStream(messages, onChunk, async (fullText) => {
      // Save the bot's response when the stream completes
      await chatRepository.saveMessage({
        senderId: userId,
        message: fullText,
        isBot: true,
        sessionToken,
      });
      onEnd(fullText);
    });
  }
}

export const chatService = new ChatService();
