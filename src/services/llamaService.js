import { LlamaContext } from 'react-native-llama-cpp';

let context = null;

export async function generateText({ modelPath, prompt }) {
  if (!context) {
    context = await LlamaContext.create({
      model: modelPath,
      n_ctx: 2048,
    });
  }

  const result = await context.completion({
    prompt,
    n_predict: 256,
    temperature: 0.7,
    top_p: 0.9
  });

  return result.text;
}
