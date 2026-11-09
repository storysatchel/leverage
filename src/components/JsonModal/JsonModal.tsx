import React, { useState, useEffect } from 'react';
import { validateCharacterJson } from '../../lib/leverage';
import { ComicButton } from '../ui/ComicButton';
import { ValidationErrorBox } from './ValidationErrorBox';
import { SchemaCopyLink } from './SchemaCopyLink';
import { CopyDataButton } from './CopyDataButton';
import { QRCodeUrl } from './QRCodeUrl';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onImport: (data: any) => void;
}

export default function JsonModal({ isOpen, onClose, data, onImport }: JsonModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(data, null, 4));
      setErrors([]);
    }
  }, [isOpen, data]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    
    const result = validateCharacterJson(text);
    if (!result.success) {
      setErrors(result.errors);
    } else {
      setErrors([]);
    }
  };

  const handleImport = () => {
    if (errors.length > 0) return;
    
    const result = validateCharacterJson(jsonText);
    if (result.success) {
      onImport(result.data);
      onClose();
    } else {
      setErrors(result.errors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="font-comic-title tracking-widest text-5xl text-black mb-2 flex-shrink-0 uppercase">
          JSON Import / Export
        </h2>
        
        <p className="text-black font-bold font-comic-label mb-4 text-sm flex-shrink-0 opacity-80">
          Copy this data to save your character, or paste a previously saved JSON file here to load it. 
          Portraits are included and can make the JSON and sharing link large.
        </p>
        
        <ValidationErrorBox errors={errors} />

        <div className="relative flex-grow flex flex-col mb-6 group">
          <CopyDataButton data={jsonText} />
          <QRCodeUrl />
          <textarea
            className="comic-textarea mb-0"
            value={jsonText}
            onChange={handleTextChange}
            placeholder="Paste character JSON here..."
            spellCheck={false}
          />
        </div>

        <div className="flex justify-between items-end flex-shrink-0">
          <SchemaCopyLink />
          
          <div className="flex gap-4">
            <ComicButton variant="white" onClick={onClose}>
              CANCEL
            </ComicButton>
            <ComicButton 
              variant="blue" 
              onClick={handleImport}
              disabled={errors.length > 0}
            >
              LOAD DATA
            </ComicButton>
          </div>
        </div>
      </div>
    </div>
  );
}
