export interface MeasurementResult {
    url: string;
    hostname:string;
    protocol: string;
    status: number;
    durationMs: number;
    measuredAt: string;
}

export async function measureWebsite(url: string): Promise<MeasurementResult> {
    const parsedUrl = new URL(url)
    const start = performance.now();
    const response = await fetch(url);
    const end = performance.now();

    return {
        url,
        hostname: parsedUrl.hostname,
        protocol: parsedUrl.protocol,
        status: response.status,
        durationMs: Math.round(end - start),
        measuredAt: new Date().toISOString()
    };
}