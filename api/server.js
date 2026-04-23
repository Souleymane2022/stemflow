import { app, setupServer } from "../server/index.js";

let initialized = false;

export default async function handler(req, res) {
  if (req.url.endsWith("/ping")) {
    return res.status(200).json({ status: "ok", from: "api/server.js" });
  }

  try {
    if (!initialized) {
      await setupServer(app);
      initialized = true;
    }
    return app(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
