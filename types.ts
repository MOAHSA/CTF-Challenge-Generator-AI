
export interface ChallengeSelections {
  languages: string[];
  topics: string[];
  difficulty: string;
  codeStyle: string;
  platform: string;
}

export interface GeneratedFile {
  fileName: string;
  language: string;
  content: string;
}

export interface GeneratedChallenge {
  files: GeneratedFile[];
  instructions: string;
  imagePrompt: string;
  image?: string;
}

export interface AiChatMessage {
    role: 'user' | 'model';
    text: string;
}