import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ModalProps } from '../../types/modal.types';

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle mounting/unmounting
  useLayoutEffect(() => {
    if (isOpen && !shouldRender) {
      // Defer setState to avoid synchronous setState warning
      requestAnimationFrame(() => {
        setShouldRender(true);
      });
    }
  }, [isOpen, shouldRender]);

  // Handle animations
  useEffect(() => {
    if (isOpen && shouldRender) {
      // Trigger enter animation
      requestAnimationFrame(() => {
        if (modalRef.current) {
          modalRef.current.classList.add('modal-open');
        }
        if (contentRef.current) {
          contentRef.current.classList.add('modal-content-open');
        }
      });
    } else if (!isOpen && shouldRender) {
      // Start exit animation
      if (modalRef.current) {
        modalRef.current.classList.remove('modal-open');
      }
      if (contentRef.current) {
        contentRef.current.classList.remove('modal-content-open');
      }
      // Remove from DOM after animation completes (300ms for content animation)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-end modal-container"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 modal-backdrop" />
      
      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative w-full max-w-xl mx-auto bg-white rounded-t-3xl shadow-lg modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <style>{`
        .modal-container {
          opacity: 0;
          transition: opacity 0.2s ease-out;
        }
        .modal-container.modal-open {
          opacity: 1;
        }
        
        .modal-backdrop {
          opacity: 0;
          transition: opacity 0.2s ease-out;
        }
        .modal-container.modal-open .modal-backdrop {
          opacity: 1;
        }
        
        .modal-content {
          transform: translateY(100%);
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-content.modal-content-open {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

