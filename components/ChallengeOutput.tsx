import React, { useState, useEffect, useRef } from 'react';
import { GeneratedChallenge } from '../types';

interface ChallengeOutputProps {
  challenge: GeneratedChallenge;
}

// Add JSZip to the global window interface for TypeScript
declare global {
  interface Window {
    JSZip: any;
  }
}

const ChallengeOutput: React.FC<ChallengeOutputProps> = ({ challenge }) => {
  const [activeTab, setActiveTab] = useState(0);

  const allItems = [
    { name: 'Instructions', type: 'instructions' },
    ...challenge.files.map(file => ({ name: file.fileName, type: 'file' }))
  ];

  const renderContent = () => {
    const activeItem = allItems[activeTab];
    if (activeItem.type === 'instructions') {
      return <MarkdownRenderer content={challenge.instructions} />;
    }
    const file = challenge.files.find(f => f.fileName === activeItem.name);
    return file ? <CodeBlock content={file.content} language={file.language} /> : null;
  };
  
  const handleDownloadZip = () => {
    if (!window.JSZip) {
      console.error("JSZip library not found.");
      alert("Could not download zip. The JSZip library is missing.");
      return;
    }
    const zip = new window.JSZip();

    // Add instructions as a markdown file
    zip.file("instructions.md", challenge.instructions);

    // Add all code files
    challenge.files.forEach(file => {
      zip.file(file.fileName, file.content);
    });
    
    // Add the image if it exists
    if (challenge.image) {
        // The image is a base64 data URL, e.g., data:image/png;base64,iVBORw0KGgo...
        const match = challenge.image.match(/^data:(image\/(.+));base64,(.*)$/);
        if (match) {
            const ext = match[2];
            const base64Data = match[3];
            zip.file(`challenge-image.${ext}`, base64Data, { base64: true });
        }
    }

    zip.generateAsync({ type: "blob" }).then((content: Blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "ctf-challenge.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }).catch((err: any) => {
        console.error("Failed to generate zip file", err);
        alert("An error occurred while creating the zip file.");
    });
  };

  return (
    <div className="mt-8 border border-gray-700 rounded-lg bg-gray-800/50">
      <div className="flex flex-col md:flex-row">
        {challenge.image && (
          <div className="w-full md:w-1/3 xl:w-1/4 p-4 flex-shrink-0">
            <img src={challenge.image} alt="Challenge theme" className="rounded-lg object-cover w-full h-auto aspect-square border-2 border-gray-600"/>
          </div>
        )}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex justify-between items-center border-b border-gray-700">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {allItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(index)}
                  className={`${
                    activeTab === index
                      ? 'border-green-400 text-green-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
            <button 
                onClick={handleDownloadZip}
                className="ml-4 flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-green-400 font-bold py-2 px-3 rounded-md transition-colors text-sm"
                aria-label="Download all files as a ZIP archive"
            >
                Download ZIP
            </button>
          </div>
          <div className="mt-4">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ content, language }: { content: string; language: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900 rounded-lg relative group">
             <button
                onClick={handleCopy}
                className="absolute top-2 right-3 p-1 text-xs rounded-md bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:ring-2 focus:ring-green-500"
                aria-label="Copy code"
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
            <div className="absolute top-2.5 left-3 text-xs text-gray-500 font-sans uppercase tracking-wider">{language}</div>
            <pre className="p-4 pt-8 text-sm text-gray-200 overflow-x-auto">
                <code>{content}</code>
            </pre>
        </div>
    );
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const pres = contentRef.current.querySelectorAll('pre');
    pres.forEach(pre => {
        if (pre.querySelector('button.copy-btn')) return;

        const code = pre.querySelector('code');
        if (!code) return;

        pre.classList.add('relative', 'group');
        
        const lang = pre.dataset.lang;
        if (lang) {
            const langDiv = document.createElement('div');
            langDiv.className = 'absolute top-2.5 left-3 text-xs text-gray-500 font-sans uppercase tracking-wider';
            langDiv.innerText = lang;
            pre.appendChild(langDiv);
            if (pre) {
                pre.classList.add('pt-8');
            }
        }

        const button = document.createElement('button');
        button.innerText = 'Copy';
        button.className = 'copy-btn absolute top-2 right-3 p-1 text-xs rounded-md bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:ring-2 focus:ring-green-500';

        button.onclick = () => {
            navigator.clipboard.writeText(code.innerText);
            button.innerText = 'Copied!';
            setTimeout(() => {
                button.innerText = 'Copy';
            }, 2000);
        };
        pre.appendChild(button);
    });
  }, [content]);

  const parts = content.split(/(```[\s\S]*?```)/g);

  const formattedContent = parts.map(part => {
      if (part.startsWith('```')) {
          const langMatch = part.match(/^```(\w*)\n?/);
          const language = langMatch ? langMatch[1] : '';
          const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return `<pre data-lang="${language}" class="bg-gray-900 p-4 my-4 rounded-md text-sm text-gray-200 overflow-x-auto"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
      }
      
      return part
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-green-300 mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-green-400 mt-6 mb-3">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-green-500 mt-8 mb-4">$1</h1>')
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-600 pl-4 my-4 italic text-gray-400">$1</blockquote>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-green-300 rounded px-1.5 py-0.5 font-mono text-sm">$1</code>')
        .replace(/^(?:\s*[\-\*]\s)(.*)/gim, '<li class="ml-6 list-disc">$1</li>')
        .replace(/\n/g, '<br />')
        .replace(/<br \/>(\s*<(li|blockquote|h1|h2|h3))/g, '$1')
        .replace(/(<\/li>)<br \>/g, '$1');
  }).join('');

  return (
    <div ref={contentRef} className="prose prose-invert text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedContent }} />
  );
};

export default ChallengeOutput;