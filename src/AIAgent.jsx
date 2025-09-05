import React, { useRef } from "react";

const defaultHints = [
  "💡 Type 'help' to see available commands!",
  "Tip: Use 'mission_status' to check your current objective.",
  "Try scanning the network or reading files for clues!",
  "If you see 'secure', you might need a password."
];

export default function AIAgent({ message }) {
  // Pick a random hint only once per mount
  const randomHintRef = useRef(defaultHints[Math.floor(Math.random() * defaultHints.length)]);
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      pointerEvents: 'none'
    }}>
      <div style={{
        background: 'rgba(30,30,30,0.95)',
        color: '#aaffaa',
        border: '2px solid #22ff88',
        borderRadius: '16px',
        padding: '12px 18px',
        marginRight: '12px',
        minWidth: '180px',
        maxWidth: '260px',
        fontFamily: 'monospace',
        fontSize: '1rem',
        boxShadow: '0 2px 12px #000a',
        pointerEvents: 'auto',
        transition: 'opacity 0.3s'
      }}>
        {message || randomHintRef.current}
      </div>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #22ff88 60%, #222 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        boxShadow: '0 2px 8px #000a',
        border: '2px solid #22ff88',
        userSelect: 'none'
      }}>
        🤖
      </div>
    </div>
  );
}
