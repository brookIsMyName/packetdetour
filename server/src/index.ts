import express from "express";
import {measureWebsite} from './services/measureWebsite'

const { performance } = require('perf_hooks');

const app = express();
const PORT = 3000;

app.get("/health", (req, res) => {
    res.json({
        staus: "ok"
    })
})

app.get("/measure", async (req, res) => {
    const url = req.query.url
    if (typeof url !== "string") {
       return res.status(400).json({
            error: "Please provide a valid string url"
        })
    }
    let parsedUrl: URL;
    try {
       parsedUrl = new URL(url)
        
    } catch(error) {
        return res.status(400).json({
            error: "Invalid URL"
        })

    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:"){
        return res.status(400).json({
            error: "Only HTTP and HTTPS URLs are supported"
        })
    }

    try {
        const result = await measureWebsite(url);
        res.json(result)
        
    } catch (error) {
        console.error("Measurement failed", error);
        return res.status(500).json({
            error: "Failed to Measure URL"
        })
    }
})

app.listen(PORT, ()=>{
    console.log(`packetDetour server running on ${PORT}`);
})

