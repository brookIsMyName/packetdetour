CREATE TABLE IF NOT EXISTS measurements (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    hostname TEXT NOT NULL,
    protocol TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    dns_time_ms INTEGER NOT NULL,
    tcp_time_ms INTEGER NOT NULL,
    tls_time_ms INTEGER,
    ttfb_ms INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,
    total_network_setup_ms INTEGER NOT NULL,
    secure BOOLEAN NOT NULL,
    measured_at TIMESTAMPTZ NOT NULL
);
