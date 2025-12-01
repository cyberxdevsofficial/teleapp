import axios from "axios";

export default async function handler(req, res) {
  // query param: ?url=<tiktok_url>
  const url = (req.query.url || "").trim();
  if (!url) return res.status(400).json({ ok:false, error: "Missing url param" });

  try {
    // TikTok has an oEmbed endpoint:
    // https://www.tiktok.com/oembed?url=VIDEO_URL
    const api = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const r = await axios.get(api, { timeout: 8000 });
    // oEmbed returns author_name, html, thumbnail_url etc.
    return res.json({ ok: true, data: r.data, note: "Metadata only. No direct download provided." });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    return res.status(500).json({ ok:false, error: "Failed to fetch TikTok metadata" });
  }
}
