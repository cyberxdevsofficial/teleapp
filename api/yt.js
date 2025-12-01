import axios from "axios";

export default async function handler(req, res) {
  // GET params: ?url=... or ?id=...
  const YT_KEY = process.env.YOUTUBE_API_KEY;
  if (!YT_KEY) {
    return res.status(500).json({ ok:false, error: "Missing YOUTUBE_API_KEY in env" });
  }

  const qUrl = (req.query.url || "").trim();
  const qId = (req.query.id || "").trim();

  try {
    // Try extract videoId from url if given
    let videoId = qId;
    if (!videoId && qUrl) {
      const m = qUrl.match(/(?:v=|\/embed\/|\.be\/)([A-Za-z0-9_-]{6,})/);
      if (m) videoId = m[1];
    }
    if (!videoId) return res.status(400).json({ ok:false, error: "No video id or url provided" });

    const api = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${encodeURIComponent(videoId)}&key=${YT_KEY}`;
    const resp = await axios.get(api);
    if (!resp.data.items || resp.data.items.length === 0) {
      return res.status(404).json({ ok:false, error: "Video not found" });
    }

    const item = resp.data.items[0];
    const snippet = item.snippet || {};
    const contentDetails = item.contentDetails || {};
    const statistics = item.statistics || {};

    return res.json({
      ok: true,
      data: {
        id: item.id,
        title: snippet.title,
        description: snippet.description,
        thumbnails: snippet.thumbnails,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        duration: contentDetails.duration,
        viewCount: statistics.viewCount,
        likeCount: statistics.likeCount,
        // NOTE: no download links provided here.
        note: "This endpoint returns metadata only. For downloads, plug a legal downloader and provide its URL via API_YT_DOWNLOADER env var."
      }
    });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    res.status(500).json({ ok:false, error: "Internal error" });
  }
}
