import OpenAI from 'openai';
import logger from './logger.js';

const apiKey = process.env.OPENAI_API_KEY;

export const isOpenAiConfigured = !!apiKey;

if (!isOpenAiConfigured) {
  logger.warn(
    'OPENAI_API_KEY is not defined in environment variables. Chatbot will run in MOCK mode.',
  );
}

export const openai = isOpenAiConfigured ? new OpenAI({ apiKey }) : null;

export interface ChatMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Fallback mock streamer for local development/testing
const streamMockResponse = async (
  prompt: string,
  onChunk: (text: string) => void,
  onEnd: (fullText: string) => void,
) => {
  const responses = [
    `Thank you for your interest! The admission requirements for the **M.S. in Computer Science** program include:\n\n1. A bachelor's degree in CS or related field.\n2. A minimum undergraduate GPA of **3.0** (on a 4.0 scale).\n3. English proficiency scores (e.g., IELTS **6.5** or TOEFL **90**).\n4. A Statement of Purpose (SOP) and 2 Letters of Recommendation.\n\nLet me know if you would like to review the specific tuition fees or application deadlines!`,
    `Sure! The annual tuition fee for the **M.S. in Computer Science** is **$22,000**. The university also offers several merit-based aid opportunities, such as the *Global Tech Excellence Scholarship*, which awards up to **$15,000** for qualified applicants.\n\nWould you like me to book a session with an advisor to discuss application steps?`,
    `We have four core departments offering graduate and undergraduate programs:\n\n- **Computer Science & AI**: M.S. in CS, Ph.D. in AI\n- **Mechanical Engineering**: B.S. in Robotics Engineering\n- **Administration & Commerce**: B.B.A. in Marketing\n\nWhich program matches your academic level?`,
    `Hello! I am your AI Admission Counselor. I can assist you with:\n\n- Answering course eligibility queries.\n- Guiding you through document requirements.\n- Tracking your active application status.\n- Reviewing scholarship matching.\n\nHow can I help you today?`,
  ];

  // Select a response based on keywords or select the last one as default
  let reply = responses[3];
  const query = prompt.toLowerCase();
  if (
    query.includes('requirement') ||
    query.includes('eligibility') ||
    query.includes('criteria')
  ) {
    reply = responses[0];
  } else if (
    query.includes('fee') ||
    query.includes('tuition') ||
    query.includes('scholarship') ||
    query.includes('cost')
  ) {
    reply = responses[1];
  } else if (
    query.includes('course') ||
    query.includes('program') ||
    query.includes('department')
  ) {
    reply = responses[2];
  }

  // Stream character-by-character to simulate AI thinking/streaming
  const words = reply.split(' ');
  let currentText = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i] + (i === words.length - 1 ? '' : ' ');
    currentText += word;
    onChunk(word);
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  onEnd(currentText);
};

export const getChatStream = async (
  messages: ChatMessageParam[],
  onChunk: (text: string) => void,
  onEnd: (fullText: string) => void,
): Promise<void> => {
  if (!isOpenAiConfigured || !openai) {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    await streamMockResponse(lastUserMessage, onChunk, onEnd);
    return;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        onChunk(content);
      }
    }
    onEnd(fullText);
  } catch (err) {
    logger.error('OpenAI stream generation error:', err);
    throw err;
  }
};
