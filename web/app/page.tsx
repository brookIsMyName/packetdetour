"use client";

import {useEffect, useState} from "react";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";
interface MeasurementResult {
  url: string;
  hostname: string;
  protocol: string;
  ipAddress: string;
  dnsTimeMs: number;
  tcpTimeMs: number;
  tlsTimeMs: number | null;
  ttfbMs: number;
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

export default function Home(){
 
  const [url, setUrl] = useState("")
  const [result, setResult] = useState<MeasurementResult | null>(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<HistoryMeasurement[]>([]);
  
  async function loadHistory() {
  try {
    const response = await fetch(`${API_URL}/history`);

    const data = await response.json();

    if (!response.ok) {
      return;
    }

    setHistory(data);
  } catch (error) {
    console.error("Failed to load history:", error);
  }
}

useEffect(() => {
  loadHistory();
}, []);

  async function handleMeasure(){
    setLoading(true)
    setError("")
      setResult(null)
      
      try{
        const response = await fetch(`${API_URL}/measure?url=${encodeURIComponent(url)}`)
        
        const data = await response.json();
        
        if(!response.ok) {
          setError(data.error ?? "Measurement failed");
          return;
        }
        setResult(data);
        await loadHistory();
      } catch {
        setError("Could not connect to PacketDetour server")
      } finally {
        setLoading(false)
        
      }
    }

  return(
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">
          PacketDetour
        </h1>
        <p className="mt-2 text-gray-500">
          See what happens between you and a website.
        </p>
          
          <div className="mt-8 flex gap-3">


          <input type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="flex-1 rounded border p-3" />

          <button 
          onClick={handleMeasure}
          disabled={loading}
          className="rounded bg0black px-6 py-3 text-white">
            {loading ? "Measuring" : "Measure"}
          </button>
          </div>

          {error && (
            <p className="mt-4 text-red-500">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-4 text-red-500">
             <h2 className="text-2xl font-semibold">
              {result.hostname}
            </h2>
             <p className="mt-1 text-gray-500">
              {result.ipAddress}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <MetricCard
                label="DNS"
                value={`${result.dnsTimeMs} ms`}
              />

              <MetricCard
                label="TCP"
                value={`${result.tcpTimeMs} ms`}
              />

              <MetricCard
                label="TLS"
                value={
                  result.tlsTimeMs !== null
                    ? `${result.tlsTimeMs} ms`
                    : "N/A"
                }
              />

              <MetricCard
                label="TTFB"
                value={`${result.ttfbMs} ms`}
              />

              <MetricCard
                label="Fetch"
                value={`${result.durationMs} ms`}
              />

              <MetricCard
                label="Network setup"
                value={`${result.summary.totalNetworkSetupMs} ms`}
              />

              <MetricCard
                label="Protocol"
                value={result.protocol}
              />

              <MetricCard
                label="Secure"
                value={result.summary.secure ? "Yes" : "No"}
              />
            </div>
            </div>
          )}

          {history.length > 0 && (
  <section className="mt-12">
    <h2 className="text-2xl font-semibold">
      Measurement History
    </h2>

    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-3">Host</th>
            <th className="p-3">DNS</th>
            <th className="p-3">TCP</th>
            <th className="p-3">TLS</th>
            <th className="p-3">TTFB</th>
            <th className="p-3">Measured</th>
          </tr>
        </thead>

        <tbody>
          {history.map((measurement) => (
            <tr
              key={measurement.id}
              className="border-b"
            >
              <td className="p-3">
                {measurement.hostname}
              </td>

              <td className="p-3">
                {measurement.dnsTimeMs} ms
              </td>

              <td className="p-3">
                {measurement.tcpTimeMs} ms
              </td>

              <td className="p-3">
                {measurement.tlsTimeMs !== null
                  ? `${measurement.tlsTimeMs} ms`
                  : "N/A"}
              </td>

              <td className="p-3">
                {measurement.ttfbMs} ms
              </td>

              <td className="p-3">
                {new Date(
                  measurement.measuredAt
                ).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)}
      </div>
    </main>
  )

}


function MetricCard({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}