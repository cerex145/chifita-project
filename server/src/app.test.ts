import request from "supertest";
import { createApp } from "./app";

describe("app", () => {
  it("responds to health checks", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, service: "chifita-server" });
  });
});
