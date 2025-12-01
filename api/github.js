import axios from "axios";

export default async function handler(req, res) {
  // query: ?repo=https://github.com/owner/repo or owner/repo
  const repoRaw = (req.query.repo || "").trim();
  if (!repoRaw) return res.status(400).json({ ok:false, error: "Missing repo param" });

  // normalize
  let ownerRepo = repoRaw;
  if (ownerRepo.startsWith("http")) {
    const m = ownerRepo.match(/github\.com\/([^\/]+\/[^\/]+)/i);
    if (!m) return res.status(400).json({ ok:false, error: "Invalid GitHub URL" });
    ownerRepo = m[1];
  }
  try {
    // GitHub archive endpoint: https://api.github.com/repos/:owner/:repo/zipball
    const api = `https://api.github.com/repos/${ownerRepo}/zipball`;
    // We can either redirect the client to this URL (GitHub will redirect to an S3 URL), or proxy
    // We'll issue a HEAD request to confirm existence, then return the redirect URL for the client to follow.
    const head = await axios.head(api, { maxRedirects: 0, validateStatus: s => s >= 200 && s < 400 });
    // Note: axios with maxRedirects:0 will produce status 302 with location header
    const location = head.headers.location || api;
    return res.json({ ok:true, data: { download_url: location, note: "This is the archive (zip/ tarball) of the public repository." }});
  } catch (err) {
    // If GitHub returns 301/302 or other, still handle
    if (err.response && err.response.status === 302 && err.response.headers.location) {
      return res.json({ ok:true, data: { download_url: err.response.headers.location }});
    }
    console.error(err?.response?.data || err.message || err);
    return res.status(500).json({ ok:false, error: "Failed to fetch GitHub repo archive. Ensure repo exists and is public." });
  }
}
