import { GoogleGenAI, Type, GenerateContentResponse, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ChallengeSelections, GeneratedChallenge, AiChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const challengeSchema = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.ARRAY,
      description: "An array of code files for the CTF challenge.",
      items: {
        type: Type.OBJECT,
        properties: {
          fileName: { type: Type.STRING, description: "The name of the file, e.g., 'exploit.py' or 'vulnerable.c'." },
          language: { type: Type.STRING, description: "The programming language of the code, e.g., 'c', 'python'." },
          content: { type: Type.STRING, description: "The full source code of the file." }
        },
        required: ["fileName", "language", "content"]
      }
    },
    instructions: {
      type: Type.STRING,
      description: "Step-by-step instructions in Markdown on how to compile, run, and solve the challenge. Include a title, description, and a 'Solution' section."
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A creative and detailed DALL-E style prompt for a square (1:1 aspect ratio) conceptual image representing the challenge theme, e.g., 'A digital representation of a stack overflowing, with bits and bytes spilling out like water from a dam, neon green on a black background, cinematic lighting.' If no image is suitable, return an empty string."
    }
  },
  required: ["files", "instructions", "imagePrompt"]
};

const buildManualPrompt = (selections: ChallengeSelections): string => {
  let prompt = `Generate a complete Capture The Flag (CTF) challenge for educational and skill-development purposes, based on the user's specifications. The goal is to create a safe, self-contained exercise for learning about cybersecurity concepts.

  **Challenge Details:**
  - **Languages:** ${selections.languages.join(', ')}
  - **Topics:** ${selections.topics.join(', ')}
  - **Difficulty:** ${selections.difficulty}
  - **Code Style:** ${selections.codeStyle}
  - **Target Platform:** ${selections.platform}

  **CRITICAL REQUIREMENTS:**
  1.  The generated code MUST be correct and directly compilable for the specified **Target Platform**. Provide the exact compilation commands.
  2.  For C/C++, ensure all necessary standard library headers are included (e.g., \`<iostream>\`, \`<cstdio>\`, \`<cstring>\`, \`<unistd.h>\` for Linux).
  3.  **DO NOT** use functions that have been removed from modern C/C++ standards (like \`gets\`). If a vulnerable function is required for the challenge (e.g., for a buffer overflow), use a standard and still-available alternative like \`read\`, \`recv\`, or a simple \`strcpy\` into a fixed-size buffer. The goal is a challenge that compiles without errors, even if it's insecure by design.
  4.  Write clear, step-by-step instructions in Markdown. The instructions must cover compilation for the target platform, how to run the challenge, and a detailed solution walkthrough.
  5.  If applicable, use ASCII art diagrams within markdown code blocks to explain complex concepts (e.g., stack layout).
  6.  The flag should be in the format 'flag{...}' and be relevant to the challenge.
  
  Please provide the output in the specified JSON format.`;
  return prompt;
};

const buildAIGuidedPrompt = (summary: string): string => {
  return `Based on the following summary of a user's request, generate a complete Capture The Flag (CTF) challenge for educational and skill-development purposes.
  
  **Summary:**
  ${summary}
  
  **CRITICAL REQUIREMENTS:**
  1.  The generated code MUST be correct and directly compilable. Provide the exact compilation commands.
  2.  For C/C++, ensure all necessary standard library headers are included.
  3.  **DO NOT** use functions that have been removed from modern C/C++ standards (like \`gets\`). If a vulnerable function is required for the challenge, use a standard and still-available alternative. The challenge must compile without errors.
  4.  Write clear, step-by-step instructions on how to compile and run the challenge, plus a detailed solution walkthrough.
  5.  The flag should be in the format 'flag{...}'.
  
  Please provide the output in the specified JSON format.`;
};


export const generateChallenge = async (selections: ChallengeSelections): Promise<GeneratedChallenge> => {
    const prompt = buildManualPrompt(selections);
    return callGeminiForChallenge(prompt);
};

export const generateChallengeFromSummary = async (summary: string): Promise<GeneratedChallenge> => {
    const prompt = buildAIGuidedPrompt(summary);
    return callGeminiForChallenge(prompt);
};

const callGeminiForChallenge = async(prompt: string): Promise<GeneratedChallenge> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: challengeSchema,
            },
            safetySettings: safetySettings,
        });

        const challengeData = JSON.parse(response.text);
        
        if (challengeData.imagePrompt && challengeData.imagePrompt.trim() !== "") {
            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: challengeData.imagePrompt }] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
                safetySettings: safetySettings,
            });

            for (const part of imageResponse.candidates?.[0]?.content?.parts ?? []) {
                if (part.inlineData) {
                    challengeData.image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        return challengeData as GeneratedChallenge;
    } catch (error) {
        console.error("Error generating challenge:", error);
        throw new Error("Failed to generate challenge. Please check your API key and try again.");
    }
}

export const processAiConversation = async (history: AiChatMessage[]): Promise<string> => {
    if (history.length === 0) {
        // This case should not be reached with the new UI logic, but as a safeguard:
        console.error("processAiConversation was called with an empty history.");
        throw new Error("Cannot process an empty conversation history.");
    }
    
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful assistant for a cybersecurity education platform. You are guiding a user to create a custom practice exercise (a CTF challenge). Your goal is to ask short, clarifying questions to understand what they want to learn about in a safe and educational context.
    - Ask one question at a time.
    - Be friendly and conversational. Your goal is to gather requirements.
    - The user will tell you when they are done providing information by clicking a 'Done' button.`;
    
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
            safetySettings: safetySettings,
        });
        return response.text;
    } catch (error) {
        console.error("Error in AI conversation:", error);
        throw new Error("Failed to get response from AI. Please try again.");
    }
};

export const summarizeConversation = async (history: AiChatMessage[]): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a security education assistant. Your task is to summarize a user's request for a practice cybersecurity exercise (a CTF challenge). The summary is for another AI that will create the educational material.
- The user's conversation is about creating a safe, controlled environment for learning about software vulnerabilities.
- Your summary should be a concise, one-sentence instruction based on the user's final requirements.
- The summary must be purely instructional. Do NOT add any conversational text like "Okay, here is the summary:".
- Example output: "A C language challenge focusing on a Stack Buffer Overflow vulnerability with basic Return Oriented Programming (ROP), on a Linux (x86-64) platform, with heavily commented code for a beginner."`;
    
    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
            safetySettings: safetySettings,
        });
        
        const text = response.text;

        if (typeof text === 'string' && text.trim().length > 0) {
            return text.trim();
        } else {
            // This case handles a valid response object that lacks text, which would cause the error.
            console.error("Summarization response did not contain text content:", response);
            throw new Error("The AI could not generate a summary from this conversation. Please try again or rephrase your request.");
        }
    } catch (error) {
        console.error("Error summarizing conversation:", error);
        // This will catch network errors or other issues with the API call itself.
        throw new Error("Failed to summarize the conversation. Please check your connection and try again.");
    }
};