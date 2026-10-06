import express from "express";
import cors from "cors";
import { measureWebsite } from "./services/measureWebsite";
import { saveMeasurement } from "./database/saveMeasurement";
import { pool } from "./database/db";

export const app = express();

app.use(cors());

app.get("/health", (req, res) => {
  return res.json({
    status: "ok"
  });
});

app.get("/measure", async (req, res) => {
  const url = req.query.url;

  if (typeof url !== "string") {
    return res.status(400).json({
      error: "Please provide a valid string url"
    });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({
      error: "Invalid URL"
    });
  }

  if (
    parsedUrl.protocol !== "http:" &&
    parsedUrl.protocol !== "https:"
  ) {
    return res.status(400).json({
      error: "Only HTTP and HTTPS URLs are supported"
    });
  }

  try {
    const result = await measureWebsite(url);

    const saved = await saveMeasurement(result);

    return res.json({
      id: saved.id,
      ...result
    });
  } catch (error) {
    console.error("Measurement failed:", error);

    return res.status(500).json({
      error: "Failed to measure URL"
    });
  }
});

app.get("/history", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        url,
        hostname,
        protocol,
        ip_address AS "ipAddress",
        dns_time_ms AS "dnsTimeMs",
        tcp_time_ms AS "tcpTimeMs",
        tls_time_ms AS "tlsTimeMs",
        ttfb_ms AS "ttfbMs",
        duration_ms AS "durationMs",
        total_network_setup_ms AS "totalNetworkSetupMs",
        secure,
        measured_at AS "measuredAt"
      FROM measurements
      ORDER BY measured_at DESC
      LIMIT 50
    `);

    return res.json(result.rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to load measurement history"
    });
  }
});