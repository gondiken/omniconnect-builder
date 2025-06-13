import React, { useState } from "react";
import JsonInputPanel from "./components/JsonInputPanel";
import ChatPanel from "./components/ChatPanel";
import OutputPanel from "./components/OutputPanel";
import { useOpenAI } from "./hooks/useOpenAI";

export default function App() {
  const [inputJson, setInputJson] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [preview, setPreview] = useState<string>("");

  const SYSTEM_PROMPT = `You are an expert developer writing Bloomreach Omniconnect transformations. You receive an input JSON payload and the user’s transformation goal. Output a valid JavaScript function that returns an array of events or customers.`;

  const { history, sendMessage } = useOpenAI(SYSTEM_PROMPT, inputJson);

  const handleChatSubmit = async (message: string) => {
    if (!inputJson) return;
    const code = await sendMessage(message);
    setGeneratedCode(code);

    try {
      // Evaluate user-generated transform function
      // eslint-disable-next-line no-new-func
      const fn = new Function("payload", code + "; return transform({ payload });");
      const result = fn(inputJson);
      setPreview(JSON.stringify(result, null, 2));
    } catch (err) {
      setPreview("[Error evaluating code: " + err + "]");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <JsonInputPanel onJsonUpload={setInputJson} />
      <ChatPanel onSubmit={handleChatSubmit} history={history} />
      <OutputPanel code={generatedCode} preview={preview} />
    </div>
  );
}
