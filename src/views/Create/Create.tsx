"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { PageTemplate } from '../../components/templates/PageTemplate';
import { CreateMissionForm } from '../../components/organisms/CreateMissionForm';
import { CreateTodoForm } from '../../components/organisms/CreateTodoForm';

type CreateType = 'mission' | 'todo';

export const Create = () => {
  const [activeTab, setActiveTab] = useState<CreateType>('mission');

  const containerRef = useRef<HTMLDivElement>(null);
  const tabMissionRef = useRef<HTMLButtonElement>(null);
  const tabTodoRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const hasMountedRef = useRef(false);

  const updateIndicatorPosition = useCallback(() => {
    const buttons = {
      mission: tabMissionRef.current,
      todo: tabTodoRef.current,
    };
    const activeButton = buttons[activeTab];
    const container = containerRef.current;
    
    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    updateIndicatorPosition();
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (indicatorRef.current) {
        indicatorRef.current.style.transition = 'none';
        requestAnimationFrame(() => {
          if (indicatorRef.current) {
            indicatorRef.current.style.transition = '';
          }
        });
      }
    }
  }, [updateIndicatorPosition]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateIndicatorPosition();
      });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [updateIndicatorPosition]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [updateIndicatorPosition]);

  return (
    <PageTemplate>
      <div className="mt-4 pb-32 space-y-6">
        
        {/* Toggle Switcher capsule model with smooth sliding background */}
        <div 
          ref={containerRef} 
          className="relative bg-[#E5E7EB] p-1 rounded-full flex max-w-md mx-auto animate-fadeIn overflow-hidden"
        >
          {/* Sliding Background Indicator */}
          <div
            ref={indicatorRef}
            className="absolute top-1 bottom-1 bg-[#7DB8E0] rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
          
          <button
            ref={tabMissionRef}
            type="button"
            onClick={() => setActiveTab('mission')}
            className={`flex-1 text-center py-2.5 px-6 rounded-full text-sm font-bold transition-colors duration-300 cursor-pointer relative z-10 ${
              activeTab === 'mission'
                ? 'text-white'
                : 'text-[#4A5D6E] hover:text-slate-800'
            }`}
          >
            Daily Mission
          </button>
          
          <button
            ref={tabTodoRef}
            type="button"
            onClick={() => setActiveTab('todo')}
            className={`flex-1 text-center py-2.5 px-6 rounded-full text-sm font-bold transition-colors duration-300 cursor-pointer relative z-10 ${
              activeTab === 'todo'
                ? 'text-white'
                : 'text-[#4A5D6E] hover:text-slate-800'
            }`}
          >
            To Do / Goal
          </button>
        </div>

        {/* Form Content Rendering */}
        <div className="animate-fadeIn space-y-6">
          <div className="mt-4">
            {activeTab === 'mission' ? <CreateMissionForm /> : <CreateTodoForm />}
          </div>
        </div>

      </div>
    </PageTemplate>
  );
};
