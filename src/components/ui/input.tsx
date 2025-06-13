import React from "react";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input
    {...props}
    className={`p-2 border rounded-md focus:outline-none focus:ring ${className || ""}`.trim()}
  />
);
