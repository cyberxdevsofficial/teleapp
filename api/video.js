import axios from "axios";

export default async function handler(req, res) {
  // Query: type & q -> e.g. ?type=yt&q=VIDEO_URL
  // Env: EXTERNAL_DOWNLOADER_URL should accept ?type=...&q=...
  const base = process.env.EXTERNAL_DOWNLOADER_URL;
  if (!base) return res.status(500).json({ ok:false, error: "Missing EXTERNAL_DOWNLOADER_URL in env. This endpoint forwards requests to your downloader service." });

  const type = (req.query.type || "generic").trim();
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ ok:false, error: "Missing q param" });

  try {
    const api = `${base}?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`;
    const r = await axios.get(api, { timeout: 20000 });
    // Return whatever the downloader returns
    return res.json({ ok:true, data: r.data });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    return res.status(500).json({ ok:false, error: "Failed to call external downloader" });
  }
}
