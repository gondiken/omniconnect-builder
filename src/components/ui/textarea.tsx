import React from "react";

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea
    {...props}
    className={`p-2 border rounded-md focus:outline-none focus:ring ${className || ""}`.trim()}
  />
);
