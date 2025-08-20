import React from 'react';

interface ChatOffsetSpacerProps {
  isCollapsed: boolean;
}

// Reserves horizontal space so main content never sits beneath the fixed AI chat
// Collapsed = 4rem (matches w-16 in AiChatSidebar). Expanded = 24rem (matches md:w-96)
export const ChatOffsetSpacer: React.FC<ChatOffsetSpacerProps> = ({ isCollapsed }) => {
  return (
    <div
      aria-hidden="true"
      className={`hidden md:block shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-96'}`}
    />
  );
};
