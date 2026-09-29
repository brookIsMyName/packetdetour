import tls from "node:tls";

export interface TlsMeasurement {
    tlsTimeMs: number;
}

export function measureTls(
    ipAddress: string,
    hostname: string,
    port: number
): Promise<TlsMeasurement> {
    return new Promise ((resolve, reject)=>{
        const start = performance.now();

        const socket = tls.connect({
            host: ipAddress,
            port,
            servername: hostname
        });

        const timer = setTimeout(() => {
            socket.destroy(new Error("TLS handshake timed out after 10 seconds"));
        }, 10_000);
        socket.once("close", () => clearTimeout(timer));

        socket.once("secureConnect", ()=> {
            clearTimeout(timer);
            const end = performance.now()
            socket.destroy();
            resolve({
                tlsTimeMs: Math.round(end-start)
            })
        })
        socket.once("error", (error) => {
            clearTimeout(timer);
            socket.destroy();
            reject(error);
            
        })
    }) 
}
