// /src/components/OutputPanel.tsx

import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button }                                   from "./ui/button";
import { ScrollArea }                               from "./ui/scroll-area";

interface OutputPanelProps {
  code: string;
  preview: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ code, preview }) => {
  const handleCopy = () => navigator.clipboard.writeText(code);

  return (
    <div className="hidden md:block md:w-1/4 border-l border-muted-foreground/20">
      <Tabs defaultValue="code" className="h-full flex flex-col">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="code">JS Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="flex-1 overflow-y-auto p-4">
          <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg">
            {code}
          </pre>
          <Button variant="secondary" size="sm" className="mt-2" onClick={handleCopy}>
            Copy to clipboard
          </Button>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 overflow-y-auto p-4">
          <ScrollArea className="h-full">
            <pre className="text-xs font-mono">
              {preview}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutputPanel;
