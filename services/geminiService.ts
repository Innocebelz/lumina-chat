import { GoogleGenAI, Chat } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';

// Initialize the SDK with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  private chatSession: Chat | null = null;

  /**
   * Initializes a new chat session.
   * This should be called when the component mounts or when clearing the chat.
   */
  initChat() {
    this.chatSession = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }

  /**
   * Sends a message to the model and returns a stream of responses.
   * @param message The user's text message.
   */
  async sendMessageStream(message: string) {
    if (!this.chatSession) {
      this.initChat();
    }

    if (!this.chatSession) {
      throw new Error("Failed to initialize chat session.");
    }

    try {
      // Using the Chat module's sendMessageStream as requested
      const streamResult = await this.chatSession.sendMessageStream({
        message: message
      });
      return streamResult;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }
  
  /**
   * Resets the internal chat session history.
   */
  resetChat() {
    this.initChat();
  }
}

export const geminiService = new GeminiService();