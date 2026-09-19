import { measureDns } from "./measureDns";

export interface MeasurementResult {
    url: string;
    hostname:string;
    protocol: string;
    ipAddress: string;
    dnsTimeMs: number;
    status: number;
    durationMs: number;
    measuredAt: string;
}

export async function measureWebsite(url: string): Promise<MeasurementResult> {
    const parsedUrl = new URL(url);
    const dnsResult = await measureDns(parsedUrl.hostname)
    const start = performance.now();
    const response = await fetch(url);
    const end = performance.now();

    return {
        url,
        hostname: parsedUrl.hostname,
        protocol: parsedUrl.protocol,
        ipAddress: dnsResult.ipAddress,
        dnsTimeMs: dnsResult.dnsTimeMs,
        status: response.status,
        durationMs: Math.round(end - start),
        measuredAt: new Date().toISOString()
    };
}