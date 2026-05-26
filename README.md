# 📚 PgluAI — Smart Exam Notes Compressor

Turn 100-page PDFs and messy notes into **compressed exam notes, flashcards, quizzes, and a last-night cheat sheet** — all in your browser.

> Runs 100% client-side, so it can be hosted for free on **GitHub Pages** with no backend.

## ✨ Features

- **📤 Upload** PDFs, images (OCR), and `.txt` files
- **📝 Compress Notes** — key points, definitions, formulas, important terms
- **🃏 Flashcards** — auto-generated, flip to reveal answers
- **❓ Quiz** — fill-in-the-blank MCQs with live scoring
- **🧠 Mindmap** — visual topic tree built from your notes
- **✨ Explain Simply** — Beginner / Kid / Teacher modes, in any supported language
- **🔊 Voice Revision** — reads notes aloud with a language selector (English/Hindi/Urdu/Punjabi), speed control & live highlighting
- **🌙 Last-Night Mode** — must-know concepts, formulas only, top probable questions
- **📸 Shareable Cards** — Instagram-style revision cards exported as PNG
- **🔁 Spaced Repetition** — "due for revision" reminders that schedule themselves
- **⚠️ Weakness Detection** — topics you miss in quizzes are saved per subject
- **🎓 Class / Grade** — Nursery to Class 12, saved per subject
- **📚 Library** — links to free, official study resources (NCERT, Khan Academy, OpenStax, CK-12, DIKSHA) by grade
- **📖 Guide** — built-in how-to-use walkthrough
- **🌐 Multilanguage UI** — English, हिन्दी, اردو (right-to-left), ਪੰਜਾਬੀ; AI explanations & voice follow the chosen language
- **⬇️ Download PDF** — clean revision sheet with an embedded **mindmap diagram** and a **top-topics chart**
- **⏰ Exam countdown**, recent subjects & **🌗 light/dark theme** (saved in your browser)

## 🧠 How the "AI" works

PgluAI is **free and works offline** using on-device text analysis (frequency-based extractive summarization, definition/formula detection, keyword extraction). No signup, no key.

For higher-quality *rewritten* summaries, open **⚙️ Settings** and optionally add your own API key:
- **Google Gemini** (free tier) or **OpenAI**
- The key is stored only in your browser (`localStorage`) and is sent only to the provider you pick.

## 🛠 Tech

Plain HTML/CSS/JS (zero build step) + CDN libraries:
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF text extraction
- [Tesseract.js](https://tesseract.projectnaptha.com/) — OCR for images
- [jsPDF](https://github.com/parallax/jsPDF) — PDF export

## 🚀 Run locally

It's a static site — just open `index.html`, or serve it:

```bash
npx serve .
# or
python -m http.server
```

## 🌍 Deploy on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch.**
3. Branch: `main`, folder: `/ (root)`. Save.
4. Your site goes live at `https://<username>.github.io/<repo>/`.

## 🗺 Roadmap

YouTube lecture summaries, group study & quiz battles with rankings, AI tutor chat, handwritten-math support, teacher dashboard & student analytics, and a mobile app.

---

Built as an MVP. Contributions welcome.
