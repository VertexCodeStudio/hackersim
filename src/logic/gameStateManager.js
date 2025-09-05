// gameStateManager.js
// Handles all stateful game logic for the Hacker Terminal

const hostSecurity = {
  "192.168.0.42": { type: "open", requiresPassword: false },
  "10.0.0.2": { type: "secure", requiresPassword: true, password: "letmein" },
  "192.168.1.5": { type: "suspicious", requiresPassword: false },
  "172.16.0.13": { type: "hidden", requiresPassword: false }
};

export const initialGameState = {
  discoveredIPs: [],
  connectedIP: null,
  loggedIn: false,
  directories: {
    // Per-IP file system
    "192.168.0.42": {
      files: ["mission.txt", "secret_folder", "hack_logs", "passwords.txt"],
      folders: ["secret_folder"],
      currentDir: "/"
    },
    "10.0.0.2": {
      files: ["mission.txt", "firewall.conf", "admin_notes.txt"],
      folders: ["backups"],
      currentDir: "/"
    },
    "192.168.1.5": {
      files: ["mission.txt", "strange_file.bin", "malware.exe"],
      folders: ["secret_folder", "downloads"],
      currentDir: "/"
    },
    "172.16.0.13": {
      files: ["mission.txt", "easter_egg.txt"],
      folders: [],
      currentDir: "/"
    }
  },
  // Add more state as needed (e.g., inventory, cracked passwords, etc.)
  tools: [], // e.g., ["nmap", "hydra"]
  missionStep: 0, // for simple mission progression
};

export function scanNetwork(gameState) {
  // Unlocks a new host after first scan
  let discovered = ["192.168.0.42", "10.0.0.2", "192.168.1.5"];
  if (gameState.missionStep > 1) discovered.push("172.16.0.13");
  return {
    ...gameState,
    discoveredIPs: discovered
  };
}

export function connectToIP(gameState, ip) {
  if (!gameState.discoveredIPs.includes(ip)) {
    return { ...gameState, error: `IP ${ip} not found. Run network_scan first!` };
  }
  return { ...gameState, connectedIP: ip, loggedIn: false };
}

export function loginToHost(gameState, passwordInput) {
  const ip = gameState.connectedIP;
  if (!ip) {
    return { ...gameState, error: "Not connected to any host. Use 'connect <ip>' first." };
  }
  const security = hostSecurity[ip] || {};
  if (security.requiresPassword) {
    // If password not provided, prompt
    if (!passwordInput) {
      return { ...gameState, error: "Password required. Use: login <password>" };
    }
    // Check password (could be more advanced)
    if (passwordInput !== security.password) {
      return { ...gameState, error: "Incorrect password for this host." };
    }
  }
  return { ...gameState, loggedIn: true };
}

export function listFiles(gameState) {
  const ip = gameState.connectedIP;
  if (!ip) return { ...gameState, error: "Not connected to any host. Use 'connect <ip>' first." };
  if (!gameState.loggedIn) return { ...gameState, error: "Access denied. Please 'login' first." };
  // Ensure currentDir is set
  const dir = gameState.directories[ip];
  const currentDir = dir?.currentDir || "/";
  // For now, only support root dir
  if (!dir) return { ...gameState, error: "No file system found for this host." };
  // If in root, show files and folders
  let files = [...(dir.files || []), ...(dir.folders || [])];
  return { ...gameState, files };
}

export function catFile(gameState, filename) {
  const ip = gameState.connectedIP;
  if (!ip || !gameState.loggedIn) return { ...gameState, error: "Access denied. Connect and login first." };
  // Demo file contents
  if (filename === "mission.txt") {
    if (ip === "192.168.0.42") return { ...gameState, fileContent: "Step 1: Find the admin password in passwords.txt" };
    if (ip === "10.0.0.2") return { ...gameState, fileContent: "Step 2: Disable the firewall (see firewall.conf)" };
    if (ip === "192.168.1.5") return { ...gameState, fileContent: "Step 3: Download malware.exe and upload to 10.0.0.2" };
    if (ip === "172.16.0.13") return { ...gameState, fileContent: "Congrats! You found the secret server. Read easter_egg.txt." };
  }
  if (filename === "hack_logs") {
    return { ...gameState, fileContent: "[INFO] Connection from 10.0.0.66\n[WARN] Suspicious access spike\n[ALERT] Failed breach attempt" };
  }
  if (filename === "strange_file.bin") {
    return { ...gameState, fileContent: "\xDE\xAD\xBE\xEF ... (binary noise)" };
  }
  if (filename === "passwords.txt") {
    return { ...gameState, fileContent: "admin: letmein\nuser: password123" };
  }
  if (filename === "firewall.conf") {
    return { ...gameState, fileContent: "# Firewall rules\nALLOW 22\nALLOW 80\nDENY 443" };
  }
  if (filename === "admin_notes.txt") {
    return { ...gameState, fileContent: "TODO: Patch malware vulnerability.\nDon't forget to backup!" };
  }
  if (filename === "malware.exe") {
    return { ...gameState, fileContent: "(binary executable)" };
  }
  if (filename === "easter_egg.txt") {
    return { ...gameState, fileContent: "You found the secret! Binod was here." };
  }
  return { ...gameState, error: `File not found: ${filename}` };
}

export function cdDirectory(gameState, dirname) {
  const ip = gameState.connectedIP;
  if (!ip || !gameState.loggedIn) return { ...gameState, error: "Access denied. Connect and login first." };
  const dir = gameState.directories[ip];
  if (!dir || !dir.folders.includes(dirname)) return { ...gameState, error: `Directory not found: ${dirname}` };
  // Update currentDir for this IP
  return {
    ...gameState,
    directories: {
      ...gameState.directories,
      [ip]: {
        ...dir,
        currentDir: dirname
      }
    },
    currentDir: dirname
  };
}

// Example: install hacking tools
export function installTool(gameState, toolName) {
  if (gameState.tools.includes(toolName)) {
    return { ...gameState, error: `${toolName} is already installed.` };
  }
  return { ...gameState, tools: [...gameState.tools, toolName] };
}

// Mission progression logic (simple linear for demo)
export function advanceMission(gameState) {
  return { ...gameState, missionStep: (gameState.missionStep || 0) + 1 };
}

// --- Mission-driven progression and gating ---
// Add missionSteps array for clarity
export const missionSteps = [
  {
    title: "Reconnaissance",
    description: "Scan the network and find the open host.",
    step: "network_scan",
    rewardXP: 20
  },
  {
    title: "Credential Harvesting",
    description: "Find the admin password on the open host.",
    step: "cat passwords.txt",
    rewardXP: 20
  },
  {
    title: "Infiltration",
    description: "Login to the secure host using the password.",
    step: "login letmein",
    rewardXP: 20
  },
  {
    title: "Firewall Bypass",
    description: "Disable the firewall on the secure host.",
    step: "cat firewall.conf",
    rewardXP: 20
  },
  {
    title: "Payload Deployment",
    description: "Connect to the suspicious host and run malware.",
    step: "cat malware.exe",
    rewardXP: 20
  },
  {
    title: "Ghost Protocol",
    description: "Scan again to find the hidden server and read the secret.",
    step: "cat easter_egg.txt",
    rewardXP: 30
  }
];

// Update checkAndAdvanceMission to use missionSteps
export function checkAndAdvanceMission(gameState, action) {
  let { missionStep = 0 } = gameState;
  let newStep = missionStep;
  let message = null;
  if (missionStep < missionSteps.length && action === missionSteps[missionStep].step) {
    newStep = missionStep + 1;
    message = `✔ Step complete: ${missionSteps[missionStep].title}\n🎯 ${missionSteps[missionStep].description} (+${missionSteps[missionStep].rewardXP} XP)`;
  }
  if (newStep !== missionStep) {
    return { ...gameState, missionStep: newStep, missionMessage: message };
  }
  return { ...gameState, missionMessage: null };
}
