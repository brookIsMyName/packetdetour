import { measureDns } from "./measureDns";
import {measureTcp} from "./measureTcp";
import { measureTls } from "./measureTls";
import  {measureTtfb} from "./measureTtfb";

export interface MeasurementResult {
    url: string;
    hostname:string;
    protocol: string;
    ipAddress: string;
    dnsTimeMs: number;
    tcpTimeMs: number;
    tlsTimeMs: number | null;
    ttfbMs: number;
    status: number;
    durationMs: number;
    measuredAt: string;
    summary: {
        totalNetworkSetupMs: number;
        secure: boolean;
    }
}

export async function measureWebsite(url: string): Promise<MeasurementResult> {
    const parsedUrl = new URL(url);
    const dnsResult = await measureDns(parsedUrl.hostname)
    const port = Number(parsedUrl.port) || (parsedUrl.protocol === "https:" ? 443 : 80);
    const tcpResult = await measureTcp(
        dnsResult.ipAddress,
        port
    )
    let tlsTimeMs: number | null = null;
     if (parsedUrl.protocol === "https:") {
        const tlsResult = await measureTls(
            dnsResult.ipAddress,
            parsedUrl.hostname,
            port
        );

        tlsTimeMs = tlsResult.tlsTimeMs
     }
     const ttfbResult = await measureTtfb(url);
    const start = performance.now();
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    const end = performance.now();
    await response.body?.cancel();

    const totalNetworkSetupMs = dnsResult.dnsTimeMs + tcpResult.tcpTimeMs + (tlsTimeMs ?? 0);
    
    return {
        url,
        hostname: parsedUrl.hostname,
        protocol: parsedUrl.protocol,
        ipAddress: dnsResult.ipAddress,
        dnsTimeMs: dnsResult.dnsTimeMs,
        tcpTimeMs: tcpResult.tcpTimeMs,
        tlsTimeMs,
        ttfbMs: ttfbResult.ttfbMs,
        status: response.status,
        durationMs: Math.round(end - start),
        measuredAt: new Date().toISOString(),
         summary: {
            totalNetworkSetupMs,
            secure: parsedUrl.protocol === "https:"
         }
    };
}
