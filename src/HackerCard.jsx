import React, { useRef, useEffect } from "react";

export default function HackerCard({ name, level, xp, title }) {
  const canvasRef = useRef(null);

  // Draw card when props change
  useEffect(() => {
    drawCard();
    // eslint-disable-next-line
  }, [name, level, xp, title]);

  const drawCard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Simple black background
    ctx.clearRect(0, 0, 420, 240);
    ctx.fillStyle = "#101712"; // deep black-green
    ctx.fillRect(0, 0, 420, 240);
    // Green border
    ctx.save();
    ctx.shadowColor = "#22ff55";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#22ff55";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 404, 224);
    ctx.restore();
    // Title
    ctx.font = "bold 36px monospace";
    ctx.fillStyle = "#22ff55";
    ctx.textAlign = "center";
    ctx.fillText("HACKER BADGE", 210, 54);
    // Name
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "#b6ffb6";
    ctx.textAlign = "left";
    ctx.fillText(`Name: ${name}`, 32, 100);
    // Level & Title
    ctx.font = "18px monospace";
    ctx.fillStyle = "#22ff55";
    ctx.fillText(`Level: ${level}  |  ${title}`, 32, 145);
    // XP
    ctx.font = "18px monospace";
    ctx.fillStyle = "#b6ffb6";
    ctx.fillText(`XP: ${xp}/100`, 32, 185);
    // Meme footer
    ctx.font = "italic 15px monospace";
    ctx.fillStyle = "#22ff55";
    ctx.textAlign = "center";
    ctx.fillText("Hack the world. 🕶️", 210, 212);
  };

  const handleDownload = () => {
    drawCard();
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `hacker_badge_${name}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center mt-4 relative">
      <button
        className="px-4 py-2 bg-cyan-700 text-white rounded shadow hover:bg-cyan-800 text-base mb-2"
        onClick={handleDownload}
      >
        Download Hacker Badge
      </button>
      <div style={{ position: "relative", width: 420, height: 240 }}>
        <canvas
          ref={canvasRef}
          width={420}
          height={240}
          style={{
            background: "#18181b",
            borderRadius: 12,
            border: "2px solid #22d3ee",
            marginTop: 8,
            zIndex: 1,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
        {/* Animated scanline overlay */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            top: 0,
            width: 420,
            height: 240,
            zIndex: 2,
            overflow: "hidden",
          }}
        >
          <div
            className="hacker-scanline"
            style={{
              position: "absolute",
              left: 0,
              width: "100%",
              height: 24,
              background:
                "linear-gradient(180deg, rgba(34,255,85,0.18) 0%, rgba(34,255,85,0.05) 100%)",
              animation: "scanline-move 2.5s linear infinite",
              filter: "blur(0.5px)",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes scanline-move {
          0% { top: 0; }
          100% { top: 216px; }
        }
      `}</style>
    </div>
  );
}
