import assert from "node:assert";
import { promises as dns} from "node:dns";
export interface DnsMeasurement {
    ipAddress: string;
    dnsTimeMs: number;
}

export async function measureDns (
    hostname:string
) : Promise<DnsMeasurement> {
    const start = performance.now()
    const result = await dns.lookup(hostname)
    const end = performance.now();
    return {
        ipAddress: result.address,
        dnsTimeMs: Math.round(end- start)
    }
}