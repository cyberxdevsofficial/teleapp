import axios from "axios";
import cheerio from "cheerio";

export default async function handler(req, res) {
  // ?url=<mediafire-file-page-url>
  const url = (req.query.url || "").trim();
  if (!url) return res.status(400).json({ ok:false, error: "Missing url param" });

  try {
    const r = await axios.get(url, { timeout: 10000, headers: { "User-Agent":"Mozilla/5.0" }});
    const $ = cheerio.load(r.data);
    // MediaFire pages include a download button; try to extract direct link
    // NOTE: site structure may change; this is a best-effort extractor.
    const dlBtn = $("a#downloadButton").attr("href") || $("a.popsok").attr("href");
    const title = $("div.filename").text().trim() || $("title").text().trim();
    const size = $("ul.details li:contains('Size')").text().replace("Size","").trim();

    return res.json({
      ok: true,
      data: {
        page: url,
        title: title || null,
        size: size || null,
        direct_download: dlBtn || null,
        note: "Direct download extraction is best-effort. If direct_download is null, supply your own downloader service URL and set API_MF_DOWNLOADER env var."
      }
    });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    return res.status(500).json({ ok:false, error: "Failed to parse MediaFire page" });
  }
}
