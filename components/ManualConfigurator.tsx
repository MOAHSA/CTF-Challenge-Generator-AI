
import React from 'react';
import { ChallengeSelections } from '../types';
import { AVAILABLE_LANGUAGES, AVAILABLE_TOPICS, AVAILABLE_DIFFICULTIES, AVAILABLE_CODE_STYLES, AVAILABLE_PLATFORMS } from '../constants';

interface ManualConfiguratorProps {
  selections: ChallengeSelections;
  onSelectionsChange: (selections: ChallengeSelections) => void;
}

const RadioGroup = ({ title, options, selected, onChange, name }: { title: string; options: string[]; selected: string; onChange: (value: string) => void; name: string; }) => (
  <section>
    <h3 className="text-xl font-bold text-green-400 mb-4 border-b-2 border-gray-700 pb-2">{title}</h3>
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option} className="flex items-center space-x-3 text-gray-300 cursor-pointer hover:text-white transition-colors">
          <input
            type="radio"
            name={name}
            className="h-5 w-5 bg-gray-700 border-gray-600 text-green-500 focus:ring-green-600 accent-green-500"
            checked={selected === option}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </section>
);

const ManualConfigurator: React.FC<ManualConfiguratorProps> = ({ selections, onSelectionsChange }) => {
  
  const handleLanguageChange = (lang: string) => {
    const newLanguages = selections.languages.includes(lang)
      ? selections.languages.filter((l) => l !== lang)
      : [...selections.languages, lang];
    onSelectionsChange({ ...selections, languages: newLanguages });
  };

  const handleTopicChange = (topic: string) => {
    const newTopics = selections.topics.includes(topic)
      ? selections.topics.filter((t) => t !== topic)
      : [...selections.topics, topic];
    onSelectionsChange({ ...selections, topics: newTopics });
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h3 className="text-xl font-bold text-green-400 mb-4 border-b-2 border-gray-700 pb-2">Languages</h3>
          <div className="space-y-3">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <label key={lang} className="flex items-center space-x-3 text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-600 accent-green-500"
                  checked={selections.languages.includes(lang)}
                  onChange={() => handleLanguageChange(lang)}
                />
                <span>{lang}</span>
              </label>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-xl font-bold text-green-400 mb-4 border-b-2 border-gray-700 pb-2">Topics / Vulnerabilities</h3>
          <div className="space-y-3">
            {AVAILABLE_TOPICS.map((topic) => (
              <label key={topic} className="flex items-center space-x-3 text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-600 accent-green-500"
                  checked={selections.topics.includes(topic)}
                  onChange={() => handleTopicChange(topic)}
                />
                <span>{topic}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="grid md:grid-cols-3 gap-8">
            <RadioGroup title="Difficulty" name="difficulty" options={AVAILABLE_DIFFICULTIES} selected={selections.difficulty} onChange={(val) => onSelectionsChange({...selections, difficulty: val})} />
            <RadioGroup title="Code Style" name="code-style" options={AVAILABLE_CODE_STYLES} selected={selections.codeStyle} onChange={(val) => onSelectionsChange({...selections, codeStyle: val})} />
            <RadioGroup title="Target Platform" name="platform" options={AVAILABLE_PLATFORMS} selected={selections.platform} onChange={(val) => onSelectionsChange({...selections, platform: val})} />
        </div>
      </div>
    </>
  );
};

export default ManualConfigurator;