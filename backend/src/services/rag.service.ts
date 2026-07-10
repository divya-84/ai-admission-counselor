import fs from 'fs';
import path from 'path';
import { openai, isOpenAiConfigured } from '../config/openai.js';
import logger from '../config/logger.js';

interface VectorItem {
  id: string;
  text: string;
  documentName: string;
  embedding: number[];
}

export class RagService {
  private vectors: VectorItem[] = [];
  private storePath: string;

  constructor() {
    // Save within workspace directory
    const storageDir = path.resolve('storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.storePath = path.join(storageDir, 'vector_store.json');
    this.loadIndex();
  }

  // Load vector index from file
  private loadIndex() {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf8');
        this.vectors = JSON.parse(raw);
        logger.info(`Loaded RAG index with ${this.vectors.length} vector chunks.`);
      } else {
        this.vectors = [];
        logger.info('Vector store file not found. Initialized empty index.');
      }
    } catch (err) {
      logger.error('Failed to load RAG index:', err);
      this.vectors = [];
    }
  }

  // Save vector index to file
  private saveIndex() {
    try {
      fs.writeFileSync(this.storePath, JSON.stringify(this.vectors, null, 2), 'utf8');
      logger.info(`Successfully saved RAG index containing ${this.vectors.length} vectors.`);
    } catch (err) {
      logger.error('Failed to save RAG index:', err);
    }
  }

  // Split text into overlapping chunks
  chunkText(text: string, chunkSize: number = 800, chunkOverlap: number = 150): string[] {
    const chunks: string[] = [];
    let i = 0;
    while (i < text.length) {
      let end = i + chunkSize;
      if (end < text.length) {
        // Find natural word boundary
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > i + chunkSize - 60) {
          end = lastSpace;
        }
      }
      const chunk = text.slice(i, end).trim();
      if (chunk.length > 10) {
        chunks.push(chunk);
      }
      i = end - chunkOverlap;
      if (i < 0) i = 0;
      if (end >= text.length) break;
    }
    return chunks;
  }

  // Calculate cosine similarity
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Generate embeddings for array of chunks
  private async getEmbeddings(chunks: string[]): Promise<number[][]> {
    if (!isOpenAiConfigured || !openai) {
      // Mock mode: generate dummy vectors of size 1536
      logger.warn(
        `OpenAI not configured. Generating dummy embeddings for ${chunks.length} chunks.`,
      );
      return chunks.map(() => Array.from({ length: 1536 }, () => Math.random() - 0.5));
    }

    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks,
      });
      return response.data.map((d) => d.embedding);
    } catch (err) {
      logger.error('Failed to generate embeddings from OpenAI API:', err);
      throw err;
    }
  }

  // Add a document chunks into index
  async addDocument(documentName: string, text: string): Promise<void> {
    const chunks = this.chunkText(text);
    if (chunks.length === 0) {
      logger.warn(`No text chunks generated for document: ${documentName}`);
      return;
    }

    const embeddings = await this.getEmbeddings(chunks);

    const items: VectorItem[] = chunks.map((chunk, idx) => ({
      id: `${documentName}_${idx}_${Date.now()}`,
      text: chunk,
      documentName,
      embedding: embeddings[idx],
    }));

    // Append to index and save
    this.vectors.push(...items);
    this.saveIndex();
  }

  // Semantic search query
  async search(
    query: string,
    limit: number = 3,
  ): Promise<{ text: string; documentName: string; score: number }[]> {
    if (this.vectors.length === 0) {
      return [];
    }

    // Keyword fallback search if OpenAI is not configured
    if (!isOpenAiConfigured) {
      const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);

      if (queryWords.length === 0) {
        // Return first K vectors if search query is empty
        return this.vectors.slice(0, limit).map((v) => ({
          text: v.text,
          documentName: v.documentName,
          score: 1.0,
        }));
      }

      const matches = this.vectors.map((v) => {
        let score = 0;
        const textLower = v.text.toLowerCase();
        for (const word of queryWords) {
          if (textLower.includes(word)) {
            score += 1.0;
          }
        }
        return {
          text: v.text,
          documentName: v.documentName,
          score: score / queryWords.length,
        };
      });

      return matches
        .filter((m) => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Standard Semantic Search
    try {
      const queryEmbeddingArr = await this.getEmbeddings([query]);
      const queryEmbedding = queryEmbeddingArr[0];

      const scored = this.vectors.map((v) => {
        const similarity = this.cosineSimilarity(queryEmbedding, v.embedding);
        return {
          text: v.text,
          documentName: v.documentName,
          score: similarity,
        };
      });

      return scored.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (err) {
      logger.error('Semantic search failed, falling back to keyword lookup:', err);
      // Fallback keyword search
      const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);
      const matches = this.vectors.map((v) => {
        let score = 0;
        const textLower = v.text.toLowerCase();
        for (const word of queryWords) {
          if (textLower.includes(word)) {
            score += 1.0;
          }
        }
        return {
          text: v.text,
          documentName: v.documentName,
          score: score / (queryWords.length || 1),
        };
      });
      return matches.sort((a, b) => b.score - a.score).slice(0, limit);
    }
  }
}

export const ragService = new RagService();
