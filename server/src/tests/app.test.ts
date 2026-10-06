import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../app";

describe("PacketDetour API", () => {
  it("returns health status", async () => {
    const response = await request(app)
      .get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok"
    });
  });

  it("rejects a missing URL", async () => {
    const response = await request(app)
      .get("/measure");

    expect(response.status).toBe(400);
  });

  it("rejects an invalid URL", async () => {
    const response = await request(app)
      .get("/measure")
      .query({
        url: "google.com"
      });

    expect(response.status).toBe(400);

    expect(response.body.error).toBe(
      "Invalid URL"
    );
  });

  it("rejects unsupported protocols", async () => {
    const response = await request(app)
      .get("/measure")
      .query({
        url: "ftp://example.com"
      });

    expect(response.status).toBe(400);
  });
});