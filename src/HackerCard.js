import React, { useRef } from "react";

export default function HackerCard({ name, level, xp, title, onDownload }) {
  const canvasRef = useRef(null);

  const drawCard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Card background
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, 400, 220);
    // Border
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 396, 216);
    // Title
    ctx.font = "bold 28px monospace";
    ctx.fillStyle = "#10b981";
    ctx.fillText("HACKER CARD", 110, 45);
    // Name
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Name: ${name}`, 30, 90);
    // Level & Title
    ctx.font = "18px monospace";
    ctx.fillStyle = "#10b981";
    ctx.fillText(`Level: ${level}  |  Title: ${title}`, 30, 130);
    // XP
    ctx.font = "18px monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText(`XP: ${xp}/100`, 30, 160);
    // Meme footer
    ctx.font = "16px monospace";
    ctx.fillStyle = "#10b981";
    ctx.fillText("# Terminal mein sab kuch ho sakta hai!", 30, 200);
  };

  const handleDownload = () => {
    drawCard();
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `hacker_card_${name}.png`;
    a.click();
    if (onDownload) onDownload();
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <canvas ref={canvasRef} width={400} height={220} style={{ display: "none" }} />
      <button
        className="px-4 py-2 bg-green-700 text-white rounded shadow mt-2 hover:bg-green-800"
        onClick={handleDownload}
      >
        Download Hacker Card
      </button>
    </div>
  );
}
