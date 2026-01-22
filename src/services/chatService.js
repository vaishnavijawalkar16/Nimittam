import { getActiveModel } from '../storage/modelStorage';
import { generateText } from './llamaService';
import { retrieveContext } from './ragService';

export async function getBotReply(text) {
  const model = await getActiveModel();
  if (!model) return 'Please download and select a model first.';

  const context = retrieveContext(text);

  const prompt = `
<s>[INST]
You are a helpful assistant.

Context:
${context || 'No additional context available.'}

User question:
${text}
[/INST]
`;

  const answer = await generateText({
    modelPath: model.path,
    prompt
  });

  return answer;
}
