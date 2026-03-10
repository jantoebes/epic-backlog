import { useState } from "react";
import { useSettings } from "./SettingsContext";

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { showNumbers, compactMode, columnWidth, rowCount, update } = useSettings();

  return (
    <div id="settings">
      <button
        id="settings-toggle"
        onClick={() => setOpen((v) => !v)}
        title="Instellingen"
        aria-expanded={open}
      >
        ⚙
      </button>

      {open && (
        <div id="settings-panel">
          <div className="settings-title">Instellingen</div>

          <label className="settings-row">
            <input
              type="checkbox"
              checked={showNumbers}
              onChange={(e) => update("showNumbers", e.target.checked)}
            />
            Itemnummers tonen
          </label>

          <label className="settings-row">
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => update("compactMode", e.target.checked)}
            />
            Compacte modus
          </label>

          <div className="settings-row settings-slider">
            <span>Kolombreedte</span>
            <input
              type="range"
              min={100}
              max={300}
              value={columnWidth}
              onChange={(e) => update("columnWidth", Number(e.target.value))}
            />
            <span className="settings-value">{columnWidth}px</span>
          </div>

          <div className="settings-row settings-stepper">
            <span>Aantal rijen</span>
            <div className="stepper">
              <button onClick={() => update("rowCount", Math.max(1, rowCount - 1))}>−</button>
              <input
                type="number"
                min={1}
                max={4}
                value={rowCount}
                onChange={(e) => update("rowCount", Math.min(4, Math.max(1, Number(e.target.value))))}
              />
              <button onClick={() => update("rowCount", Math.min(4, rowCount + 1))}>+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
