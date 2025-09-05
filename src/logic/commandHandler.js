import {
  scanNetwork,
  connectToIP,
  loginToHost,
  listFiles,
  catFile,
  cdDirectory,
  initialGameState,
  checkAndAdvanceMission,
  installTool,
  missionSteps
} from "./gameStateManager";

let userXP = 0;
let userLevel = 1;
let userTitle = "Script Kiddie";

// XP/Level state moved to App.jsx
export function getTitleByLevel(level) {
  if (level >= 10) return "Digital Ghost";
  if (level >= 7) return "Cyber Ninja";
  if (level >= 5) return "Shell Slinger";
  if (level >= 3) return "Root Seeker";
  return "Script Kiddie";
}

/**
 * handleCommand - now supports interconnected, stateful gameplay
 * @param {string} command - user input
 * @param {object} xpState - { userXP, userLevel, userTitle, addXP }
 * @param {object} gameState - { discoveredIPs, connectedIP, loggedIn }
 * @returns {object} { output: string[], newGameState: object }
 */
export function handleCommand(command, xpState, gameState = initialGameState) {
  // Default state
  let { discoveredIPs = [], connectedIP = null, loggedIn = false } = gameState;
  const cmd = command.trim();
  let output = [];
  let newGameState = { ...gameState };

  // Helper: parse args
  const [baseCmd, ...args] = cmd.split(" ");

  // --- Interconnected commands (delegated to gameStateManager) ---
  if (cmd === "network_scan") {
    // Check for required tool first!
    if (!(gameState.tools || []).includes("nmap")) {
      output = ["> network_scan", "nmap is not installed. Use 'install_tool nmap' first."];
      return { output, newGameState };
    }
    newGameState = scanNetwork(gameState);
    // Mission progression check
    newGameState = checkAndAdvanceMission(newGameState, 'network_scan');
    output = [
      "> network_scan",
      "Scanning [.]",
      "Scanning [..]",
      "Scanning [...]",
      ...newGameState.discoveredIPs.map(ip => `${ip} - ${ip === "192.168.0.42" ? "open" : ip === "10.0.0.2" ? "secure" : ip === "172.16.0.13" ? "hidden" : "??? suspicious"}`),
      `Discovered ${newGameState.discoveredIPs.length} hosts. Use connect <ip> to interact.`
    ];
    if (newGameState.missionMessage) output.push(newGameState.missionMessage);
    if (xpState && xpState.addXP) output.push(...xpState.addXP(20));
    return { output, newGameState };
  }

  if (baseCmd === "connect") {
    const ip = args[0];
    if (!ip) {
      output = ["> connect", "Usage: connect <ip>"];
      return { output, newGameState };
    }
    const result = connectToIP(gameState, ip);
    newGameState = result;
    if (result.error) {
      output = ["> connect " + ip, result.error];
    } else {
      output = ["> connect " + ip, `Connecting to ${ip}...`, "Connection established. Use 'login' to proceed."];
      if (xpState && xpState.addXP) output.push(...xpState.addXP(10));
    }
    return { output, newGameState };
  }

  if (cmd === "login" || baseCmd === "login") {
    // Support: login <password> for secure hosts
    let passwordInput = args.length > 0 ? args.join(" ") : undefined;
    const result = loginToHost(gameState, passwordInput);
    newGameState = result;
    if (result.error) {
      output = ["> login", result.error];
    } else if (gameState.loggedIn) {
      output = ["> login", `Already logged in to ${gameState.connectedIP}.`];
    } else {
      if (passwordInput) {
        output = ["> login", `Password accepted. 🔐 Access Granted to ${gameState.connectedIP}`];
      } else {
        output = ["> login", `Username: hacker007", "Password: ********", "🔐 Access Granted to ${gameState.connectedIP}`];
      }
      if (xpState && xpState.addXP) output.push(...xpState.addXP(15));
    }
    return { output, newGameState };
  }

  if (baseCmd === "ls") {
    const result = listFiles(gameState);
    if (result.error) {
      output = ["> ls", result.error];
    } else {
      // Realistic ls output
      output = ["> ls"];
      (result.files || []).forEach(f => {
        if (f.endsWith(".txt")) output.push(`-rw-r--r-- 1 root root  1.2K mission ${f}`);
        else if (f.endsWith(".exe")) output.push(`-rwxr-xr-x 1 root root  2.1M bin ${f}`);
        else if (f.endsWith(".conf")) output.push(`-rw------- 1 root root  512 config ${f}`);
        else if (f.endsWith("_folder") || f === "secret_folder" || f === "downloads" || f === "backups") output.push(`drwxr-xr-x 2 root root 4.0K dir ${f}/`);
        else output.push(`-rw-r--r-- 1 root root  512 misc ${f}`);
      });
    }
    return { output, newGameState };
  }

  if (baseCmd === "cat") {
    const filename = args.join(" ");
    // Special Indian meme output for weird_lunch_orders.txt
    if (filename === "weird_lunch_orders.txt") {
      output = [
        "> cat weird_lunch_orders.txt",
        "Parsing weird_lunch_orders.txt...",
        "1. Rajesh: 2 butter naan, paneer tikka, extra hari chutney (no onions, boss is watching)",
        "2. Priya: Dosa with Nutella (don't judge)",
        "3. Amit: Chole bhature, but bhature only, chole on the side, 1.5x spicy",
        "4. Suresh: Maggi with ketchup, and a chai in a steel glass",
        "5. Ritu: Salad (but actually eats samosa from Sharma ji's dabba)",
        '6. IT Guy: "Bhai, kuch bhi chalega, bas thanda mil jaye!"',
        "7. Boss: Quinoa salad, but steals a bite of everyone's gulab jamun",
        '',
        "# When lunch is life, but jugaad is real. 🇮🇳🥗🥪🍛"
      ];
      return { output, newGameState };
    }
    const result = catFile(gameState, filename);
    newGameState = checkAndAdvanceMission(result, `cat ${filename}`);
    if (result.error) {
      output = ["> cat " + filename, result.error];
    } else if (result.fileContent) {
      // Realistic cat output: add line numbers and color for .conf
      if (filename.endsWith(".conf")) {
        const lines = result.fileContent.split("\n");
        output = ["> cat " + filename, ...lines.map((l, i) => `${i + 1}: ${l}`)];
      } else {
        output = ["> cat " + filename, result.fileContent];
      }
      if (newGameState.missionMessage) output.push(newGameState.missionMessage);
    } else {
      output = ["> cat " + filename, "No content."];
    }
    return { output, newGameState };
  }

  if (baseCmd === "cd") {
    const dirname = args.join(" ");
    const result = cdDirectory(gameState, dirname);
    if (result.error) {
      output = ["> cd " + dirname, result.error];
    } else {
      output = ["> cd " + dirname, `You entered the ${dirname} directory.`];
      newGameState = { ...gameState, currentDir: dirname };
    }
    return { output, newGameState };
  }

  // --- Tool installation command ---
  if (baseCmd === "install_tool") {
    const toolName = args[0];
    if (!toolName) {
      output = ["> install_tool", "Usage: install_tool <toolname>"];
      return { output, newGameState };
    }
    const result = installTool(gameState, toolName);
    newGameState = result;
    if (result.error) {
      output = ["> install_tool " + toolName, result.error];
    } else {
      output = ["> install_tool " + toolName, `${toolName} installed successfully!`];
      if (xpState && xpState.addXP) output.push(...xpState.addXP(5));
    }
    return { output, newGameState };
  }

  // --- Side/Bonus Missions Command ---
  if (cmd === "side_missions" || cmd === "bonus_missions") {
    try {
      const { sideMissions } = require("../data/missions");
      // Initialize progress if not present
      if (!newGameState.sideMissionProgress) newGameState.sideMissionProgress = {};
      output = ["> side_missions"];
      sideMissions.forEach((mission, idx) => {
        const progress = newGameState.sideMissionProgress[mission.id] || 0;
        const total = mission.steps.length;
        const isComplete = progress >= total;
        output.push(
          `Side Mission ${idx + 1}: ${mission.title}`,
          `Objective: ${mission.description}`,
          `Progress: ${isComplete ? "Completed!" : `Step ${progress + 1} of ${total}`}`,
          `Reward: ${mission.rewardXP} XP`,
          "---"
        );
      });
      output.push("Type the required commands to complete side missions. Progress is tracked automatically!");
    } catch (e) {
      output = ["> side_missions", "No side missions found."];
    }
    return { output, newGameState };
  }

  // --- Side Mission Progression ---
  // Check if any side mission step is completed
  try {
    const { sideMissions } = require("../data/missions");
    if (!newGameState.sideMissionProgress) newGameState.sideMissionProgress = {};
    sideMissions.forEach((mission) => {
      const progress = newGameState.sideMissionProgress[mission.id] || 0;
      if (progress < mission.steps.length) {
        const step = mission.steps[progress];
        const answer = typeof step === 'string' ? step : step.answer;
        if (cmd === answer) {
          newGameState.sideMissionProgress[mission.id] = progress + 1;
          if (progress + 1 === mission.steps.length) {
            if (!output) output = [];
            output.push(`✔ Side Mission Complete: ${mission.title} (+${mission.rewardXP} XP)`);
            if (xpState && xpState.addXP) output.push(...xpState.addXP(mission.rewardXP));
          } else {
            if (!output) output = [];
            output.push(`✔ Side Mission Progress: ${mission.title} (Step ${progress + 1} of ${mission.steps.length})`);
          }
        }
      }
    });
  } catch (e) {}

  // --- Classic commands (not stateful) ---
  switch (cmd.toLowerCase()) {
    case "ping 127.0.0.1":
      output = [
        "> ping 127.0.0.1",
        "Reply from 127.0.0.1: You're talking to yourself again."
      ];
      break;
    case "decrypt_file":
      output = [
        "> decrypt_file",
        "🛡️ Decrypting file...",
        "[██░░░░░░░░] 20%",
        "[████░░░░░░] 40%",
        "[██████░░░░] 60%",
        "[████████░░] 80%",
        "[██████████] 100%",
        "✅ File Decrypted: weird_lunch_orders.txt"
      ];
      if (xpState && xpState.addXP) output.push(...xpState.addXP(30));
      break;
    case "nmap":
      output = [
        "> nmap",
        "Starting Nmap 7.92 ( https://nmap.org ) at 2025-06-29",
        "Nmap scan report for 192.168.0.42 (open)",
        "22/tcp   open  ssh",
        "80/tcp   open  http",
        "443/tcp  closed https",
        "Nmap scan report for 10.0.0.2 (secure)",
        "22/tcp   open  ssh",
        "443/tcp  open  https",
        "Nmap scan report for 192.168.1.5 (suspicious)",
        "6667/tcp open  irc",
        "31337/tcp open  elite",
        "Nmap done: 3 IP addresses scanned in 0.42 seconds"
      ];
      break;
    case "install_nmap": {
      // Alias for install_tool nmap
      const result = installTool(gameState, "nmap");
      newGameState = result;
      if (result.error) {
        output = ["> install_nmap", result.error];
      } else {
        output = [
          "> install_nmap",
          "[░░░░░░░░░░] 0%",
          "[██░░░░░░░░] 20%",
          "[██████░░░░] 60%",
          "[██████████] 100%",
          "Installed: nmap v7.92"
        ];
        if (xpState && xpState.addXP) output.push(...xpState.addXP(10));
      }
      return { output, newGameState };
    }
    case "whoami": {
      if (args.length > 0) {
        // Set the user name
        const newName = args.join(" ").trim();
        newGameState = { ...newGameState, userName: newName };
        output = [
          `> whoami ${newName}`,
          `Username set to: ${newName} (now type 'whoami' to see your profile)`
        ];
      } else {
        const userLevel = (xpState && xpState.userLevel !== undefined) ? xpState.userLevel : 1;
        const userTitle = (xpState && xpState.userTitle) ? xpState.userTitle : "Script Kiddie";
        const userXP = (xpState && xpState.userXP !== undefined) ? xpState.userXP : 0;
        const userName = newGameState.userName || "Anonymous";
        output = [
          "> whoami",
          `you are: ${userName} | Level ${userLevel} - ${userTitle} [XP: ${userXP}/100]`,
          "💡 Hint: Type 'whoami <yourname>' to set your hacker name."
        ];
      }
      break;
    }
    case "mission_status": {
      // Show current mission step and hint
      const step = gameState.missionStep || 0;
      if (step < missionSteps.length) {
        const m = missionSteps[step];
        output = [
          "> mission_status",
          `Mission: ${m.title}`,
          `Objective: ${m.description}`,
          `Step ${step + 1} of ${missionSteps.length}`
        ];
      } else {
        output = [
          "> mission_status",
          "All missions complete! 🏆 You are a Digital Ghost!"
        ];
      }
      return { output, newGameState };
    }
    case "banner":
      output = [
        "> banner",
        "====================",
        "   HACKER SIM OS",
        "===================="
      ];
      break;
    case "rickroll":
      output = [
        "> rickroll",
        "🎵 Never gonna give you up...",
        "🎵 Never gonna let you down...",
        "🎵 Never gonna run around and desert you...",
        "GLITCH"
      ];
      break;
    case "sudo rm -rf /":
      output = [
        "> sudo rm -rf /",
        "💥 Self-destruct sequence initiated...",
        "💣 Just kidding. Access denied. You're not that dangerous.",
        "GLITCH"
      ];
      break;
    case "echo \"hello\"":
      output = ["> echo \"hello\"", "hello"];
      break;
    case "tip":
      output = [
        "> tip",
        "💡 TIP: Use `ping` to test connectivity. It's like yelling into the void and hoping it yells back."
      ];
      break;
    case "init matrix":
      output = [
        "> init matrix",
        "🌌 Welcome to The Matrix",
        "Wake up, Neo...",
        "⚠️ Simulation stabilized.",
        "[SYSTEM] Unauthorized access detected...",
        "[SYSTEM] Intrusion countermeasures deployed.",
        "[SYSTEM] Tracing signal...",
        "[SYSTEM] You are not alone. Someone is watching...",
        "GLITCH"
      ];
      break;
    case "clear":
      return { output: ["CLEAR"], newGameState };
    case "help":
      output = [
        "> help",
        "Core commands:",
        "network_scan        - Scan the network for devices",
        "connect <ip>        - Connect to a discovered IP",
        "login               - Login to the connected host",
        "ls                  - List files on the host (after login)",
        "cat <file>          - View file contents (after login)",
        "cd <dir>            - Enter a directory (after login)",
        "whoami              - Show your hacker profile",
        "mission_status      - Show your level, XP, and next title",
        "banner              - Display the system banner",
        "clear               - Clear the terminal",
        "install_tool <tool> - Install a tool (e.g., nmap)",
        "reset               - Reset all progress and start over",
        "",
        "Fun/Meme commands:",
        "decrypt_file, rickroll, sudo rm -rf /, echo \"hello\"",
        "binod, bhai kya kar raha hai tu, pawri ho rahi hai, so beautiful so elegant, kya karu mai mar jau, xyzzy, cat /dev/random, boss key"
      ];
      break;
    // Meme/Easter egg commands
    case "binod":
      output = [
        "> binod",
        "BINOD spotted! 🔥",
        "(You just made the terminal 10x cooler.)",
        "GLITCH"
      ];
      break;
    case "bhai kya kar raha hai tu":
      output = [
        "> bhai kya kar raha hai tu",
        "Bhai: Coding kar raha hoon, tu tension na le! 💻"
      ];
      break;
    case "pawri ho rahi hai":
      output = [
        "> pawri ho rahi hai",
        "Yeh humari terminal hai...",
        "Yeh hum hain...",
        "Aur yeh pawri ho rahi hai! 🎉"
      ];
      break;
    case "so beautiful so elegant":
      output = [
        "> so beautiful so elegant",
        "Just looking like a wow! 😍"
      ];
      break;
    case "kya karu mai mar jau":
      output = [
        "> kya karu mai mar jau?",
        "Terminal: Chill bro, code likh! 😅"
      ];
      break;
    case "sudo make me a sandwich":
      output = [
        "> sudo make me a sandwich",
        "Okay. 🥪 (root privileges granted)",
        "Just kidding, make it yourself! 😜"
      ];
      break;
    case "xyzzy":
      output = [
        "> xyzzy",
        "Nothing happens. (But you feel a little more mysterious.)"
      ];
      break;
    case "cat /dev/random":
      output = [
        "> cat /dev/random",
        "010101010101010101010101010101... (endless chaos)",
        "Terminal: Enough randomness for today!"
      ];
      break;
    case "boss key":
      output = [
        "> boss key",
        "[BOSS MODE ACTIVATED]",
        "Quick! Pretend you are working on something important..."
      ];
      break;
    case "reset":
      // Clear localStorage and reset all state
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("hackerSimState");
      }
      output = [
        "> reset",
        "All progress reset. Refresh the page to start over!"
      ];
      newGameState = { ...initialGameState, missionStep: 0 };
      break;
    default:
      // Cinematic/creepy/immersive error for short/cryptic commands
      if (cmd.length <= 2 && /^[a-zA-Z0-9]$|^[a-zA-Z0-9]{2}$/.test(cmd)) {
        // Randomly pick a cinematic effect
        const effects = [
          { msg: '[SYSTEM] Unauthorized access detected...', flag: 'DANGER' },
          { msg: '[SYSTEM] Signal lost. Attempting to reconnect...', flag: 'GLITCH' },
          { msg: '[SYSTEM] Intrusion countermeasures deployed.', flag: 'DANGER' },
          { msg: '[SYSTEM] Tracing signal...', flag: 'GLITCH' },
          { msg: '[SYSTEM] You are not alone. Someone is watching...', flag: 'GLITCH' },
          { msg: '[SYSTEM] Command intercepted by sysadmin.', flag: 'DANGER' },
          { msg: '[SYSTEM] Unknown protocol. System instability detected.', flag: 'GLITCH' },
        ];
        const pick = effects[Math.floor(Math.random() * effects.length)];
        // Only show the message, not the flag
        output = [
          `> ${command}`,
          pick.msg,
          // Hidden flag for UI effect (not shown to user)
          `__${pick.flag}__`
        ];
      } else {
        output = ["> " + command, `Unknown command: ${command}`];
      }
      break;
  }

  return { output, newGameState };
}
