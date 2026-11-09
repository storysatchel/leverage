import React, { useState } from 'react';
import { z } from 'zod';
import { characterSchema } from '../../lib/leverage';

export const SchemaCopyLink: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const schema = (z as any).toJSONSchema(characterSchema);
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="comic-link-subtle"
      onClick={handleCopy}
    >
      {copied ? 'COPIED!' : 'Copy Blank Schema'}
    </button>
  );
};
