import React from "react";
import "./WindowControls.css";

// macOS-style traffic lights. Hovering the group reveals the ×, −, and zoom
// glyphs like on a real Mac window. Pass handlers to make them buttons;
// without handlers they are decoration only.
type Props = {
  onClose?: () => void;
  onMinimize?: () => void;
  onZoom?: () => void;
  zoomed?: boolean;
};

const Glyph = ({ kind }: { kind: "close" | "minimize" | "zoom" }) => (
  <svg viewBox="0 0 10 10" aria-hidden="true">
    {kind === "close" && <path d="M3 3l4 4M7 3l-4 4" />}
    {kind === "minimize" && <path d="M2.5 5h5" />}
    {kind === "zoom" && <path d="M3 7V3.6L6.4 7zM7 3v3.4L3.6 3z" className="fill" />}
  </svg>
);

const WindowControls = ({ onClose, onMinimize, onZoom, zoomed }: Props) => {
  const light = (kind: "close" | "minimize" | "zoom", onClick?: () => void, label?: string) =>
    onClick ? (
      <button type="button" className={`traffic-light ${kind}`} onClick={onClick} aria-label={label}>
        <Glyph kind={kind} />
      </button>
    ) : (
      <span className={`traffic-light ${kind}`}>
        <Glyph kind={kind} />
      </span>
    );

  const interactive = Boolean(onClose || onMinimize || onZoom);
  return (
    <div className="traffic-lights" aria-hidden={interactive ? undefined : true}>
      {light("close", onClose, "Close")}
      {light("minimize", onMinimize, "Minimize")}
      {light("zoom", onZoom, zoomed ? "Restore size" : "Enlarge")}
    </div>
  );
};

export default WindowControls;
