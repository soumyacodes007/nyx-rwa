import type React from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Database,
  Eye,
  EyeOff,
  FileKey2,
  Fingerprint,
  KeyRound,
  Landmark,
  Lock,
  Radio,
  Scale,
  ShieldCheck,
  Share2,
  UserCheck,
} from "lucide-react"

export const metadata = {
  title: "Nyx · Compliance Architecture",
  description:
    "How Nyx separates public state, confidential token evidence, auditor decryption, KYB controls, and scoped disclosure.",
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-[#8a8480] tracking-[0.16em] uppercase mb-2">
      {children}
    </p>
  )
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "dark" }) {
  const cls =
    tone === "green"
      ? "bg-[#1a6042]/08 text-[#1a6042] border-[#1a6042]/20"
      : tone === "amber"
        ? "bg-[#92400e]/08 text-[#92400e] border-[#92400e]/20"
        : tone === "dark"
          ? "bg-[#37322F] text-white border-[#37322F]"
          : "bg-white text-[#605A57] border-[rgba(55,50,47,0.14)]"

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${cls}`}>
      {children}
    </span>
  )
}

function Visible() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1a6042]">
      <Eye className="w-3 h-3" /> Visible
    </span>
  )
}

function Hidden() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#a8a29e] italic">
      <EyeOff className="w-3 h-3" /> Hidden
    </span>
  )
}

function Scoped() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#92400e]">
      <Share2 className="w-3 h-3" /> Scoped
    </span>
  )
}

function Card({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-5 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-lg bg-[#1a6042]/08 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#1a6042]" />
        </div>
        <p className="text-[14px] font-bold text-[#37322F]">{title}</p>
      </div>
      <p className="text-[12px] text-[#8a8480] leading-relaxed">{body}</p>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "roles", label: "Visibility model" },
  { id: "state", label: "Data boundary" },
  { id: "controls", label: "Controls" },
  { id: "disclosure", label: "Disclosure grants" },
  { id: "audit", label: "Audit evidence" },
  { id: "operations", label: "Demo controls" },
]

const VISIBILITY_MATRIX: [string, React.ReactNode, React.ReactNode, React.ReactNode][] = [
  ["Position existence and lifecycle", <Visible key="public" />, <Visible key="auditor" />, <Scoped key="regulator" />],
  ["SEP-31 payout status", <Visible key="public" />, <Visible key="auditor" />, <Scoped key="regulator" />],
  ["KYB approval result", <Visible key="public" />, <Visible key="auditor" />, <Scoped key="regulator" />],
  ["Proof verification result", <Visible key="public" />, <Visible key="auditor" />, <Scoped key="regulator" />],
  ["Collateral asset class and tenor", <Visible key="public" />, <Visible key="auditor" />, <Scoped key="regulator" />],
  ["Draw and repayment amounts", <Hidden key="public" />, <Visible key="auditor" />, <Scoped key="regulator" />],
  ["Static collateral balance", <Hidden key="public" />, <Hidden key="auditor" />, <Hidden key="regulator" />],
  ["Individual repayment records", <Hidden key="public" />, <Visible key="auditor" />, <Scoped key="regulator" />],
  ["Private witness values", <Hidden key="public" />, <Hidden key="auditor" />, <Hidden key="regulator" />],
]

const CHAIN_STORES = [
  "participant approval result",
  "policy references and contract IDs",
  "oracle price freshness result",
  "position lifecycle events",
  "collateral lock key and nullifier",
  "proof public inputs and verifier result",
  "confidential transfer ciphertext references",
  "disclosure scope hash, expiry, revocation",
]

const CHAIN_NEVER_STORES = [
  "private collateral amount",
  "private draw amount",
  "private repayment amount",
  "auditor private key",
  "plaintext disclosure bundle",
  "full repayment history",
  "private proof witness",
  "viewer session secret",
]

const CONTROLS = [
  {
    icon: UserCheck,
    title: "KYB and participant policy",
    body: "Anchor Platform callbacks create the customer status. ACCEPTED writes approval to ParticipantPolicy on-chain. REJECTED blocks quotes and credit opening.",
    pills: ["SEP-12", "ParticipantPolicy", "on-chain approval"],
  },
  {
    icon: Scale,
    title: "Collateral policy",
    body: "CollateralPolicyRegistry defines eligible collateral, haircut, and maximum tenor. The credit contract checks these values before opening a line.",
    pills: ["eligibility", "haircut", "5 day tenor cap"],
  },
  {
    icon: Clock,
    title: "Oracle freshness",
    body: "OracleAdapter reads the configured price source and rejects stale values. Before a demo, refresh the oracle if ledgers have advanced past the window.",
    pills: ["Reflector source", "freshness window", "stale price reject"],
  },
  {
    icon: Fingerprint,
    title: "Replay prevention",
    body: "Position nullifiers, collateral locks, and repayment history nullifiers prevent a proof, collateral allowance, or private repayment leaf from being reused.",
    pills: ["position nullifier", "lock registry", "leaf nullifier"],
  },
  {
    icon: ShieldCheck,
    title: "Proof verification",
    body: "Noir proofs are verified by UltraHonk verifier contracts on Soroban. Public inputs bind oracle price, haircut, tenor, lock key, and nullifier.",
    pills: ["Noir", "UltraHonk", "Soroban verifier"],
  },
  {
    icon: KeyRound,
    title: "Auditor visibility",
    body: "OZ confidential transfers emit auditor ciphertexts. The auditor can decrypt live draw and repayment amounts without making those amounts public.",
    pills: ["auditor ciphertext", "local credential", "live transfer evidence"],
  },
]

const GRANT_STORES = [
  "grant_id",
  "owner",
  "viewer_hash",
  "position_id",
  "event_hash",
  "scope_hash",
  "expires_at_ledger",
  "revoked",
]

const GRANT_NEVER_STORES = [
  "plaintext amount",
  "auditor key",
  "viewer secret",
  "full disclosure bundle",
  "decrypted event data",
]

const EVIDENCE_TRAIL = [
  {
    title: "Anchor acceptance",
    detail: "SEP-12 customer status accepted, then ParticipantPolicy approval tx confirms.",
  },
  {
    title: "Credit proof",
    detail: "Collateral sufficiency proof job produces proof bytes, verifier accepts them, PrefundingCreditLine opens.",
  },
  {
    title: "Private draw",
    detail: "CreditExecutor coordinates a real cUSDC confidential transfer and records DrawExecuted after success.",
  },
  {
    title: "Auditor decrypt",
    detail: "Auditor decrypts the live cUSDC draw and repayment ciphertext refs, not old proof-of-life artifacts.",
  },
  {
    title: "History proof",
    detail: "RepaymentHistoryRegistry verifies a threshold proof over private leaves without showing the individual records.",
  },
  {
    title: "Scoped disclosure",
    detail: "DisclosureGrantRegistry proves grant scope, expiry, and revocation while the encrypted bundle remains off-chain.",
  },
]

const OPERATIONS = [
  "Use a fresh active SEP-31 transaction before every demo run",
  "Confirm /api/demo/state returns source: live and no quote fallback warnings",
  "Refresh the oracle if the current ledger is outside the freshness window",
  "Confirm Beta draw and repayment confidential artifacts are configured",
  "Run credit open, draw, repay, and history proof serially",
  "Do not claim browser-local proving unless the prover runs outside the backend stack",
]

export default function CompliancePage() {
  return (
    <div className="min-h-screen w-full bg-[#F7F5F3] relative">
      <div className="pointer-events-none fixed inset-y-0 left-0 w-[1px] bg-[rgba(55,50,47,0.10)] shadow-[1px_0_0_white] z-50" />
      <div className="pointer-events-none fixed inset-y-0 right-0 w-[1px] bg-[rgba(55,50,47,0.10)] shadow-[-1px_0_0_white] z-50" />

      <div className="sticky top-0 border-b border-[rgba(55,50,47,0.10)] bg-[#F7F5F3]/90 backdrop-blur-sm z-40">
        <div className="max-w-[1060px] mx-auto px-6 h-11 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-[13px] font-medium text-[#37322F] hover:opacity-70 transition-opacity">
              Nyx
            </Link>
            <span className="w-[1px] h-3.5 bg-[rgba(55,50,47,0.15)]" />
            <span className="text-[11px] font-medium text-[#8a8480] tracking-[0.1em] uppercase">
              Compliance
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-[12px] font-medium text-[#605A57] hover:text-[#37322F] transition-colors">
              Docs
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

        <main className="min-w-0">
          <section id="overview" className="scroll-mt-20">
            <SectionLabel>Nyx compliance architecture</SectionLabel>
            <h1 className="text-[40px] leading-[1.1] font-serif text-[#37322F] mb-5">
              Compliance without public plaintext.
            </h1>
            <p className="text-[15px] text-[#605A57] leading-relaxed max-w-[600px]">
              Nyx separates public accountability from private financial data. The chain proves that
              policy was followed, the auditor can decrypt live confidential token evidence, and
              regulators receive only scoped facts through expiring grants.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-[760px]">
              <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-4 py-4 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                <Radio className="w-4 h-4 text-[#1a6042] mb-3" />
                <p className="text-[12px] font-bold text-[#37322F]">Public verifies status</p>
                <p className="text-[11px] text-[#8a8480] leading-relaxed mt-1">Policy, proof, lifecycle, locks, and tx hashes.</p>
              </div>
              <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-4 py-4 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                <KeyRound className="w-4 h-4 text-[#1a6042] mb-3" />
                <p className="text-[12px] font-bold text-[#37322F]">Auditor decrypts trail</p>
                <p className="text-[11px] text-[#8a8480] leading-relaxed mt-1">Live cUSDC draw and repayment ciphertexts.</p>
              </div>
              <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-4 py-4 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                <Share2 className="w-4 h-4 text-[#1a6042] mb-3" />
                <p className="text-[12px] font-bold text-[#37322F]">Regulator sees scope</p>
                <p className="text-[11px] text-[#8a8480] leading-relaxed mt-1">One encrypted bundle, one permission, one expiry.</p>
              </div>
            </div>
          </section>

          <section id="roles" className="mt-20 scroll-mt-20">
            <SectionLabel>01 - Visibility model</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">One position, different credentials</h2>
            <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
              <div className="hidden sm:grid grid-cols-[1.45fr_1fr_1fr_1fr] px-5 py-3 border-b border-[rgba(55,50,47,0.08)] bg-[rgba(55,50,47,0.02)]">
                <span className="text-[10px] font-bold text-[#8a8480] tracking-[0.12em] uppercase">Fact</span>
                <span className="text-[10px] font-bold text-[#8a8480] tracking-[0.12em] uppercase">Public</span>
                <span className="text-[10px] font-bold text-[#8a8480] tracking-[0.12em] uppercase">Auditor</span>
                <span className="text-[10px] font-bold text-[#8a8480] tracking-[0.12em] uppercase">Regulator</span>
              </div>
              {VISIBILITY_MATRIX.map(([fact, pub, aud, reg], i) => (
                <div
                  key={fact}
                  className={`grid grid-cols-1 sm:grid-cols-[1.45fr_1fr_1fr_1fr] px-5 py-3 gap-2 sm:gap-0 sm:items-center ${i > 0 ? "border-t border-[rgba(55,50,47,0.06)]" : ""}`}
                >
                  <span className="text-[12px] text-[#37322F] font-medium pr-3">{fact}</span>
                  <div className="flex sm:block items-center justify-between"><span className="sm:hidden text-[10px] font-bold text-[#a8a29e] uppercase">Public</span>{pub}</div>
                  <div className="flex sm:block items-center justify-between"><span className="sm:hidden text-[10px] font-bold text-[#a8a29e] uppercase">Auditor</span>{aud}</div>
                  <div className="flex sm:block items-center justify-between"><span className="sm:hidden text-[10px] font-bold text-[#a8a29e] uppercase">Regulator</span>{reg}</div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#a8a29e] mt-3 leading-relaxed max-w-[650px]">
              Static collateral balance is intentionally not decrypted in the demo. The proof shows
              sufficiency; the live confidential transfers emit auditor ciphertexts for draw and repayment.
            </p>
          </section>

          <section id="state" className="mt-20 scroll-mt-20">
            <SectionLabel>02 - Data boundary</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">What can exist on-chain</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-[#FDFAF6] border border-[#1a6042]/20 rounded-2xl px-5 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-[#1a6042]" />
                  <p className="text-[11px] font-bold text-[#1a6042] tracking-wide uppercase">Public chain stores</p>
                </div>
                <div className="flex flex-col gap-2">
                  {CHAIN_STORES.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#1a6042] flex-shrink-0 mt-[2px]" />
                      <span className="text-[12px] text-[#605A57] leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.14)] rounded-2xl px-5 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-[#8a8480]" />
                  <p className="text-[11px] font-bold text-[#605A57] tracking-wide uppercase">Never public state</p>
                </div>
                <div className="flex flex-col gap-2">
                  {CHAIN_NEVER_STORES.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <EyeOff className="w-3.5 h-3.5 text-[#a8a29e] flex-shrink-0 mt-[2px]" />
                      <span className="text-[12px] text-[#8a8480] leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 bg-[rgba(55,50,47,0.03)] border border-dashed border-[rgba(55,50,47,0.16)] rounded-2xl px-5 py-4">
              <p className="text-[12px] text-[#605A57] leading-relaxed">
                <span className="font-bold text-[#37322F]">Boundary rule:</span> the backend stores
                SEP state, proof jobs, event references, and encrypted bundles. It does not become the
                privacy source of truth. Confidential token ciphertexts and verifier-checked proofs do.
              </p>
            </div>
          </section>

          <section id="controls" className="mt-20 scroll-mt-20">
            <SectionLabel>03 - Control planes</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">Policy enforced before liquidity moves</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {CONTROLS.map((control) => (
                <Card key={control.title} icon={control.icon} title={control.title} body={control.body}>
                  <div className="flex flex-wrap gap-1.5">
                    {control.pills.map((pill) => (
                      <Pill key={pill}>{pill}</Pill>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section id="disclosure" className="mt-20 scroll-mt-20">
            <SectionLabel>04 - Scoped disclosure</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-2">A thin registry that cannot leak amounts</h2>
            <p className="text-[14px] text-[#605A57] leading-relaxed max-w-[600px] mb-6">
              DisclosureGrantRegistry records only permission metadata. The encrypted disclosure bundle
              remains off-chain, and the viewer secret belongs to the browser session.
            </p>
            <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl px-5 py-5 shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-[#1a6042] tracking-[0.12em] uppercase mb-2.5">Registry stores</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GRANT_STORES.map((field) => (
                      <Pill key={field} tone="green">{field}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#8a8480] tracking-[0.12em] uppercase mb-2.5">Registry never stores</p>
                  <div className="flex flex-wrap gap-1.5">
                    {GRANT_NEVER_STORES.map((field) => (
                      <span key={field} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono bg-[rgba(55,50,47,0.04)] text-[#a8a29e] border border-[rgba(55,50,47,0.10)] line-through decoration-[#c4bfbb]">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="audit" className="mt-20 scroll-mt-20">
            <SectionLabel>05 - Audit evidence</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">Evidence chain for the demo</h2>
            <div className="flex flex-col">
              {EVIDENCE_TRAIL.map((item, i) => (
                <div key={item.title} className="flex gap-4 relative pb-6 last:pb-0">
                  {i < EVIDENCE_TRAIL.length - 1 && (
                    <div className="absolute left-[13px] top-[30px] bottom-0 w-[1px] bg-[rgba(55,50,47,0.12)]" />
                  )}
                  <div className="w-[27px] h-[27px] rounded-full bg-[#37322F] text-white flex items-center justify-center flex-shrink-0 z-10 text-[11px] font-bold font-mono">
                    {i + 1}
                  </div>
                  <div className="pt-[3px]">
                    <p className="text-[14px] font-bold text-[#37322F] leading-snug">{item.title}</p>
                    <p className="text-[13px] text-[#8a8480] leading-relaxed mt-1 max-w-[560px]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <Card
                icon={FileKey2}
                title="Honest prover boundary"
                body="The current demo uses an anchor demo prover worker. Do not claim the backend never sees witness values unless proving is moved to browser WASM or anchor-controlled infrastructure."
              >
                <div className="flex flex-wrap gap-1.5">
                  <Pill tone="amber">demo prover-worker</Pill>
                  <Pill>production: anchor-controlled prover</Pill>
                </div>
              </Card>
              <Card
                icon={Landmark}
                title="Anchor separation"
                body="SEP-31 payout status and Nyx product status are separate. A payout can be pending while private prefunding has already moved through quote, proof, draw, and repayment."
              >
                <div className="flex flex-wrap gap-1.5">
                  <Pill>pending_sender</Pill>
                  <Pill>pending_stellar</Pill>
                  <Pill>prefunding_required</Pill>
                  <Pill>credit_drawn</Pill>
                </div>
              </Card>
            </div>
          </section>

          <section id="operations" className="mt-20 scroll-mt-20">
            <SectionLabel>06 - Operational controls</SectionLabel>
            <h2 className="text-[26px] font-serif text-[#37322F] mb-6">Pre-demo readiness checklist</h2>
            <div className="bg-[#FDFAF6] border border-[rgba(55,50,47,0.10)] rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(55,50,47,0.06)]">
              {OPERATIONS.map((item, i) => (
                <div key={item} className={`px-5 py-3.5 flex items-center gap-3 ${i > 0 ? "border-t border-[rgba(55,50,47,0.06)]" : ""}`}>
                  <span className="w-[18px] h-[18px] rounded-full border border-[rgba(55,50,47,0.25)] flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#1a6042]" />
                  </span>
                  <span className="text-[13px] text-[#605A57]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-20 pt-8 border-t border-[rgba(55,50,47,0.10)] flex flex-wrap items-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1a6042] hover:text-[#14503a] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> Full documentation <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link
              href="/observer"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#605A57] hover:text-[#37322F] transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" /> Open observer and auditor view <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
