import React, { useState, useEffect } from "react";
import { Text } from "../../components/atoms/Text";
import { Button } from "../../components/atoms/Button";
import { getUserApiKeyAction } from "../../actions/user";
import {
  KeyIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CodeBracketIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const ApiKeySettings: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

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

  const jsSnippet = `// Example Widget Fetch Code
async function fetchDailyMissions() {
  const API_KEY = "${apiKey || "YOUR_API_KEY"}";
  const response = await fetch("https://${typeof window !== "undefined" ? window.location.host : "yourdomain.com"}/api/v1/public/daily-missions", {
    headers: {
      "x-api-key": API_KEY
    }
  });
  const data = await response.json();
  console.log(data);
}`;

  const jsonSnippet = `{
  "success": true,
  "date": "2026-08-01",
  "user": {
    "username": "user123",
    "full_name": "Developer"
  },
  "total_missions": 1,
  "data": [
    {
      "id": "uuid-mission-id",
      "title": "100 Days Coding Challenge",
      "description": "Daily coding practice",
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-blue-50 text-[#7DB8E0] rounded-2xl">
          <KeyIcon className="w-6 h-6" />
        </div>
        <div>
          <Text size="base" weight="semibold" className="text-gray-800">
            Public API Key & Portfolio Widget
          </Text>
          <Text size="xs" className="text-gray-500">
            Use this API key to display your daily habits on external websites
          </Text>
        </div>
      </div>

      {/* API Key Box */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4">
        <Text size="xs" weight="semibold" className="text-gray-400 uppercase tracking-wider mb-1.5 block">
          Your Personal API Key
        </Text>
        
        {isLoading ? (
          <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-sm text-gray-700 overflow-x-auto select-all">
              {showKey ? apiKey : maskedKey}
            </div>
            
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all"
              title={showKey ? "Hide API Key" : "Show API Key"}
              type="button"
            >
              {showKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>

            <Button
              variant="secondary"
              onClick={handleCopy}
              className="flex items-center gap-1.5 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 text-xs"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Accordion Documentation */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setIsDocsOpen(!isDocsOpen)}
          className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100/80 transition-colors text-left"
          type="button"
        >
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-[#7DB8E0]" />
            <Text size="sm" weight="semibold" className="text-gray-700">
              Widget Integration & Documentation
            </Text>
          </div>
          {isDocsOpen ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {isDocsOpen && (
          <div className="p-4 space-y-4 text-sm text-gray-600 bg-white">
            <div>
              <Text size="xs" weight="semibold" className="text-gray-700 uppercase tracking-wider block mb-1">
                Endpoint URL (GET Only)
              </Text>
              <code className="block bg-gray-900 text-gray-100 p-2.5 rounded-xl font-mono text-xs overflow-x-auto">
                GET /api/v1/public/daily-missions
              </code>
            </div>

            <div>
              <Text size="xs" weight="semibold" className="text-gray-700 uppercase tracking-wider block mb-1">
                Authentication
              </Text>
              <p className="text-xs text-gray-500 mb-1">
                Pass your API key in the request header or query parameter:
              </p>
              <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
                <li>Header: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">x-api-key: {apiKey || "YOUR_API_KEY"}</code></li>
                <li>Query param: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800">?api_key={apiKey || "YOUR_API_KEY"}</code></li>
              </ul>
            </div>

            <div>
              <Text size="xs" weight="semibold" className="text-gray-700 uppercase tracking-wider block mb-1">
                JavaScript Example (Fetch)
              </Text>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                {jsSnippet}
              </pre>
            </div>

            <div>
              <Text size="xs" weight="semibold" className="text-gray-700 uppercase tracking-wider block mb-1">
                Response Preview (JSON)
              </Text>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                {jsonSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
