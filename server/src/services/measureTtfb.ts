import { response } from "express";
import http from "node:http"
import https from "node:https"

export interface TtfbMeasurement {
    ttfbMs: number;
    statusCode: number;

}

export function measureTtfb(
    url:string
): Promise<TtfbMeasurement> {
    return new Promise ((resolve, reject) => {
        const parsedUrl = new URL(url)

        const client = parsedUrl.protocol === "https:" ? https : http;
        
        const start = performance.now()
        const request = client.get(url, (response) => {
            const end = performance.now()

            response.destroy();
            
            resolve({
                ttfbMs:Math.round(end - start),
                statusCode: response.statusCode ?? 0
            })
        })

        const timer = setTimeout(() => {
            request.destroy(
                new Error("TTFBmeasurement timed out after 10 seconds")
                
            )
        }, 10_000);

        request.once("error", (error) => {
            clearTimeout(timer)
            reject(error)
        })
    })
}