import { createContext, useContext, useState } from "react";

const defaults = {
  showNumbers: true,
  compactMode: false,
  columnWidth: 160,
  rowCount: 1,
};

const SettingsContext = createContext(defaults);

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);

  const update = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <SettingsContext.Provider value={{ ...settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}
