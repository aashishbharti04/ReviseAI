/* PgluAI — client-side study compressor.
   Runs entirely in the browser so it can be hosted on GitHub Pages. */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const $ = (id) => document.getElementById(id);
const STORE_KEY = "reviseai.subjects";
const SETTINGS_KEY = "reviseai.settings";
const LANG_KEY = "reviseai.lang";

/* ---------------- i18n ---------------- */
const LANG_META = {
  en: { name: "English", voice: "en-US", rtl: false },
  hi: { name: "Hindi", voice: "hi-IN", rtl: false },
  ur: { name: "Urdu", voice: "ur-PK", rtl: true },
  pa: { name: "Punjabi", voice: "pa-IN", rtl: false },
};
const I18N = {
  en: {
    "tagline": "AI study companion · notes · quiz · mindmap · voice · translate", "nav.dashboard": "Dashboard", "nav.study": "Study",
    "nav.library": "Library", "nav.guide": "Guide", "upload.grade": "Class / Grade", "voice.lang": "Voice language",
    "tool.translate": "🌍 Translate", "translate.target": "Translate to", "translate.btn": "Translate",
    "translate.downloadTxt": "⬇️ Download .txt", "translate.downloadPdf": "⬇️ Download PDF", "translate.downloadDoc": "⬇️ Download Word", "translate.working": "Translating…",
    "translate.note": "Your text and paragraphs are kept. For Hindi/Urdu/Tamil and other scripts, use 'Save as PDF' so your browser renders them correctly.",
    "lib.title": "📚 Free Study Library — Nursery to Class 12",
    "lib.sub": "Hand-picked free & official learning resources. Open any book, then bring it back to PgluAI to make notes, flashcards and quizzes.",
    "lib.note": "ℹ️ PgluAI does not host copyrighted books. These are links to official free sources (NCERT, Government of India, Khan Academy, OpenStax, CK-12).",
    "lib.testTitle": "🧪 Test Yourself", "lib.testSub": "Pick your class and subject, then attempt a 10-question quiz made by PgluAI.", "lib.testStart": "Start test",
    "guide.title": "📖 How to use PgluAI", "guide.sub": "Five simple steps to turn any notes into smart, exam-ready study material.",
    "hero.title": "Turn 100 pages into a 1-page revision sheet.",
    "hero.sub": "Upload your notes, and PgluAI builds compressed notes, flashcards, quizzes and a last-night cheat sheet — right in your browser.",
    "upload.title": "📤 Upload notes", "upload.subject": "Subject", "upload.subjectPh": "e.g. Physics — Chapter 4",
    "upload.examDate": "Exam date (optional)", "upload.drop": "📎 Drag & drop PDF / Word / images / .txt here",
    "upload.browse": "Browse files", "upload.hint": "PDFs & text read instantly. Images are OCR-scanned.",
    "upload.process": "Process notes →", "upload.recent": "📈 Recent subjects",
    "upload.recentEmpty": "No subjects yet — upload your first notes!",
    "tool.summary": "📝 Compress Notes", "tool.flashcards": "🃏 Flashcards", "tool.quiz": "❓ Quiz",
    "tool.mindmap": "🧠 Mindmap", "tool.explain": "✨ Explain Simply", "tool.voice": "🔊 Voice Revision",
    "tool.lastnight": "🌙 Last-Night Mode", "tool.share": "📸 Share Card", "tool.source": "📄 Source Text",
    "tool.download": "⬇️ Download PDF",
    "settings.title": "⚙️ AI Settings",
    "settings.desc": "PgluAI works fully free & offline. For higher-quality, rewritten AI summaries you can optionally add your own API key. It is stored only in your browser and never uploaded anywhere except the provider you choose.",
    "settings.provider": "Provider", "settings.providerOffline": "Offline (free, no key)",
    "settings.key": "API key", "settings.keyPh": "Paste key (only needed for Gemini/OpenAI)",
    "settings.save": "Save", "settings.close": "Close",
    "footer.text": "Built with PgluAI · Runs 100% in your browser", "footer.source": "Source on GitHub",
    "study.empty": "No notes loaded", "study.pickTool": "Pick a tool above to generate your study materials.",
    "study.uploadFirst": "Upload and process notes first.", "study.words": "words", "study.saved": "saved",
    "countdown.days": "days to exam", "countdown.passed": "exam passed",
    "recent.days": "days to exam", "recent.noExam": "no exam date",
    "due.title": "🔁 Due for revision today", "due.study": "Study", "due.revised": "✓ Revised",
    "due.stage": "stage", "due.weak": "weak topics", "due.onTrack": "on track",
    "loader.working": "Working…",
    "sum.title": "📝 Compressed Notes", "sum.titleAI": "📝 Compressed Notes (AI)",
    "sum.keyPoints": "Key points", "sum.definitions": "Definitions", "sum.formulas": "Formulas & key lines", "sum.terms": "Important terms",
    "fc.title": "🃏 Flashcards", "fc.hint": "(tap to flip)", "fc.none": "Not enough structured content to build flashcards. Try the Compress tool.",
    "fc.whatIs": "What is {t}?", "fc.explain": "Explain the term \"{t}\".",
    "quiz.title": "❓ Quiz", "quiz.none": "Not enough content to build a quiz.", "quiz.score": "Score:",
    "quiz.questions": "questions", "quiz.fillBlank": "Fill the blank:",
    "quiz.weakTitle": "⚠️ Your weak topics (from past quizzes)",
    "quiz.saved": "Saved {n} weak topic(s) for revision", "quiz.noWeak": "🎉 No weak topics!",
    "mm.title": "🧠 Mindmap", "mm.hint": "Auto-built from your most important topics. Hover a node for the full text.", "mm.none": "Not enough content to build a mindmap.",
    "ex.title": "✨ Explain Simply", "ex.beginner": "👶 Beginner", "ex.kid": "🧒 Kid Mode", "ex.teacher": "👩‍🏫 Teacher",
    "ex.offlineNote": "ℹ️ Offline mode can't translate. Add a free Gemini key in ⚙️ Settings for explanations in {lang}. Showing simplified key points for now:",
    "ex.glossary": "Glossary",
    "voice.title": "🔊 Voice Revision", "voice.play": "▶️ Play", "voice.pause": "⏸ Pause", "voice.resume": "⏵ Resume", "voice.stop": "⏹ Stop", "voice.speed": "Speed",
    "voice.note": "Great for revising while walking, in the gym, or travelling. 🎧", "voice.unsupported": "Your browser doesn't support speech synthesis.",
    "voice.ready": "✓ {lang} voice is ready.", "voice.missing": "⚠️ No {lang} voice on this device — audio will play in English. Install a {lang} voice in your device's speech settings to hear it.",
    "ln.title": "🌙 Last-Night Revision Mode", "ln.sub": "Everything essential, nothing else.",
    "ln.must": "🔑 Must-know concepts", "ln.formulas": "🧮 Formulas only", "ln.probable": "🎯 Top probable questions",
    "ln.define": "Define / explain: {t}.", "ln.shortNotes": "Write short notes on \"{t}\".",
    "share.title": "📸 Shareable Revision Card", "share.prev": "‹ Prev", "share.next": "Next ›", "share.download": "⬇️ Download PNG",
    "share.note": "Post it to your story — instant revision + free marketing. 🚀", "share.none": "Not enough content for a share card.",
    "src.title": "📄 Extracted Source Text",
  },
  hi: {
    "tagline": "AI अध्ययन साथी · नोट्स · क्विज़ · माइंडमैप · वॉइस · अनुवाद", "nav.dashboard": "डैशबोर्ड", "nav.study": "अध्ययन",
    "nav.library": "लाइब्रेरी", "nav.guide": "गाइड", "upload.grade": "कक्षा / ग्रेड", "voice.lang": "वॉइस भाषा",
    "tool.translate": "🌍 अनुवाद", "translate.target": "इसमें अनुवाद करें", "translate.btn": "अनुवाद करें",
    "translate.downloadTxt": "⬇️ .txt डाउनलोड", "translate.downloadPdf": "⬇️ PDF डाउनलोड", "translate.downloadDoc": "⬇️ Word डाउनलोड", "translate.working": "अनुवाद हो रहा है…",
    "translate.note": "आपका टेक्स्ट और पैराग्राफ बने रहते हैं। हिंदी/उर्दू/तमिल आदि लिपियों के लिए 'PDF के रूप में सेव करें' का उपयोग करें ताकि ब्राउज़र उन्हें सही दिखाए।",
    "lib.title": "📚 मुफ़्त अध्ययन लाइब्रेरी — नर्सरी से कक्षा 12",
    "lib.sub": "चुनिंदा मुफ़्त और आधिकारिक संसाधन। कोई भी किताब खोलें, फिर PgluAI में लाकर नोट्स, फ्लैशकार्ड और क्विज़ बनाएँ।",
    "lib.note": "ℹ️ PgluAI कॉपीराइट किताबें होस्ट नहीं करता। ये आधिकारिक मुफ़्त स्रोतों (NCERT, भारत सरकार, Khan Academy, OpenStax, CK-12) के लिंक हैं।",
    "lib.testTitle": "🧪 खुद को परखें", "lib.testSub": "अपनी कक्षा और विषय चुनें, फिर PgluAI द्वारा बनाई 10-प्रश्नों की क्विज़ हल करें।", "lib.testStart": "टेस्ट शुरू करें",
    "guide.title": "📖 PgluAI कैसे इस्तेमाल करें", "guide.sub": "किसी भी नोट्स को स्मार्ट, परीक्षा-तैयार सामग्री में बदलने के पाँच आसान चरण।",
    "hero.title": "100 पन्नों को 1-पेज रिवीजन शीट में बदलें।",
    "hero.sub": "अपने नोट्स अपलोड करें, और PgluAI आपके ब्राउज़र में ही कॉम्प्रेस्ड नोट्स, फ्लैशकार्ड, क्विज़ और लास्ट-नाइट चीट शीट बनाता है।",
    "upload.title": "📤 नोट्स अपलोड करें", "upload.subject": "विषय", "upload.subjectPh": "जैसे भौतिकी — अध्याय 4",
    "upload.examDate": "परीक्षा तिथि (वैकल्पिक)", "upload.drop": "📎 PDF / Word / इमेज / .txt यहाँ खींचें और छोड़ें",
    "upload.browse": "फ़ाइल चुनें", "upload.hint": "PDF और टेक्स्ट तुरंत पढ़े जाते हैं। इमेज OCR से स्कैन होती हैं।",
    "upload.process": "नोट्स प्रोसेस करें →", "upload.recent": "📈 हाल के विषय",
    "upload.recentEmpty": "अभी कोई विषय नहीं — अपने पहले नोट्स अपलोड करें!",
    "tool.summary": "📝 नोट्स कंप्रेस करें", "tool.flashcards": "🃏 फ्लैशकार्ड", "tool.quiz": "❓ क्विज़",
    "tool.mindmap": "🧠 माइंडमैप", "tool.explain": "✨ आसान भाषा में समझाएँ", "tool.voice": "🔊 वॉइस रिवीजन",
    "tool.lastnight": "🌙 लास्ट-नाइट मोड", "tool.share": "📸 शेयर कार्ड", "tool.source": "📄 मूल टेक्स्ट",
    "tool.download": "⬇️ PDF डाउनलोड",
    "settings.title": "⚙️ AI सेटिंग्स",
    "settings.desc": "PgluAI पूरी तरह मुफ़्त और ऑफ़लाइन काम करता है। बेहतर AI सारांश के लिए आप अपनी API key जोड़ सकते हैं। यह केवल आपके ब्राउज़र में सहेजी जाती है।",
    "settings.provider": "प्रोवाइडर", "settings.providerOffline": "ऑफ़लाइन (मुफ़्त, बिना key)",
    "settings.key": "API key", "settings.keyPh": "key पेस्ट करें (केवल Gemini/OpenAI के लिए)",
    "settings.save": "सहेजें", "settings.close": "बंद करें",
    "footer.text": "PgluAI से बना · पूरी तरह आपके ब्राउज़र में चलता है", "footer.source": "GitHub पर सोर्स",
    "study.empty": "कोई नोट्स लोड नहीं", "study.pickTool": "अपनी अध्ययन सामग्री बनाने के लिए ऊपर कोई टूल चुनें।",
    "study.uploadFirst": "पहले नोट्स अपलोड और प्रोसेस करें।", "study.words": "शब्द", "study.saved": "सहेजा गया",
    "countdown.days": "दिन शेष", "countdown.passed": "परीक्षा हो गई",
    "recent.days": "दिन शेष", "recent.noExam": "कोई परीक्षा तिथि नहीं",
    "due.title": "🔁 आज रिवीजन के लिए", "due.study": "अध्ययन", "due.revised": "✓ रिवाइज़ हो गया",
    "due.stage": "चरण", "due.weak": "कमज़ोर विषय", "due.onTrack": "सही दिशा में",
    "loader.working": "काम हो रहा है…",
    "sum.title": "📝 कॉम्प्रेस्ड नोट्स", "sum.titleAI": "📝 कॉम्प्रेस्ड नोट्स (AI)",
    "sum.keyPoints": "मुख्य बिंदु", "sum.definitions": "परिभाषाएँ", "sum.formulas": "सूत्र और मुख्य पंक्तियाँ", "sum.terms": "महत्वपूर्ण शब्द",
    "fc.title": "🃏 फ्लैशकार्ड", "fc.hint": "(पलटने के लिए टैप करें)", "fc.none": "फ्लैशकार्ड बनाने के लिए पर्याप्त सामग्री नहीं। कंप्रेस टूल आज़माएँ।",
    "fc.whatIs": "{t} क्या है?", "fc.explain": "\"{t}\" शब्द समझाएँ।",
    "quiz.title": "❓ क्विज़", "quiz.none": "क्विज़ बनाने के लिए पर्याप्त सामग्री नहीं।", "quiz.score": "स्कोर:",
    "quiz.questions": "प्रश्न", "quiz.fillBlank": "रिक्त स्थान भरें:",
    "quiz.weakTitle": "⚠️ आपके कमज़ोर विषय (पिछली क्विज़ से)",
    "quiz.saved": "रिवीजन के लिए {n} कमज़ोर विषय सहेजे गए", "quiz.noWeak": "🎉 कोई कमज़ोर विषय नहीं!",
    "mm.title": "🧠 माइंडमैप", "mm.hint": "आपके सबसे महत्वपूर्ण विषयों से अपने-आप बना। पूरा टेक्स्ट देखने के लिए नोड पर होवर करें।", "mm.none": "माइंडमैप बनाने के लिए पर्याप्त सामग्री नहीं।",
    "ex.title": "✨ आसान भाषा में समझाएँ", "ex.beginner": "👶 शुरुआती", "ex.kid": "🧒 बच्चों के लिए", "ex.teacher": "👩‍🏫 शिक्षक",
    "ex.offlineNote": "ℹ️ ऑफ़लाइन मोड अनुवाद नहीं कर सकता। {lang} में व्याख्या के लिए ⚙️ सेटिंग्स में मुफ़्त Gemini key जोड़ें। अभी सरल मुख्य बिंदु दिखाए जा रहे हैं:",
    "ex.glossary": "शब्दावली",
    "voice.title": "🔊 वॉइस रिवीजन", "voice.play": "▶️ चलाएँ", "voice.pause": "⏸ रोकें", "voice.resume": "⏵ जारी रखें", "voice.stop": "⏹ बंद करें", "voice.speed": "गति",
    "voice.note": "चलते-फिरते, जिम में या यात्रा के दौरान रिवीजन के लिए बढ़िया। 🎧", "voice.unsupported": "आपका ब्राउज़र वॉइस सिंथेसिस का समर्थन नहीं करता।",
    "voice.ready": "✓ {lang} वॉइस तैयार है।", "voice.missing": "⚠️ इस डिवाइस पर {lang} वॉइस नहीं है — ऑडियो अंग्रेज़ी में चलेगा। {lang} सुनने के लिए डिवाइस की स्पीच सेटिंग्स में {lang} वॉइस इंस्टॉल करें।",
    "ln.title": "🌙 लास्ट-नाइट रिवीजन मोड", "ln.sub": "केवल ज़रूरी, और कुछ नहीं।",
    "ln.must": "🔑 ज़रूरी अवधारणाएँ", "ln.formulas": "🧮 केवल सूत्र", "ln.probable": "🎯 सबसे संभावित प्रश्न",
    "ln.define": "परिभाषित/समझाएँ: {t}।", "ln.shortNotes": "\"{t}\" पर संक्षिप्त नोट्स लिखें।",
    "share.title": "📸 शेयर करने योग्य रिवीजन कार्ड", "share.prev": "‹ पिछला", "share.next": "अगला ›", "share.download": "⬇️ PNG डाउनलोड",
    "share.note": "इसे अपनी स्टोरी पर डालें — तुरंत रिवीजन + मुफ़्त मार्केटिंग। 🚀", "share.none": "शेयर कार्ड के लिए पर्याप्त सामग्री नहीं।",
    "src.title": "📄 निकाला गया मूल टेक्स्ट",
  },
  ur: {
    "tagline": "AI مطالعہ ساتھی · نوٹس · کوئز · مائنڈ میپ · آواز · ترجمہ", "nav.dashboard": "ڈیش بورڈ", "nav.study": "مطالعہ",
    "nav.library": "لائبریری", "nav.guide": "گائیڈ", "upload.grade": "کلاس / گریڈ", "voice.lang": "صوتی زبان",
    "tool.translate": "🌍 ترجمہ", "translate.target": "اس میں ترجمہ کریں", "translate.btn": "ترجمہ کریں",
    "translate.downloadTxt": "⬇️ .txt ڈاؤن لوڈ", "translate.downloadPdf": "⬇️ PDF ڈاؤن لوڈ", "translate.downloadDoc": "⬇️ Word ڈاؤن لوڈ", "translate.working": "ترجمہ ہو رہا ہے…",
    "translate.note": "آپ کا متن اور پیراگراف برقرار رہتے ہیں۔ ہندی/اردو/تامل وغیرہ رسم الخط کے لیے 'PDF کے طور پر محفوظ کریں' استعمال کریں تاکہ براؤزر انہیں درست دکھائے۔",
    "lib.title": "📚 مفت مطالعہ لائبریری — نرسری سے کلاس 12",
    "lib.sub": "منتخب مفت اور سرکاری وسائل۔ کوئی بھی کتاب کھولیں، پھر PgluAI میں لا کر نوٹس، فلیش کارڈز اور کوئز بنائیں۔",
    "lib.note": "ℹ️ PgluAI کاپی رائٹ کتابیں ہوسٹ نہیں کرتا۔ یہ سرکاری مفت ذرائع (NCERT، حکومت ہند، Khan Academy، OpenStax، CK-12) کے لنکس ہیں۔",
    "lib.testTitle": "🧪 خود کو آزمائیں", "lib.testSub": "اپنی کلاس اور مضمون منتخب کریں، پھر PgluAI کی بنائی 10 سوالات کی کوئز حل کریں۔", "lib.testStart": "ٹیسٹ شروع کریں",
    "guide.title": "📖 PgluAI کیسے استعمال کریں", "guide.sub": "کسی بھی نوٹس کو اسمارٹ، امتحان کے لیے تیار مواد میں بدلنے کے پانچ آسان مراحل۔",
    "hero.title": "100 صفحات کو 1 صفحے کی ریویژن شیٹ میں بدلیں۔",
    "hero.sub": "اپنے نوٹس اپلوڈ کریں، اور PgluAI آپ کے براؤزر میں ہی کمپریسڈ نوٹس، فلیش کارڈز، کوئز اور لاسٹ نائٹ چیٹ شیٹ بناتا ہے۔",
    "upload.title": "📤 نوٹس اپلوڈ کریں", "upload.subject": "مضمون", "upload.subjectPh": "مثلاً فزکس — باب 4",
    "upload.examDate": "امتحان کی تاریخ (اختیاری)", "upload.drop": "📎 PDF / Word / تصاویر / .txt یہاں ڈراپ کریں",
    "upload.browse": "فائل منتخب کریں", "upload.hint": "PDF اور ٹیکسٹ فوراً پڑھے جاتے ہیں۔ تصاویر OCR سے اسکین ہوتی ہیں۔",
    "upload.process": "نوٹس پروسیس کریں →", "upload.recent": "📈 حالیہ مضامین",
    "upload.recentEmpty": "ابھی کوئی مضمون نہیں — اپنے پہلے نوٹس اپلوڈ کریں!",
    "tool.summary": "📝 نوٹس کمپریس کریں", "tool.flashcards": "🃏 فلیش کارڈز", "tool.quiz": "❓ کوئز",
    "tool.mindmap": "🧠 مائنڈ میپ", "tool.explain": "✨ آسان زبان میں سمجھائیں", "tool.voice": "🔊 صوتی ریویژن",
    "tool.lastnight": "🌙 لاسٹ نائٹ موڈ", "tool.share": "📸 شیئر کارڈ", "tool.source": "📄 اصل متن",
    "tool.download": "⬇️ PDF ڈاؤن لوڈ",
    "settings.title": "⚙️ AI ترتیبات",
    "settings.desc": "PgluAI مکمل طور پر مفت اور آف لائن کام کرتا ہے۔ بہتر AI خلاصے کے لیے آپ اپنی API key شامل کر سکتے ہیں۔ یہ صرف آپ کے براؤزر میں محفوظ ہوتی ہے۔",
    "settings.provider": "پرووائیڈر", "settings.providerOffline": "آف لائن (مفت، بغیر key)",
    "settings.key": "API key", "settings.keyPh": "key پیسٹ کریں (صرف Gemini/OpenAI کے لیے)",
    "settings.save": "محفوظ کریں", "settings.close": "بند کریں",
    "footer.text": "PgluAI سے بنایا گیا · مکمل طور پر آپ کے براؤزر میں چلتا ہے", "footer.source": "GitHub پر سورس",
    "study.empty": "کوئی نوٹس لوڈ نہیں", "study.pickTool": "اپنا مطالعاتی مواد بنانے کے لیے اوپر کوئی ٹول منتخب کریں۔",
    "study.uploadFirst": "پہلے نوٹس اپلوڈ اور پروسیس کریں۔", "study.words": "الفاظ", "study.saved": "محفوظ شدہ",
    "countdown.days": "دن باقی", "countdown.passed": "امتحان ہو گیا",
    "recent.days": "دن باقی", "recent.noExam": "کوئی امتحان تاریخ نہیں",
    "due.title": "🔁 آج ریویژن کے لیے", "due.study": "مطالعہ", "due.revised": "✓ ریوائز ہو گیا",
    "due.stage": "مرحلہ", "due.weak": "کمزور موضوعات", "due.onTrack": "درست راہ پر",
    "loader.working": "کام جاری ہے…",
    "sum.title": "📝 کمپریسڈ نوٹس", "sum.titleAI": "📝 کمپریسڈ نوٹس (AI)",
    "sum.keyPoints": "اہم نکات", "sum.definitions": "تعریفیں", "sum.formulas": "فارمولے اور اہم سطریں", "sum.terms": "اہم اصطلاحات",
    "fc.title": "🃏 فلیش کارڈز", "fc.hint": "(پلٹنے کے لیے ٹیپ کریں)", "fc.none": "فلیش کارڈز بنانے کے لیے کافی مواد نہیں۔ کمپریس ٹول آزمائیں۔",
    "fc.whatIs": "{t} کیا ہے؟", "fc.explain": "\"{t}\" کی اصطلاح سمجھائیں۔",
    "quiz.title": "❓ کوئز", "quiz.none": "کوئز بنانے کے لیے کافی مواد نہیں۔", "quiz.score": "اسکور:",
    "quiz.questions": "سوالات", "quiz.fillBlank": "خالی جگہ پُر کریں:",
    "quiz.weakTitle": "⚠️ آپ کے کمزور موضوعات (پچھلے کوئز سے)",
    "quiz.saved": "ریویژن کے لیے {n} کمزور موضوع محفوظ ہوئے", "quiz.noWeak": "🎉 کوئی کمزور موضوع نہیں!",
    "mm.title": "🧠 مائنڈ میپ", "mm.hint": "آپ کے سب سے اہم موضوعات سے خودکار بنایا گیا۔ مکمل متن کے لیے نوڈ پر ہوور کریں۔", "mm.none": "مائنڈ میپ بنانے کے لیے کافی مواد نہیں۔",
    "ex.title": "✨ آسان زبان میں سمجھائیں", "ex.beginner": "👶 ابتدائی", "ex.kid": "🧒 بچوں کے لیے", "ex.teacher": "👩‍🏫 استاد",
    "ex.offlineNote": "ℹ️ آف لائن موڈ ترجمہ نہیں کر سکتا۔ {lang} میں وضاحت کے لیے ⚙️ ترتیبات میں مفت Gemini key شامل کریں۔ ابھی آسان اہم نکات دکھائے جا رہے ہیں:",
    "ex.glossary": "لغت",
    "voice.title": "🔊 صوتی ریویژن", "voice.play": "▶️ چلائیں", "voice.pause": "⏸ روکیں", "voice.resume": "⏵ جاری رکھیں", "voice.stop": "⏹ بند کریں", "voice.speed": "رفتار",
    "voice.note": "چلتے پھرتے، جم میں یا سفر کے دوران ریویژن کے لیے بہترین۔ 🎧", "voice.unsupported": "آپ کا براؤزر صوتی ترکیب کی حمایت نہیں کرتا۔",
    "voice.ready": "✓ {lang} آواز تیار ہے۔", "voice.missing": "⚠️ اس ڈیوائس پر {lang} آواز نہیں ہے — آڈیو انگریزی میں چلے گا۔ {lang} سننے کے لیے ڈیوائس کی اسپیچ سیٹنگز میں {lang} آواز انسٹال کریں۔",
    "ln.title": "🌙 لاسٹ نائٹ ریویژن موڈ", "ln.sub": "صرف ضروری، اور کچھ نہیں۔",
    "ln.must": "🔑 ضروری تصورات", "ln.formulas": "🧮 صرف فارمولے", "ln.probable": "🎯 سب سے ممکنہ سوالات",
    "ln.define": "تعریف/وضاحت کریں: {t}۔", "ln.shortNotes": "\"{t}\" پر مختصر نوٹس لکھیں۔",
    "share.title": "📸 شیئر کرنے کے قابل ریویژن کارڈ", "share.prev": "‹ پچھلا", "share.next": "اگلا ›", "share.download": "⬇️ PNG ڈاؤن لوڈ",
    "share.note": "اسے اپنی اسٹوری پر لگائیں — فوری ریویژن + مفت مارکیٹنگ۔ 🚀", "share.none": "شیئر کارڈ کے لیے کافی مواد نہیں۔",
    "src.title": "📄 نکالا گیا اصل متن",
  },
  pa: {
    "tagline": "AI ਅਧਿਐਨ ਸਾਥੀ · ਨੋਟਸ · ਕਵਿਜ਼ · ਮਾਈਂਡਮੈਪ · ਵੌਇਸ · ਅਨੁਵਾਦ", "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ", "nav.study": "ਅਧਿਐਨ",
    "nav.library": "ਲਾਇਬ੍ਰੇਰੀ", "nav.guide": "ਗਾਈਡ", "upload.grade": "ਕਲਾਸ / ਗ੍ਰੇਡ", "voice.lang": "ਵੌਇਸ ਭਾਸ਼ਾ",
    "tool.translate": "🌍 ਅਨੁਵਾਦ", "translate.target": "ਇਸ ਵਿੱਚ ਅਨੁਵਾਦ ਕਰੋ", "translate.btn": "ਅਨੁਵਾਦ ਕਰੋ",
    "translate.downloadTxt": "⬇️ .txt ਡਾਊਨਲੋਡ", "translate.downloadPdf": "⬇️ PDF ਡਾਊਨਲੋਡ", "translate.downloadDoc": "⬇️ Word ਡਾਊਨਲੋਡ", "translate.working": "ਅਨੁਵਾਦ ਹੋ ਰਿਹਾ ਹੈ…",
    "translate.note": "ਤੁਹਾਡਾ ਟੈਕਸਟ ਅਤੇ ਪੈਰੇ ਬਰਕਰਾਰ ਰਹਿੰਦੇ ਹਨ। ਹਿੰਦੀ/ਉਰਦੂ/ਤਮਿਲ ਆਦਿ ਲਿਪੀਆਂ ਲਈ 'PDF ਵਜੋਂ ਸੰਭਾਲੋ' ਵਰਤੋ ਤਾਂ ਜੋ ਬ੍ਰਾਊਜ਼ਰ ਉਨ੍ਹਾਂ ਨੂੰ ਸਹੀ ਦਿਖਾਏ।",
    "lib.title": "📚 ਮੁਫ਼ਤ ਅਧਿਐਨ ਲਾਇਬ੍ਰੇਰੀ — ਨਰਸਰੀ ਤੋਂ ਕਲਾਸ 12",
    "lib.sub": "ਚੁਣੇ ਹੋਏ ਮੁਫ਼ਤ ਅਤੇ ਸਰਕਾਰੀ ਸਰੋਤ। ਕੋਈ ਵੀ ਕਿਤਾਬ ਖੋਲ੍ਹੋ, ਫਿਰ PgluAI ਵਿੱਚ ਲਿਆ ਕੇ ਨੋਟਸ, ਫਲੈਸ਼ਕਾਰਡ ਅਤੇ ਕਵਿਜ਼ ਬਣਾਓ।",
    "lib.note": "ℹ️ PgluAI ਕਾਪੀਰਾਈਟ ਕਿਤਾਬਾਂ ਹੋਸਟ ਨਹੀਂ ਕਰਦਾ। ਇਹ ਸਰਕਾਰੀ ਮੁਫ਼ਤ ਸਰੋਤਾਂ (NCERT, ਭਾਰਤ ਸਰਕਾਰ, Khan Academy, OpenStax, CK-12) ਦੇ ਲਿੰਕ ਹਨ।",
    "lib.testTitle": "🧪 ਆਪਣੇ ਆਪ ਨੂੰ ਪਰਖੋ", "lib.testSub": "ਆਪਣੀ ਕਲਾਸ ਅਤੇ ਵਿਸ਼ਾ ਚੁਣੋ, ਫਿਰ PgluAI ਵੱਲੋਂ ਬਣਾਈ 10-ਸਵਾਲਾਂ ਦੀ ਕਵਿਜ਼ ਹੱਲ ਕਰੋ।", "lib.testStart": "ਟੈਸਟ ਸ਼ੁਰੂ ਕਰੋ",
    "guide.title": "📖 PgluAI ਕਿਵੇਂ ਵਰਤੀਏ", "guide.sub": "ਕਿਸੇ ਵੀ ਨੋਟਸ ਨੂੰ ਸਮਾਰਟ, ਪ੍ਰੀਖਿਆ-ਤਿਆਰ ਸਮੱਗਰੀ ਵਿੱਚ ਬਦਲਣ ਦੇ ਪੰਜ ਸੌਖੇ ਕਦਮ।",
    "hero.title": "100 ਸਫ਼ਿਆਂ ਨੂੰ 1-ਸਫ਼ੇ ਦੀ ਰਿਵੀਜ਼ਨ ਸ਼ੀਟ ਵਿੱਚ ਬਦਲੋ।",
    "hero.sub": "ਆਪਣੇ ਨੋਟਸ ਅਪਲੋਡ ਕਰੋ, ਅਤੇ PgluAI ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਹੀ ਕੰਪ੍ਰੈਸਡ ਨੋਟਸ, ਫਲੈਸ਼ਕਾਰਡ, ਕਵਿਜ਼ ਅਤੇ ਲਾਸਟ-ਨਾਈਟ ਚੀਟ ਸ਼ੀਟ ਬਣਾਉਂਦਾ ਹੈ।",
    "upload.title": "📤 ਨੋਟਸ ਅਪਲੋਡ ਕਰੋ", "upload.subject": "ਵਿਸ਼ਾ", "upload.subjectPh": "ਜਿਵੇਂ ਭੌਤਿਕ ਵਿਗਿਆਨ — ਅਧਿਆਇ 4",
    "upload.examDate": "ਪ੍ਰੀਖਿਆ ਤਾਰੀਖ਼ (ਚੋਣਵੀਂ)", "upload.drop": "📎 PDF / Word / ਤਸਵੀਰਾਂ / .txt ਇੱਥੇ ਖਿੱਚੋ ਤੇ ਛੱਡੋ",
    "upload.browse": "ਫ਼ਾਈਲ ਚੁਣੋ", "upload.hint": "PDF ਅਤੇ ਟੈਕਸਟ ਤੁਰੰਤ ਪੜ੍ਹੇ ਜਾਂਦੇ ਹਨ। ਤਸਵੀਰਾਂ OCR ਨਾਲ ਸਕੈਨ ਹੁੰਦੀਆਂ ਹਨ।",
    "upload.process": "ਨੋਟਸ ਪ੍ਰੋਸੈਸ ਕਰੋ →", "upload.recent": "📈 ਹਾਲੀਆ ਵਿਸ਼ੇ",
    "upload.recentEmpty": "ਹਾਲੇ ਕੋਈ ਵਿਸ਼ਾ ਨਹੀਂ — ਆਪਣੇ ਪਹਿਲੇ ਨੋਟਸ ਅਪਲੋਡ ਕਰੋ!",
    "tool.summary": "📝 ਨੋਟਸ ਕੰਪ੍ਰੈਸ ਕਰੋ", "tool.flashcards": "🃏 ਫਲੈਸ਼ਕਾਰਡ", "tool.quiz": "❓ ਕਵਿਜ਼",
    "tool.mindmap": "🧠 ਮਾਈਂਡਮੈਪ", "tool.explain": "✨ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ", "tool.voice": "🔊 ਵੌਇਸ ਰਿਵੀਜ਼ਨ",
    "tool.lastnight": "🌙 ਲਾਸਟ-ਨਾਈਟ ਮੋਡ", "tool.share": "📸 ਸ਼ੇਅਰ ਕਾਰਡ", "tool.source": "📄 ਮੂਲ ਟੈਕਸਟ",
    "tool.download": "⬇️ PDF ਡਾਊਨਲੋਡ",
    "settings.title": "⚙️ AI ਸੈਟਿੰਗਾਂ",
    "settings.desc": "PgluAI ਪੂਰੀ ਤਰ੍ਹਾਂ ਮੁਫ਼ਤ ਅਤੇ ਆਫ਼ਲਾਈਨ ਕੰਮ ਕਰਦਾ ਹੈ। ਬਿਹਤਰ AI ਸਾਰ ਲਈ ਤੁਸੀਂ ਆਪਣੀ API key ਜੋੜ ਸਕਦੇ ਹੋ। ਇਹ ਸਿਰਫ਼ ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਸੰਭਾਲੀ ਜਾਂਦੀ ਹੈ।",
    "settings.provider": "ਪ੍ਰੋਵਾਈਡਰ", "settings.providerOffline": "ਆਫ਼ਲਾਈਨ (ਮੁਫ਼ਤ, ਬਿਨਾਂ key)",
    "settings.key": "API key", "settings.keyPh": "key ਪੇਸਟ ਕਰੋ (ਸਿਰਫ਼ Gemini/OpenAI ਲਈ)",
    "settings.save": "ਸੰਭਾਲੋ", "settings.close": "ਬੰਦ ਕਰੋ",
    "footer.text": "PgluAI ਨਾਲ ਬਣਾਇਆ · ਪੂਰੀ ਤਰ੍ਹਾਂ ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਚੱਲਦਾ ਹੈ", "footer.source": "GitHub ਉੱਤੇ ਸੋਰਸ",
    "study.empty": "ਕੋਈ ਨੋਟਸ ਲੋਡ ਨਹੀਂ", "study.pickTool": "ਆਪਣੀ ਅਧਿਐਨ ਸਮੱਗਰੀ ਬਣਾਉਣ ਲਈ ਉੱਪਰ ਕੋਈ ਟੂਲ ਚੁਣੋ।",
    "study.uploadFirst": "ਪਹਿਲਾਂ ਨੋਟਸ ਅਪਲੋਡ ਅਤੇ ਪ੍ਰੋਸੈਸ ਕਰੋ।", "study.words": "ਸ਼ਬਦ", "study.saved": "ਸੰਭਾਲਿਆ",
    "countdown.days": "ਦਿਨ ਬਾਕੀ", "countdown.passed": "ਪ੍ਰੀਖਿਆ ਹੋ ਗਈ",
    "recent.days": "ਦਿਨ ਬਾਕੀ", "recent.noExam": "ਕੋਈ ਪ੍ਰੀਖਿਆ ਤਾਰੀਖ਼ ਨਹੀਂ",
    "due.title": "🔁 ਅੱਜ ਰਿਵੀਜ਼ਨ ਲਈ", "due.study": "ਅਧਿਐਨ", "due.revised": "✓ ਰਿਵਾਈਜ਼ ਹੋ ਗਿਆ",
    "due.stage": "ਪੜਾਅ", "due.weak": "ਕਮਜ਼ੋਰ ਵਿਸ਼ੇ", "due.onTrack": "ਸਹੀ ਰਾਹ ਉੱਤੇ",
    "loader.working": "ਕੰਮ ਚੱਲ ਰਿਹਾ ਹੈ…",
    "sum.title": "📝 ਕੰਪ੍ਰੈਸਡ ਨੋਟਸ", "sum.titleAI": "📝 ਕੰਪ੍ਰੈਸਡ ਨੋਟਸ (AI)",
    "sum.keyPoints": "ਮੁੱਖ ਨੁਕਤੇ", "sum.definitions": "ਪਰਿਭਾਸ਼ਾਵਾਂ", "sum.formulas": "ਫਾਰਮੂਲੇ ਤੇ ਮੁੱਖ ਲਾਈਨਾਂ", "sum.terms": "ਮਹੱਤਵਪੂਰਨ ਸ਼ਬਦ",
    "fc.title": "🃏 ਫਲੈਸ਼ਕਾਰਡ", "fc.hint": "(ਪਲਟਣ ਲਈ ਟੈਪ ਕਰੋ)", "fc.none": "ਫਲੈਸ਼ਕਾਰਡ ਬਣਾਉਣ ਲਈ ਕਾਫ਼ੀ ਸਮੱਗਰੀ ਨਹੀਂ। ਕੰਪ੍ਰੈਸ ਟੂਲ ਅਜ਼ਮਾਓ।",
    "fc.whatIs": "{t} ਕੀ ਹੈ?", "fc.explain": "\"{t}\" ਸ਼ਬਦ ਸਮਝਾਓ।",
    "quiz.title": "❓ ਕਵਿਜ਼", "quiz.none": "ਕਵਿਜ਼ ਬਣਾਉਣ ਲਈ ਕਾਫ਼ੀ ਸਮੱਗਰੀ ਨਹੀਂ।", "quiz.score": "ਸਕੋਰ:",
    "quiz.questions": "ਸਵਾਲ", "quiz.fillBlank": "ਖਾਲੀ ਥਾਂ ਭਰੋ:",
    "quiz.weakTitle": "⚠️ ਤੁਹਾਡੇ ਕਮਜ਼ੋਰ ਵਿਸ਼ੇ (ਪਿਛਲੇ ਕਵਿਜ਼ ਤੋਂ)",
    "quiz.saved": "ਰਿਵੀਜ਼ਨ ਲਈ {n} ਕਮਜ਼ੋਰ ਵਿਸ਼ੇ ਸੰਭਾਲੇ ਗਏ", "quiz.noWeak": "🎉 ਕੋਈ ਕਮਜ਼ੋਰ ਵਿਸ਼ਾ ਨਹੀਂ!",
    "mm.title": "🧠 ਮਾਈਂਡਮੈਪ", "mm.hint": "ਤੁਹਾਡੇ ਸਭ ਤੋਂ ਮਹੱਤਵਪੂਰਨ ਵਿਸ਼ਿਆਂ ਤੋਂ ਆਪਣੇ-ਆਪ ਬਣਿਆ। ਪੂਰਾ ਟੈਕਸਟ ਵੇਖਣ ਲਈ ਨੋਡ ਉੱਤੇ ਹੋਵਰ ਕਰੋ।", "mm.none": "ਮਾਈਂਡਮੈਪ ਬਣਾਉਣ ਲਈ ਕਾਫ਼ੀ ਸਮੱਗਰੀ ਨਹੀਂ।",
    "ex.title": "✨ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝਾਓ", "ex.beginner": "👶 ਸ਼ੁਰੂਆਤੀ", "ex.kid": "🧒 ਬੱਚਿਆਂ ਲਈ", "ex.teacher": "👩‍🏫 ਅਧਿਆਪਕ",
    "ex.offlineNote": "ℹ️ ਆਫ਼ਲਾਈਨ ਮੋਡ ਅਨੁਵਾਦ ਨਹੀਂ ਕਰ ਸਕਦਾ। {lang} ਵਿੱਚ ਵਿਆਖਿਆ ਲਈ ⚙️ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਮੁਫ਼ਤ Gemini key ਜੋੜੋ। ਹੁਣੇ ਸਰਲ ਮੁੱਖ ਨੁਕਤੇ ਦਿਖਾਏ ਜਾ ਰਹੇ ਹਨ:",
    "ex.glossary": "ਸ਼ਬਦਾਵਲੀ",
    "voice.title": "🔊 ਵੌਇਸ ਰਿਵੀਜ਼ਨ", "voice.play": "▶️ ਚਲਾਓ", "voice.pause": "⏸ ਰੋਕੋ", "voice.resume": "⏵ ਜਾਰੀ ਰੱਖੋ", "voice.stop": "⏹ ਬੰਦ ਕਰੋ", "voice.speed": "ਗਤੀ",
    "voice.note": "ਚੱਲਦੇ-ਫਿਰਦੇ, ਜਿਮ ਵਿੱਚ ਜਾਂ ਸਫ਼ਰ ਦੌਰਾਨ ਰਿਵੀਜ਼ਨ ਲਈ ਵਧੀਆ। 🎧", "voice.unsupported": "ਤੁਹਾਡਾ ਬ੍ਰਾਊਜ਼ਰ ਸਪੀਚ ਸਿੰਥੇਸਿਸ ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਕਰਦਾ।",
    "voice.ready": "✓ {lang} ਵੌਇਸ ਤਿਆਰ ਹੈ।", "voice.missing": "⚠️ ਇਸ ਡੀਵਾਈਸ ਉੱਤੇ {lang} ਵੌਇਸ ਨਹੀਂ ਹੈ — ਆਡੀਓ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਚੱਲੇਗਾ। {lang} ਸੁਣਨ ਲਈ ਡੀਵਾਈਸ ਦੀ ਸਪੀਚ ਸੈਟਿੰਗ ਵਿੱਚ {lang} ਵੌਇਸ ਇੰਸਟਾਲ ਕਰੋ।",
    "ln.title": "🌙 ਲਾਸਟ-ਨਾਈਟ ਰਿਵੀਜ਼ਨ ਮੋਡ", "ln.sub": "ਸਿਰਫ਼ ਜ਼ਰੂਰੀ, ਹੋਰ ਕੁਝ ਨਹੀਂ।",
    "ln.must": "🔑 ਜ਼ਰੂਰੀ ਸੰਕਲਪ", "ln.formulas": "🧮 ਸਿਰਫ਼ ਫਾਰਮੂਲੇ", "ln.probable": "🎯 ਸਭ ਤੋਂ ਸੰਭਾਵੀ ਸਵਾਲ",
    "ln.define": "ਪਰਿਭਾਸ਼ਿਤ/ਸਮਝਾਓ: {t}।", "ln.shortNotes": "\"{t}\" ਉੱਤੇ ਸੰਖੇਪ ਨੋਟਸ ਲਿਖੋ।",
    "share.title": "📸 ਸ਼ੇਅਰ ਕਰਨ ਯੋਗ ਰਿਵੀਜ਼ਨ ਕਾਰਡ", "share.prev": "‹ ਪਿਛਲਾ", "share.next": "ਅਗਲਾ ›", "share.download": "⬇️ PNG ਡਾਊਨਲੋਡ",
    "share.note": "ਇਸਨੂੰ ਆਪਣੀ ਸਟੋਰੀ ਉੱਤੇ ਪਾਓ — ਤੁਰੰਤ ਰਿਵੀਜ਼ਨ + ਮੁਫ਼ਤ ਮਾਰਕੀਟਿੰਗ। 🚀", "share.none": "ਸ਼ੇਅਰ ਕਾਰਡ ਲਈ ਕਾਫ਼ੀ ਸਮੱਗਰੀ ਨਹੀਂ।",
    "src.title": "📄 ਕੱਢਿਆ ਗਿਆ ਮੂਲ ਟੈਕਸਟ",
  },
};
let LANG = localStorage.getItem(LANG_KEY) || "en";
function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
  return s;
}
function applyLang(code) {
  LANG = I18N[code] ? code : "en";
  localStorage.setItem(LANG_KEY, LANG);
  const meta = LANG_META[LANG];
  document.documentElement.lang = LANG;
  document.body.dir = meta.rtl ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $("langSelect").value = LANG;
  $("loaderText").textContent = t("loader.working");
  renderRecent();
  renderDue();
  if (state.current) {
    $("studyMeta").textContent = `${state.current.grade ? state.current.grade + " · " : ""}${state.current.text.split(/\s+/).length} ${t("study.words")} · ${t("study.saved")} ${new Date(state.current.created).toLocaleString()}`;
    renderCountdown();
  }
}

const state = {
  files: [],        // {name, kind, file}
  text: "",         // extracted text of current subject
  subject: "",
  examDate: "",
  current: null,    // active subject record
};

/* ---------------- Navigation ---------------- */
const NAV_MAP = { dashboard: "navHome", study: "navStudy", library: "navLibrary", guide: "navGuide" };
function show(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  $(view).classList.add("active");
  Object.entries(NAV_MAP).forEach(([v, id]) => $(id).classList.toggle("active", v === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("navHome").onclick = () => show("dashboard");
$("navStudy").onclick = () => show("study");
$("navLibrary").onclick = () => { renderRecent(); show("library"); };
$("navGuide").onclick = () => show("guide");

/* ---------------- Settings ---------------- */
function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { return {}; }
}
function openSettings() {
  const s = getSettings();
  $("aiProvider").value = s.provider || "offline";
  $("apiKey").value = s.key || "";
  $("settingsModal").classList.remove("hidden");
}
$("settingsBtn").onclick = openSettings;
$("closeSettings").onclick = () => $("settingsModal").classList.add("hidden");
$("saveSettings").onclick = () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    provider: $("aiProvider").value,
    key: $("apiKey").value.trim(),
  }));
  $("settingsModal").classList.add("hidden");
};

/* ---------------- Theme ---------------- */
function applyTheme(t) {
  document.body.dataset.theme = t;
  localStorage.setItem("reviseai.theme", t);
  $("themeBtn").textContent = t === "light" ? "🌙" : "🌞";
}
$("themeBtn").onclick = () =>
  applyTheme(document.body.dataset.theme === "light" ? "dark" : "light");
$("langSelect").onchange = (e) => applyLang(e.target.value);

/* ---------------- File handling ---------------- */
const dropzone = $("dropzone");
$("browseBtn").onclick = () => $("fileInput").click();
$("fileInput").onchange = (e) => addFiles(e.target.files);

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("drag"); }));
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("drag"); }));
dropzone.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

function kindOf(file) {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  if (/\.docx?$/i.test(file.name) || file.type.includes("wordprocessingml")) return "docx";
  return "text";
}
function addFiles(fileList) {
  for (const f of fileList) state.files.push({ name: f.name, kind: kindOf(f), file: f });
  renderFiles();
}
function renderFiles() {
  const el = $("fileList");
  el.innerHTML = "";
  state.files.forEach((f, i) => {
    const icon = f.kind === "pdf" ? "📕" : f.kind === "image" ? "🖼️" : f.kind === "docx" ? "📘" : "📄";
    const row = document.createElement("div");
    row.className = "fileitem";
    row.innerHTML = `<span>${icon} ${f.name}</span><button title="Remove">✕</button>`;
    row.querySelector("button").onclick = () => { state.files.splice(i, 1); renderFiles(); };
    el.appendChild(row);
  });
  $("processBtn").disabled = state.files.length === 0;
}

/* ---------------- Extraction ---------------- */
function loader(on, text = "Working…") {
  $("loaderText").textContent = text;
  $("loader").classList.toggle("hidden", !on);
}

async function extractPdf(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    loader(true, `Reading PDF page ${p}/${pdf.numPages}…`);
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map((i) => i.str).join(" ") + "\n";
  }
  return out;
}
async function extractImage(file) {
  loader(true, `OCR scanning ${file.name}… (first run downloads the engine)`);
  const { data } = await Tesseract.recognize(file, "eng");
  return data.text;
}
async function extractDocx(file) {
  loader(true, `Reading Word document ${file.name}…`);
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}
function extractText(file) { return file.text(); }

$("processBtn").onclick = async () => {
  state.subject = $("subjectName").value.trim() || "Untitled subject";
  state.examDate = $("examDate").value;
  state.grade = $("gradeLevel").value;
  $("processStatus").textContent = "Starting…";
  let text = "";
  try {
    for (const f of state.files) {
      if (f.kind === "pdf") text += await extractPdf(f.file) + "\n";
      else if (f.kind === "image") text += await extractImage(f.file) + "\n";
      else if (f.kind === "docx") text += await extractDocx(f.file) + "\n";
      else text += await extractText(f.file) + "\n";
    }
  } catch (err) {
    loader(false);
    $("processStatus").textContent = "❌ Could not read a file: " + err.message;
    return;
  }
  loader(false);
  text = cleanText(text);
  if (text.split(/\s+/).length < 20) {
    $("processStatus").textContent = "⚠️ Very little text found. If these are photos, OCR may have struggled — try clearer images.";
  } else {
    $("processStatus").textContent = `✅ Extracted ~${text.split(/\s+/).length} words.`;
  }
  state.text = text;
  const record = saveSubject();
  loadSubject(record);
  show("study");
};

function cleanText(t) {
  return t.replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------------- Storage ---------------- */
function getSubjects() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function setSubjects(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }

// Spaced-repetition intervals (days) after each successful review.
const SR_INTERVALS = [1, 3, 7, 16, 35];

function saveSubject() {
  const list = getSubjects();
  const record = {
    id: Date.now().toString(36),
    subject: state.subject,
    grade: state.grade || "",
    examDate: state.examDate,
    text: state.text,
    created: new Date().toISOString(),
    srStage: 0,
    nextReview: addDays(new Date(), SR_INTERVALS[0]).toISOString(),
    weakTerms: [],
  };
  list.unshift(record);
  setSubjects(list.slice(0, 25)); // keep storage bounded
  renderRecent();
  renderDue();
  return record;
}

function updateSubject(id, patch) {
  const list = getSubjects();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], ...patch };
  setSubjects(list);
  if (state.current && state.current.id === id) state.current = list[i];
  renderRecent();
  renderDue();
}

function addDays(date, n) { return new Date(date.getTime() + n * 86400000); }

/* ---------------- Spaced repetition (due for revision) ---------------- */
function renderDue() {
  const el = $("dueSection");
  const now = new Date();
  const due = getSubjects().filter((r) => r.nextReview && new Date(r.nextReview) <= now);
  if (!due.length) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="due-banner"><h3>${t("due.title")} (${due.length})</h3>
    <div class="due-list">${due.map((r) => `
      <div class="due-chip" data-id="${r.id}">
        <span class="dc-title">${escapeHtml(r.subject)}</span>
        <span style="font-size:12px">${t("due.stage")} ${r.srStage + 1} · ${r.weakTerms?.length ? r.weakTerms.length + " " + t("due.weak") : t("due.onTrack")}</span>
        <div style="display:flex;gap:6px">
          <button class="open">${t("due.study")}</button>
          <button class="revised">${t("due.revised")}</button>
        </div>
      </div>`).join("")}</div></div>`;
  el.querySelectorAll(".due-chip").forEach((chip) => {
    const id = chip.dataset.id;
    const rec = getSubjects().find((r) => r.id === id);
    chip.querySelector(".open").onclick = () => { loadSubject(rec); show("study"); };
    chip.querySelector(".revised").onclick = () => {
      const stage = Math.min((rec.srStage || 0) + 1, SR_INTERVALS.length - 1);
      updateSubject(id, { srStage: stage, nextReview: addDays(new Date(), SR_INTERVALS[stage]).toISOString() });
    };
  });
}

function renderRecent() {
  const list = getSubjects();
  ["recentList", "libRecent"].forEach((id) => {
    const el = $(id);
    if (!el) return;
    if (!list.length) { el.innerHTML = `<p class="recent-empty">${t("upload.recentEmpty")}</p>`; return; }
    el.innerHTML = "";
    list.forEach((r) => {
      const days = daysLeft(r.examDate);
      const meta = `${r.grade ? escapeHtml(r.grade) + " · " : ""}${days != null ? days + " " + t("recent.days") : t("recent.noExam")}`;
      const div = document.createElement("div");
      div.className = "recent-item";
      div.innerHTML = `<h4>${escapeHtml(r.subject)}</h4>
        <div class="sub"><span>${new Date(r.created).toLocaleDateString()}</span><span>${meta}</span></div>`;
      div.onclick = () => { loadSubject(r); show("study"); };
      el.appendChild(div);
    });
  });
}

function loadSubject(record) {
  state.current = record;
  state.text = record.text;
  state.subject = record.subject;
  state.examDate = record.examDate;
  $("studyTitle").textContent = record.subject;
  $("studyMeta").textContent = `${record.grade ? record.grade + " · " : ""}${record.text.split(/\s+/).length} ${t("study.words")} · ${t("study.saved")} ${new Date(record.created).toLocaleString()}`;
  renderCountdown();
  document.querySelectorAll(".tool[data-tool]").forEach((b) => b.classList.remove("active"));
  $("output").innerHTML = `<p class="muted center">${t("study.pickTool")}</p>`;
}

function daysLeft(date) {
  if (!date) return null;
  const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
  return diff;
}
function renderCountdown() {
  const el = $("countdown");
  const d = daysLeft(state.examDate);
  if (d == null) { el.innerHTML = ""; return; }
  el.classList.toggle("soon", d <= 3);
  el.innerHTML = d < 0
    ? `<span class="num">✓</span><span class="lbl">${t("countdown.passed")}</span>`
    : `<span class="num">${d}</span><span class="lbl">${t("countdown.days")}</span>`;
}

/* ---------------- Text analysis engine (offline) ---------------- */
const STOP = new Set(("a an the of to in on at for and or but is are was were be been being this that these those it its as by with from into about above after again against all am any because before below between both did do does doing down during each few further had has have having he her here hers him his how i if me more most my no nor not now of off once only other our out over own same she should so some such than then there they through too under until up very we what when where which while who whom why will you your".split(" ")));

function sentences(text) {
  return text
    .replace(/\n+/g, " ")
    .match(/[^.!?]+[.!?]+|\S[^.!?]*$/g)?.map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 4) || [];
}
function words(text) {
  return (text.toLowerCase().match(/[a-z][a-z'-]+/g) || []).filter((w) => !STOP.has(w) && w.length > 2);
}
function freqMap(text) {
  const map = {};
  for (const w of words(text)) map[w] = (map[w] || 0) + 1;
  return map;
}
function topKeywords(text, n = 18) {
  const map = freqMap(text);
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n).map((e) => e[0]);
}
function rankSentences(text, n) {
  const fm = freqMap(text);
  const sents = sentences(text);
  const scored = sents.map((s, idx) => {
    const ws = words(s);
    const score = ws.reduce((a, w) => a + (fm[w] || 0), 0) / (ws.length + 1);
    return { s, idx, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, n)
    .sort((a, b) => a.idx - b.idx).map((x) => x.s);
}
function findFormulas(text) {
  return text.split(/\n|(?<=[.!?])\s/)
    .filter((l) => /[=≈≤≥±×÷√∑∫πΩλμ]|(\b\d+\s*[\/^]\s*\d+)/.test(l) && l.length < 160)
    .map((l) => l.trim()).filter(Boolean).slice(0, 12);
}
function findDefinitions(text) {
  const out = [];
  for (const s of sentences(text)) {
    const m = s.match(/^(.{2,50}?)\s+(?:is|are|refers to|means|is defined as|is called)\s+(.{8,})$/i);
    if (m) out.push({ term: m[1].replace(/^(the|a|an)\s+/i, "").trim(), def: s.trim() });
    if (out.length >= 14) break;
  }
  return out;
}

/* ---------------- AI provider (optional) ---------------- */
async function aiGenerate(prompt) {
  const s = getSettings();
  if (s.provider === "gemini" && s.key) return geminiCall(prompt, s.key);
  if (s.provider === "openai" && s.key) return openaiCall(prompt, s.key);
  return null; // offline
}
async function geminiCall(prompt, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error("Gemini API error " + res.status);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
async function openaiCall(prompt, key) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.4 }),
  });
  if (!res.ok) throw new Error("OpenAI API error " + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
function truncForAI(text, max = 12000) {
  return text.length > max ? text.slice(0, max) + "\n...[truncated]" : text;
}
function aiLangSuffix() {
  return LANG === "en" ? "" : ` Write your entire response in ${LANG_META[LANG].name}.`;
}

/* ---------------- Tools ---------------- */
const out = $("output");
document.querySelectorAll(".tool[data-tool]").forEach((btn) => {
  btn.onclick = async () => {
    if (!state.text) { out.innerHTML = `<p class="muted center">${t("study.uploadFirst")}</p>`; return; }
    stopVoice();
    document.querySelectorAll(".tool[data-tool]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tool = btn.dataset.tool;
    try {
      if (tool === "summary") await renderSummary();
      else if (tool === "flashcards") await renderFlashcards();
      else if (tool === "quiz") renderQuiz();
      else if (tool === "mindmap") renderMindmap();
      else if (tool === "explain") await renderExplain();
      else if (tool === "voice") renderVoice();
      else if (tool === "translate") renderTranslate();
      else if (tool === "lastnight") await renderLastNight();
      else if (tool === "share") renderShare();
      else if (tool === "source") renderSource();
    } catch (err) {
      loader(false);
      out.innerHTML = `<p class="muted">⚠️ ${escapeHtml(err.message)}. Falling back to offline mode usually fixes this (check ⚙️ settings).</p>`;
    }
  };
});

async function renderSummary() {
  const ai = getSettings().provider !== "offline";
  if (ai) {
    loader(true, "Asking AI to compress your notes…");
    const prompt = `You are an exam coach. Compress the following study notes into concise revision notes.
Return: (1) 8-12 key bullet points, (2) important definitions, (3) any formulas.
Use clear short lines.${aiLangSuffix()} Notes:\n\n${truncForAI(state.text)}`;
    const res = await aiGenerate(prompt);
    loader(false);
    if (res) { out.innerHTML = `<h3>${t("sum.titleAI")}</h3><div>${mdLite(res)}</div>`; return; }
  }
  // offline
  const points = rankSentences(state.text, 10);
  const defs = findDefinitions(state.text);
  const formulas = findFormulas(state.text);
  const keys = topKeywords(state.text, 16);
  let html = `<h3>${t("sum.title")}</h3>`;
  html += `<div class="section-block"><h4>${t("sum.keyPoints")}</h4><ul>${points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul></div>`;
  if (defs.length) html += `<div class="section-block"><h4>${t("sum.definitions")}</h4><ul>${defs.map((d) => `<li><strong>${escapeHtml(d.term)}</strong> — ${escapeHtml(d.def)}</li>`).join("")}</ul></div>`;
  if (formulas.length) html += `<div class="section-block"><h4>${t("sum.formulas")}</h4>${formulas.map((f) => `<div class="formula">${escapeHtml(f)}</div>`).join("")}</div>`;
  html += `<div class="section-block"><h4>${t("sum.terms")}</h4>${keys.map((k) => `<span class="pill">${escapeHtml(k)}</span>`).join("")}</div>`;
  out.innerHTML = html;
}

async function renderFlashcards() {
  const cards = buildFlashcards();
  if (!cards.length) { out.innerHTML = `<p class="muted center">${t("fc.none")}</p>`; return; }
  out.innerHTML = `<h3>${t("fc.title")} <span class="muted">${t("fc.hint")}</span></h3>
    <div class="flash-grid">${cards.map((c, i) => `
      <div class="flashcard" data-i="${i}">
        <div class="flash-inner">
          <div class="flash-face flash-front"><span class="flash-tag">Q</span>${escapeHtml(c.q)}</div>
          <div class="flash-face flash-back"><span class="flash-tag">A</span>${escapeHtml(c.a)}</div>
        </div>
      </div>`).join("")}</div>`;
  out.querySelectorAll(".flashcard").forEach((el) => el.onclick = () => el.classList.toggle("flipped"));
}
function buildFlashcards() {
  const cards = [];
  for (const d of findDefinitions(state.text)) cards.push({ q: t("fc.whatIs", { t: d.term }), a: d.def });
  const keys = topKeywords(state.text, 14);
  const sents = sentences(state.text);
  for (const k of keys) {
    if (cards.length >= 16) break;
    const s = sents.find((x) => new RegExp(`\\b${k}\\b`, "i").test(x));
    if (s && !cards.some((c) => c.a === s)) cards.push({ q: t("fc.explain", { t: k }), a: s });
  }
  return cards.slice(0, 16);
}

function renderQuiz() {
  const qs = buildQuiz();
  if (!qs.length) { out.innerHTML = `<p class="muted center">${t("quiz.none")}</p>`; return; }
  let html = weaknessBanner();
  html += `<h3>${t("quiz.title")} <span class="muted">(${qs.length} ${t("quiz.questions")})</span></h3><div id="quizScore" class="quiz-score"></div>`;
  qs.forEach((q, qi) => {
    html += `<div class="quiz-q"><div class="qtext">${qi + 1}. ${escapeHtml(q.question)}</div>`;
    q.options.forEach((opt, oi) => {
      html += `<button class="quiz-opt" data-q="${qi}" data-correct="${oi === q.answer}">${escapeHtml(opt)}</button>`;
    });
    html += `</div>`;
  });
  out.innerHTML = html;
  let answered = 0, correct = 0;
  const wrongTerms = new Set();
  out.querySelectorAll(".quiz-opt").forEach((b) => {
    b.onclick = () => {
      const qi = b.dataset.q;
      const group = out.querySelectorAll(`.quiz-opt[data-q="${qi}"]`);
      if ([...group].some((x) => x.classList.contains("correct") || x.classList.contains("wrong"))) return;
      const isCorrect = b.dataset.correct === "true";
      group.forEach((x) => { if (x.dataset.correct === "true") x.classList.add("correct"); });
      if (!isCorrect) { b.classList.add("wrong"); if (qs[qi].term) wrongTerms.add(qs[qi].term); }
      answered++; if (isCorrect) correct++;
      $("quizScore").textContent = `${t("quiz.score")} ${correct} / ${answered}`;
      // Persist weak topics once the whole quiz is answered.
      if (answered === qs.length && state.current) {
        const prev = new Set(state.current.weakTerms || []);
        wrongTerms.forEach((term) => prev.add(term));
        updateSubject(state.current.id, { weakTerms: [...prev].slice(0, 20) });
        $("quizScore").textContent += wrongTerms.size
          ? " · " + t("quiz.saved", { n: wrongTerms.size })
          : " · " + t("quiz.noWeak");
      }
    };
  });
}
function buildQuiz() {
  const keys = topKeywords(state.text, 24);
  const quiz = [];
  for (const s of rankSentences(state.text, 18)) {
    if (quiz.length >= 8) break;
    const target = keys.find((k) => new RegExp(`\\b${k}\\b`, "i").test(s));
    if (!target) continue;
    const distractors = keys.filter((k) => k !== target).sort(() => Math.random() - 0.5).slice(0, 3);
    if (distractors.length < 3) continue;
    const question = s.replace(new RegExp(`\\b${target}\\b`, "i"), "_____");
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    quiz.push({ question: t("quiz.fillBlank") + " " + question, options, answer: options.indexOf(target), term: target });
  }
  return quiz;
}
function weaknessBanner() {
  const weak = state.current?.weakTerms || [];
  if (!weak.length) return "";
  return `<div class="weak-box"><h4>${t("quiz.weakTitle")}</h4>
    <div>${weak.map((w) => `<span class="pill">${escapeHtml(w)}</span>`).join("")}</div></div>`;
}

async function renderLastNight() {
  const ai = getSettings().provider !== "offline";
  let body = "";
  if (ai) {
    loader(true, t("loader.working"));
    const prompt = `Create an emergency "night before the exam" cheat sheet from these notes.
Include: the 8 most important concepts (one line each), all key formulas, and the top 10 most probable exam questions.
Be extremely concise.${aiLangSuffix()} Notes:\n\n${truncForAI(state.text)}`;
    const res = await aiGenerate(prompt);
    loader(false);
    if (res) body = mdLite(res);
  }
  if (!body) {
    const must = rankSentences(state.text, 8);
    const formulas = findFormulas(state.text);
    const probable = buildProbableQuestions();
    body = `<div class="section-block"><h4>${t("ln.must")}</h4><ul>${must.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul></div>`;
    if (formulas.length) body += `<div class="section-block"><h4>${t("ln.formulas")}</h4>${formulas.map((f) => `<div class="formula">${escapeHtml(f)}</div>`).join("")}</div>`;
    body += `<div class="section-block"><h4>${t("ln.probable")}</h4><ul>${probable.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul></div>`;
  }
  out.innerHTML = `<div class="ln-banner"><h3>${t("ln.title")}</h3><p class="muted">${t("ln.sub")}</p></div>${body}`;
}
function buildProbableQuestions() {
  const defs = findDefinitions(state.text);
  const keys = topKeywords(state.text, 12);
  const qs = [];
  defs.slice(0, 6).forEach((d) => qs.push(t("ln.define", { t: d.term })));
  keys.forEach((k) => { if (qs.length < 10) qs.push(t("ln.shortNotes", { t: k })); });
  return qs.slice(0, 10);
}

/* ---------------- Mindmap (SVG radial) ---------------- */
function renderMindmap() {
  const subject = state.subject || "Notes";
  const keys = topKeywords(state.text, 7);
  const sents = sentences(state.text);
  if (!keys.length) { out.innerHTML = `<p class="muted center">${t("mm.none")}</p>`; return; }
  const W = 820, H = 600, cx = W / 2, cy = H / 2, R = 160, R2 = 270;
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  let lines = "", nodes = "";
  keys.forEach((k, i) => {
    const a = (i / keys.length) * Math.PI * 2 - Math.PI / 2;
    const bx = cx + R * Math.cos(a), by = cy + R * Math.sin(a);
    lines += `<line class="mm-line" x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" />`;
    const snip = sents.find((s) => new RegExp(`\\b${k}\\b`, "i").test(s));
    if (snip) {
      const lx = cx + R2 * Math.cos(a), ly = cy + R2 * Math.sin(a);
      lines += `<line class="mm-line" x1="${bx}" y1="${by}" x2="${lx}" y2="${ly}" />`;
      nodes += mmNode(lx, ly, trunc(snip.split(/\s+/).slice(0, 5).join(" "), 24), "mm-leaf", 150, 40, snip);
    }
    nodes += mmNode(bx, by, trunc(k, 16), "mm-branch", 120, 38);
  });
  nodes += mmNode(cx, cy, trunc(subject, 18), "mm-center", 150, 46);
  out.innerHTML = `<h3>${t("mm.title")}</h3><div class="mindmap-wrap">
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${lines}${nodes}</svg></div>
    <p class="muted center">${t("mm.hint")}</p>`;
}
function mmNode(x, y, label, cls, w, h, title) {
  return `<g class="mm-node ${cls}" transform="translate(${x},${y})">
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" />
    <text x="0" y="4" text-anchor="middle">${escapeHtml(label)}</text>
    <title>${escapeHtml(title || label)}</title></g>`;
}

/* ---------------- Explain Simply ---------------- */
let explainMode = "beginner";
const EXPLAIN_MODES = {
  beginner: "Explain like I'm a beginner, in plain simple words with short sentences",
  kid: "Explain like I'm 10 years old, using fun simple analogies",
  teacher: "Explain like an exam teacher giving clear, structured points students can write in an exam",
};
async function renderExplain() {
  out.innerHTML = `<h3>${t("ex.title")}</h3>
    <div class="mode-row">
      ${Object.keys(EXPLAIN_MODES).map((m) => `<button class="mode-btn ${m === explainMode ? "active" : ""}" data-mode="${m}">${t("ex." + m)}</button>`).join("")}
    </div><div id="explainBody"></div>`;
  out.querySelectorAll(".mode-btn").forEach((b) => b.onclick = () => {
    explainMode = b.dataset.mode;
    out.querySelectorAll(".mode-btn").forEach((x) => x.classList.toggle("active", x === b));
    runExplain();
  });
  await runExplain();
}
async function runExplain() {
  const body = $("explainBody");
  const aiOn = getSettings().provider !== "offline";
  if (aiOn) {
    loader(true, t("loader.working"));
    const prompt = `${EXPLAIN_MODES[explainMode]}. Summarize and explain the key ideas from these notes so they are easy to understand and remember for an exam. Use short bullet points.${aiLangSuffix()}\n\n${truncForAI(state.text)}`;
    try {
      const res = await aiGenerate(prompt);
      loader(false);
      if (res) { body.innerHTML = mdLite(res); return; }
    } catch (e) { loader(false); }
  }
  // Offline fallback (can't translate generated content without an API key)
  const points = rankSentences(state.text, 8);
  const defs = findDefinitions(state.text);
  let html = "";
  if (LANG !== "en") {
    html += `<p class="muted">${t("ex.offlineNote", { lang: LANG_META[LANG].name })}</p>`;
  }
  html += `<ul>${points.map((p) => `<li>${escapeHtml(simplify(p))}</li>`).join("")}</ul>`;
  if (defs.length) html += `<div class="section-block"><h4>${t("ex.glossary")}</h4><ul>${defs.map((d) => `<li><strong>${escapeHtml(d.term)}</strong>: ${escapeHtml(d.def)}</li>`).join("")}</ul></div>`;
  body.innerHTML = html;
}
function simplify(s) {
  // Offline "simplify": keep the first clause, trim filler.
  return s.split(/[,;:]/)[0].replace(/\b(therefore|however|moreover|consequently|furthermore)\b/gi, "").trim() + (s.includes(",") ? "." : "");
}

/* ---------------- Voice revision (Web Speech API) ---------------- */
const voiceState = { sentences: [], baseSentences: [], cache: {}, idx: 0, playing: false, rate: 1, voiceLang: "en-US" };
function stopVoice() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  voiceState.playing = false;
}
function pickVoice(langCode) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const code = langCode.toLowerCase();
  const two = code.slice(0, 2);
  return voices.find((v) => v.lang && v.lang.toLowerCase() === code)
    || voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(two)) || null;
}
function buildRevisionText() {
  const pts = rankSentences(state.text, 14);
  const defs = findDefinitions(state.text).map((d) => d.def);
  return [...pts, ...defs];
}
function renderVoice() {
  if (!("speechSynthesis" in window)) {
    out.innerHTML = `<p class="muted center">${t("voice.unsupported")}</p>`; return;
  }
  voiceState.baseSentences = buildRevisionText();
  voiceState.sentences = voiceState.baseSentences;
  voiceState.cache = {};
  voiceState.idx = 0;
  voiceState.voiceLang = LANG_META[LANG].voice;
  out.innerHTML = `<h3>${t("voice.title")}</h3>
    <div class="voice-panel">
      <button class="btn primary" id="vPlay">${t("voice.play")}</button>
      <button class="btn ghost" id="vPause">${t("voice.pause")}</button>
      <button class="btn ghost" id="vResume">${t("voice.resume")}</button>
      <button class="btn ghost" id="vStop">${t("voice.stop")}</button>
      <label>${t("voice.lang")}
        <select id="vLang" class="langsel">
          <option value="en-US">English</option>
          <option value="hi-IN">हिन्दी</option>
          <option value="ur-PK">اردو</option>
          <option value="pa-IN">ਪੰਜਾਬੀ</option>
        </select>
      </label>
      <label>${t("voice.speed")} <input type="range" id="vRate" min="0.6" max="1.6" step="0.1" value="1"></label>
    </div>
    <div id="vStatus" class="muted" style="margin:0 0 12px;font-size:13px"></div>
    <div class="voice-text">${voiceState.sentences.map((s, i) => `<span id="v-s-${i}">${escapeHtml(s)} </span>`).join("")}</div>
    <p class="muted">${t("voice.note")}</p>`;
  $("vLang").value = voiceState.voiceLang;
  // Translate up-front on language change so that pressing Play later can call
  // speech synchronously (browsers block speak() if it runs after a network await).
  $("vLang").onchange = async (e) => {
    stopVoice(); clearVoiceHighlight();
    voiceState.voiceLang = e.target.value;
    await ensureVoiceLanguage();
    updateVoiceStatus();
  };
  $("vRate").oninput = (e) => { voiceState.rate = parseFloat(e.target.value); };
  $("vPlay").onclick = () => {
    const code = (voiceState.voiceLang || "en-US").slice(0, 2);
    if (code === "en") { voiceState.sentences = voiceState.baseSentences; speakFrom(0); }
    else if (voiceState.cache[code]) { voiceState.sentences = voiceState.cache[code]; speakFrom(0); }
    else { ensureVoiceLanguage().then(() => speakFrom(0)); } // first run for this language
  };
  $("vPause").onclick = () => window.speechSynthesis.pause();
  $("vResume").onclick = () => window.speechSynthesis.resume();
  $("vStop").onclick = () => { stopVoice(); clearVoiceHighlight(); };
  // Voice list loads asynchronously in some browsers; refresh status when it does.
  window.speechSynthesis.onvoiceschanged = updateVoiceStatus;
  updateVoiceStatus();
  if ((voiceState.voiceLang || "en-US").slice(0, 2) !== "en") ensureVoiceLanguage();
}
const VOICE_NAMES = { en: "English", hi: "हिन्दी", ur: "اردو", pa: "ਪੰਜਾਬੀ" };
function updateVoiceStatus() {
  const el = $("vStatus");
  if (!el) return;
  const code = (voiceState.voiceLang || "en-US").slice(0, 2);
  const name = VOICE_NAMES[code] || code;
  if (code === "en" || pickVoice(voiceState.voiceLang)) {
    el.innerHTML = `<span style="color:var(--accent)">${t("voice.ready", { lang: name })}</span>`;
  } else {
    el.innerHTML = `<span style="color:var(--danger)">${t("voice.missing", { lang: name })}</span>`;
  }
}
// Translate the revision text into the chosen voice language so it is actually
// SPOKEN in that language (not just pronounced by a different engine).
async function ensureVoiceLanguage() {
  const code = (voiceState.voiceLang || "en-US").slice(0, 2);
  if (code === "en") { voiceState.sentences = voiceState.baseSentences; updateVoiceText(); return; }
  if (voiceState.cache[code]) { voiceState.sentences = voiceState.cache[code]; updateVoiceText(); return; }
  loader(true, t("translate.working"));
  try {
    const translated = await googleTranslate(voiceState.baseSentences.join("\n\n"), code);
    const arr = translated.split(/\n{2,}/);
    voiceState.sentences = arr.length === voiceState.baseSentences.length ? arr : translated.split(/\n+/).filter(Boolean);
    voiceState.cache[code] = voiceState.sentences;
  } catch (e) {
    voiceState.sentences = voiceState.baseSentences; // fall back to original
  }
  loader(false);
  updateVoiceText();
}
function updateVoiceText() {
  const box = out.querySelector(".voice-text");
  if (!box) return;
  const code = (voiceState.voiceLang || "en-US").slice(0, 2);
  box.dir = (code === "ur" || code === "ar") ? "rtl" : "auto";
  box.innerHTML = voiceState.sentences.map((s, i) => `<span id="v-s-${i}">${escapeHtml(s)} </span>`).join("");
}
function speakFrom(i) {
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume(); // clear any stuck "paused" state
  voiceState.idx = i; voiceState.playing = true;
  speakNext();
}
function speakNext() {
  if (!voiceState.playing || voiceState.idx >= voiceState.sentences.length) {
    voiceState.playing = false; clearVoiceHighlight(); return;
  }
  const code = (voiceState.voiceLang || "en-US").slice(0, 2);
  const match = pickVoice(voiceState.voiceLang);
  // If no voice exists for the chosen language, read the English original
  // (intelligible) instead of the translated script (which the English engine
  // would mangle, reading only numbers/Latin).
  const useNative = code === "en" || !!match;
  const text = useNative ? voiceState.sentences[voiceState.idx]
    : (voiceState.baseSentences[voiceState.idx] || voiceState.sentences[voiceState.idx]);
  const u = new SpeechSynthesisUtterance(text);
  u.rate = voiceState.rate;
  if (match) { u.voice = match; u.lang = match.lang; }
  else u.lang = useNative ? (voiceState.voiceLang || "en-US") : "en-US";
  u.onstart = () => highlightVoice(voiceState.idx);
  u.onend = () => { if (voiceState.playing) { voiceState.idx++; speakNext(); } };
  window.speechSynthesis.speak(u);
}
function highlightVoice(i) {
  clearVoiceHighlight();
  const el = $(`v-s-${i}`);
  if (el) { el.classList.add("speaking"); el.scrollIntoView({ block: "center", behavior: "smooth" }); }
}
function clearVoiceHighlight() {
  document.querySelectorAll(".voice-text .speaking").forEach((e) => e.classList.remove("speaking"));
}

/* ---------------- Translate whole document ---------------- */
const TRANSLATE_LANGS = [
  { code: "en", name: "English" }, { code: "hi", name: "हिन्दी (Hindi)" }, { code: "ur", name: "اردو (Urdu)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" }, { code: "bn", name: "বাংলা (Bengali)" }, { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" }, { code: "mr", name: "मराठी (Marathi)" }, { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" }, { code: "ml", name: "മലയാളം (Malayalam)" }, { code: "ar", name: "العربية (Arabic)" },
  { code: "es", name: "Español (Spanish)" }, { code: "fr", name: "Français (French)" }, { code: "de", name: "Deutsch (German)" },
  { code: "ru", name: "Русский (Russian)" }, { code: "zh-CN", name: "中文 (Chinese)" }, { code: "ja", name: "日本語 (Japanese)" },
];
function renderTranslate() {
  const opts = TRANSLATE_LANGS.map((l) => `<option value="${l.code}">${l.name}</option>`).join("");
  out.innerHTML = `<h3>${t("tool.translate")}</h3>
    <div class="voice-panel">
      <label>${t("translate.target")}
        <select id="trTarget" class="langsel">${opts}</select>
      </label>
      <button class="btn primary" id="trGo">${t("translate.btn")}</button>
    </div>
    <div id="trOut"></div>`;
  $("trGo").onclick = doTranslate;
}
async function doTranslate() {
  const target = $("trTarget").value;
  const langName = (TRANSLATE_LANGS.find((l) => l.code === target) || {}).name || target;
  loader(true, t("translate.working"));
  let translated;
  try {
    translated = await translateText(state.text, target, langName);
  } catch (e) {
    loader(false);
    $("trOut").innerHTML = `<p class="muted">⚠️ ${escapeHtml(e.message)}. Tip: add a Gemini/OpenAI key in ⚙️ Settings as a fallback translator.</p>`;
    return;
  }
  loader(false);
  const rtl = target === "ur" || target === "ar";
  $("trOut").innerHTML = `
    <div class="share-controls" style="justify-content:flex-start;margin-bottom:12px">
      <button class="btn primary" id="trPdf">${t("translate.downloadPdf")}</button>
      <button class="btn ghost" id="trDoc">${t("translate.downloadDoc")}</button>
      <button class="btn ghost" id="trTxt">${t("translate.downloadTxt")}</button>
    </div>
    <div class="voice-text" dir="${rtl ? "rtl" : "auto"}" style="white-space:pre-wrap">${escapeHtml(translated)}</div>
    <p class="muted">${t("translate.note")}</p>`;
  $("trPdf").onclick = () => downloadTranslatedPdf(translated, target, state.subject);
  $("trDoc").onclick = () => downloadTranslatedDoc(translated, target, state.subject);
  $("trTxt").onclick = () => downloadText(translated, `${state.subject}_${target}.txt`);
}
async function translateText(text, target, langName) {
  try {
    return await googleTranslate(text, target);
  } catch (e) {
    const s = getSettings();
    if ((s.provider === "gemini" || s.provider === "openai") && s.key) {
      const r = await aiGenerate(`Translate the following text into ${langName}. Keep the same paragraphs and line breaks. Output only the translation, nothing else:\n\n${truncForAI(text)}`);
      if (r) return r;
    }
    throw e;
  }
}
async function googleTranslate(text, target) {
  // Translate paragraph-by-paragraph so structure is preserved.
  const paras = text.split(/\n{2,}/);
  const outParas = [];
  for (const para of paras) {
    if (!para.trim()) { outParas.push(""); continue; }
    const pieces = para.length > 1500 ? chunkBySentence(para, 1500) : [para];
    let translatedPara = "";
    for (const piece of pieces) {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(piece)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Translation service error " + res.status);
      const data = await res.json();
      translatedPara += (data[0] || []).map((seg) => seg[0]).join("");
    }
    outParas.push(translatedPara);
  }
  return outParas.join("\n\n");
}
function chunkBySentence(text, max) {
  const sents = text.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [text];
  const chunks = []; let cur = "";
  for (const s of sents) {
    if ((cur + s).length > max && cur) { chunks.push(cur); cur = ""; }
    cur += s;
  }
  if (cur) chunks.push(cur);
  return chunks;
}
function downloadText(text, filename) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename.replace(/[^\w.]+/g, "_");
  a.click();
  URL.revokeObjectURL(a.href);
}
// Direct PDF download. Text is drawn onto canvas pages (the browser renders any
// script — Hindi/Urdu/Tamil — correctly), then embedded into the PDF.
function downloadTranslatedPdf(text, code, subject) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth(), pageH = doc.internal.pageSize.getHeight();
  const margin = 42, S = 2, fontPx = 15, lineH = 23;
  const rtl = code === "ur" || code === "ar";
  const family = "'Segoe UI','Nirmala UI','Noto Sans',sans-serif";
  const meas = document.createElement("canvas").getContext("2d");
  meas.font = `${fontPx * S}px ${family}`;
  const maxW = (pageW - margin * 2) * S;
  const wrap = (para) => {
    if (!para.trim()) return [""];
    const words = para.split(/\s+/), lines = []; let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (meas.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };
  const all = [{ text: subject || "PgluAI", title: true }, { text: "", title: false }];
  text.split(/\n{2,}/).forEach((p) => { wrap(p).forEach((l) => all.push({ text: l, title: false })); all.push({ text: "", title: false }); });
  const perPage = Math.floor((pageH - margin * 2) / lineH);
  for (let i = 0; i < all.length; i += perPage) {
    if (i > 0) doc.addPage();
    const c = document.createElement("canvas"); c.width = pageW * S; c.height = pageH * S;
    const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.textBaseline = "top";
    ctx.direction = rtl ? "rtl" : "ltr"; ctx.textAlign = rtl ? "right" : "left";
    const x = rtl ? (pageW - margin) * S : margin * S;
    let y = margin * S;
    all.slice(i, i + perPage).forEach((ln) => {
      if (ln.title) { ctx.fillStyle = "#6c5ce7"; ctx.font = `bold ${20 * S}px ${family}`; }
      else { ctx.fillStyle = "#111"; ctx.font = `${fontPx * S}px ${family}`; }
      ctx.fillText(ln.text, x, y);
      y += lineH * S;
    });
    doc.addImage(c.toDataURL("image/jpeg", 0.85), "JPEG", 0, 0, pageW, pageH);
  }
  doc.save(`${(subject || "PgluAI")}_${code}.pdf`.replace(/[^\w.\-]+/g, "_"));
}
// Direct Word download via a Unicode HTML document Word opens as .doc.
function downloadTranslatedDoc(text, code, subject) {
  const rtl = code === "ur" || code === "ar";
  const body = text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const html = `<!DOCTYPE html><html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${escapeHtml(subject || "PgluAI")}</title></head>
    <body dir='${rtl ? "rtl" : "ltr"}' style="font-family:'Segoe UI','Nirmala UI',sans-serif;line-height:1.6">
    <h1 style='color:#6c5ce7'>${escapeHtml(subject || "PgluAI")}</h1>${body}</body></html>`;
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(subject || "PgluAI")}_${code}.doc`.replace(/[^\w.\-]+/g, "_");
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------------- Shareable revision card (PNG) ---------------- */
function renderShare() {
  const points = rankSentences(state.text, 12).filter((p) => p.length < 220);
  if (!points.length) { out.innerHTML = `<p class="muted center">${t("share.none")}</p>`; return; }
  let idx = 0;
  out.innerHTML = `<h3>${t("share.title")}</h3><div class="share-wrap">
    <canvas id="shareCanvas" width="1080" height="1080"></canvas>
    <div class="share-controls">
      <button class="btn ghost" id="prevCard">${t("share.prev")}</button>
      <button class="btn ghost" id="nextCard">${t("share.next")}</button>
      <button class="btn primary" id="dlCard">${t("share.download")}</button>
    </div>
    <p class="muted">${t("share.note")}</p></div>`;
  const draw = () => drawCard(points[idx]);
  $("prevCard").onclick = () => { idx = (idx - 1 + points.length) % points.length; draw(); };
  $("nextCard").onclick = () => { idx = (idx + 1) % points.length; draw(); };
  $("dlCard").onclick = () => {
    const a = document.createElement("a");
    a.download = `PgluAI_card_${idx + 1}.png`;
    a.href = $("shareCanvas").toDataURL("image/png");
    a.click();
  };
  draw();
}
function drawCard(point) {
  const c = $("shareCanvas"), ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 1080, 1080);
  g.addColorStop(0, "#6c5ce7"); g.addColorStop(1, "#00b3a4");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = "rgba(255,255,255,0.10)"; roundRect(ctx, 70, 70, 940, 940, 40); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 46px Segoe UI, sans-serif";
  ctx.fillText("📚 PgluAI", 110, 170);
  ctx.font = "600 34px Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(wrapTrim(state.subject || "Revision", 32), 110, 240);
  // main point, wrapped + vertically centered
  ctx.font = "bold 54px Segoe UI, sans-serif"; ctx.fillStyle = "#fff";
  const lines = wrapText(ctx, point, 860);
  const startY = 540 - (lines.length - 1) * 35;
  lines.forEach((ln, i) => ctx.fillText(ln, 110, startY + i * 70));
  ctx.font = "500 28px Segoe UI, sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Made with PgluAI · revise smarter", 110, 960);
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrapText(ctx, text, maxW) {
  const words = text.split(/\s+/), lines = []; let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 9);
}
function wrapTrim(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

function renderSource() {
  out.innerHTML = `<h3>${t("src.title")}</h3><pre style="white-space:pre-wrap;font-size:13px;line-height:1.5;color:var(--muted)">${escapeHtml(state.text)}</pre>`;
}

/* ---------------- PDF export ---------------- */
$("downloadBtn").onclick = () => {
  if (!state.text) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48, width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;
  const line = (txt, size = 11, bold = false, color = [30, 30, 30]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size); doc.setTextColor(...color);
    for (const l of doc.splitTextToSize(txt, width)) {
      if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
      doc.text(l, margin, y); y += size + 5;
    }
  };
  const imageBlock = (canvas, label, ratioH) => {
    const h = width * ratioH;
    if (y + h + 26 > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
    line(label, 14, true, [108, 92, 231]);
    doc.addImage(canvas, "PNG", margin, y, width, h);
    y += h + 16;
  };

  line("PgluAI — Revision Sheet", 18, true, [108, 92, 231]); y += 4;
  line(`${state.grade ? state.grade + " · " : ""}${state.subject}`, 13, true); y += 6;

  // Visual diagram + chart so concepts are easy to grasp
  imageBlock(buildMindmapCanvas(), "Mindmap", 0.58);
  imageBlock(buildChartCanvas(), "Most important topics", 0.46);

  line("Key Points", 14, true, [108, 92, 231]);
  rankSentences(state.text, 10).forEach((p) => line("• " + p));
  y += 8;
  const defs = findDefinitions(state.text);
  if (defs.length) { line("Definitions", 14, true, [108, 92, 231]); defs.forEach((d) => line("• " + d.def)); y += 8; }
  const formulas = findFormulas(state.text);
  if (formulas.length) { line("Formulas", 14, true, [108, 92, 231]); formulas.forEach((f) => line(f, 11, false, [0, 120, 100])); y += 8; }
  line("Probable Questions", 14, true, [108, 92, 231]);
  buildProbableQuestions().forEach((q, i) => line(`${i + 1}. ${q}`));

  doc.save(`${state.subject.replace(/[^\w]+/g, "_")}_PgluAI.pdf`);
};

// Offscreen canvas helpers for the PDF visuals.
function buildMindmapCanvas() {
  const W = 900, H = Math.round(W * 0.58), c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2, R = H * 0.32, R2 = H * 0.46;
  const keys = topKeywords(state.text, 7);
  const sents = sentences(state.text);
  const node = (x, y, text, w, h, fill, stroke, txtColor, bold) => {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 2;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = txtColor; ctx.font = `${bold ? "bold " : ""}15px Segoe UI, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text.length > 22 ? text.slice(0, 21) + "…" : text, x, y);
  };
  keys.forEach((k, i) => {
    const a = (i / keys.length) * Math.PI * 2 - Math.PI / 2;
    const bx = cx + R * Math.cos(a), by = cy + R * Math.sin(a);
    ctx.strokeStyle = "#c9cdf0"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
    const snip = sents.find((s) => new RegExp(`\\b${k}\\b`, "i").test(s));
    if (snip) {
      const lx = cx + R2 * Math.cos(a), ly = cy + R2 * Math.sin(a);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(lx, ly); ctx.stroke();
      node(lx, ly, snip.split(/\s+/).slice(0, 4).join(" "), 170, 40, "#f3f4fc", "#d9ddf0", "#333");
    }
    node(bx, by, k, 130, 38, "#eef0fb", "#8f7bff", "#1c1f3a", true);
  });
  node(cx, cy, state.subject || "Notes", 170, 48, "#6c5ce7", "#6c5ce7", "#ffffff", true);
  return c;
}
function buildChartCanvas() {
  const W = 900, H = Math.round(W * 0.46), c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
  const fm = freqMap(state.text);
  const top = Object.entries(fm).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = top.length ? top[0][1] : 1;
  const padL = 170, padR = 40, padT = 24, rowH = (H - padT - 24) / Math.max(top.length, 1);
  ctx.textBaseline = "middle";
  top.forEach(([word, n], i) => {
    const y = padT + i * rowH + rowH / 2;
    const barW = ((W - padL - padR) * n) / max;
    ctx.fillStyle = "#1c1f3a"; ctx.font = "15px Segoe UI, sans-serif"; ctx.textAlign = "right";
    ctx.fillText(word.length > 18 ? word.slice(0, 17) + "…" : word, padL - 12, y);
    const g = ctx.createLinearGradient(padL, 0, padL + barW, 0);
    g.addColorStop(0, "#6c5ce7"); g.addColorStop(1, "#00d2a8");
    ctx.fillStyle = g; roundRect(ctx, padL, y - rowH * 0.3, Math.max(barW, 2), rowH * 0.6, 6); ctx.fill();
    ctx.fillStyle = "#5b6190"; ctx.font = "13px Segoe UI, sans-serif"; ctx.textAlign = "left";
    ctx.fillText(String(n), padL + Math.max(barW, 2) + 8, y);
  });
  return c;
}

/* ---------------- Helpers ---------------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function mdLite(md) {
  return escapeHtml(md)
    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^## (.*)$/gm, "<h4>$1</h4>")
    .replace(/^\* (.*)$/gm, "<li>$1</li>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.*)$/gm, "<li>$1</li>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "<br><br>");
}

/* ---------------- Library: Test Yourself ---------------- */
function initLibraryTest() {
  const bandSel = $("testBand");
  if (!bandSel || typeof QUIZ_BANK === "undefined") return;
  bandSel.innerHTML = Object.keys(QUIZ_BANK).map((b) => `<option>${b}</option>`).join("");
  const fillSubjects = () => {
    $("testSubject").innerHTML = Object.keys(QUIZ_BANK[bandSel.value] || {}).map((s) => `<option>${s}</option>`).join("");
  };
  bandSel.onchange = () => { fillSubjects(); $("testArea").innerHTML = ""; };
  fillSubjects();
  $("testStart").onclick = () => {
    const qs = (QUIZ_BANK[bandSel.value] || {})[$("testSubject").value];
    if (qs && qs.length) renderTestQuiz(qs, $("testArea"));
  };
}
function renderTestQuiz(qs, container) {
  // Shuffle the options of each question so the answer position varies.
  const items = qs.map((item) => {
    const opts = item.options.map((text, i) => ({ text, correct: i === item.answer }));
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    return { q: item.q, opts };
  });
  let html = `<div id="testScore" class="quiz-score"></div>`;
  items.forEach((item, qi) => {
    html += `<div class="quiz-q"><div class="qtext">${qi + 1}. ${escapeHtml(item.q)}</div>`;
    item.opts.forEach((o) => { html += `<button class="quiz-opt" data-q="${qi}" data-correct="${o.correct}">${escapeHtml(o.text)}</button>`; });
    html += `</div>`;
  });
  container.innerHTML = html;
  let answered = 0, correct = 0;
  container.querySelectorAll(".quiz-opt").forEach((b) => {
    b.onclick = () => {
      const qi = b.dataset.q;
      const group = container.querySelectorAll(`.quiz-opt[data-q="${qi}"]`);
      if ([...group].some((x) => x.classList.contains("correct") || x.classList.contains("wrong"))) return;
      const isCorrect = b.dataset.correct === "true";
      group.forEach((x) => { if (x.dataset.correct === "true") x.classList.add("correct"); });
      if (!isCorrect) b.classList.add("wrong");
      answered++; if (isCorrect) correct++;
      const scoreEl = container.querySelector("#testScore");
      scoreEl.textContent = `${t("quiz.score")} ${correct} / ${answered}`;
      if (answered === items.length) scoreEl.textContent += ` · ${Math.round((correct / answered) * 100)}%`;
    };
  });
  container.querySelector("#testScore").scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/* ---------------- Init ---------------- */
applyTheme(localStorage.getItem("reviseai.theme") || "dark");
applyLang(LANG);
initLibraryTest();
renderFiles();
