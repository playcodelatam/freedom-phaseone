// ExploitGym — Packet Lab: Architecture & Payload Assembly
// Slices high-resolution cybersecurity architecture and exploit diagrams into an NxN grid.
// Operatives must reconstruct the network topology, TCP packet, or exploit chain
// to verify packet integrity and earn clearance XP.

import { createProgress } from "./progress.js";
import { sfx, unlockAudio } from "./audio.js";

// Generates procedural SVG vector diagrams for cybersecurity concepts
function makeSvg(content) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#081426"/>
        <stop offset="50%" stop-color="#0e1f38"/>
        <stop offset="100%" stop-color="#060e1c"/>
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f5ff"/>
        <stop offset="100%" stop-color="#0099ff"/>
      </linearGradient>
      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00ff88"/>
        <stop offset="100%" stop-color="#00cc66"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <!-- Background grid -->
    <rect width="512" height="512" fill="url(#bg)"/>
    <path d="M0,64 H512 M0,128 H512 M0,192 H512 M0,256 H512 M0,320 H512 M0,384 H512 M0,448 H512 M64,0 V512 M128,0 V512 M192,0 V512 M256,0 V512 M320,0 V512 M384,0 V512 M448,0 V512" stroke="#162c4a" stroke-width="1" opacity="0.4"/>
    <rect x="8" y="8" width="496" height="496" fill="none" stroke="#00f5ff" stroke-width="2" opacity="0.6"/>
    ${content}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 6 Curated Cybersecurity Architecture & Exploit Diagrams
const DIAGRAMS = [
  {
    id: "tcp_header",
    name: "TCP Packet Structure",
    desc: "Headers, sequence numbers & flags",
    url: makeSvg(`
      <text x="256" y="44" fill="#00f5ff" font-family="'Orbitron', monospace" font-size="20" font-weight="bold" text-anchor="middle">TCP/IP PACKET HEADER</text>
      <!-- Row 1: Source & Dest Ports -->
      <rect x="32" y="68" width="220" height="60" rx="8" fill="#132644" stroke="#00f5ff" stroke-width="2"/>
      <text x="142" y="96" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">SOURCE PORT: 44332</text>
      <text x="142" y="116" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">16 BITS // EPHEMERAL</text>
      <rect x="260" y="68" width="220" height="60" rx="8" fill="#132644" stroke="#00f5ff" stroke-width="2"/>
      <text x="370" y="96" fill="#00ff88" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">DEST PORT: 443 (HTTPS)</text>
      <text x="370" y="116" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">16 BITS // TARGET SERVICE</text>
      <!-- Row 2: Sequence Number -->
      <rect x="32" y="138" width="448" height="60" rx="8" fill="#0f2038" stroke="#38bdf8" stroke-width="2"/>
      <text x="256" y="166" fill="#f8fafc" font-family="monospace" font-size="15" font-weight="bold" text-anchor="middle">SEQUENCE NUMBER: 0x7E3A91B4</text>
      <text x="256" y="186" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="middle">32 BITS STREAM TRACKING</text>
      <!-- Row 3: Acknowledgment Number -->
      <rect x="32" y="208" width="448" height="60" rx="8" fill="#0f2038" stroke="#38bdf8" stroke-width="2"/>
      <text x="256" y="236" fill="#f8fafc" font-family="monospace" font-size="15" font-weight="bold" text-anchor="middle">ACKNOWLEDGMENT: 0x7E3A91B5</text>
      <text x="256" y="256" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="middle">32 BITS NEXT EXPECTED BYTE</text>
      <!-- Row 4: Flags & Window -->
      <rect x="32" y="278" width="220" height="60" rx="8" fill="#132644" stroke="#f59e0b" stroke-width="2"/>
      <text x="142" y="306" fill="#f59e0b" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">FLAGS: [SYN, ACK, PSH]</text>
      <text x="142" y="326" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">CONTROL BITS</text>
      <rect x="260" y="278" width="220" height="60" rx="8" fill="#132644" stroke="#f59e0b" stroke-width="2"/>
      <text x="370" y="306" fill="#f59e0b" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">WINDOW SIZE: 65535</text>
      <text x="370" y="326" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">FLOW CONTROL BYTES</text>
      <!-- Row 5: Payload Data -->
      <rect x="32" y="348" width="448" height="130" rx="8" fill="#0b172a" stroke="#00ff88" stroke-width="2"/>
      <text x="48" y="378" fill="#00ff88" font-family="monospace" font-size="14" font-weight="bold">DATA PAYLOAD // HTTP/1.1 REST INJECTION:</text>
      <text x="48" y="408" fill="#f8fafc" font-family="monospace" font-size="13">POST /api/v1/auth/login HTTP/1.1</text>
      <text x="48" y="432" fill="#38bdf8" font-family="monospace" font-size="13">Host: target.corp.local | Cookie: sess_id=...</text>
      <text x="48" y="456" fill="#ff0055" font-family="monospace" font-size="13">Payload: ' OR '1'='1' -- [BYPASS ACTIVE]</text>
    `),
  },
  {
    id: "kill_chain",
    name: "Cyber Kill Chain",
    desc: "Adversary attack progression",
    url: makeSvg(`
      <text x="256" y="44" fill="#00f5ff" font-family="'Orbitron', monospace" font-size="20" font-weight="bold" text-anchor="middle">CYBER KILL CHAIN FRAMEWORK</text>
      <!-- Phase 1 -->
      <rect x="40" y="70" width="432" height="48" rx="8" fill="#11223b" stroke="#38bdf8" stroke-width="2"/>
      <text x="56" y="100" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">01. RECONNAISSANCE</text>
      <text x="456" y="100" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">Nmap port scans, OSINT harvest</text>
      <!-- Phase 2 -->
      <rect x="40" y="128" width="432" height="48" rx="8" fill="#11223b" stroke="#38bdf8" stroke-width="2"/>
      <text x="56" y="158" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">02. WEAPONIZATION</text>
      <text x="456" y="158" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">Crafting reverse shell payload</text>
      <!-- Phase 3 -->
      <rect x="40" y="186" width="432" height="48" rx="8" fill="#11223b" stroke="#00f5ff" stroke-width="2"/>
      <text x="56" y="216" fill="#00f5ff" font-family="monospace" font-size="14" font-weight="bold">03. DELIVERY</text>
      <text x="456" y="216" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">Phishing email / direct HTTP injection</text>
      <!-- Phase 4 -->
      <rect x="40" y="244" width="432" height="48" rx="8" fill="#1e1832" stroke="#a855f7" stroke-width="2"/>
      <text x="56" y="274" fill="#a855f7" font-family="monospace" font-size="14" font-weight="bold">04. EXPLOITATION</text>
      <text x="456" y="274" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">Triggering CVE buffer overflow</text>
      <!-- Phase 5 -->
      <rect x="40" y="302" width="432" height="48" rx="8" fill="#1e1832" stroke="#a855f7" stroke-width="2"/>
      <text x="56" y="332" fill="#a855f7" font-family="monospace" font-size="14" font-weight="bold">05. INSTALLATION</text>
      <text x="456" y="332" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">Deploying persistent cron / backdoor</text>
      <!-- Phase 6 -->
      <rect x="40" y="360" width="432" height="48" rx="8" fill="#2d1424" stroke="#ff0055" stroke-width="2"/>
      <text x="56" y="390" fill="#ff0055" font-family="monospace" font-size="14" font-weight="bold">06. COMMAND &amp; CONTROL</text>
      <text x="456" y="390" fill="#94a3b8" font-family="monospace" font-size="12" text-anchor="end">C2 beaconing over DNS/HTTPS</text>
      <!-- Phase 7 -->
      <rect x="40" y="418" width="432" height="58" rx="8" fill="#0d261e" stroke="#00ff88" stroke-width="2"/>
      <text x="56" y="448" fill="#00ff88" font-family="monospace" font-size="15" font-weight="bold">07. ACTIONS ON OBJECTIVES</text>
      <text x="56" y="466" fill="#38bdf8" font-family="monospace" font-size="12">FLAG EXFILTRATION: FLAG{KILL_CH4IN_COMPLET3D}</text>
    `),
  },
  {
    id: "network_dmz",
    name: "Secure DMZ Architecture",
    desc: "Perimeter, bastion & core tiers",
    url: makeSvg(`
      <text x="256" y="44" fill="#00f5ff" font-family="'Orbitron', monospace" font-size="20" font-weight="bold" text-anchor="middle">ENTERPRISE DMZ ARCHITECTURE</text>
      <!-- Public Internet -->
      <rect x="40" y="70" width="120" height="90" rx="10" fill="#1b253b" stroke="#38bdf8" stroke-width="2"/>
      <text x="100" y="110" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">INTERNET</text>
      <text x="100" y="135" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">UNTRUSTED</text>
      <!-- Arrow 1 -->
      <path d="M165,115 H200" stroke="#00f5ff" stroke-width="3" marker-end="url(#glow)"/>
      <!-- External Firewall -->
      <rect x="205" y="70" width="100" height="90" rx="10" fill="#2d121c" stroke="#ff0055" stroke-width="2"/>
      <text x="255" y="110" fill="#ff0055" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">FIREWALL 1</text>
      <text x="255" y="135" fill="#f8fafc" font-family="monospace" font-size="10" text-anchor="middle">WAF / PORTS 80/443</text>
      <!-- Arrow 2 -->
      <path d="M310,115 H345" stroke="#00f5ff" stroke-width="3"/>
      <!-- DMZ Segment -->
      <rect x="350" y="65" width="125" height="100" rx="10" fill="#162540" stroke="#f59e0b" stroke-width="2"/>
      <text x="412" y="100" fill="#f59e0b" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">DMZ ZONE</text>
      <text x="412" y="125" fill="#f8fafc" font-family="monospace" font-size="11" text-anchor="middle">NGINX REVERSE</text>
      <text x="412" y="145" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">BASTION PROXY</text>
      <!-- Arrow down to internal firewall -->
      <path d="M412,170 V230" stroke="#00f5ff" stroke-width="3"/>
      <!-- Internal Firewall -->
      <rect x="350" y="235" width="125" height="70" rx="10" fill="#2d121c" stroke="#ff0055" stroke-width="2"/>
      <text x="412" y="265" fill="#ff0055" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">FIREWALL 2</text>
      <text x="412" y="285" fill="#f8fafc" font-family="monospace" font-size="10" text-anchor="middle">STRICT ZERO-TRUST</text>
      <!-- Arrow left to internal LAN -->
      <path d="M345,270 H250" stroke="#00ff88" stroke-width="3"/>
      <!-- Internal Secure Network -->
      <rect x="40" y="215" width="200" height="250" rx="12" fill="#0c1d2e" stroke="#00ff88" stroke-width="2"/>
      <text x="140" y="245" fill="#00ff88" font-family="monospace" font-size="15" font-weight="bold" text-anchor="middle">INTERNAL LAN (ISOLATED)</text>
      <!-- App Server -->
      <rect x="55" y="265" width="170" height="55" rx="6" fill="#142640" stroke="#38bdf8" stroke-width="1"/>
      <text x="140" y="295" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">CORE APP SERVERS</text>
      <text x="140" y="310" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">NO DIRECT INTERNET ACCESS</text>
      <!-- DB Server -->
      <rect x="55" y="335" width="170" height="55" rx="6" fill="#142640" stroke="#a855f7" stroke-width="1"/>
      <text x="140" y="365" fill="#a855f7" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">ENCRYPTED DB CLUSTER</text>
      <text x="140" y="380" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">PORT 5432 / 3306 PROTECTED</text>
      <!-- Key Vault -->
      <rect x="55" y="405" width="170" height="45" rx="6" fill="#1e1828" stroke="#f59e0b" stroke-width="1"/>
      <text x="140" y="432" fill="#f59e0b" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">HARDWARE SECURITY (HSM)</text>
    `),
  },
  {
    id: "buffer_overflow",
    name: "Stack Buffer Overflow",
    desc: "Memory frame, canary & EIP",
    url: makeSvg(`
      <text x="256" y="44" fill="#00f5ff" font-family="'Orbitron', monospace" font-size="20" font-weight="bold" text-anchor="middle">x86/x64 STACK MEMORY FRAME</text>
      <!-- Low Memory Address indicator -->
      <text x="40" y="70" fill="#94a3b8" font-family="monospace" font-size="12">LOW MEMORY (0x7FFFFFFFD000) ↓</text>
      <!-- Local Buffer -->
      <rect x="40" y="80" width="432" height="85" rx="8" fill="#1e1218" stroke="#ff0055" stroke-width="2"/>
      <text x="56" y="110" fill="#ff0055" font-family="monospace" font-size="15" font-weight="bold">LOCAL BUFFER [64 BYTES] — OVERFLOWED</text>
      <text x="56" y="135" fill="#f8fafc" font-family="monospace" font-size="13">"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA..." [0x41414141]</text>
      <text x="56" y="152" fill="#94a3b8" font-family="monospace" font-size="11">Attacker input exceeds allocated memory boundaries</text>
      <!-- Stack Canary -->
      <rect x="40" y="175" width="432" height="60" rx="8" fill="#2d1c08" stroke="#f59e0b" stroke-width="2"/>
      <text x="56" y="202" fill="#f59e0b" font-family="monospace" font-size="14" font-weight="bold">STACK CANARY GUARD: 0x00A5F100 [CORRUPTED!]</text>
      <text x="56" y="222" fill="#94a3b8" font-family="monospace" font-size="11">Random integer checked before return; terminates if modified</text>
      <!-- Saved Frame Pointer (EBP) -->
      <rect x="40" y="245" width="432" height="55" rx="8" fill="#12243d" stroke="#38bdf8" stroke-width="2"/>
      <text x="56" y="272" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">SAVED EBP / RBP (FRAME POINTER): 0x7FFD9B80</text>
      <text x="56" y="290" fill="#94a3b8" font-family="monospace" font-size="11">Overwritten by exploit padding</text>
      <!-- Return Address (EIP / RIP) -->
      <rect x="40" y="310" width="432" height="75" rx="8" fill="#082b20" stroke="#00ff88" stroke-width="3"/>
      <text x="56" y="338" fill="#00ff88" font-family="monospace" font-size="15" font-weight="bold">RETURN ADDRESS (EIP / RIP): 0x080484B6</text>
      <text x="56" y="360" fill="#f8fafc" font-family="monospace" font-size="12">HIJACKED! POINTS TO: JMP ESP / SHELLCODE ENTRY</text>
      <text x="56" y="375" fill="#38bdf8" font-family="monospace" font-size="11">CPU jumps directly to injected binary payload</text>
      <!-- High Memory / Shellcode -->
      <rect x="40" y="395" width="432" height="85" rx="8" fill="#141c2c" stroke="#a855f7" stroke-width="2"/>
      <text x="56" y="422" fill="#a855f7" font-family="monospace" font-size="14" font-weight="bold">INJECTED SHELLCODE / NOP SLED [HIGH MEMORY]</text>
      <text x="56" y="445" fill="#f8fafc" font-family="monospace" font-size="12">\x90\x90\x90\x31\xc0\x50\x68\x2f\x2f\x73\x68...</text>
      <text x="56" y="465" fill="#00ff88" font-family="monospace" font-size="11">Spawns /bin/sh with target privileges</text>
    `),
  },
  {
    id: "rsa_crypto",
    name: "Asymmetric Cryptography",
    desc: "Key pairs, ciphertext & TLS",
    url: makeSvg(`
      <text x="256" y="44" fill="#00f5ff" font-family="'Orbitron', monospace" font-size="20" font-weight="bold" text-anchor="middle">ASYMMETRIC RSA CRYPTOSYSTEM</text>
      <!-- Sender: Alice -->
      <rect x="36" y="70" width="130" height="150" rx="10" fill="#11223b" stroke="#38bdf8" stroke-width="2"/>
      <text x="101" y="96" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">SENDER (ALICE)</text>
      <rect x="46" y="110" width="110" height="40" rx="6" fill="#081426"/>
      <text x="101" y="134" fill="#f8fafc" font-family="monospace" font-size="11" text-anchor="middle">PLAINTEXT:</text>
      <text x="101" y="148" fill="#00ff88" font-family="monospace" font-size="11" text-anchor="middle">"FLAG{SECURE}"</text>
      <text x="101" y="185" fill="#f59e0b" font-family="monospace" font-size="10" text-anchor="middle">ENCRYPTS WITH:</text>
      <text x="101" y="200" fill="#f59e0b" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">BOB'S PUBLIC KEY</text>
      <!-- Middle: Untrusted Channel -->
      <rect x="186" y="110" width="140" height="70" rx="10" fill="#2d121c" stroke="#ff0055" stroke-width="2"/>
      <text x="256" y="135" fill="#ff0055" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">CIPHERTEXT (WIRE)</text>
      <text x="256" y="155" fill="#f8fafc" font-family="monospace" font-size="11" text-anchor="middle">0x8F3C...A91E</text>
      <text x="256" y="170" fill="#94a3b8" font-family="monospace" font-size="9" text-anchor="middle">SNIFFING YIELDS NOISE</text>
      <!-- Recipient: Bob -->
      <rect x="346" y="70" width="130" height="150" rx="10" fill="#11223b" stroke="#00ff88" stroke-width="2"/>
      <text x="411" y="96" fill="#00ff88" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">RECIPIENT (BOB)</text>
      <rect x="356" y="110" width="110" height="40" rx="6" fill="#081426"/>
      <text x="411" y="135" fill="#f59e0b" font-family="monospace" font-size="10" text-anchor="middle">DECRYPTS WITH:</text>
      <text x="411" y="148" fill="#f59e0b" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">BOB'S PRIVATE KEY</text>
      <text x="411" y="185" fill="#f8fafc" font-family="monospace" font-size="10" text-anchor="middle">OUTPUT:</text>
      <text x="411" y="200" fill="#00ff88" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">"FLAG{SECURE}"</text>
      <!-- Mathematical Foundation box -->
      <rect x="36" y="235" width="440" height="240" rx="10" fill="#0c1828" stroke="#38bdf8" stroke-width="2"/>
      <text x="56" y="265" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">MATHEMATICAL PRIMITIVES (RSA):</text>
      <text x="56" y="295" fill="#f8fafc" font-family="monospace" font-size="12">1. Select two large primes: p = 61, q = 53</text>
      <text x="56" y="320" fill="#f8fafc" font-family="monospace" font-size="12">2. Modulus: n = p * q = 3233 (Shared Public)</text>
      <text x="56" y="345" fill="#f8fafc" font-family="monospace" font-size="12">3. Totient: φ(n) = (p - 1)(q - 1) = 3120</text>
      <text x="56" y="370" fill="#f59e0b" font-family="monospace" font-size="12">4. Public Exponent e: gcd(e, φ(n)) = 1 ➔ e = 17</text>
      <text x="56" y="395" fill="#ff0055" font-family="monospace" font-size="12">5. Private Exponent d: (d * e) ≡ 1 mod φ(n) ➔ d = 2753</text>
      <text x="56" y="425" fill="#00ff88" font-family="monospace" font-size="12">Encryption: C = M^e mod n | Decryption: M = C^d mod n</text>
      <text x="56" y="450" fill="#94a3b8" font-family="monospace" font-size="11">Security based on computational hardness of prime factorization</text>
    `),
  },
  {
    id: "sql_injection",
    name: "SQL Injection Mechanics",
    desc: "Syntax override & boolean bypass",
    url: makeSvg(`
      <text x="256" y="44" fill="#00f5ff" font-family="'Orbitron', monospace" font-size="20" font-weight="bold" text-anchor="middle">SQL INJECTION (SQLi) BYPASS</text>
      <!-- Vulnerable Code block -->
      <rect x="36" y="68" width="440" height="95" rx="8" fill="#141c2c" stroke="#ff0055" stroke-width="2"/>
      <text x="52" y="94" fill="#ff0055" font-family="monospace" font-size="13" font-weight="bold">VULNERABLE BACKEND QUERY (NODE.JS / PHP):</text>
      <text x="52" y="120" fill="#f8fafc" font-family="monospace" font-size="12">const sql = "SELECT * FROM users WHERE user = '" +</text>
      <text x="52" y="142" fill="#f59e0b" font-family="monospace" font-size="12">             req.body.username + "' AND pass = '" + req.body.password + "'";</text>
      <!-- Injected Payload -->
      <rect x="36" y="178" width="440" height="95" rx="8" fill="#1e1828" stroke="#00f5ff" stroke-width="2"/>
      <text x="52" y="204" fill="#00f5ff" font-family="monospace" font-size="13" font-weight="bold">CRAFTED ATTACKER INPUT:</text>
      <text x="52" y="230" fill="#00ff88" font-family="monospace" font-size="14" font-weight="bold">USERNAME: ' OR '1'='1' -- </text>
      <text x="52" y="254" fill="#94a3b8" font-family="monospace" font-size="12">PASSWORD: (any junk / empty)</text>
      <!-- Resulting Query -->
      <rect x="36" y="288" width="440" height="100" rx="8" fill="#0c1828" stroke="#00ff88" stroke-width="2"/>
      <text x="52" y="314" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="bold">PARSED SQL LOGIC AT DATABASE ENGINE:</text>
      <text x="52" y="340" fill="#f8fafc" font-family="monospace" font-size="12">SELECT * FROM users WHERE user = '' <tspan fill="#00ff88" font-weight="bold">OR '1'='1'</tspan> <tspan fill="#94a3b8">-- AND pass = '...'</tspan></text>
      <text x="52" y="365" fill="#f59e0b" font-family="monospace" font-size="12">EVALUATION: [FALSE] OR [TRUE] ➔ <tspan fill="#00ff88" font-weight="bold">ALWAYS TRUE</tspan></text>
      <!-- Impact Box -->
      <rect x="36" y="400" width="440" height="85" rx="8" fill="#0a2618" stroke="#00ff88" stroke-width="2"/>
      <text x="52" y="426" fill="#00ff88" font-family="monospace" font-size="14" font-weight="bold">EXPLOIT OUTCOME: AUTHENTICATION BYPASS</text>
      <text x="52" y="448" fill="#f8fafc" font-family="monospace" font-size="12">Returns first user record (typically ID 1 / Administrator).</text>
      <text x="52" y="468" fill="#38bdf8" font-family="monospace" font-size="11">Remediation: Parameterized Queries / Prepared Statements (PDO / ORM)</text>
    `),
  },
];

export function startPuzzles(onHome) {
  unlockAudio();
  const root = document.getElementById("puzzles");
  const progress = createProgress();
  root.classList.remove("hidden");
  document.getElementById("hud")?.classList.add("hidden");
  document.getElementById("btn-home")?.classList.remove("hidden");

  let cleanupFns = [];
  function on(el, ev, fn) {
    el.addEventListener(ev, fn);
    cleanupFns.push(() => el.removeEventListener(ev, fn));
  }

  showPicker();

  function showPicker() {
    root.innerHTML = `
      <div class="puz-wrap">
        <h1 class="puz-title">🧩 Packet Lab: Reconstruct Schematics</h1>
        <p class="puz-sub">Assemble network headers, kill-chain phases and memory layouts to verify payload integrity.</p>
        <div class="puz-pick">
          ${DIAGRAMS.map(
            (p) => `<button class="puz-thumb" data-id="${p.id}">
              <img src="${p.url}" alt="${p.name}"/>
              <span class="pt-title">${p.name}</span>
              <span class="pt-desc">${p.desc}</span>
            </button>`
          ).join("")}
        </div>
        <div class="puz-diff">
          <span>Assembly Grid:</span>
          <button class="puz-dbtn selected" data-n="3">3x3 (Fast)</button>
          <button class="puz-dbtn" data-n="4">4x4 (Hard)</button>
        </div>
      </div>`;

    let n = 3;
    root.querySelectorAll(".puz-dbtn").forEach((b) =>
      on(b, "click", () => {
        root.querySelectorAll(".puz-dbtn").forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
        n = Number(b.dataset.n);
      })
    );
    root.querySelectorAll(".puz-thumb").forEach((b) =>
      on(b, "click", () => {
        const diagram = DIAGRAMS.find((p) => p.id === b.dataset.id);
        startBoard(diagram, n);
      })
    );
  }

  function startBoard(diagram, n) {
    const total = n * n;
    const order = shuffle([...Array(total).keys()]);
    root.innerHTML = `
      <div class="puz-wrap">
        <h1 class="puz-title">${diagram.name}</h1>
        <p class="puz-sub">Tap a payload shard in the buffer tray, then tap its destination socket on the board.</p>
        <div class="puz-game">
          <div class="puz-board" style="--n:${n}"></div>
          <div class="puz-tray"></div>
        </div>
        <button class="btn puz-back">↩ Return to Schematics</button>
        <div class="puz-feedback" id="puz-feedback"></div>
      </div>`;

    const board = root.querySelector(".puz-board");
    const tray = root.querySelector(".puz-tray");
    on(root.querySelector(".puz-back"), "click", showPicker);

    // Build board grid cells (faint socket guides)
    const cells = [];
    for (let i = 0; i < total; i++) {
      const cell = document.createElement("div");
      cell.className = "puz-cell";
      cell.dataset.idx = i;
      cell.style.backgroundImage = `url("${diagram.url}")`;
      cell.style.backgroundSize = `${n * 100}% ${n * 100}%`;
      cell.style.backgroundPosition = posFor(i, n);
      board.appendChild(cell);
      cells.push(cell);
      on(cell, "click", () => onCellTap(i));
    }

    // Build shuffled piece tray
    function makePiece(idx) {
      const piece = document.createElement("div");
      piece.className = "puz-piece";
      piece.dataset.idx = idx;
      piece.style.backgroundImage = `url("${diagram.url}")`;
      piece.style.backgroundSize = `${n * 100}% ${n * 100}%`;
      piece.style.backgroundPosition = posFor(idx, n);
      on(piece, "click", () => onPieceTap(piece));
      return piece;
    }
    order.forEach((idx) => tray.appendChild(makePiece(idx)));

    let selected = null;
    let placed = 0;

    function onPieceTap(piece) {
      if (selected) selected.classList.remove("selected");
      selected = selected === piece ? null : piece;
      if (selected) selected.classList.add("selected");
    }

    function onCellTap(cellIdx) {
      const cell = cells[cellIdx];
      if (cell.classList.contains("filled")) return;
      if (!selected) return;

      const pieceIdx = Number(selected.dataset.idx);
      if (pieceIdx === cellIdx) {
        // Correct piece placed
        cell.classList.add("filled");
        cell.classList.add("pop");
        selected.remove();
        selected = null;
        placed++;
        sfx.coin();
        if (placed === total) win();
      } else {
        // Misaligned shard
        selected.classList.remove("selected");
        const s = selected;
        s.classList.add("shake");
        setTimeout(() => s.classList.remove("shake"), 400);
        selected = null;
        sfx.wrong();
      }
    }

    function win() {
      const fb = root.querySelector("#puz-feedback");
      fb.innerHTML = "SCHEMATIC RECONSTRUCTED: PACKET VERIFIED ✓";
      fb.className = "puz-feedback good";
      sfx.win();
      progress.addXp(45);
      burst(root);

      setTimeout(() => {
        const again = document.createElement("button");
        again.className = "btn btn-accent puz-again";
        again.textContent = "Next Schematic →";
        on(again, "click", showPicker);
        fb.after(again);
      }, 700);
    }
  }

  function destroy() {
    cleanupFns.forEach((f) => f());
    cleanupFns = [];
    root.innerHTML = "";
    root.classList.add("hidden");
    document.getElementById("btn-home")?.classList.add("hidden");
  }

  return { destroy };
}

function posFor(idx, n) {
  const col = idx % n;
  const row = Math.floor(idx / n);
  const x = n === 1 ? 0 : (col / (n - 1)) * 100;
  const y = n === 1 ? 0 : (row / (n - 1)) * 100;
  return `${x}% ${y}%`;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function burst(root) {
  const emojis = ["⚡", "🔓", "🛡️", "💾", "🏆"];
  for (let i = 0; i < 16; i++) {
    const e = document.createElement("div");
    e.className = "puz-confetti";
    e.textContent = emojis[i % emojis.length];
    e.style.left = 30 + Math.random() * 40 + "%";
    e.style.animationDelay = Math.random() * 0.3 + "s";
    root.appendChild(e);
    setTimeout(() => e.remove(), 2000);
  }
}
