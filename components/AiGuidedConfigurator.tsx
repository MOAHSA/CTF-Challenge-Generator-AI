import React, { useState, useEffect, useRef } from 'react';
import { AiChatMessage } from '../types';
import { processAiConversation, summarizeConversation } from '../services/geminiService';

interface AiGuidedConfiguratorProps {
  onSummaryReady: (summary: string) => void;
  isGenerating: boolean;
}

const getInitialMessage = (): AiChatMessage => ({
    role: 'model',
    text: "Welcome! What cybersecurity topic are you interested in exploring for your CTF challenge? For example, stack overflows, reverse engineering, or something else?"
});

const AiGuidedConfigurator: React.FC<AiGuidedConfiguratorProps> = ({ onSummaryReady, isGenerating }) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([getInitialMessage()]);
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isAiTyping || summary) return;

    const newMessages: AiChatMessage[] = [...messages, { role: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsAiTyping(true);

    try {
      const aiResponse = await processAiConversation(newMessages);
      setMessages([...newMessages, { role: 'model', text: aiResponse }]);
    } catch(e) {
      setMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again." }]);
    }
    
    setIsAiTyping(false);
  };

  const handleDone = async () => {
    if (isAiTyping || summary) return;

    setIsAiTyping(true);
    try {
        const summaryText = await summarizeConversation(messages);
        setSummary(summaryText);
        onSummaryReady(summaryText);
        setMessages(prev => [...prev, { role: 'model', text: `Here is the summary:\n\n**${summaryText}**\n\nIf that looks right, click the "Generate Challenge" button below.` }]);
    } catch (e) {
        console.error("Summarization error:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setMessages(prev => [...prev, { role: 'model', text: `Error: ${errorMessage}` }]);
    } finally {
        setIsAiTyping(false);
    }
  };


  return (
    <div className="flex flex-col h-[50vh] bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-green-800 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={summary ? "Ready to generate!" : "Type your answer..."}
          disabled={isAiTyping || !!summary || isGenerating}
          className="flex-1 bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button type="submit" disabled={isAiTyping || !!summary || isGenerating} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
          Send
        </button>
        <button type="button" onClick={handleDone} disabled={isAiTyping || !!summary || isGenerating || messages.length < 3} className="bg-gray-700 text-green-400 font-bold py-2 px-4 rounded-md hover:bg-gray-600 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            Done
        </button>
      </form>
    </div>
  );
};

export default AiGuidedConfigurator;