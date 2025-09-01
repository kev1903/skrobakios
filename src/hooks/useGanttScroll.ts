import { useEffect, useRef, useCallback } from 'react';

export const useGanttScroll = () => {
  const taskListRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  const syncVerticalScroll = useCallback((source: HTMLDivElement, target: HTMLDivElement) => {
    if (source.scrollTop !== target.scrollTop) {
      target.scrollTop = source.scrollTop;
    }
  }, []);

  const syncHorizontalScroll = useCallback((source: HTMLDivElement, target: HTMLDivElement) => {
    if (source.scrollLeft !== target.scrollLeft) {
      target.scrollLeft = source.scrollLeft;
    }
  }, []);

  useEffect(() => {
    const taskList = taskListRef.current;
    const timelineHeader = timelineHeaderRef.current;
    const timelineBody = timelineBodyRef.current;

    if (!taskList || !timelineHeader || !timelineBody) return;

    const handleTaskListScroll = () => {
      syncVerticalScroll(taskList, timelineBody);
    };

    const handleTimelineBodyScroll = () => {
      syncVerticalScroll(timelineBody, taskList);
      syncHorizontalScroll(timelineBody, timelineHeader);
    };

    const handleTimelineHeaderScroll = () => {
      syncHorizontalScroll(timelineHeader, timelineBody);
    };

    taskList.addEventListener('scroll', handleTaskListScroll);
    timelineBody.addEventListener('scroll', handleTimelineBodyScroll);
    timelineHeader.addEventListener('scroll', handleTimelineHeaderScroll);

    return () => {
      taskList.removeEventListener('scroll', handleTaskListScroll);
      timelineBody.removeEventListener('scroll', handleTimelineBodyScroll);
      timelineHeader.removeEventListener('scroll', handleTimelineHeaderScroll);
    };
  }, [syncVerticalScroll, syncHorizontalScroll]);

  return {
    taskListRef,
    timelineHeaderRef,
    timelineBodyRef
  };
};