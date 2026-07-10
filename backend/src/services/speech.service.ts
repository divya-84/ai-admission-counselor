import OpenAI from 'openai';
import { openai, isOpenAiConfigured } from '../config/openai.js';
import logger from '../config/logger.js';

export class SpeechService {
  // 1. Cloud Speech-To-Text (Whisper)
  async speechToText(
    audioBuffer: Buffer,
    originalName: string,
    language?: string,
  ): Promise<string> {
    try {
      if (!isOpenAiConfigured || !openai) {
        logger.info('[SpeechService]: Whisper STT mock response triggered (No API key).');
        return 'What are the core admission eligibility requirements for AKTU university?';
      }

      // Convert buffer to file-like object for openai sdk
      const file = await OpenAI.toFile(audioBuffer, originalName || 'audio.wav');

      const response = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: language === 'hi' ? 'hi' : 'en',
      });

      return response.text;
    } catch (err) {
      logger.error('Error during cloud Speech-to-Text translation:', err);
      throw err;
    }
  }

  // 2. Cloud Text-To-Speech (OpenAI TTS)
  async textToSpeech(
    text: string,
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'alloy',
  ): Promise<Buffer> {
    try {
      if (!isOpenAiConfigured || !openai) {
        logger.info('[SpeechService]: TTS mock triggered. Returning silent audio buffer.');
        // Return a mock 44-byte silent WAV file header
        const wavHeader = Buffer.alloc(44);
        wavHeader.write('RIFF', 0);
        wavHeader.writeUInt32LE(36, 4);
        wavHeader.write('WAVE', 8);
        wavHeader.write('fmt ', 12);
        wavHeader.writeUInt32LE(16, 16);
        wavHeader.writeUInt16LE(1, 20); // PCM
        wavHeader.writeUInt16LE(1, 22); // Mono
        wavHeader.writeUInt32LE(8000, 24); // Sample rate
        wavHeader.writeUInt32LE(8000, 28); // Byte rate
        wavHeader.writeUInt16LE(1, 32); // Block align
        wavHeader.writeUInt16LE(8, 34); // Bits per sample
        wavHeader.write('data', 36);
        wavHeader.writeUInt32LE(0, 40);
        return wavHeader;
      }

      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (err) {
      logger.error('Error during cloud Text-to-Speech synthesis:', err);
      throw err;
    }
  }
}

export const speechService = new SpeechService();
