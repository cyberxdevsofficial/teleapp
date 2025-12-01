import axios from "axios";

export default async function handler(req, res) {
  // params: ?id=<video_object_id> or ?url=<facebook_video_url>
  const token = process.env.FB_ACCESS_TOKEN; // must be set by you
  if (!token) return res.status(500).json({ ok:false, error: "Missing FB_ACCESS_TOKEN" });

  const url = (req.query.url || "").trim();
  const id = (req.query.id || "").trim();

  try {
    let objectId = id;
    if (!objectId && url) {
      // Facebook Graph requires object ID; if you have a full URL, Graph can sometimes accept ?id=URL
      // We will attempt to call the Graph endpoint with the url param.
      const graphUrl = `https://graph.facebook.com/?id=${encodeURIComponent(url)}&access_token=${token}`;
      const r = await axios.get(graphUrl);
      if (r.data && r.data.share && r.data.share.comment_count !== undefined) {
        return res.json({ ok: true, data: r.data });
      }
      // else fallthrough to error
    }
    if (!objectId) return res.status(400).json({ ok:false, error: "Provide id or url" });

    // fetch fields for video object
    const api = `https://graph.facebook.com/${encodeURIComponent(objectId)}?fields=id,title,description,thumbnails,embed_html,source&access_token=${token}`;
    const resp = await axios.get(api);
    return res.json({ ok: true, data: resp.data, note: "Metadata only. Downloading Facebook video may require additional permissions and is not provided here." });
  } catch (err) {
    console.error(err?.response?.data || err.message || err);
    return res.status(500).json({ ok:false, error: "Failed to fetch Facebook data" });
  }
}
