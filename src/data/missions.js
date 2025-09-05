export const missions = [
  {
    id: 1,
    title: "Find the Rogue Device",
    description: "A rogue device is connected to the network. Identify and trace its IP.",
    steps: [
      "network_scan",
      "trace_route",
      "cat hack_logs"
    ],
    rewardXP: 50
  },
  {
    id: 2,
    title: "Decrypt the Secret Transmission",
    description: "We intercepted a strange encrypted file. Decrypt it and find out what's inside.",
    steps: [
      "decrypt_file",
      "cat mission.txt"
    ],
    rewardXP: 40
  },
  {
    id: 3,
    title: "Install Recon Tools",
    description: "Set up your environment by installing essential network tools.",
    steps: [
      "install_nmap",
      "whoami"
    ],
    rewardXP: 25
  },
  {
    id: 4,
    title: "Bypass Hidden Directory",
    description: "Something’s hidden deep in the system. Navigate to it and inspect the logs.",
    steps: [
      "cd secret_folder",
      "cat hack_logs"
    ],
    rewardXP: 35
  },
  {
    id: 5,
    title: "Establish Identity",
    description: "You need to authenticate and prove who you are before taking further action.",
    steps: [
      "login",
      "whoami",
      "banner"
    ],
    rewardXP: 30
  }
];

export const sideMissions = [
  {
    id: 1,
    title: "Find Binod (Side Mission)",
    description: "A mysterious name is hidden in the logs. Can you uncover it?",
    steps: [
      { answer: "cat hack_logs", hint: "Check the logs for something unusual." },
      { answer: "binod", hint: "Type the name you found in the logs." }
    ],
    rewardXP: 40
  }
];
