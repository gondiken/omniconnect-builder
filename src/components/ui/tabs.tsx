import React, { useState, createContext, useContext } from "react";

type TabsContextType = { value: string; setValue: (v: string) => void };
const TabsContext = createContext<TabsContextType>({ value: "", setValue: () => {} });

export const Tabs: React.FC<{ defaultValue: string; children: React.ReactNode }> = ({
  defaultValue,
  children,
}) => {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}>{children}</TabsContext.Provider>;
};

export const TabsList: React.FC = ({ children }) => <div className="flex border-b">{children}</div>;

export const TabsTrigger: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  const { value: active, setValue } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      onClick={() => setValue(value)}
      className={`px-3 py-1 border-b-2 ${isActive ? "border-blue-600" : "border-transparent"}`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  const { value: active } = useContext(TabsContext);
  return active === value ? <div className="p-4">{children}</div> : null;
};
