import net from "node:net";

export interface TcpMeasurement {
    tcpTimeMs: number;
}

export function measureTcp(
    ipAddress: string,
    port:number
): Promise<TcpMeasurement>{
    return new Promise((resolve, reject)=>{
        const start = performance.now();
        const socket = net.createConnection({
            host: ipAddress,
            port
        })

        const timer = setTimeout(() => {
            socket.destroy(new Error("TCP connection timed out after 10 seconds"));
        }, 10_000);
        socket.once("close", () => clearTimeout(timer));

        socket.once("connect", ()=>{
            clearTimeout(timer);
            const end = performance.now();
            socket.destroy();
            resolve({
                tcpTimeMs: Math.round(end - start)
            })
        })

        socket.once("error", (error)=>{
            clearTimeout(timer);
            socket.destroy();
            reject(error);
        })
    })
}
