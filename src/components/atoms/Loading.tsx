import Image from "next/image";

interface LoadingProps {
  message?: string;
  className?: string;
  size?: number;
  fullScreen?: boolean;
}

export const Loading = ({
  message = "Loading your system...",
  className = "",
  size = 96,
  fullScreen = true,
}: LoadingProps) => {
  return (
    <div
      className={`${
        fullScreen ? "min-h-screen" : "py-12"
      } w-full flex flex-col items-center justify-center bg-transparent ${className}`}
    >
      {/* Inject reliable animation keyframes */}
      <style>{`
        @keyframes memStripeMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 48px 0;
          }
        }
      `}</style>

      <div className="flex flex-col items-center select-none">
        <Image
          src="/mem_icon.png"
          alt="mem.exe"
          width={size}
          height={size}
          priority
          className="w-24 h-24 object-contain brightness-0 opacity-45 pointer-events-none mb-5"
        />

        {/* Animated striped progress bar */}
        <div className="w-64 sm:w-80 max-w-[85vw] h-6 sm:h-7 bg-gray-100/90 rounded-full p-[3px] shadow-inner border border-gray-200/80 flex items-center">
          <div className="w-full h-full rounded-full bg-[#7DB8E0] overflow-hidden relative shadow-xs">
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, rgba(255, 255, 255, 0.35) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.35) 50%, rgba(255, 255, 255, 0.35) 75%, transparent 75%, transparent)",
                backgroundSize: "24px 24px",
                animation: "memStripeMove 1.2s linear infinite",
                WebkitAnimation: "memStripeMove 1.2s linear infinite",
              }}
            />
          </div>
        </div>

        {message && (
          <p className="mt-4 text-gray-500 font-medium text-sm tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
