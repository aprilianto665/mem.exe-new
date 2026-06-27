import { useEffect, useLayoutEffect, useRef } from "react";
import { CapsuleButton } from "../atoms/CapsuleButton";
import type { CommitmentLevel } from "./CommitmentLevelSelector";

export interface CommitmentLevelSelectorSimpleProps {
  value: CommitmentLevel;
  onChange: (value: CommitmentLevel) => void;
}

export const CommitmentLevelSelectorSimple = ({
  value,
  onChange,
}: CommitmentLevelSelectorSimpleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const normalButtonRef = useRef<HTMLButtonElement>(null);
  const hardButtonRef = useRef<HTMLButtonElement>(null);
  const extremeButtonRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const levels: CommitmentLevel[] = ["normal", "hard", "extreme"];
  const activeIndex = levels.indexOf(value);

  const updatePosition = () => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    const buttonRefs = [normalButtonRef, hardButtonRef, extremeButtonRef];
    const activeButton = buttonRefs[activeIndex]?.current;
    const container = containerRef.current;

    if (activeButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      indicator.style.left = `${buttonRect.left - containerRect.left}px`;
      indicator.style.width = `${buttonRect.width}px`;
    }
  };

  useLayoutEffect(() => {
    updatePosition();
  });

  useEffect(() => {
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  });

  return (
    <div
      ref={containerRef}
      className="relative flex justify-between gap-1 rounded-full p-1 bg-[#F8FAFC]"
    >
      {/* Sliding Background Indicator */}
      <div
        ref={indicatorRef}
        className="absolute top-1 bottom-1 bg-[#7DB8E0] rounded-full transition-all duration-300 ease-out"
      />

      <CapsuleButton
        ref={normalButtonRef}
        active={value === "normal"}
        onClick={() => onChange("normal")}
        className={`flex-1 relative z-10 ${
          value === "normal" ? "text-white !bg-transparent" : ""
        }`}
        transparentInactive
      >
        Normal
      </CapsuleButton>

      <CapsuleButton
        ref={hardButtonRef}
        active={value === "hard"}
        onClick={() => onChange("hard")}
        className={`flex-1 relative z-10 ${
          value === "hard" ? "text-white !bg-transparent" : ""
        }`}
        transparentInactive
      >
        Hard
      </CapsuleButton>

      <CapsuleButton
        ref={extremeButtonRef}
        active={value === "extreme"}
        onClick={() => onChange("extreme")}
        className={`flex-1 relative z-10 ${
          value === "extreme" ? "text-white !bg-transparent" : ""
        }`}
        transparentInactive
      >
        Extreme
      </CapsuleButton>
    </div>
  );
};

