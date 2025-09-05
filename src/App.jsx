import { useState, useEffect, useRef } from "react";
import { handleCommand, getTitleByLevel } from "./logic/commandHandler";
import { missions } from "./data/missions";
import { initialGameState } from "./logic/gameStateManager";
import AIAgent from "./AIAgent";
import { missionSteps } from "./logic/gameStateManager";
import HackerCard from "./HackerCard.jsx";
import MatrixRain from "./MatrixRain";

export default function App() {
  // Load from localStorage if available
  const savedState = (() => {
    try {
      const data = JSON.parse(localStorage.getItem("hackerSimState"));
      return data || {};
    } catch {
      return {};
    }
  })();
  const [userName, setUserName] = useState(savedState.userName || initialGameState.userName || "Anonymous");
  const [userXP, setUserXP] = useState(savedState.userXP || 0);
  const [userLevel, setUserLevel] = useState(savedState.userLevel || 1);
  const [userTitle, setUserTitle] = useState(savedState.userTitle || "Script Kiddie");
  const [gameState, setGameState] = useState(savedState.gameState || initialGameState);
  const [command, setCommand] = useState("");
  const [log, setLog] = useState([
    "🧠 Booting Hacker Terminal...",
    "💡 Type 'help' for available commands.",
    "🔐 Login not required. Terminal open in dev mode."
  ]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [typingQueue, setTypingQueue] = useState([]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [danger, setDanger] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [showBoot, setShowBoot] = useState(true);
  const [bootText, setBootText] = useState("");
  const logRef = useRef(null);

  const fullBootText = "🧠 Booting Hacker Terminal...\nInitializing modules...\nWelcome, hacker!";

  // Boot animation typewriter effect
  useEffect(() => {
    if (!showBoot) return;
    let idx = 0;
    setBootText("");
    const interval = setInterval(() => {
      setBootText(fullBootText.slice(0, idx + 1));
      idx++;
      if (idx >= fullBootText.length) {
        clearInterval(interval);
        setTimeout(() => setShowBoot(false), 1200); // Hold for a moment
      }
    }, 28);
    return () => clearInterval(interval);
  }, [showBoot]);

  const processTypingQueue = () => {
    if (typingQueue.length === 0) return;
    const [next, ...rest] = typingQueue;

    let delay = 40;
    if (next.includes("[") || next.includes("...")) delay = 300;
    if (next.includes("Scanning") || next.includes("Decrypting")) delay = 200;
    if (next.startsWith("✅") || next.includes("Installed:")) delay = 500;
    
    setTimeout(() => {
      setLog((prev) => [...prev, next]);
      setTypingQueue(rest);
    }, delay); 
  };

  useEffect(() => {
    processTypingQueue();
  }, [typingQueue]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const addXP = (xpGain) => {
    let newXP = userXP + xpGain;
    let newLevel = userLevel;
    let newTitle = userTitle;
    let levelUpMsg = [];
    if (newXP >= 100) {
      newLevel++;
      newXP = newXP % 100;
      newTitle = getTitleByLevel(newLevel);
      setUserLevel(newLevel);
      setUserTitle(newTitle);
      levelUpMsg.push(`🎉 Level Up! You are now level ${newLevel} - ${newTitle}`);
    }
    setUserXP(newXP);
    return levelUpMsg;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const { output, newGameState } = handleCommand(command, { userXP, userLevel, userTitle, addXP }, gameState);
      setGameState(newGameState);
      // Danger triggers (improved: check all output lines, including emoji)
      if (output.some(line => /access denied|incorrect password|not installed|dangerous|self-destruct|fail|denied|error|💥|💣|mission failed|just kidding/i.test(line))) {
        setDanger(true);
        setTimeout(() => setDanger(false), 700);
      }
      // Glitch effect for meme commands
      if (output.includes("GLITCH")) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 700);
      }
      // Filter out 'GLITCH' and '__DANGER__'/'__GLITCH__' flags from output before displaying
      const filteredOutput = output.filter(line => line !== "GLITCH" && !/^__.*__$/.test(line));
      // If userName changed, update state
      if (newGameState.userName && newGameState.userName !== userName) {
        setUserName(newGameState.userName);
      }
      let missionMsg = [];
      // AI agent: show a hint if unknown command or error
      if (filteredOutput.length === 2 && filteredOutput[1]?.startsWith("Unknown command")) {
        setAiMessage("🤖 Oops! That's not a valid command. Try 'help' or check your spelling.");
      } else if (filteredOutput.some(line => /not installed|Access denied|Password required|Incorrect password|File not found|Directory not found|Usage:/.test(line))) {
        setAiMessage("🤖 Hint: " + filteredOutput.find(line => /not installed|Access denied|Password required|Incorrect password|File not found|Directory not found|Usage:/.test(line)));
      } else if (command.toLowerCase().includes("sudo")) {
        setAiMessage("🤖 Sudo won't help you here, hacker! 😜");
      } else {
        // Show next main mission step as a tip
        const step = newGameState.missionStep || 0;
        if (step < missionSteps.length) {
          const m = missionSteps[step];
          setAiMessage(`🤖 Next Objective: ${m.description}`);
        } else {
          setAiMessage("🤖 All missions complete! You are a Digital Ghost!");
        }
      }
      const currentMission = missions[currentMissionIndex];
      // Check for error in output
      const hasError = filteredOutput.some(line =>
        /not installed|Access denied|Password required|Incorrect password|File not found|Directory not found|Usage:/.test(line)
      );
      
      if (filteredOutput[0] === "CLEAR") {
        setLog([]);
      } else {
        setTypingQueue((prev) => [...prev, ...filteredOutput, ...missionMsg]);
        setHistory((prev) => [...prev, command]);
      }
      setCommand("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setCommand(history[newIndex] || "");
    } else if (e.key === "ArrowDown") {
      if (history.length === 0) return;
      const newIndex = Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(newIndex);
      setCommand(history[newIndex] || "");
    }
  };

  // Save to localStorage on relevant state change
  useEffect(() => {
    localStorage.setItem(
      "hackerSimState",
      JSON.stringify({
        userName,
        userXP,
        userLevel,
        userTitle,
        gameState
      })
    );
  }, [userName, userXP, userLevel, userTitle, gameState]);

  return (
    <>
      <MatrixRain />
      {showBoot && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-95 transition-opacity duration-700 animate-fadeIn">
          <div className="text-green-400 text-2xl md:text-3xl font-mono whitespace-pre-line drop-shadow-lg text-center" style={{textShadow: '0 0 8px #00ff00'}}>
            {bootText}
          </div>
        </div>
      )}
      <div className={`bg-black text-green-400 min-h-screen font-mono p-4 transition-all duration-300${showBoot ? ' opacity-0 pointer-events-none' : ''}`}>
        <h1 className="text-xl mb-2 drop-shadow">🧠 Hacker Terminal v1.0</h1>

        <div
          ref={logRef}
          className={`bg-black border border-green-700 p-4 overflow-y-auto h-[70vh] rounded-md shadow-inner transition-all duration-300 ${danger ? 'danger-flash' : ''} ${glitch ? 'glitch-anim' : ''}`}
        >
          {log.map((line, idx) => (
            <pre key={idx} className="whitespace-pre-wrap mb-1">{line}</pre>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-green-500">&gt;</span>
          <div className="relative flex-1 flex gap-2">
            <input
              autoFocus
              type="text"
              placeholder="Type a command..."
              className="flex-1 bg-black text-green-300 border border-green-700 p-2 text-lg md:text-base outline-none pr-2 rounded"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              style={{ position: 'relative', zIndex: 2, background: 'transparent', caretColor: '#00ff00' }}
            />
            {/* Mobile-friendly Enter button (now always visible) */}
            <button
              className="ml-2 px-4 py-2 bg-green-700 text-white rounded shadow active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => {
                // Simulate Enter key
                handleKeyDown({ key: "Enter", preventDefault: () => {} });
              }}
              aria-label="Submit command"
              type="button"
              disabled={!command.trim()}
            >
              Enter
            </button>
          </div>
        </div>

        <AIAgent message={aiMessage} />
        <HackerCard
          name={userName}
          level={userLevel}
          xp={userXP}
          title={userTitle}
        />
        <style>{`
          .danger-flash {
            box-shadow: 0 0 0 4px #ff2222, 0 0 32px 12px #ff2222cc;
            animation: danger-border-pulse 2s cubic-bezier(0.4,0,0.2,1) 1;
          }
          @keyframes danger-border-pulse {
            0% { box-shadow: 0 0 0 4px #ff2222, 0 0 0 0 #ff222200; }
            20% { box-shadow: 0 0 0 4px #ff2222, 0 0 32px 12px #ff2222cc; }
            50% { box-shadow: 0 0 0 4px #ff2222, 0 0 48px 18px #ff2222cc; }
            80% { box-shadow: 0 0 0 4px #ff2222, 0 0 32px 12px #ff2222cc; }
            100% { box-shadow: 0 0 0 4px #ff2222, 0 0 0 0 #ff222200; }
          }
          .glitch-anim {
            animation: terminal-glitch 0.7s steps(2, end) 1;
          }
          @keyframes terminal-glitch {
            0% { filter: none; }
            10% { filter: contrast(2) brightness(1.5) hue-rotate(30deg); transform: skewX(-2deg) scaleY(1.02); }
            20% { filter: blur(1.5px) brightness(1.2); transform: skewX(2deg) scaleY(0.98); }
            30% { filter: none; }
            40% { filter: contrast(2) brightness(1.5) hue-rotate(-30deg); transform: skewX(1deg) scaleY(1.01); }
            50% { filter: blur(1.5px) brightness(1.2); transform: skewX(-1deg) scaleY(0.99); }
            60% { filter: none; }
            100% { filter: none; }
          }
        `}</style>
      </div>
    </>
  );
}
