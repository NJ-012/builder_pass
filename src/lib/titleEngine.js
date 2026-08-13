// Deterministic builder title engine
// Stack × Energy → curated title

const TITLE_MATRIX = {
  AI: {
    ARCHITECT: ['Neural Architect', 'Systems Intelligence Architect', 'AI Infrastructure Lead'],
    HACKER: ['Model Hacker', 'Prompt Breaker', 'Neural Exploit Engineer'],
    EXPLORER: ['Frontier AI Explorer', 'Emergent Intelligence Scout', 'AI Cartographer'],
    DEGEN: ['Model Alchemist', 'GPU Degen', 'Training Loss Maximalist'],
    VISIONARY: ['AGI Visionary', 'Intelligence Designer', 'Synthetic Minds Architect'],
    CHAOS_ENGINEER: ['Neural Chaos Engineer', 'Hallucination Specialist', 'AI Entropy Maker'],
    RESEARCHER: ['Deep Learning Researcher', 'Foundation Model Scientist', 'AI Theorist'],
    MAKER: ['AI Shipwright', 'Inference Engineer', 'Model Deployer'],
  },
  CRYPTO: {
    ARCHITECT: ['Protocol Architect', 'Chain Systems Designer', 'Consensus Engineer'],
    HACKER: ['Smart Contract Hacker', 'On-Chain Exploit Hunter', 'MEV Searcher'],
    EXPLORER: ['Cross-Chain Explorer', 'DeFi Pathfinder', 'Protocol Archeologist'],
    DEGEN: ['Protocol Degen', 'Liquidity Goblin', 'Chain Menace'],
    VISIONARY: ['Web3 Visionary', 'Decentralized Futures Architect', 'Token Economist'],
    CHAOS_ENGINEER: ['Fork Specialist', 'Consensus Breaker', 'Chain Chaos Agent'],
    RESEARCHER: ['Cryptography Researcher', 'ZK Proof Scientist', 'Mechanism Designer'],
    MAKER: ['Smart Contract Deployer', 'dApp Shipwright', 'On-Chain Builder'],
  },
  CYBER: {
    ARCHITECT: ['Security Architect', 'Zero-Trust Designer', 'Threat Model Architect'],
    HACKER: ['Penetration Artist', 'Red Team Lead', 'Exploit Developer'],
    EXPLORER: ['Attack Surface Mapper', 'Vuln Hunter', 'Bug Bounty Explorer'],
    DEGEN: ['Security Degen', 'CTF Addict', 'Offensive Maximalist'],
    VISIONARY: ['Cyber Defense Visionary', 'Security Futurist', 'Trust Architect'],
    CHAOS_ENGINEER: ['Purple Team Chaos', 'Incident Chaos Engineer', 'Security Entropy Maker'],
    RESEARCHER: ['Malware Researcher', 'Threat Intel Analyst', 'CVE Discoverer'],
    MAKER: ['Security Tool Builder', 'Detection Engineer', 'SIEM Shipwright'],
  },
  WEB: {
    ARCHITECT: ['Frontend Architect', 'Web Platform Architect', 'Performance Engineer'],
    HACKER: ['DOM Hacker', 'Browser Bender', 'API Exploit Artist'],
    EXPLORER: ['Edge Runtime Explorer', 'Web Standards Pioneer', 'PWA Pathfinder'],
    DEGEN: ['Framework Degen', 'NPM Addict', 'JS Maximalist'],
    VISIONARY: ['Web Experience Visionary', 'Interface Futurist', 'Digital Experience Lead'],
    CHAOS_ENGINEER: ['Build System Chaos Agent', 'Config Entropy Maker', 'Deploy Chaos Engineer'],
    RESEARCHER: ['Web Performance Researcher', 'Rendering Pipeline Scientist', 'A11y Researcher'],
    MAKER: ['Full-Stack Shipwright', 'Pixel Perfect Builder', 'Component Crafter'],
  },
  ML: {
    ARCHITECT: ['ML Systems Architect', 'Pipeline Architect', 'Feature Store Designer'],
    HACKER: ['Data Pipeline Hacker', 'Model Jailbreaker', 'Dataset Exploit Hunter'],
    EXPLORER: ['Data Explorer', 'Distribution Diver', 'Feature Space Navigator'],
    DEGEN: ['Overfitting Degen', 'Hyperparameter Gambler', 'GPU Burner'],
    VISIONARY: ['MLOps Visionary', 'Prediction Architect', 'Data Futures Designer'],
    CHAOS_ENGINEER: ['Data Drift Chaos Agent', 'Model Decay Specialist', 'Pipeline Entropy Maker'],
    RESEARCHER: ['ML Research Scientist', 'Statistical Learning Theorist', 'Optimization Researcher'],
    MAKER: ['ML Engineer', 'Model Deployer', 'Pipeline Builder'],
  },
  DESIGN: {
    ARCHITECT: ['Design Systems Architect', 'Experience Architect', 'Visual Systems Lead'],
    HACKER: ['Design Hacker', 'Interaction Bender', 'Convention Breaker'],
    EXPLORER: ['Design Explorer', 'UX Research Pioneer', 'Interaction Mapper'],
    DEGEN: ['Pixel Degen', 'Anti-Pattern Maximalist', 'Brutalist Designer'],
    VISIONARY: ['Interface Visionary', 'Experience Futurist', 'Design Language Creator'],
    CHAOS_ENGINEER: ['Design System Chaos Agent', 'Layout Entropy Maker', 'UX Chaos Tester'],
    RESEARCHER: ['Design Researcher', 'Cognitive Load Scientist', 'Usability Analyst'],
    MAKER: ['UI Crafter', 'Interaction Builder', 'Design-Dev Hybrid'],
  },
  PRODUCT: {
    ARCHITECT: ['Product Architect', 'Platform Strategist', 'Feature Systems Designer'],
    HACKER: ['Growth Hacker', 'Funnel Bender', 'Metric Manipulation Expert'],
    EXPLORER: ['Product Explorer', 'Market Mapper', 'User Signal Hunter'],
    DEGEN: ['Ship-First Degen', 'Feature Maximalist', 'Launch Addict'],
    VISIONARY: ['Product Visionary', 'Market Futures Architect', 'Category Creator'],
    CHAOS_ENGINEER: ['A/B Test Chaos Agent', 'Feature Flag Entropy Maker', 'Release Chaos Manager'],
    RESEARCHER: ['Product Researcher', 'Behavioral Scientist', 'Market Intelligence Analyst'],
    MAKER: ['Product Builder', 'Feature Shipwright', 'MVP Machine'],
  },
  RESEARCH: {
    ARCHITECT: ['Research Infrastructure Architect', 'Knowledge Systems Designer', 'Lab Architect'],
    HACKER: ['Research Hacker', 'Paper Replication Breaker', 'Methodology Bender'],
    EXPLORER: ['Research Explorer', 'Interdisciplinary Pioneer', 'Knowledge Frontiersman'],
    DEGEN: ['Paper Mill Degen', 'Citation Maximalist', 'Preprint Addict'],
    VISIONARY: ['Research Visionary', 'Science Futurist', 'Paradigm Architect'],
    CHAOS_ENGINEER: ['Reproducibility Chaos Agent', 'Methodology Entropy Maker', 'Peer Review Chaos'],
    RESEARCHER: ['Deep Researcher', 'First-Principles Scientist', 'Theoretical Researcher'],
    MAKER: ['Research Engineer', 'Lab Builder', 'Experiment Shipwright'],
  },
  HARDWARE: {
    ARCHITECT: ['Hardware Architect', 'Silicon Systems Designer', 'Embedded Systems Architect'],
    HACKER: ['Hardware Hacker', 'Firmware Bender', 'Side-Channel Exploit Artist'],
    EXPLORER: ['Hardware Explorer', 'IoT Pathfinder', 'Sensor Network Pioneer'],
    DEGEN: ['Overclock Degen', 'FPGA Maximalist', 'Voltage Regulator Gambler'],
    VISIONARY: ['Hardware Visionary', 'Compute Futurist', 'Edge Computing Architect'],
    CHAOS_ENGINEER: ['Power Supply Chaos Agent', 'Signal Integrity Entropy Maker', 'Thermal Chaos'],
    RESEARCHER: ['Hardware Researcher', 'ASIC Design Scientist', 'Quantum Hardware Researcher'],
    MAKER: ['Hardware Maker', 'PCB Shipwright', 'Prototype Builder'],
  },
  OTHER: {
    ARCHITECT: ['Systems Architect', 'Cross-Domain Designer', 'Integration Architect'],
    HACKER: ['Generalist Hacker', 'Convention Breaker', 'Multi-Domain Exploit Artist'],
    EXPLORER: ['Multidisciplinary Explorer', 'Boundary Crosser', 'Domain Pioneer'],
    DEGEN: ['Polymath Degen', 'Jack-of-All Maximalist', 'Chaos Agent'],
    VISIONARY: ['Cross-Domain Visionary', 'Convergence Architect', 'Futures Designer'],
    CHAOS_ENGINEER: ['Organizational Chaos Agent', 'Process Entropy Maker', 'System Chaos Engineer'],
    RESEARCHER: ['Interdisciplinary Researcher', 'Convergence Scientist', 'Cross-Domain Analyst'],
    MAKER: ['Generalist Builder', 'Multi-Stack Shipwright', 'Universal Maker'],
  },
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function titlesFor(stack, energy) {
  const stackId = typeof stack === 'string' ? stack : stack?.id || 'OTHER'
  const energyId = typeof energy === 'string' ? energy : energy?.id || 'MAKER'
  return TITLE_MATRIX[stackId]?.[energyId] || TITLE_MATRIX.OTHER[energyId] || ['Builder']
}

/**
 * Deterministic by default, so the same builder always gets the same class.
 * `offset` lets the studio cycle through the alternatives on request.
 */
export function generateTitle(stack, energy, name = '', offset = 0) {
  if (!stack || !energy) return ''
  const titles = titlesFor(stack, energy)
  const base = name ? hashString(name) : 0
  return titles[(base + offset) % titles.length]
}

/** How many alternatives exist for this combination. */
export function countTitles(stack, energy) {
  return titlesFor(stack, energy).length
}

export function generateBuilderId() {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `BUILDER // ${String(num).padStart(4, '0')}`
}
