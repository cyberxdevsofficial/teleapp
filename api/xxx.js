export default async function handler(req, res) {
  // The user requested an 18+ search/downloader endpoint.
  // We refuse to create tools that facilitate pornographic content distribution or that may aid illegal behavior.
  return res.status(403).json({
    ok: false,
    error: "Request refused: creation of 18+ search/download endpoints is not allowed by this assistant. If you need help with safe, legal adult-content moderation tooling (age-gating, disclaimers, parental controls), I can help build that."
  });
}
