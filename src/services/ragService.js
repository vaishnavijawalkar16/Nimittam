
import knowledgeData from '../data/knowledge.json';
import kumbhData from '../data/kumbh.json';
import pandharpurData from '../data/pandharpur.json';

/**
 * Simple RAG Service for Nimittam
 */

// Combine and pre-process chunks from all available datasets
const allDATA = [
  ...knowledgeData.map(d => ({ ...d, dataset: 'namokar_tirth' })),
  ...kumbhData.map(d => ({ ...d, dataset: 'kumbh_mela' })),
  ...pandharpurData.map(d => ({ ...d, dataset: 'pandharpur' }))
];

const chunks = allDATA.map(item => {
  const content = item.content.join('\n');
  const rules = item.rules ? (Array.isArray(item.rules) ? item.rules.join('\n') : item.rules) : '';
  const facilities = item.facilities ? (Array.isArray(item.facilities) ? item.facilities.join('\n') : item.facilities) : '';
  const tags = item.tags?.join(', ') || '';
  
  const text = [
    `Title: ${item.title}`,
    rules ? `Rules/Conduct:\n${rules}` : '',
    `Content:\n${content}`,
    facilities ? `Facilities:\n${facilities}` : ''
  ].filter(Boolean).join('\n');

  const titleTokens = item.title.toLowerCase().split(/[^a-z0-9]+/);
  const tagTokens = (item.tags || []).map(t => t.toLowerCase());
  const bodyTokens = (item.category + ' ' + content + ' ' + rules + ' ' + facilities).toLowerCase().split(/[^a-z0-9]+/);

  return {
    id: item.id,
    dataset: item.dataset,
    text,
    titleTokens,
    tagTokens,
    bodyTokens
  };
});

function fuzzyMatch(s1, s2) {
  if (s1 === s2) return true;
  if (s1.length < 4 || s2.length < 4) return s1 === s2;
  if (Math.abs(s1.length - s2.length) > 1) return false;

  let edits = 0;
  let i = 0, j = 0;
  while (i < s1.length && j < s2.length) {
    if (s1[i] !== s2[j]) {
      edits++;
      if (edits > 1) return false;
      if (s1.length > s2.length) i++;
      else if (s2.length > s1.length) j++;
      else { i++; j++; }
    } else {
      i++; j++;
    }
  }
  return (edits + (s1.length - i) + (s2.length - j)) <= 1;
}

/**
 * Retrieves relevant context chunks based on query and optional occasion filter
 */
export function getRelevantContext(query, k = 3, occasionId = null) {
  const queryTokens = query.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 2);
  if (queryTokens.length === 0) return "";

  const scoredChunks = chunks
    .filter(chunk => !occasionId || chunk.dataset === occasionId)
    .map(chunk => {
      let score = 0;
      queryTokens.forEach(token => {
        if (chunk.titleTokens.some(t => fuzzyMatch(t, token))) score += 10;
        if (chunk.tagTokens.some(t => fuzzyMatch(t, token))) score += 5;
        if (chunk.bodyTokens.some(t => fuzzyMatch(t, token))) score += 1;
      });
      return { ...chunk, score };
    });

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter(c => c.score >= 5)
    .map(c => c.text)
    .join('\n\n---\n\n');
}

export function isGeneralGreeting(query) {
  const interactions = [
    'hi', 'hello', 'hey', 'namaste', 'jai jinendra', 'jaijinendra',
    'pranam', 'vandan', 'khama ghani', 'om shanti', 'good', 'nice',
    'great', 'thanks', 'thank you', 'ok', 'okay', 'help', 'who are you',
    'what can you do', 'how are you', 'gm', 'gn'
  ];
  
  const lowerQuery = query.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  if (lowerQuery.length > 35) return false;

  return interactions.some(g => {
    if (lowerQuery === g || lowerQuery.startsWith(g + ' ') || lowerQuery.endsWith(' ' + g)) return true;
    if (lowerQuery.includes(g) && lowerQuery.length <= g.length + 3) return true;
    return false;
  });
}

export function formatPrompt(question, context, isGreeting = false, occasionName = "this occasion", activeModelId = 'gemma_vision', isImage = false, targetLanguage = 'English') {
  const isHindi = targetLanguage.toLowerCase() === 'hindi';
  
  const persona = `You are the Ai guide who will answer the questions. Your goal is to be helpful, wise, and concise. 
IMPORTANT: Your entire response including suggested questions must be in ${targetLanguage}.`;

  const isGemma = activeModelId.startsWith('gemma');

  if (isGreeting) {
    if (isGemma) {
      return `<start_of_turn>user
[SYSTEM INSTRUCTIONS]
${persona}
- Greet with a warm spiritual welcome as the Ai guide in ${targetLanguage}.
- Be sweet, simple, and short.
- Never say "I am Nimittam".
[END INSTRUCTIONS]

User statement: ${question}${isImage ? '\n<img>\n' : ''}<end_of_turn>
<start_of_turn>model
`;
    } else {
      return `<|im_start|>system
${persona}
- Greet with a warm spiritual welcome as the Ai guide in ${targetLanguage}.
- Be sweet, simple, and short.
- Never say "I am Nimittam".
<|im_end|>
<|im_start|>user
${question}${isImage ? '\n<img>\n' : ''}<|im_end|>
<|im_start|>assistant
`;
    }
  }

  const instructions = `
### Instructions for a Perfect Answer:
1. QUALITY: Provide a full, complete, and structured answer using the "Context" below. Avoid half-finished thoughts.
2. STRUCTURE: Use bullet points or numbered lists for rules, facilities, or multiple items.
3. NO REPETITION: Do not repeat sentences or facts. Consolidate similar information.
4. RAG & GENERAL QUESTIONS: If the question is about the context provided, STRICTLY base your answer ONLY on the Context. If the context lacks the answer, say you don't know based on the provided info. HOWEVER, if the user asks a normal general question (e.g., math, casual chat, general knowledge), answer it correctly using your general wisdom.
5. CONCISENESS: Be detailed but not over-detailed. Stay relevant to the user's question.
6. COMPLETENESS: Always double-check that your response is a complete thought before ending.
7. SUGGESTED QUESTIONS: Based on your answer and the context, provide exactly 3 relevant follow-up questions for the user. These must be at the very end of your response, strictly following the delimiter [SUGGESTED_QUESTIONS] and separated by a pipe character |.
8. LANGUAGE: Provide the entire answer and the suggested questions in ${targetLanguage}.

Example (if Hindi): [SUGGESTED_QUESTIONS] प्रश्न 1 | प्रश्न 2 | प्रश्न 3

### Context:
${context || 'No specific data found for this query.'}
`;

  if (isGemma) {
    return `<start_of_turn>user
[SYSTEM INSTRUCTIONS]
${persona}
${instructions}
[END INSTRUCTIONS]

User Question: ${question}${isImage ? '\n<img>\n' : ''}<end_of_turn>
<start_of_turn>model
`;
  } else {
    return `<|im_start|>system
${persona}
${instructions}
<|im_end|>
<|im_start|>user
${question}${isImage ? '\n<img>\n' : ''}<|im_end|>
<|im_start|>assistant
`;
  }
}
