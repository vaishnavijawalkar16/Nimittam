import { initLlama } from 'llama.rn';
import { getModelPath, getVisionModelPath, getActiveModel } from './modelService';
import { getRelevantContext, formatPrompt, isGeneralGreeting } from './ragService';
import RNFS from 'react-native-fs';

let llamaContext = null;
let currentLoadedModelId = null;

export async function getBotReply(payload, onToken) {
  const isImage = payload.type === 'image';
  const question = isImage ? "Can you explain what is in this image and provide relevant details?" : payload.value;
  const occasion = payload.occasion;
  const occasionId = occasion?.id;
  const occasionName = occasion?.name || "this occasion";
  const targetLanguage = payload.language || 'English';

  try {
    const activeModelId = await getActiveModel();
    if (!activeModelId) {
      return { text: "No model active. Please select one from the menu.", suggestedQuestions: [] };
    }

    const modelPath = await getModelPath();
    const exists = await RNFS.exists(modelPath);

    if (!exists) {
      return { text: "Model file not found. Please download the model first.", suggestedQuestions: [] };
    }

    // Initialize Llama context if not already done, or if the model swapped
    if (!llamaContext || currentLoadedModelId !== activeModelId) {
      try {
        if (llamaContext && llamaContext.release) {
          await llamaContext.release();
        }
        llamaContext = null;

        const isGemmaVision = activeModelId === 'gemma_vision';
        const isGemma = activeModelId.startsWith('gemma');
        
        const initConfig = {
          model: modelPath,
          use_mlock: true,
          n_ctx: isGemma ? 4096 : 2048,
          n_gpu_layers: 0,
        };

        if (isGemmaVision) {
          const visionPath = await getVisionModelPath();
          if (visionPath && await RNFS.exists(visionPath)) {
            initConfig.mmproj = visionPath;
          }
        }

        llamaContext = await initLlama(initConfig);
        currentLoadedModelId = activeModelId;
      } catch (e) {
        console.error('Failed to initialize llama context:', e);
        return { text: `Initialization Error: ${e.message}`, suggestedQuestions: [] };
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
    const prompt = formatPrompt(question, context, isGreeting, occasionName, activeModelId, isImage, targetLanguage);

    const completionParams = {
      prompt: prompt,
      n_predict: isGreeting ? 96 : 768, 
      stop: activeModelId.startsWith('gemma') 
        ? ['<end_of_turn>', '<start_of_turn>', 'User:', 'Assistant:', '### Context:']
        : ['<|im_start|>', '<|im_end|>', 'User:', 'Assistant:', '### Context:'],
      temperature: 0, 
      repeat_penalty: 1.2, 
      repeat_last_n: 64,   
    };

    if (isImage) {
      const imageUri = payload.value.startsWith('file://') ? payload.value.replace('file://', '') : payload.value;
      completionParams.images = [imageUri];
    }

    // 4. Generate response with streaming
    let fullText = "";
    const { text } = await llamaContext.completion(completionParams, (event) => {
      if (event.token) {
        fullText += event.token;
        if (onToken) {
          // If we encounter the suggested questions tag during streaming, hide it from the UI
          const displayPart = fullText.split('[SUGGESTED_QUESTIONS]')[0];
          onToken(displayPart.trim());
        }
      }
    });

    const trimmedText = text.trim();

    // 5. Separate answer from suggested questions
    let finalAnswer = trimmedText;
    let suggestedQuestions = [];

    if (trimmedText.includes('[SUGGESTED_QUESTIONS]')) {
      const parts = trimmedText.split('[SUGGESTED_QUESTIONS]');
      finalAnswer = parts[0].trim();
      const suggestionsPart = parts[1] || "";
      suggestedQuestions = suggestionsPart.split('|').map(q => q.trim()).filter(q => q.length > 0);
    }

    return {
      text: finalAnswer,
      suggestedQuestions: suggestedQuestions
    };
  } catch (error) {
    console.error('Chat Error:', error);
    return {
      text: `Error: ${error.message}`,
      suggestedQuestions: []
    };
  }
}

export async function isTransformersAvailable() {
   try {
     const path = await getModelPath();
     return await RNFS.exists(path);
   } catch {
     return false;
   }
}
