import { pool } from "./db";
import type { MeasurementResult } from "../services/measureWebsite";

export async function saveMeasurement(
  measurement: MeasurementResult
) {
  const query = `
    INSERT INTO measurements (
      url,
      hostname,
      protocol,
      ip_address,
      dns_time_ms,
      tcp_time_ms,
      tls_time_ms,
      ttfb_ms,
      duration_ms,
      total_network_setup_ms,
      secure,
      measured_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12
    )
    RETURNING id
  `;

  const values = [
    measurement.url,
    measurement.hostname,
    measurement.protocol,
    measurement.ipAddress,
    measurement.dnsTimeMs,
    measurement.tcpTimeMs,
    measurement.tlsTimeMs,
    measurement.ttfbMs,
    measurement.durationMs,
    measurement.summary.totalNetworkSetupMs,
    measurement.summary.secure,
    measurement.measuredAt
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}