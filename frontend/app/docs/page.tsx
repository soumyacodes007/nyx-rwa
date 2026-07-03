import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Landmark,
  Layers,
  ShieldCheck,
  Cpu,
  Radio,
  Lock,
  History,
  Share2,
  GitBranch,
  Boxes,
} from "lucide-react"

export const metadata = {
  title: "Nyx · Documentation",
  description: "How Nyx confidential prefunding credit works — architecture, flow, contracts, and proofs.",
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-[#8a8480] tracking-[0.16em] uppercase mb-2">
      {children}
    </p>
  )
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "dark" | "green" }) {
  const cls =
    tone === "dark"
      ? "bg-[#37322F] text-white border-[#37322F]"
      : tone === "green"
        ? "bg-[#1a6042]/08 text-[#1a6042] border-[#1a6042]/20"
        : "bg-white text-[#605A57] border-[rgba(55,50,47,0.14)]"
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${cls}`}>
      {children}
    </span>
  )
}

function StatusChain({ steps, accent }: { steps: string[]; accent?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-y-2">
      {steps.map((step, i) => (
        <span key={step} className="flex items-center">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              accent !== undefined && i === accent
                ? "bg-[#1a6042]/08 text-[#1a6042] border-[#1a6042]/25 font-bold"
                : "bg-white text-[#605A57] border-[rgba(55,50,47,0.14)]"
            }`}
          >
            {step}
          </span>
          {i < steps.length - 1 && <span className="mx-1.5 text-[#c4bfbb] text-[11px]">→</span>}
        </span>
      ))}
    </div>
  )
}

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "The problem" },
  { id: "flow", label: "How it works" },
  { id: "architecture", label: "Architecture" },
  { id: "states", label: "State machines" },
  { id: "contracts", label: "Contracts" },
  { id: "proofs", label: "Proof system" },
]

const FLOW_STEPS = [
  { title: "SEP-31 payout arrives", body: "Anchor Platform creates or ingests the payout transaction that needs prefunded liquidity." },
  { title: "KYB syncs on-chain", body: "Alpha's accepted KYB status is written to ParticipantPolicy — approval becomes an on-chain authorization condition, not UI state." },
  { title: "Live quote", body: "The backend quotes prefunding from real contract state: participant approval, collateral policy, haircut, tenor, and a fresh oracle price." },
  { title: "Collateral sufficiency proof", body: "Alpha generates a Noir proof that its encrypted cTBill balance covers the draw after haircut — without revealing the balance." },
  { title: "On-chain verification", body: "PrefundingCreditLine.open_credit verifies the UltraHonk proof on Soroban, checks every policy, and locks the collateral commitment." },
  { title: "Confidential draw", body: "The facility releases cUSDC through an OpenZeppelin confidential transfer — the ledger records an encrypted commitment, not an amount." },
  { title: "Public lifecycle, private numbers", body: "Anyone can see an active position with a verified proof. Nobody can read reserve size, draw amount, or fee." },
  { title: "Auditor visibility", body: "Every confidential transfer emits a second ciphertext encrypted to the auditor key — decryptable evidence, live." },
  { title: "Repayment", body: "Alpha repays; the credit line closes, the collateral lock releases, and the SEP-31 payout completes." },
  { title: "Repayment history proof", body: "A second circuit proves a threshold statement — e.g. ≥2 of 3 repayments on time — without exposing which one was late." },
  { title: "Scoped disclosure", body: "A regulator receives one encrypted fact via an expiring, revocable grant. The server never sees the plaintext." },
]

const LAYERS = [
  {
    icon: Landmark,
    name: "Anchor / SEP layer",
    body: "Stellar Anchor Platform + business callback server. Owns SEP-31 payout state and SEP-12 KYB status.",
    pills: ["Anchor Platform", "Business server", "SEP-31", "SEP-12"],
  },
  {
    icon: Boxes,
    name: "Coordination backend",
    body: "Fastify API with SQLite state, a Soroban event watcher, a quote engine reading live contract state, and a proof job queue.",
    pills: ["Fastify API", "Quote engine", "Prover worker", "Event watcher", "Auditor / disclosure APIs"],
  },
  {
    icon: GitBranch,
    name: "Soroban contracts",
    body: "Nine contracts enforce participation, collateral policy, oracle freshness, locking, credit lifecycle, history, and disclosure grants.",
    pills: ["ParticipantPolicy", "CollateralPolicyRegistry", "OracleAdapter", "CollateralLockRegistry", "PrefundingCreditLine", "RepaymentHistoryRegistry", "DisclosureGrantRegistry", "2× UltraHonk verifiers"],
  },
  {
    icon: Lock,
    name: "Confidential token layer",
    body: "OpenZeppelin Confidential Tokens are the privacy source of truth: encrypted balances, encrypted transfer amounts, auditor ciphertexts, compliance hooks.",
    pills: ["cUSDC", "cTBill", "ConfidentialAuditor", "ConfidentialVerifier"],
  },
  {
    icon: Layers,
    name: "Frontend personas",
    body: "One design system, three credentials: the anchor operator runs the flow, the public observer verifies it, the auditor decrypts it.",
    pills: ["Anchor operator", "Public observer", "Authorized auditor", "Regulator (scoped link)"],
  },
]

const CONTRACTS = [
  { name: "ParticipantPolicy", role: "On-chain allowlist — records whether a participant is approved to use the credit system. Synced from Anchor Platform KYB." },
  { name: "CollateralPolicyRegistry", role: "Collateral eligibility, haircut basis points, max tenor, and oracle configuration per asset." },
  { name: "OracleAdapter", role: "Price and freshness checks — Reflector-backed where configured. Stale prices reject the open." },
  { name: "CollateralLockRegistry", role: "Prevents a collateral commitment from being reused; releases the lock after repayment." },
  { name: "PrefundingCreditLine", role: "The core: verifies the proof, checks every policy, opens credit, records draw and repayment, emits lifecycle events." },
  { name: "RepaymentHistoryRegistry", role: "Stores private repayment leaves and roots; verifies threshold statements via the second circuit." },
  { name: "DisclosureGrantRegistry", role: "Thin grant registry — scope hash, viewer hash, expiry, revocation. Stores no plaintext, ever." },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div className="min-h-screen w-full bg-[#F7F5F3] relative">
      <div className="pointer-events-none fixed inset-y-0 left-0 w-[1px] bg-[rgba(55,50,47,0.10)] shadow-[1px_0_0_white] z-50" />
      <div className="pointer-events-none fixed inset-y-0 right-0 w-[1px] bg-[rgba(55,50,47,0.10)] shadow-[-1px_0_0_white] z-50" />

      {/* Top bar */}
      <div className="sticky top-0 border-b border-[rgba(55,50,47,0.10)] bg-[#F7F5F3]/90 backdrop-blur-sm z-40">
        <div className="max-w-[1060px] mx-auto px-6 h-11 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[13px] font-medium text-[#37322F] hover:opacity-70 transition-opacity">
              Nyx
            </Link>
            <span className="w-[1px] h-3.5 bg-[rgba(55,50,47,0.15)]" />
            <span className="text-[11px] font-medium text-[#8a8480] tracking-[0.1em] uppercase">
              Documentation
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/compliance" className="text-[12px] font-medium text-[#605A57] hover:text-[#37322F] transition-colors">
              Compliance
            </Link>
            <Link
              href="/anchor"
              className="inline-flex items-center gap-1.5 bg-[#37322F] text-white text-[12px] font-medium px-3.5 py-1.5 rounded-full hover:bg-[#23201E] transition-colors"
            >
              Open dashboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1060px] mx-auto px-6 pt-14 pb-24 grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-12">

        {/* Sticky TOC */}
        <nav className="hidden lg:block">
          <div className="sticky top-24">
            <SectionLabel>On this page</SectionLabel>
            <div className="flex flex-col">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="py-1.5 text-[12px] text-[#8a8480] hover:text-[#37322F] transition-colors border-l border-[rgba(55,50,47,0.10)] pl-3 hover:border-[#37322F]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="min-w-0">

          {/* Hero */}
          <section id="overview" className="scroll-mt-20">
            <SectionLabel>Nyx · Confidential Prefunding</SectionLabel>
            <h1 className="text-[40px] leading-[1.1] font-serif text-[#37322F] mb-5">
              Private credit for public rails.
            </h1>
            <p className="text-[15px] text-[#605A57] leading-relaxed max-w-[560px]">
              Nyx lets a Stellar anchor borrow short-term stablecoin liquidity against confidential
              tokenized collateral — without revealing reserve size, draw amount, repayment amount,
              or credit capacity to the public.
            </p>
            <div className="mt-6 bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-6 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)] max-w-[560px]">
              <p className="text-[13px] text-[#37322F] leading-relaxed font-serif italic">
                “The public sees that a compliant credit position exists — but amounts stay hidden.
                Then an authorized auditor loads a credential and decrypts the full trail.”
              </p>
              <p className="text-[11px] text-[#a8a29e] mt-2">The demo in one sentence.</p>
            </div>
          </section>

          {/* Problem */}
          <section id="problem" className="mt-20 scroll-mt-20">
            <SectionLabel>01 — The problem</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-4">Prefunding is dead capital with bad options</h2>
            <p className="text-[14px] text-[#605A57] leading-relaxed max-w-[560px] mb-6">
              Cross-border anchors must prefund corridors before a payout completes. Today every
              option leaks something:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["Idle USDC in corridors", "capital-inefficient — money waits instead of working"],
                ["External borrowing", "exposes treasury stress and reserve size to lenders"],
                ["Public collateral moves", "leaks corridor strategy to competitors on-chain"],
                ["Off-chain trust", "lenders and auditors settle for PDFs and delayed reconciliation"],
              ].map(([title, body]) => (
                <div key={title} className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-5 py-4 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                  <p className="text-[13px] font-bold text-[#37322F] mb-1">{title}</p>
                  <p className="text-[12px] text-[#8a8480] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
            <p className="text-[14px] text-[#605A57] leading-relaxed max-w-[560px] mt-6">
              The institutional requirement isn&apos;t just “borrow against collateral.” It is: prove
              sufficiency without disclosing the amount, release liquidity privately, keep a public
              audit trail, let an authorized auditor decrypt everything, and let a counterparty
              verify <em>selected</em> facts without seeing the whole book.
            </p>
          </section>

          {/* Flow */}
          <section id="flow" className="mt-20 scroll-mt-20">
            <SectionLabel>02 — How it works</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">Eleven steps, end to end</h2>
            <div className="flex flex-col">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4 relative pb-6 last:pb-0">
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="absolute left-[13px] top-[30px] bottom-0 w-[1px] bg-[rgba(55,50,47,0.12)]" />
                  )}
                  <div className="w-[27px] h-[27px] rounded-full bg-[#37322F] text-white flex items-center justify-center flex-shrink-0 z-10 text-[11px] font-bold font-mono">
                    {i + 1}
                  </div>
                  <div className="pt-[3px]">
                    <p className="text-[14px] font-bold text-[#37322F] leading-snug">{step.title}</p>
                    <p className="text-[13px] text-[#8a8480] leading-relaxed mt-1 max-w-[520px]">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture" className="mt-20 scroll-mt-20">
            <SectionLabel>03 — Architecture</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-2">Five layers, one boundary rule</h2>
            <p className="text-[14px] text-[#605A57] leading-relaxed max-w-[560px] mb-6">
              The backend coordinates; it is never the privacy source of truth. That role belongs to
              the confidential token ciphertexts and verifier-checked proofs.
            </p>
            <div className="flex flex-col gap-3">
              {LAYERS.map((layer) => (
                <div key={layer.name} className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-5 py-4 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(55,50,47,0.06)] flex items-center justify-center flex-shrink-0">
                      <layer.icon className="w-3.5 h-3.5 text-[#605A57]" />
                    </div>
                    <p className="text-[14px] font-bold text-[#37322F]">{layer.name}</p>
                  </div>
                  <p className="text-[12px] text-[#8a8480] leading-relaxed mb-2.5">{layer.body}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {layer.pills.map((pill) => (
                      <Pill key={pill}>{pill}</Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* State machines */}
          <section id="states" className="mt-20 scroll-mt-20">
            <SectionLabel>04 — State machines</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-2">Two lifecycles, deliberately separate</h2>
            <p className="text-[14px] text-[#605A57] leading-relaxed max-w-[560px] mb-6">
              <span className="font-mono text-[13px]">pending_stellar</span> means the payout is waiting on settlement.
              <span className="font-mono text-[13px]"> credit_drawn</span> means the private prefunding leg released
              liquidity. Related — but not the same machine, and Nyx never conflates them.
            </p>
            <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-6 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)] flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-bold text-[#8a8480] tracking-[0.14em] uppercase mb-2.5">SEP-31 payout status</p>
                <StatusChain steps={["pending_sender", "pending_stellar", "completed"]} />
              </div>
              <div className="h-[1px] bg-[rgba(55,50,47,0.08)]" />
              <div>
                <p className="text-[10px] font-bold text-[#8a8480] tracking-[0.14em] uppercase mb-2.5">Nyx product status</p>
                <StatusChain steps={["prefunding_required", "credit_quote_ready", "proof_pending", "proof_verified", "credit_drawn", "repaid", "closed"]} />
              </div>
            </div>
          </section>

          {/* Contracts */}
          <section id="contracts" className="mt-20 scroll-mt-20">
            <SectionLabel>05 — Contracts</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">What enforces what</h2>
            <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
              {CONTRACTS.map((contract, i) => (
                <div
                  key={contract.name}
                  className={`px-5 py-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 ${i > 0 ? "border-t border-[rgba(55,50,47,0.07)]" : ""}`}
                >
                  <span className="text-[12px] font-mono font-bold text-[#37322F] sm:w-[220px] flex-shrink-0">
                    {contract.name}
                  </span>
                  <span className="text-[12px] text-[#8a8480] leading-relaxed">{contract.role}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#a8a29e] mt-3 leading-relaxed">
              Plus the OpenZeppelin confidential token contracts (cUSDC, cTBill, ConfidentialAuditor,
              ConfidentialVerifier) and two UltraHonk verifier contracts — one per circuit.
            </p>
          </section>

          {/* Proofs */}
          <section id="proofs" className="mt-20 scroll-mt-20">
            <SectionLabel>06 — Proof system</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">Two circuits, one honesty rule</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-5 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#1a6042]" />
                  <p className="text-[14px] font-bold text-[#37322F]">Collateral sufficiency</p>
                </div>
                <p className="text-[12px] text-[#8a8480] leading-relaxed mb-3">
                  Proves the private collateral balance covers the requested draw after haircut. The
                  public inputs bind the oracle price, haircut, tenor, lock key, and a position
                  nullifier — so the proof can&apos;t be replayed or repriced.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone="green">Noir</Pill>
                  <Pill tone="green">UltraHonk</Pill>
                  <Pill>verified on Soroban</Pill>
                  <Pill>nullifier replay-blocked</Pill>
                </div>
              </div>
              <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-5 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-[#1a6042]" />
                  <p className="text-[14px] font-bold text-[#37322F]">Repayment history</p>
                </div>
                <p className="text-[12px] text-[#8a8480] leading-relaxed mb-3">
                  Proves a threshold statement over private repayment leaves — e.g. at least 2 of 3
                  repayments on time — without exposing amounts, dates, counterparties, or which
                  record was late. This is the portable private credit record.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone="green">Second circuit</Pill>
                  <Pill>private leaves + root</Pill>
                  <Pill>threshold statement</Pill>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-[rgba(55,50,47,0.03)] border border-dashed border-[rgba(55,50,47,0.16)] rounded-2xl px-5 py-4">
              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-[#8a8480] flex-shrink-0 mt-[1px]" />
                <p className="text-[12px] text-[#605A57] leading-relaxed">
                  <span className="font-bold text-[#37322F]">Honesty note:</span> demo proving runs in an
                  Alpha-controlled prover worker, and auditor decryption runs through co-hosted auditor
                  tooling. In production, proving moves into the anchor&apos;s own infrastructure (or
                  browser WASM) and decryption runs on auditor-controlled machines. Nyx never claims
                  the backend can&apos;t see witness values while that boundary is co-hosted.
                </p>
              </div>
            </div>
          </section>

          {/* Footer links */}
          <div className="mt-20 pt-8 border-t border-[rgba(55,50,47,0.10)] flex flex-wrap items-center gap-4">
            <Link
              href="/compliance"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1a6042] hover:text-[#14503a] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Compliance architecture <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link
              href="/anchor"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#605A57] hover:text-[#37322F] transition-colors"
            >
              <Radio className="w-3.5 h-3.5" /> Run the demo <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link
              href="/observer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#605A57] hover:text-[#37322F] transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Observer view <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
