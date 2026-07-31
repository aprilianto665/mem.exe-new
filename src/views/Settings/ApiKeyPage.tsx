import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "../../components/templates/PageTemplate";
import { Text } from "../../components/atoms/Text";
import { Button } from "../../components/atoms/Button";
import { getUserApiKeyAction } from "../../actions/user";
import {
  ArrowLeftIcon,
  KeyIcon,
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
      <div className="flex flex-col pb-12">
        {/* Top Bar Header */}
        <div className="flex-shrink-0 mb-6 relative flex items-center justify-center">
          <button
            onClick={() => navigate("/settings")}
            className="absolute left-0 flex items-center gap-1.5 text-gray-600 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-xl hover:bg-white/50 transition-colors"
            type="button"
          >
            <ArrowLeftIcon strokeWidth={2.5} className="w-5 h-5" />
            <Text size="sm" weight="semibold">
              Settings
            </Text>
          </button>

          <Text size="2xl" weight="bold" className="text-gray-800">
            API Key & Public Widget
          </Text>
        </div>

        {/* Section 1: API Key Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 text-[#7DB8E0] rounded-2xl">
              <KeyIcon className="w-6 h-6" />
            </div>
            <div>
              <Text size="lg" weight="bold" className="text-gray-800">
                Personal API Key
              </Text>
              <Text size="xs" className="text-gray-500">
                Stateless, HMAC-authenticated key for embedding habit progress widgets
              </Text>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <Text size="xs" weight="semibold" className="text-gray-400 uppercase tracking-wider mb-2 block">
              Your API Key
            </Text>

            {isLoading ? (
              <div className="h-11 bg-gray-200 animate-pulse rounded-xl" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-mono text-sm text-gray-700 overflow-x-auto select-all shadow-inner">
                  {showKey ? apiKey : maskedKey}
                </div>

                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-white rounded-xl border border-gray-200 transition-all shadow-sm"
                  title={showKey ? "Hide Key" : "Show Key"}
                  type="button"
                >
                  {showKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>

                <Button
                  variant="secondary"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 text-sm shadow-sm"
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
        </div>

        {/* Section 2: Documentation Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
              <CodeBracketIcon className="w-6 h-6" />
            </div>
            <div>
              <Text size="lg" weight="bold" className="text-gray-800">
                Integration & API Documentation
              </Text>
              <Text size="xs" className="text-gray-500">
                Read-only HTTP GET REST API specs for portfolio widgets
              </Text>
            </div>
          </div>

          <div className="space-y-4">
            {/* Endpoint Badge */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Text size="xs" weight="semibold" className="text-gray-400 uppercase tracking-wider mb-1.5 block">
                Base Endpoint URL (GET Only)
              </Text>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-white font-mono text-xs px-2.5 py-1 rounded-lg font-bold">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-200 flex-1 overflow-x-auto">
                  https://{hostUrl}/api/v1/public/daily-missions
                </code>
              </div>
            </div>

            {/* Authentication Header Specs */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Text size="xs" weight="semibold" className="text-gray-400 uppercase tracking-wider mb-1.5 block">
                Authentication Methods
              </Text>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 min-w-24">HTTP Header:</span>
                  <code className="bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-800 font-mono">
                    x-api-key: {showKey ? apiKey : maskedKey}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 min-w-24">Query Param:</span>
                  <code className="bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-800 font-mono">
                    ?api_key={showKey ? apiKey : maskedKey}
                  </code>
                </div>
              </div>
            </div>

            {/* Interactive Code Snippets Tabs */}
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-md">
              <div className="flex border-b border-gray-800 bg-gray-950/60 px-2 pt-2">
                <button
                  onClick={() => setActiveTab("fetch")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                    activeTab === "fetch"
                      ? "bg-gray-900 text-blue-400 border-t-2 border-blue-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  type="button"
                >
                  <CodeBracketIcon className="w-4 h-4" />
                  JavaScript (Fetch)
                </button>

                <button
                  onClick={() => setActiveTab("curl")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                    activeTab === "curl"
                      ? "bg-gray-900 text-blue-400 border-t-2 border-blue-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  type="button"
                >
                  <CommandLineIcon className="w-4 h-4" />
                  cURL
                </button>

                <button
                  onClick={() => setActiveTab("json")}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors ${
                    activeTab === "json"
                      ? "bg-gray-900 text-blue-400 border-t-2 border-blue-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  type="button"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  JSON Response
                </button>
              </div>

              <div className="p-4 overflow-x-auto">
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
