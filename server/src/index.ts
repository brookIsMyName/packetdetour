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
        res.status(400).json({
            error: "Please provide a valid string url"
        })
    }
    const start = performance.now()
    try {
        const result = await measureWebsite(url)
        res.json(result)
        
    } catch(error) {
        res.status(500).json({
            error: "Failed to measure URL"
        })
        console.log(error)
    }

})

app.listen(PORT, ()=>{
    console.log(`packetDetour server running on ${PORT}`);
})

