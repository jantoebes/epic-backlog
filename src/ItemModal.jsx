import { useState, useRef, useEffect } from "react";
import { useBoard } from "./BoardContext";

export default function ItemModal({ item, onClose }) {
  const { editItem } = useBoard();
  const [label, setLabel] = useState(item.label);
  const [description, setDescription] = useState(item.description);
  const labelRef = useRef(null);

  useEffect(() => {
    labelRef.current?.focus();
    const onKeyDown = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleClose = () => {
    const trimmedLabel = label.trim();
    if (trimmedLabel) editItem(item.id, { label: trimmedLabel, description });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>
        <input
          ref={labelRef}
          className="modal-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleClose()}
          placeholder="Naam"
        />
        <textarea
          className="modal-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschrijving..."
          rows={6}
        />
      </div>
    </div>
  );
}
