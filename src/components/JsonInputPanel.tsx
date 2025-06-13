// /src/components/JsonInputPanel.tsx

import React, { useRef, useState } from "react";
import { Card, CardHeader, CardContent } from "./ui/card";
import { Input }                             from "./ui/input";
import { Textarea }                          from "./ui/textarea";
import { Paperclip }                         from "lucide-react";

interface JsonInputPanelProps {
  onJsonUpload: (json: any) => void;
}

const JsonInputPanel: React.FC<JsonInputPanelProps> = ({ onJsonUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        setInputValue(JSON.stringify(json, null, 2));
        onJsonUpload(json);
      } catch {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (value: string) => {
    setInputValue(value);
    try {
      const parsed = JSON.parse(value);
      onJsonUpload(parsed);
    } catch {
      // ignore until valid JSON
    }
  };

  return (
    <div className="hidden md:block md:w-1/4 border-r border-muted-foreground/20">
      <Card className="h-full rounded-none">
        <CardHeader className="font-semibold text-lg">Sample Input JSON</CardHeader>
        <CardContent className="h-full flex flex-col gap-4">
          <div
            className="flex-1 rounded-md border border-dashed border-muted-foreground/40 flex items-center justify-center text-muted-foreground cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center space-y-2">
              <Paperclip className="mx-auto" />
              <p className="text-sm">Click to upload JSON file</p>
              <Input
                type="file"
                accept="application/json"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
          <Textarea
            placeholder="Or paste raw JSON here..."
            className="flex-1 font-mono text-xs"
            value={inputValue}
            onChange={(e) => handlePasteChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonInputPanel;
