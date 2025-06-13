// /src/components/ChatPanel.tsx

import React, { useState } from "react";
import { Textarea }           from "./ui/textarea";
import { Button }             from "./ui/button";
import { SendHorizonal }      from "lucide-react";

interface ChatPanelProps {
  onSubmit: (message: string) => void;
  history: { role: "user" | "system" | "assistant"; content: string }[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onSubmit, history }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="flex-1 md:w-1/2 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-log">
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-muted"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="border-t border-muted-foreground/20 p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Describe your mapping or refinement..."
            className="flex-1 resize-none"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="icon" className="shrink-0" onClick={handleSend}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
