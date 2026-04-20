/**
 * API Status — live runtime summary from ``GET /runtime-summary`` (no session header).
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Boxes,
  Cpu,
  ExternalLink,
  FileJson2,
  FileText,
  KeyRound,
  MessageSquare,
  Network,
  RefreshCw,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { PageWrapper, SectionWrapper } from "@/components/layout/page-wrapper";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchRuntimeSummary } from "@/lib/api";
import { API_BASE_URL, joinApiUrl } from "@/lib/constants";
import type { RuntimeSummary } from "@/types";
import { cn } from "@/lib/utils";

const apiStaggerRoot = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

const apiLineGroup = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

const apiButtonStrip = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

const apiCardRow = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

const apiCardInner = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

const apiStairItem = {
  hidden: {
    opacity: 1,
    x: -14,
    y: 8,
    clipPath: "inset(0 100% 0 0)",
  },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.56,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const apiGlassShellItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function Sk({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-md bg-white/10 align-middle animate-pulse",
        className,
      )}
      aria-hidden
    />
  );
}

function providerBadgeVariant(
  s: string,
): "success" | "warning" | "destructive" | "secondary" {
  if (s === "working") return "success";
  if (s === "partial") return "warning";
  if (s === "unavailable") return "destructive";
  return "secondary";
}

export function ApiStatusPage() {
  const [data, setData] = React.useState<RuntimeSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const load = React.useCallback(async (isRefresh: boolean) => {
    // Distinguish first-load skeleton vs manual refresh spinner for smoother UX.
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErr(null);
    try {
      const d = await fetchRuntimeSummary();
      setData(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void load(false);
  }, [load]);

  const docsUrl = joinApiUrl("/docs");
  const healthUrl = joinApiUrl("/health");
  const summaryUrl = joinApiUrl("/runtime-summary");
  const mode = import.meta.env.MODE;

  const statusBadgeVariant =
    data?.status === "ok"
      ? "success"
      : data?.status === "degraded"
        ? "warning"
        : "destructive";

  const showSk = loading || refreshing;

  return (
    <PageWrapper
      showBackground
      showFooter
      clipHorizontal={false}
      className="w-full min-w-0"
    >
      <SectionWrapper className="w-full max-w-9xl mx-auto py-8 sm:py-12 px-2 sm:px-6">
        <motion.div
          variants={apiStaggerRoot}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <motion.div
                variants={apiLineGroup}
                className="flex items-center gap-2 text-white"
              >
                <motion.span variants={apiStairItem} className="inline-flex">
                  <Activity className="h-7 w-7 text-emerald-400" />
                </motion.span>
                <motion.h1
                  variants={apiStairItem}
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                >
                  API status
                </motion.h1>
              </motion.div>
              <motion.p
                variants={apiLineGroup}
                className="mt-2 text-sm text-white/80 max-w-xl"
              >
                <motion.span variants={apiStairItem} className="block">
                  Live summary from{" "}
                  <code className="text-xs text-sky-300/90 bg-white/5 px-1.5 py-0.5 rounded">
                    {summaryUrl}
                  </code>
                  .
                </motion.span>
                <motion.span variants={apiStairItem} className="block mt-1">
                  Frontend uses{" "}
                  <code className="text-xs text-white/80">
                    VITE_API_BASE_URL
                  </code>{" "}
                  → resolved API{" "}
                  <code className="text-xs text-white/80 break-all">
                    {API_BASE_URL}
                  </code>
                </motion.span>
              </motion.p>
            </div>
            <motion.div
              variants={apiButtonStrip}
              className="flex flex-wrap items-center gap-2 shrink-0"
            >
              <motion.div variants={apiStairItem}>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="h-4 w-4" />
                    API Docs
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </Button>
              </motion.div>
              <motion.div variants={apiStairItem}>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a
                    href={summaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileJson2 className="h-4 w-4" />
                    Raw JSON
                  </a>
                </Button>
              </motion.div>

              <motion.div variants={apiStairItem}>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2"
                  disabled={refreshing}
                  // Manual refresh is intentionally same fetch path as initial load.
                  onClick={() => void load(true)}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", refreshing && "animate-spin")}
                  />
                  {refreshing ? "Refreshing…" : "Refresh"}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {err ? (
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="outline" radius="lg" padding="default">
                <GlassCardContent className="text-red-300 text-sm">
                  {err}
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          ) : null}

          <motion.div
            variants={apiCardRow}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="hover" radius="lg" padding="default">
                <GlassCardContent className="space-y-2">
                  <motion.div variants={apiCardInner} className="space-y-2">
                    <motion.p
                      variants={apiStairItem}
                      className="text-xs font-medium uppercase tracking-wide text-white/80"
                    >
                      Status
                    </motion.p>
                    <motion.p
                      variants={apiStairItem}
                      className="text-sm text-white/80 flex items-center gap-2"
                    >
                      <ShieldCheck
                        className="h-4 w-4 shrink-0 text-emerald-300"
                        aria-hidden
                      />
                      Core provider check
                    </motion.p>
                    <motion.div
                      variants={apiStairItem}
                      className="pt-1 min-h-[2rem] flex items-center"
                    >
                      {showSk ? (
                        <Sk className="h-7 w-20" />
                      ) : (
                        <Badge variant={statusBadgeVariant} size="lg">
                          {data?.status ?? "—"}
                        </Badge>
                      )}
                    </motion.div>
                  </motion.div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="hover" radius="lg" padding="default">
                <GlassCardContent className="space-y-2">
                  <motion.div variants={apiCardInner} className="space-y-2">
                    <motion.p
                      variants={apiStairItem}
                      className="text-xs font-medium uppercase tracking-wide text-white/80"
                    >
                      Providers
                    </motion.p>
                    <motion.p
                      variants={apiStairItem}
                      className="text-sm text-white/80 flex items-center gap-2"
                    >
                      <Boxes
                        className="h-4 w-4 shrink-0 text-cyan-300"
                        aria-hidden
                      />
                      Registered engines
                    </motion.p>
                    <motion.div
                      variants={apiStairItem}
                      className="pt-1 min-h-[2.5rem] flex items-end"
                    >
                      {showSk ? (
                        <Sk className="h-10 w-14" />
                      ) : (
                        <span className="text-3xl font-semibold text-white tabular-nums">
                          {data?.providers ?? "—"}
                        </span>
                      )}
                    </motion.div>
                  </motion.div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="hover" radius="lg" padding="default">
                <GlassCardContent className="space-y-2">
                  <motion.div variants={apiCardInner} className="space-y-2">
                    <motion.p
                      variants={apiStairItem}
                      className="text-xs font-medium uppercase tracking-wide text-white/80"
                    >
                      Working / partial
                    </motion.p>
                    <motion.p
                      variants={apiStairItem}
                      className="text-sm text-white/80 flex items-center gap-2"
                    >
                      <KeyRound
                        className="h-4 w-4 shrink-0 text-amber-300"
                        aria-hidden
                      />
                      Usable with keys or partial stack
                    </motion.p>
                    <motion.div
                      variants={apiStairItem}
                      className="pt-1 min-h-[2.5rem] flex items-end"
                    >
                      {showSk ? (
                        <Sk className="h-10 w-14" />
                      ) : (
                        <span className="text-3xl font-semibold text-white tabular-nums">
                          {data?.working ?? "—"}
                        </span>
                      )}
                    </motion.div>
                  </motion.div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </motion.div>

          <motion.div
            variants={apiCardRow}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="hover" radius="lg" padding="default">
                <GlassCardContent className="space-y-2">
                  <motion.div variants={apiCardInner} className="space-y-2">
                    <motion.p
                      variants={apiStairItem}
                      className="text-xs font-medium uppercase tracking-wide text-white/80"
                    >
                      PDFs uploaded
                    </motion.p>
                    <motion.p
                      variants={apiStairItem}
                      className="text-sm text-white/80 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-sky-300" />
                      Successful uploads (all time)
                    </motion.p>
                    <motion.div
                      variants={apiStairItem}
                      className="pt-1 min-h-[2.5rem] flex items-end"
                    >
                      {showSk ? (
                        <Sk className="h-10 w-14" />
                      ) : (
                        <span className="text-3xl font-semibold text-white tabular-nums">
                          {data?.total_pdf_uploads ?? "—"}
                        </span>
                      )}
                    </motion.div>
                  </motion.div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="hover" radius="lg" padding="default">
                <GlassCardContent className="space-y-2">
                  <motion.div variants={apiCardInner} className="space-y-2">
                    <motion.p
                      variants={apiStairItem}
                      className="text-xs font-medium uppercase tracking-wide text-white/80"
                    >
                      Chat completions
                    </motion.p>
                    <motion.p
                      variants={apiStairItem}
                      className="text-sm text-white/80 flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 text-violet-300" />
                      Successful /ask & stream (all time)
                    </motion.p>
                    <motion.div
                      variants={apiStairItem}
                      className="pt-1 min-h-[2.5rem] flex items-end"
                    >
                      {showSk ? (
                        <Sk className="h-10 w-14" />
                      ) : (
                        <span className="text-3xl font-semibold text-white tabular-nums">
                          {data?.total_chat_completions ?? "—"}
                        </span>
                      )}
                    </motion.div>
                  </motion.div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </motion.div>

          <motion.div
            variants={apiCardRow}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="default" radius="lg" padding="default">
                <GlassCardContent className="space-y-3 text-sm">
                  <motion.div variants={apiCardInner} className="space-y-3">
                    <motion.h2
                      variants={apiStairItem}
                      className="text-base font-semibold text-white flex items-center gap-2"
                    >
                      <Cpu className="h-4 w-4 text-violet-300" />
                      Frontend runtime
                    </motion.h2>
                    <motion.div
                      variants={apiCardInner}
                      className="space-y-2 text-white/80"
                    >
                      <motion.div
                        variants={apiStairItem}
                        className="flex justify-between gap-4 border-b border-white/5 pb-2"
                      >
                        <span className="text-white/80 shrink-0">Mode</span>
                        <span className="text-right font-mono text-xs text-sky-200/90 break-all">
                          {mode}
                        </span>
                      </motion.div>
                      <motion.div
                        variants={apiStairItem}
                        className="flex justify-between gap-4 border-b border-white/5 pb-2"
                      >
                        <span className="text-white/80 shrink-0">API base</span>
                        <span className="text-right font-mono text-xs text-sky-200/90 break-all min-w-0">
                          {showSk ? (
                            <Sk className="h-4 w-full max-w-[220px] ml-auto" />
                          ) : (
                            API_BASE_URL
                          )}
                        </span>
                      </motion.div>
                      <motion.div
                        variants={apiStairItem}
                        className="flex justify-between gap-4"
                      >
                        <span className="text-white/80 shrink-0">
                          Default model
                        </span>
                        <span className="text-right font-mono text-xs min-w-0">
                          {showSk ? (
                            <Sk className="h-4 w-40 max-w-full ml-auto" />
                          ) : (
                            <span className="text-emerald-200/90 break-all">
                              {data?.default_model ?? "—"}
                            </span>
                          )}
                        </span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
            <motion.div variants={apiGlassShellItem}>
              <GlassCard variant="default" radius="lg" padding="default">
                <GlassCardContent className="space-y-3 text-sm">
                  <motion.div variants={apiCardInner} className="space-y-3">
                    <motion.h2
                      variants={apiStairItem}
                      className="text-base font-semibold text-white flex items-center gap-2"
                    >
                      <Network className="h-4 w-4 text-cyan-300" />
                      Backend routing
                    </motion.h2>
                    <motion.div
                      variants={apiCardInner}
                      className="space-y-2 text-white/80"
                    >
                      <motion.div
                        variants={apiStairItem}
                        className="flex justify-between gap-4 border-b border-white/5 pb-2"
                      >
                        <span className="text-white/80 shrink-0">Health</span>
                        <span className="text-right font-mono text-[11px] text-sky-200/90 break-all min-w-0">
                          {showSk ? (
                            <Sk className="h-4 w-full max-w-[240px] ml-auto" />
                          ) : (
                            healthUrl
                          )}
                        </span>
                      </motion.div>
                      <motion.div
                        variants={apiStairItem}
                        className="flex justify-between gap-4 border-b border-white/5 pb-2"
                      >
                        <span className="text-white/80 shrink-0">OpenAPI</span>
                        <span className="text-right font-mono text-[11px] text-sky-200/90 break-all min-w-0">
                          {showSk ? (
                            <Sk className="h-4 w-full max-w-[240px] ml-auto" />
                          ) : (
                            docsUrl
                          )}
                        </span>
                      </motion.div>
                      <motion.div
                        variants={apiStairItem}
                        className="flex justify-between gap-4 border-b border-white/5 pb-2"
                      >
                        <span className="text-white/80 shrink-0">
                          Runtime JSON
                        </span>
                        <span className="text-right font-mono text-[11px] text-sky-200/90 break-all min-w-0">
                          {showSk ? (
                            <Sk className="h-4 w-full max-w-[240px] ml-auto" />
                          ) : (
                            summaryUrl
                          )}
                        </span>
                      </motion.div>
                      <motion.div
                        variants={apiStairItem}
                        className="flex justify-between gap-4"
                      >
                        <span className="text-white/80 shrink-0">
                          App version
                        </span>
                        <span className="text-right font-mono text-xs">
                          {showSk ? (
                            <Sk className="h-4 w-24 ml-auto" />
                          ) : (
                            (data?.app_version ?? "—")
                          )}
                        </span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          </motion.div>

          <motion.div variants={apiGlassShellItem}>
            <GlassCard variant="default" radius="lg" padding="default">
              <GlassCardContent className="space-y-3 text-sm">
                <motion.div variants={apiCardInner} className="space-y-3">
                  <motion.h2
                    variants={apiStairItem}
                    className="text-base font-semibold text-white flex items-center gap-2"
                  >
                    <Settings2 className="h-4 w-4 text-amber-300" />
                    Server limits & pipeline
                  </motion.h2>
                  <motion.div
                    variants={apiCardRow}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-white/70"
                  >
                    <motion.div
                      variants={apiStairItem}
                      className="flex justify-between gap-3 border-b border-white/5 sm:border-0 pb-2 sm:pb-0"
                    >
                      <span className="text-white/70 shrink-0">
                        Pipeline agents
                      </span>
                      <span className="font-mono text-xs text-right min-w-[2rem]">
                        {showSk ? (
                          <Sk className="h-4 w-8 ml-auto" />
                        ) : (
                          (data?.pipeline_agents ?? "—")
                        )}
                      </span>
                    </motion.div>
                    <motion.div
                      variants={apiStairItem}
                      className="flex justify-between gap-3 border-b border-white/5 sm:border-0 pb-2 sm:pb-0"
                    >
                      <span className="text-white/70 shrink-0">
                        Embedding chain steps
                      </span>
                      <span className="font-mono text-xs text-right min-w-[2rem]">
                        {showSk ? (
                          <Sk className="h-4 w-8 ml-auto" />
                        ) : (
                          (data?.embedding_chain_steps ?? "—")
                        )}
                      </span>
                    </motion.div>
                    <motion.div
                      variants={apiStairItem}
                      className="flex justify-between gap-3 border-b border-white/5 sm:border-0 pb-2 sm:pb-0"
                    >
                      <span className="text-white/70 shrink-0">
                        LLM keys configured
                      </span>
                      <span className="font-mono text-xs text-right min-w-[2rem]">
                        {showSk ? (
                          <Sk className="h-4 w-8 ml-auto" />
                        ) : (
                          (data?.llm_providers_ready ?? "—")
                        )}
                      </span>
                    </motion.div>
                    <motion.div
                      variants={apiStairItem}
                      className="flex justify-between gap-3 border-b border-white/5 sm:border-0 pb-2 sm:pb-0"
                    >
                      <span className="text-white/70 shrink-0">
                        Rate limit upload / min
                      </span>
                      <span className="font-mono text-xs text-right min-w-[2rem]">
                        {showSk ? (
                          <Sk className="h-4 w-10 ml-auto" />
                        ) : (
                          (data?.rate_limit_upload_per_minute ?? "—")
                        )}
                      </span>
                    </motion.div>
                    <motion.div
                      variants={apiStairItem}
                      className="flex justify-between gap-3 border-b border-white/5 sm:border-0 pb-2 sm:pb-0"
                    >
                      <span className="text-white/70 shrink-0">
                        Rate limit ask / min
                      </span>
                      <span className="font-mono text-xs text-right min-w-[2rem]">
                        {showSk ? (
                          <Sk className="h-4 w-10 ml-auto" />
                        ) : (
                          (data?.rate_limit_ask_per_minute ?? "—")
                        )}
                      </span>
                    </motion.div>
                    <motion.div
                      variants={apiStairItem}
                      className="flex justify-between gap-3 border-b border-white/5 sm:border-0 pb-2 sm:pb-0"
                    >
                      <span className="text-white/70 shrink-0">
                        Max vector sessions (LRU)
                      </span>
                      <span className="font-mono text-xs text-right min-w-[2rem]">
                        {showSk ? (
                          <Sk className="h-4 w-10 ml-auto" />
                        ) : (
                          (data?.max_vector_sessions ?? "—")
                        )}
                      </span>
                    </motion.div>
                    <motion.div
                      variants={apiStairItem}
                      className="flex justify-between gap-3 sm:col-span-2 lg:col-span-1"
                    >
                      <span className="text-white/70 shrink-0">
                        FAISS session max age (days)
                      </span>
                      <span className="font-mono text-xs text-right min-w-[2rem]">
                        {showSk ? (
                          <Sk className="h-4 w-10 ml-auto" />
                        ) : (
                          (data?.faiss_session_max_age_days ?? "—")
                        )}
                      </span>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </GlassCardContent>
            </GlassCard>
          </motion.div>

          <motion.div variants={apiLineGroup}>
            <motion.h2
              variants={apiStairItem}
              className="text-lg font-semibold text-white mb-1 flex items-center gap-2"
            >
              <Network className="h-5 w-5 text-sky-300" />
              Provider status
            </motion.h2>
            <motion.p
              variants={apiStairItem}
              className="text-xs text-white/70 mb-4 font-mono break-all"
            >
              {summaryUrl}
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showSk
                ? Array.from(
                    { length: Math.max(1, data?.providers ?? 5) },
                    (_, i) => (
                      <GlassCard
                        key={`sk-${i}`}
                        variant="hover"
                        radius="lg"
                        padding="default"
                      >
                        <GlassCardContent className="flex gap-3">
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white/20" />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <Sk className="h-5 w-32" />
                              <div className="min-h-[1.5rem] flex items-center">
                                <Sk className="h-6 w-24" />
                              </div>
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed">
                              <Sk className="h-3 w-full max-w-md" />
                            </p>
                          </div>
                        </GlassCardContent>
                      </GlassCard>
                    ),
                  )
                : (data?.providers_detail ?? []).map((row) => (
                    <GlassCard
                      key={row.id}
                      variant="hover"
                      radius="lg"
                      padding="default"
                    >
                      <GlassCardContent className="flex gap-3">
                        <span
                          className={cn(
                            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                            row.status === "working"
                              ? "bg-emerald-400"
                              : row.status === "partial"
                                ? "bg-amber-400"
                                : "bg-red-400",
                          )}
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-mono text-sm text-white font-medium">
                              {row.display_name}
                            </span>
                            <div className="min-h-[1.5rem] flex items-center">
                              <Badge
                                variant={providerBadgeVariant(row.status)}
                                size="sm"
                              >
                                {row.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed">
                            {/* LLM readiness and embedding readiness can differ by provider. */}
                            LLM: {row.llm_ready ? "ready" : "no key"} ·
                            Embeddings:{" "}
                            {row.embedding_ready ? "ready" : "not in chain"}
                          </p>
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  ))}
            </div>
          </motion.div>
        </motion.div>
      </SectionWrapper>
    </PageWrapper>
  );
}

export default ApiStatusPage;
