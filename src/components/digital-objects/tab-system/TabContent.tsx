import { DigitalObjectsTab } from "./types";

interface TabContentProps {
  tabs: DigitalObjectsTab[];
  activeTab: string;
  previousTab: string | null;
  isAnimating: boolean;
  children: (activeTabId: string) => React.ReactNode;
}

export const TabContent = ({
  tabs,
  activeTab,
  previousTab,
  isAnimating,
  children
}: TabContentProps) => {
  return (
    <div className="relative overflow-hidden">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isPrevious = previousTab === tab.id;
        const shouldShow = isActive || (isPrevious && isAnimating);
        
        if (!shouldShow) return null;
        
        let animationClass = '';
        if (isAnimating) {
          if (isPrevious) {
            // Slide out to the left
            animationClass = 'animate-[slide-out-left_150ms_ease-in-out_forwards]';
          } else if (isActive) {
            // Slide in from the right  
            animationClass = 'animate-[slide-in-right_300ms_ease-in-out_150ms_both]';
          }
        }
        
        return (
          <div 
            key={tab.id} 
            className={`${isActive && !isAnimating ? 'block' : 'absolute inset-0'} ${animationClass}`}
          >
            {children(tab.id)}
          </div>
        );
      })}
    </div>
  );
};