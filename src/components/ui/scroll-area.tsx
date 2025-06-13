import React from "react";

export const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={`overflow-auto ${className || ""}`.trim()}>
    {children}
  </div>
);
