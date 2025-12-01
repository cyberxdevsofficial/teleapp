import express from "express";
import yt from "./yt.js";
import fb from "./fb.js";
import tiktok from "./tiktok.js";
import github from "./github.js";
import mediafire from "./mfire.js";
import xxx from "./xxx.js";

const app = express();

// Home route
app.get("/", (req, res) => {
    res.json({
        status: "API ONLINE",
        author: "ANUGA SENITHU",
        endpoints: {
            yt: "/api/yt?query=",
            fb: "/api/fb?url=",
            tiktok: "/api/tiktok?url=",
            github: "/api/github?repo=",
            mediafire: "/api/mfire?url=",
            xxx: "/api/xxx?name="
        },
        footer: "POWERED BY ANUGA SENITHU"
    });
});

// Route mounting
app.use("/yt", yt);
app.use("/fb", fb);
app.use("/tiktok", tiktok);
app.use("/github", github);
app.use("/mfire", mediafire);
app.use("/xxx", xxx);

// Export for Vercel serverless
export default app;
