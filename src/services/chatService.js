import { initLlama } from 'llama.rn';
import { getModelPath } from './modelService';
import { getRelevantContext, formatPrompt, isGeneralGreeting } from './ragService';
import RNFS from 'react-native-fs';

let llamaContext = null;

export async function getBotReply(payload) {
  const { value: question, occasion } = payload;
  const occasionId = occasion?.id;
  const occasionName = occasion?.name || "this occasion";

  try {
    const modelPath = getModelPath();
    const exists = await RNFS.exists(modelPath);

    if (!exists) {
      return "Model file not found. Please download the model first.";
    }

    // Initialize Llama context if not already done
    if (!llamaContext) {
      try {
        llamaContext = await initLlama({
          model: modelPath,
          use_mlock: true,
          n_ctx: 2048,
          n_gpu_layers: 0, // 0 for CPU-only, or more if available
        });
      } catch (e) {
        console.error('Failed to initialize llama context:', e);
        if (e.message.includes('install') || e.message.includes('null')) {
          return "Native AI engine not found. You must stop your current build and run 'npx react-native run-android' again to link the new AI module.";
        }
        return `Initialization Error: ${e.message}`;
      }
    }

    // 1. Detect if it's a general greeting
    const isGreeting = isGeneralGreeting(question);
    
    // 2. Get relevant context from RAG (skip for greetings)
    let context = "";
    if (!isGreeting) {
      context = getRelevantContext(question, 3, occasionId);
    }

    // 3. Format Prompt
    const prompt = formatPrompt(question, context, isGreeting, occasionName);

    // 4. Generate response
    const { text } = await llamaContext.completion({
      prompt: prompt,
      n_predict: isGreeting ? 48 : 512, // Increased for full, detailed answers
      stop: ['<|im_start|>', '<|im_end|>', 'User:', 'Assistant:', '### Context:'],
      temperature: isGreeting ? 0.7 : 0.15, // Low temperature for stability and factuality
      repeat_penalty: 1.3, // Prevents loops while allowing natural detail
      repeat_last_n: 128,   // Increased context for repetition check
    });

    return text.trim();
  } catch (error) {
    console.error('RAG Error:', error);
    return `Error: ${error.message}`;
  }
}

export async function isTransformersAvailable() {
   try {
     const path = getModelPath();
     return await RNFS.exists(path);
   } catch {
     return false;
   }
}
