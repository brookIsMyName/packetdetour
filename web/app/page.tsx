
"use client";

import { useEffect, useState, type FormEvent } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface MeasurementResult {
  url: string;
  hostname: string;
  protocol: string;
  ipAddress: string;
  dnsTimeMs: number;
  tcpTimeMs: number;
  tlsTimeMs: number | null;
  ttfbMs: number;
  status?: number;
  durationMs: number;
  measuredAt: string;
  summary: {
    totalNetworkSetupMs: number;
    secure: boolean;
  };
}

interface HistoryMeasurement {
  id: number;
  url: string;
  hostname: string;
  protocol: string;
  ipAddress: string;
  dnsTimeMs: number;
  tcpTimeMs: number;
  tlsTimeMs: number | null;
  ttfbMs: number;
  durationMs: number;
  totalNetworkSetupMs: number;
  secure: boolean;
  measuredAt: string;
}

function formatMs(value: number | null | undefined) {
  if (value == null) return "N/A";
  return `${Number(value.toFixed(2))} ms`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getRating(value: number) {
  if (value < 100) return { label: "Very fast", color: "text-emerald-700 bg-emerald-50" };
  if (value < 300) return { label: "Fast", color: "text-lime-800 bg-lime-50" };
  if (value < 700) return { label: "Moderate", color: "text-amber-800 bg-amber-50" };
  return { label: "Slow", color: "text-orange-800 bg-orange-50" };
}

function MetricCard({
  label,
  value,
  description,
  icon,
  featured = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        featured
          ? "border-transparent bg-[#172b26] text-white shadow-md"
          : "border-slate-200/80 bg-white text-slate-900 shadow-sm hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
            featured
              ? "bg-white/10 text-lime-300"
              : "bg-slate-100 text-slate-600"
          }`}
          aria-hidden="true"
        >
          {icon}
        </div>

        <span
          className={`mt-1 text-xs font-medium ${
            featured ? "text-slate-300" : "text-slate-400"
          }`}
        >
          {featured ? "Overview" : "Network metric"}
        </span>
      </div>

      <p
        className={`mt-5 text-sm font-medium ${
          featured ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </p>

      <p
        className={`mt-3 text-sm leading-6 ${
          featured ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </article>
  );
}

function HistoryCard({
  measurement,
  onSelect,
}: {
  measurement: HistoryMeasurement;
  onSelect: () => void;
}) {
  const rating = getRating(measurement.ttfbMs);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {measurement.hostname}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(measurement.measuredAt)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${rating.color}`}
        >
          {rating.label}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">First response</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatMs(measurement.ttfbMs)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">DNS lookup</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatMs(measurement.dnsTimeMs)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Connection setup</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatMs(measurement.totalNetworkSetupMs)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Connection security</p>
          <p className="mt-1 font-semibold text-slate-900">
            {measurement.secure ? "HTTPS secured" : "HTTP"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">
          Request duration: {formatMs(measurement.durationMs)}
        </span>
        <span className="text-sm font-semibold text-emerald-800">
          View results →
        </span>
      </div>
    </button>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryMeasurement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  async function loadHistory() {
    try {
      const response = await fetch(`${API_URL}/history`);
      if (!response.ok) return;

      const data = await response.json();

      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function handleMeasure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = url.trim();

    if (!input) {
      setError("Enter a website address to get started.");
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(
        /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(input)
          ? input
          : `https://${input}`
      );
    } catch {
      setError("That doesn't look like a valid website address.");
      return;
    }

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      !parsedUrl.hostname.includes(".") ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      setError("Please enter a valid HTTP or HTTPS website address.");
      return;
    }

    const normalizedUrl = parsedUrl.href;

    setUrl(normalizedUrl);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${API_URL}/measure?url=${encodeURIComponent(normalizedUrl)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "We couldn't measure this website. Please try again.");
        return;
      }

      setResult(data);
      await loadHistory();
    } catch {
      setError(
        "We couldn't connect to PacketDetour. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectHistory(measurement: HistoryMeasurement) {
    setResult({
      url: measurement.url,
      hostname: measurement.hostname,
      protocol: measurement.protocol,
      ipAddress: measurement.ipAddress,
      dnsTimeMs: measurement.dnsTimeMs,
      tcpTimeMs: measurement.tcpTimeMs,
      tlsTimeMs: measurement.tlsTimeMs,
      ttfbMs: measurement.ttfbMs,
      durationMs: measurement.durationMs,
      measuredAt: measurement.measuredAt,
      summary: {
        totalNetworkSetupMs: measurement.totalNetworkSetupMs,
        secure: measurement.secure,
      },
    });

    setUrl(measurement.url);
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8f5] text-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200/70 bg-[#f7f8f5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <a href="#" className="flex items-center gap-3" aria-label="PacketDetour home">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18352c] text-lime-300 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M3 12h5l3-8 4 16 2-8h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div>
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                PacketDetour
              </span>
              <span className="block text-[11px] font-medium tracking-widest text-slate-500">
                WEBSITE PERFORMANCE
              </span>
            </div>
          </a>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span className="text-xs font-medium text-slate-600">
              Network insights, made simple
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-36 -top-20 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 top-36 h-72 w-72 rounded-full bg-lime-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-900 shadow-sm">
              <span className="text-base">✳</span>
              A clearer picture of your connection
            </div>

            <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-[#172b26] sm:text-6xl lg:text-7xl">
              Every millisecond
              <br />
              <span className="text-emerald-700">has a story.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Discover what happens behind the scenes when you visit a website.
              Understand connection speed, response times, and security — without
              needing to be a network expert.
            </p>
          </div>

          {/* Search panel */}
          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_24px_80px_-32px_rgba(23,43,38,0.22)] sm:mt-12 sm:p-7">
            <form onSubmit={handleMeasure}>
              <label
                htmlFor="website-url"
                className="mb-3 block text-sm font-semibold text-slate-800"
              >
                Which website should we explore?
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8faf8] px-4 transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5 shrink-0 text-slate-400"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0-18" />
                  </svg>

                  <input
                    id="website-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    spellCheck={false}
                    placeholder="example.com"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    disabled={loading}
                    aria-describedby="url-help"
                    className="min-w-0 flex-1 bg-transparent py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60 sm:text-base"
                  />

                  {url && !loading && (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200"
                      aria-label="Clear website address"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[#18352c] px-7 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#24483a] focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-wait disabled:opacity-80"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Measuring...
                    </>
                  ) : (
                    <>
                      Measure website
                      <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>
              </div>

              <p id="url-help" className="mt-3 text-xs leading-5 text-slate-500">
                Try any public website. You can enter a domain with or without
                https://.
              </p>
            </form>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
              >
                <span className="text-lg" aria-hidden="true">ⓘ</span>
                <div>
                  <p className="font-semibold">We couldn't complete that measurement</p>
                  <p className="mt-1 leading-6">{error}</p>
                </div>
              </div>
            )}

            {loading && (
              <div
                className="mt-5 rounded-2xl bg-[#f2f7f2] p-4"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#18352c]">
                    Tracing your website's connection
                  </p>
                  <span className="text-xs text-slate-500">Usually a few seconds</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-700" />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Checking connection setup and server response...
                </p>
              </div>
            )}
          </div>

          <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-2">
              <span className="text-emerald-700">✓</span> No account required
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-700">✓</span> Clear explanations
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-700">✓</span> Measurement history
            </span>
          </div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section
          id="results"
          className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-16 sm:px-8 lg:px-12"
        >
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-[#18352c] px-6 py-8 text-white sm:px-9 sm:py-10">
              <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-14 h-44 w-44 rounded-full border border-white/10" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lime-300">
                    <span>✳</span>
                    Measurement complete
                  </div>

                  <h2 className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                    {result.hostname}
                  </h2>

                  <p className="mt-2 break-all text-sm text-slate-300">
                    {result.url}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Measured {formatDate(result.measuredAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 sm:self-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      result.summary.secure
                        ? "bg-emerald-400/15 text-lime-300"
                        : "bg-amber-400/15 text-amber-300"
                    }`}
                  >
                    {result.summary.secure ? "✓" : "!"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {result.summary.secure ? "HTTPS connection" : "HTTP connection"}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      {result.summary.secure
                        ? "Encrypted in transit"
                        : "Not encrypted in transit"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-slate-300">
                <span>
                  Server IP: <span className="font-medium text-white">{result.ipAddress}</span>
                </span>
                <span>
                  Protocol: <span className="font-medium text-white">{result.protocol}</span>
                </span>
                <span>
                  Network setup:{" "}
                  <span className="font-medium text-white">
                    {formatMs(result.summary.totalNetworkSetupMs)}
                  </span>
                </span>
              </div>
            </div>

            <div className="px-5 py-8 sm:px-8 sm:py-10">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                    Your results
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    Here's what we found
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Eight measurements that break down how your website connection works.
                    Select any card's explanation to understand the number.
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  All timings are in milliseconds (ms)
                </span>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="DNS lookup"
                  value={formatMs(result.dnsTimeMs)}
                  icon="⌕"
                  description="Finding the website's server address, like looking up a contact in a phonebook."
                />

                <MetricCard
                  label="TCP connection"
                  value={formatMs(result.tcpTimeMs)}
                  icon="↔"
                  description="Time needed to establish a connection between the measuring server and the website."
                />

                <MetricCard
                  label="TLS handshake"
                  value={formatMs(result.tlsTimeMs)}
                  icon="♧"
                  description={
                    result.tlsTimeMs === null
                      ? "No TLS handshake was recorded. This usually means the website uses HTTP instead of HTTPS."
                      : "Time spent establishing the encrypted connection used by HTTPS."
                  }
                />

                <MetricCard
                  label="First response (TTFB)"
                  value={formatMs(result.ttfbMs)}
                  icon="◷"
                  featured
                  description="Time until the first response data arrives. This includes network delays and the server's initial response time."
                />

                <MetricCard
                  label="Request duration"
                  value={formatMs(result.durationMs)}
                  icon="⏱"
                  description="Elapsed time for the measured fetch request to receive its response headers. This is not a full page-load time."
                />

                <MetricCard
                  label="Network setup"
                  value={formatMs(result.summary.totalNetworkSetupMs)}
                  icon="⌁"
                  description="Combined DNS lookup, TCP connection, and TLS handshake times when applicable."
                />

                <MetricCard
                  label="Web protocol"
                  value={result.protocol}
                  icon="◎"
                  description="The communication protocol used for the website address, such as HTTPS or HTTP."
                />

                <MetricCard
                  label="Connection security"
                  value={result.summary.secure ? "Secure" : "Not secure"}
                  icon={result.summary.secure ? "✓" : "!"}
                  description={
                    result.summary.secure
                      ? "The URL uses HTTPS, which encrypts data in transit when TLS is correctly configured."
                      : "The URL uses HTTP, which does not encrypt traffic in transit."
                  }
                />
              </div>

              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#f8faf8] p-5">
                <span className="mt-0.5 text-xl" aria-hidden="true">💡</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    How should you read these numbers?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Lower timings generally mean less delay, but they depend on the
                    measuring server, network conditions, and website workload. These
                    measurements describe the connection from PacketDetour's server,
                    not necessarily the connection from your own device. A secure
                    connection does not automatically mean a website is trustworthy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* History */}
      <section
        id="history"
        className="border-t border-slate-200/80 bg-white/60"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                Your activity
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#172b26] sm:text-4xl">
                Measurement history
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Revisit previous checks and compare how different websites respond.
                Select a measurement to see its full breakdown.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 sm:self-auto">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5 text-emerald-800"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 3v5h5M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold text-slate-700">
                {history.length} {history.length === 1 ? "measurement" : "measurements"}
              </span>
            </div>
          </div>

          {historyLoading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-4 w-2/5 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-3/5 rounded bg-slate-100" />
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="h-12 rounded-lg bg-slate-100" />
                    <div className="h-12 rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {history.map((measurement) => (
                <HistoryCard
                  key={measurement.id}
                  measurement={measurement}
                  onSelect={() => selectHistory(measurement)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                ⌁
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                Your history starts here
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Every time you measure a website, your results can appear here.
                Run your first measurement to start building a picture of website
                performance.
              </p>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("website-url")?.focus();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-6 rounded-xl bg-[#18352c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24483a] focus:outline-none focus:ring-4 focus:ring-emerald-700/20"
              >
                Measure your first website →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[#f7f8f5]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#18352c] text-sm text-lime-300">
              ✳
            </div>
            <span className="text-sm font-bold text-slate-800">
              PacketDetour
            </span>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Understand the journey. One connection at a time.
          </p>
        </div>
      </footer>
    </main>
  );
}
