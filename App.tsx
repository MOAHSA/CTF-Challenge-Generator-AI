import React, { useState } from 'react';
import { ChallengeSelections, GeneratedChallenge } from './types';
import { generateChallenge, generateChallengeFromSummary } from './services/geminiService';
import ManualConfigurator from './components/ManualConfigurator';
import AiGuidedConfigurator from './components/AiGuidedConfigurator';
import ChallengeOutput from './components/ChallengeOutput';
import LoadingSpinner from './components/LoadingSpinner';
import CodeIcon from './components/icons/CodeIcon';
import SparklesIcon from './components/icons/SparklesIcon';

type Mode = 'manual' | 'ai_guided';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('manual');
  const [selections, setSelections] = useState<ChallengeSelections>({ 
    languages: [], 
    topics: [],
    difficulty: 'Easy',
    codeStyle: 'Standard',
    platform: 'Linux (x86-64)'
  });
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generatedChallenge, setGeneratedChallenge] = useState<GeneratedChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGenerateDisabled = () => {
    if (isLoading) return true;
    if (mode === 'manual') {
      return selections.languages.length === 0 || selections.topics.length === 0;
    }
    if (mode === 'ai_guided') {
      return !aiSummary;
    }
    return true;
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedChallenge(null);

    try {
      let challenge: GeneratedChallenge;
      if (mode === 'manual') {
        challenge = await generateChallenge(selections);
      } else if (aiSummary) {
        challenge = await generateChallengeFromSummary(aiSummary);
      } else {
        throw new Error("Cannot generate challenge without selections or AI summary.");
      }
      setGeneratedChallenge(challenge);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Extracted props type to an alias to resolve TypeScript inference issue.
  type ModeButtonProps = {
    activeMode: Mode;
    targetMode: Mode;
    children: React.ReactNode;
  };

  // FIX: Explicitly typed component with React.FC to fix TypeScript inference issue.
  const ModeButton: React.FC<ModeButtonProps> = ({ activeMode, targetMode, children }) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
        ${activeMode === targetMode ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-mono p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">
            CTF Challenge Generator AI
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Craft your next pwn or reverse engineering challenge.
          </p>
        </header>

        <main>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 shadow-2xl shadow-green-900/10">
            <div className="max-w-md mx-auto mb-8 grid grid-cols-2 gap-4">
              <ModeButton activeMode={mode} targetMode='manual'>
                <CodeIcon className="w-5 h-5" />
                Manual Setup
              </ModeButton>
              <ModeButton activeMode={mode} targetMode='ai_guided'>
                <SparklesIcon className="w-5 h-5" />
                AI Guided
              </ModeButton>
            </div>

            {mode === 'manual' ? (
              <ManualConfigurator selections={selections} onSelectionsChange={setSelections} />
            ) : (
              <AiGuidedConfigurator onSummaryReady={setAiSummary} isGenerating={isLoading} />
            )}

            <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col items-center">
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled()}
                className="w-full max-w-xs bg-green-500 text-gray-900 font-bold text-lg py-3 px-6 rounded-lg shadow-lg
                hover:bg-green-400 transition-all duration-200 ease-in-out
                disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed
                transform hover:scale-105 disabled:transform-none"
              >
                {isLoading ? 'Generating...' : 'Generate Challenge'}
              </button>
            </div>
          </div>
          
          {isLoading && <LoadingSpinner message={mode === 'ai_guided' ? "AI is crafting your challenge..." : "Generating from your selections..."} />}
          
          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {generatedChallenge && <ChallengeOutput challenge={generatedChallenge} />}
        </main>
        
        <footer className="text-center text-gray-600 mt-12 pb-4">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;