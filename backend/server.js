/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CAROUSEL RENDERING SERVICE                                   ║
 * ║  Express + Puppeteer → renders HTML slides to PNG images     ║
 * ║                                                              ║
 * ║  HOW TO RUN:                                                 ║
 * ║    cd carousel-service                                        ║
 * ║    npm install                                                ║
 * ║    node server.js                                             ║
 * ║  Runs on http://localhost:3001                                ║
 * ║                                                              ║
 * ║  OUTPUTS: PNG images uploaded to Supabase Storage            ║
 * ║  (returns public URLs for Instagram Graph API)               ║
 * ║                                                              ║
 * ║  SUPABASE STORAGE SETUP:                                     ║
 * ║    1. Supabase dashboard → Storage → New bucket "carousels"  ║
 * ║    2. Set bucket to Public                                   ║
 * ║    3. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const express = require("express");
const puppeteer = require("puppeteer");
const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: "../backend/.env" });

const app = express();
app.use(express.json());

// 🔧 Supabase client for storage upload
const supabase = createClient(
  process.env.SUPABASE_URL,        // same as backend .env
  process.env.SUPABASE_SERVICE_KEY // use SERVICE key (not anon) for storage writes
  //   get from: Supabase → Project Settings → API → service_role key
);

const SLIDE_WIDTH  = 1080; // Instagram square
const SLIDE_HEIGHT = 1080;

/**
 * Build HTML for a single carousel slide.
 * Customize this template for your branding.
 */
function buildSlideHTML(slide, index, total, theme = "dark") {
  const bg    = theme === "dark"  ? "#0d0d14" : "#ffffff";
  const text  = theme === "dark"  ? "#e8e9ec" : "#0d0d14";
  const muted = theme === "dark"  ? "#6b7280" : "#9ca3af";
  const accent = "#7c6cff";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${SLIDE_WIDTH}px;
    height: ${SLIDE_HEIGHT}px;
    background: ${bg};
    font-family: 'Segoe UI', sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px;
    position: relative;
    overflow: hidden;
  }
  /* Background grid */
  body::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(124,108,255,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,108,255,0.05) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .slide-number {
    position: absolute;
    top: 48px;
    right: 56px;
    font-size: 14px;
    color: ${muted};
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
  }
  .emoji {
    font-size: 72px;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }
  .title {
    font-size: ${slide.title && slide.title.length > 30 ? '48px' : '60px'};
    font-weight: 800;
    color: ${text};
    text-align: center;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }
  .body {
    font-size: 26px;
    color: ${muted};
    text-align: center;
    line-height: 1.6;
    max-width: 800px;
    position: relative;
    z-index: 1;
  }
  /* Accent line */
  .accent-line {
    width: 60px;
    height: 4px;
    background: ${accent};
    border-radius: 2px;
    margin: 0 auto 36px;
    position: relative;
    z-index: 1;
  }
  /* Branding footer */
  .brand {
    position: absolute;
    bottom: 48px;
    left: 56px;
    font-size: 18px;
    color: ${accent};
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <div class="slide-number">${index + 1} / ${total}</div>
  ${slide.emoji ? `<div class="emoji">${slide.emoji}</div>` : ''}
  <div class="accent-line"></div>
  <div class="title">${slide.title || ''}</div>
  <div class="body">${slide.body || ''}</div>
  <div class="brand">persona ◈</div>
</body>
</html>`;
}


/**
 * POST /render
 * Body: { slides: [{title, body, emoji}], theme: "dark"|"light" }
 * Returns: { image_urls: ["https://...supabase.co/storage/..."] }
 */
app.post("/render", async (req, res) => {
  const { slides, theme = "dark" } = req.body;

  if (!slides || !Array.isArray(slides)) {
    return res.status(400).json({ error: "slides must be an array" });
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const imageUrls = [];
  const sessionId = uuidv4();

  try {
    for (let i = 0; i < slides.length; i++) {
      const page = await browser.newPage();
      await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT });

      const html = buildSlideHTML(slides[i], i, slides.length, theme);
      await page.setContent(html, { waitUntil: "networkidle0" });

      const screenshot = await page.screenshot({ type: "png" });
      await page.close();

      // Upload to Supabase Storage
      // 🔧 Make sure you have a "carousels" bucket in Supabase Storage (set to public)
      const filePath = `${sessionId}/slide-${i + 1}.png`;
      const { data, error } = await supabase.storage
        .from("carousels")
        .upload(filePath, screenshot, { contentType: "image/png", upsert: true });

      if (error) {
        console.error(`Upload failed for slide ${i + 1}:`, error);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("carousels")
        .getPublicUrl(filePath);

      imageUrls.push(urlData.publicUrl);
    }
  } finally {
    await browser.close();
  }

  res.json({ image_urls: imageUrls, session_id: sessionId });
});


app.get("/health", (req, res) => res.json({ status: "carousel-service ok" }));

const PORT = process.env.CAROUSEL_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎨 Carousel service running on http://localhost:${PORT}`);
});
