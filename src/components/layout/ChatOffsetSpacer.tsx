import React from 'react';
// Reserves horizontal space so main content never sits beneath the fixed AI chat
// Controlled via CSS var --ai-chat-offset set by AiChatSidebar to ensure perfect sync
export const ChatOffsetSpacer: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block shrink-0 transition-all duration-300"
      style={{ width: 'var(--ai-chat-offset, 0px)' }}
    />
  );
};
