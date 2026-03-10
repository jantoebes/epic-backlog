import { SettingsProvider } from "./SettingsContext";
import { BoardProvider, useBoard } from "./BoardContext";
import { SelectionProvider } from "./SelectionContext";
import SettingsPanel from "./SettingsPanel";
import ActionBar from "./ActionBar";
import TodoBoard from "./TodoBoard";

function BoardApp() {
  const { loading } = useBoard();
  if (loading) return <div style={{ padding: "1rem", fontSize: "0.8rem", color: "#888" }}>Loading...</div>;
  return (
    <SelectionProvider>
      <TodoBoard />
      <SettingsPanel />
      <ActionBar />
    </SelectionProvider>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <BoardProvider>
        <BoardApp />
      </BoardProvider>
    </SettingsProvider>
  );
}
