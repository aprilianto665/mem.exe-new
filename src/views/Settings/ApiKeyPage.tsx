import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "../../components/templates/PageTemplate";
import { Text } from "../../components/atoms/Text";
import { Button } from "../../components/atoms/Button";
import { getUserApiKeyAction } from "../../actions/user";
import {
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CodeBracketIcon,
  CommandLineIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const ApiKeyPage: React.FC = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"fetch" | "curl" | "json">("fetch");

  // Tab Sliding Indicator Logic (identical to Create page pill tabs)
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabFetchRef = useRef<HTMLButtonElement>(null);
  const tabCurlRef = useRef<HTMLButtonElement>(null);
  const tabJsonRef = useRef<HTMLButtonElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const hasMountedRef = useRef(false);

  const updateIndicatorPosition = useCallback(() => {
    const refs = {
      fetch: tabFetchRef.current,
      curl: tabCurlRef.current,
      json: tabJsonRef.current,
    };
    const activeBtn = refs[activeTab];
    const container = tabContainerRef.current;

    if (activeBtn && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeBtn.getBoundingClientRect();

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
        indicatorRef.current.style.transition = "none";
        requestAnimationFrame(() => {
          if (indicatorRef.current) {
            indicatorRef.current.style.transition = "";
          }
        });
      }
    }
  }, [updateIndicatorPosition]);

  useEffect(() => {
    const container = tabContainerRef.current;
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
    let isMounted = true;
    async function loadKey() {
      try {
        const key = await getUserApiKeyAction();
        if (isMounted) {
          setApiKey(key);
        }
      } catch (err) {
        console.error("Failed to load API Key:", err);
        toast.error("Failed to load API Key");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadKey();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success("API Key copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 12)}${"•".repeat(Math.max(0, apiKey.length - 16))}${apiKey.slice(-4)}`
    : "";

  const hostUrl = typeof window !== "undefined" ? window.location.host : "mem-exe.vercel.app";

  const jsSnippet = `// Example JavaScript Fetch for Portfolio Widget
async function getDailyMissions() {
  const response = await fetch("https://${hostUrl}/api/v1/public/daily-missions", {
    headers: {
      "x-api-key": "${apiKey || "YOUR_API_KEY"}"
    }
  });
  const data = await response.json();
  console.log("Daily Habits:", data);
}`;

  const curlSnippet = `# Terminal cURL Example
curl -i -X GET "https://${hostUrl}/api/v1/public/daily-missions" \\
  -H "x-api-key: ${apiKey || "YOUR_API_KEY"}"`;

  const jsonSnippet = `{
  "success": true,
  "date": "2026-08-01",
  "user": {
    "username": "developer",
    "full_name": "Developer Name"
  },
  "total_missions": 2,
  "data": [
    {
      "id": "uuid-mission-1",
      "title": "100 Days Coding Challenge",
      "description": "Daily coding habit",
      "type": "challenge",
      "target_minutes": 60,
      "minutes_done": 45,
      "progress_percentage": 75,
      "is_completed": false,
      "streak": 11
    }
  ]
}`;

  return (
    <PageTemplate>
      <div className="flex flex-col pb-32">
        {/* Header */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => navigate("/settings")}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50 transition-colors"
            type="button"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">
              Back
            </Text>
          </button>

          <Text size="2xl" weight="bold" className="text-gray-800">
            Public API Key
          </Text>
        </div>

        {/* Content Container */}
        <div className="space-y-4">
          {/* Card 1: API Key Management */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <Text size="xs" weight="bold" className="text-gray-500 uppercase tracking-wider mb-4 block">
              Personal API Key
            </Text>

            {isLoading ? (
              <div className="h-11 bg-gray-100 animate-pulse rounded-2xl" />
            ) : (
              <div className="bg-gray-50/80 rounded-2xl p-2.5 border border-gray-100 flex items-center gap-3">
                <div className="flex-1 min-w-0 px-3 font-mono text-sm text-gray-800 truncate select-all">
                  {showKey ? apiKey : maskedKey}
                </div>

                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-200/60 transition-colors"
                  title={showKey ? "Hide API Key" : "Show API Key"}
                  type="button"
                >
                  {showKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>

                <Button
                  variant="primary"
                  onClick={handleCopy}
                  className="!py-2 !px-5 !text-sm !rounded-xl flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Card 2: Integration & API Documentation */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
            <Text size="xs" weight="bold" className="text-gray-500 uppercase tracking-wider block">
              Integration & API Documentation
            </Text>

            {/* Base Endpoint URL */}
            <div>
              <Text size="xs" weight="bold" className="text-gray-400 uppercase tracking-wider mb-2 block">
                Base Endpoint URL (GET Only)
              </Text>
              <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                <span className="bg-[#7DB8E0] text-white font-bold text-xs px-3 py-1 rounded-xl">
                  GET
                </span>
                <code className="font-mono text-sm text-gray-700 truncate flex-1">
                  https://{hostUrl}/api/v1/public/daily-missions
                </code>
              </div>
            </div>

            {/* Authentication Methods */}
            <div>
              <Text size="xs" weight="bold" className="text-gray-400 uppercase tracking-wider mb-2 block">
                Authentication Methods
              </Text>
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Text size="xs" weight="semibold" className="text-gray-600 min-w-28">
                    HTTP Header:
                  </Text>
                  <code className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-gray-800 font-mono text-xs truncate flex-1">
                    x-api-key: {showKey ? apiKey : maskedKey}
                  </code>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Text size="xs" weight="semibold" className="text-gray-600 min-w-28">
                    Query Param:
                  </Text>
                  <code className="bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-gray-800 font-mono text-xs truncate flex-1">
                    ?api_key={showKey ? apiKey : maskedKey}
                  </code>
                </div>
              </div>
            </div>

            {/* Code Examples Section */}
            <div>
              <Text size="xs" weight="bold" className="text-gray-400 uppercase tracking-wider mb-3 block">
                Code Examples
              </Text>

              {/* Smooth Sliding Pill Tabs Capsule (Identical to Create Page) */}
              <div
                ref={tabContainerRef}
                className="relative bg-[#E5E7EB]/70 p-1 rounded-full flex gap-1 mb-3 overflow-hidden"
              >
                {/* Sliding Background Pill Indicator */}
                <div
                  ref={indicatorRef}
                  className="absolute top-1 bottom-1 bg-[#7DB8E0] rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                  }}
                />

                <button
                  ref={tabFetchRef}
                  onClick={() => setActiveTab("fetch")}
                  className={`relative z-10 flex-1 py-2 px-3 rounded-full font-bold text-xs transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "fetch"
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  type="button"
                >
                  <CodeBracketIcon className="w-4 h-4" />
                  <span>JavaScript (Fetch)</span>
                </button>

                <button
                  ref={tabCurlRef}
                  onClick={() => setActiveTab("curl")}
                  className={`relative z-10 flex-1 py-2 px-3 rounded-full font-bold text-xs transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "curl"
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  type="button"
                >
                  <CommandLineIcon className="w-4 h-4" />
                  <span>cURL</span>
                </button>

                <button
                  ref={tabJsonRef}
                  onClick={() => setActiveTab("json")}
                  className={`relative z-10 flex-1 py-2 px-3 rounded-full font-bold text-xs transition-colors duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "json"
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  type="button"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>JSON Response</span>
                </button>
              </div>

              {/* Code Box */}
              <div className="bg-[#1E222D] rounded-2xl p-4 overflow-x-auto shadow-inner border border-gray-800">
                <pre className="font-mono text-xs text-gray-200 leading-relaxed">
                  {activeTab === "fetch" && jsSnippet}
                  {activeTab === "curl" && curlSnippet}
                  {activeTab === "json" && jsonSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};
