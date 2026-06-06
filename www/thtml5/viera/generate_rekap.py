import json
import os

def generate_html():
    json_path = "/home/wira/Downloads/viera_project/www/thtml5/js/test.json"
    trans_path = "/home/wira/Downloads/viera_project/www/thtml5/viera/transcriptions.json"
    output_path = "/home/wira/Downloads/viera_project/www/thtml5/viera/rekap_soal.html"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        
    transcriptions = {}
    if os.path.exists(trans_path):
        with open(trans_path, 'r', encoding='utf-8') as f:
            transcriptions = json.load(f)
            
    # Serialize questions and transcriptions to embed as JS objects
    questions_json = json.dumps(questions, indent=2)
    transcriptions_json = json.dumps(transcriptions, indent=2)
    
    # Use normal string block to avoid f-string doubling errors
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rekapitulasi Soal VIERA</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #f4f6fc;
      --bg-card: #ffffff;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --secondary: #475569;
      --border-color: #e2e8f0;
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
      --shadow-hover: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      --badge-listening-bg: #dbeafe;
      --badge-listening-text: #1e40af;
      --badge-reading-bg: #dcfce7;
      --badge-reading-text: #166534;
      --badge-dir-bg: #fef3c7;
      --badge-dir-text: #92400e;
    }

    [data-theme="dark"] {
      --bg-primary: #0f172a;
      --bg-card: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #3b82f6;
      --primary-hover: #60a5fa;
      --border-color: #334155;
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);
      --badge-listening-bg: #1e3a8a;
      --badge-listening-text: #93c5fd;
      --badge-reading-bg: #064e3b;
      --badge-reading-text: #86efac;
      --badge-dir-bg: #78350f;
      --badge-dir-text: #fde047;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-main);
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar Navigation */
    .sidebar {
      width: 320px;
      border-right: 1px solid var(--border-color);
      background-color: var(--bg-card);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .sidebar-header h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 5px;
    }

    .sidebar-header p {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .question-grid-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 12px;
      margin-top: 15px;
    }

    .section-title:first-child {
      margin-top: 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .grid-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-main);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
    }

    .grid-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .grid-btn.active {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .grid-btn.visited {
      border-color: var(--primary);
      background-color: rgba(37, 99, 235, 0.05);
    }

    /* Main Content */
    .main-layout {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    /* Top Navigation bar */
    .top-bar {
      height: 70px;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-card);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
      z-index: 10;
    }

    .search-box {
      position: relative;
      width: 300px;
    }

    .search-box input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-main);
      font-size: 0.875rem;
      outline: none;
    }

    .search-box input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    }

    .search-box svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    .controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--border-color);
      background-color: var(--bg-card);
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:hover {
      background-color: var(--bg-primary);
    }

    .btn-primary {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .btn-primary:hover {
      background-color: var(--primary-hover);
    }

    .content-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 30px;
    }

    .container-width {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Card Styling */
    .q-card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-margin-top: 20px;
    }

    .q-card:hover {
      box-shadow: var(--shadow-hover);
    }

    .q-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px dashed var(--border-color);
      padding-bottom: 12px;
    }

    .q-id {
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--primary);
    }

    .badge {
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-listening {
      background-color: var(--badge-listening-bg);
      color: var(--badge-listening-text);
    }

    .badge-reading {
      background-color: var(--badge-reading-bg);
      color: var(--badge-reading-text);
    }

    .badge-dir {
      background-color: var(--badge-dir-bg);
      color: var(--badge-dir-text);
    }

    /* Split layout inside card body */
    .q-card-body {
      display: flex;
      gap: 24px;
      margin-top: 4px;
    }

    .q-card-left {
      flex: 1.3;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }

    .q-card-right {
      flex: 0.7;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 20px;
      min-width: 0;
    }

    .q-text {
      font-size: 1.05rem;
      line-height: 1.6;
      font-weight: 500;
    }

    /* Audio / Image Containers */
    .media-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 8px 0;
    }

    .audio-player {
      width: 100%;
      border-radius: 8px;
    }

    .question-image-wrapper {
      max-width: 100%;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      background-color: #f8fafc;
      align-self: flex-start;
      cursor: pointer;
    }

    .question-image-wrapper img {
      display: block;
      max-width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: contain;
    }

    /* Options List */
    .options-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .option-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    .option-item:hover {
      border-color: var(--primary);
      background-color: rgba(37, 99, 235, 0.03);
    }

    .option-item.selected {
      border-color: var(--primary);
      background-color: rgba(37, 99, 235, 0.08);
      font-weight: 600;
    }

    .option-item.correct-answer-option {
      border-color: #22c55e;
      background-color: rgba(34, 197, 94, 0.05);
      font-weight: 600;
    }

    .option-item.correct-answer-option::after {
      content: "✓ Kunci";
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: #22c55e;
      background-color: rgba(34, 197, 94, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }

    [data-theme="dark"] .option-item.correct-answer-option {
      background-color: rgba(34, 197, 94, 0.08);
      border-color: #4ade80;
    }

    [data-theme="dark"] .option-item.correct-answer-option::after {
      color: #4ade80;
      background-color: rgba(74, 222, 128, 0.15);
    }

    .option-radio {
      margin-right: 12px;
      width: 16px;
      height: 16px;
      accent-color: var(--primary);
    }

    /* Right column components */
    .right-section-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
      border-bottom: 1px dashed var(--border-color);
      padding-bottom: 6px;
    }

    .correct-answer-box {
      background-color: rgba(22, 101, 52, 0.08);
      border: 1px dashed #166534;
      border-radius: 8px;
      padding: 14px;
      color: #166534;
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    [data-theme="dark"] .correct-answer-box {
      background-color: rgba(34, 197, 94, 0.1);
      border-color: #22c55e;
      color: #4ade80;
    }

    .correct-badge {
      background-color: #166534;
      color: white;
      font-weight: 700;
      border-radius: 4px;
      padding: 3px 10px;
      font-size: 0.85rem;
    }

    [data-theme="dark"] .correct-badge {
      background-color: #22c55e;
      color: #0f172a;
    }

    .transcript-text {
      font-size: 0.925rem;
      line-height: 1.55;
      color: var(--text-main);
      white-space: pre-line;
      font-style: italic;
      background-color: var(--bg-card);
      padding: 12px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
    }

    /* Theme Switch Button */
    .theme-toggle svg {
      width: 20px;
      height: 20px;
    }

    /* Image Lightbox */
    .lightbox {
      position: fixed;
      inset: 0;
      background-color: rgba(0,0,0,0.85);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
      cursor: zoom-out;
    }

    .lightbox.active {
      display: flex;
    }

    .lightbox img {
      max-width: 90%;
      max-height: 90vh;
      border-radius: 8px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    /* Responsive details */
    @media (max-width: 992px) {
      .q-card-body {
        flex-direction: column;
      }
      .q-card-left, .q-card-right {
        flex: none;
        width: 100%;
      }
    }

    /* Print Styles */
    @media print {
      body {
        background-color: white !important;
        color: black !important;
        height: auto;
        overflow: visible;
      }
      .sidebar, .top-bar, .theme-toggle, .lightbox {
        display: none !important;
      }
      .main-layout {
        height: auto;
        overflow: visible;
      }
      .content-scroll {
        overflow: visible;
        padding: 0;
      }
      .container-width {
        max-width: 100%;
        gap: 30px;
      }
      .q-card {
        border: 1px solid #000 !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        padding: 15px;
      }
      .q-card-body {
        flex-direction: column;
        gap: 12px;
      }
      .q-card-left, .q-card-right {
        width: 100% !important;
        background-color: white !important;
        border-color: #000 !important;
        padding: 0 !important;
      }
      .option-item {
        background-color: white !important;
        border-color: #ccc !important;
      }
      .correct-answer-box {
        background-color: white !important;
        border-color: #000 !important;
        color: black !important;
      }
      .correct-badge {
        background-color: black !important;
        color: white !important;
      }
      .transcript-text {
        background-color: white !important;
        border-color: #ccc !important;
      }
    }
  </style>
</head>
<body>

  <!-- Sidebar: Navigator Soal -->
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>VIERA Questions Recap</h1>
      <p>Total Soal: <span id="total-count">0</span> | Navigator</p>
    </div>
    <div class="question-grid-container">
      <div class="section-title">Listening (1-50)</div>
      <div class="grid" id="listening-grid"></div>
      
      <div class="section-title">Reading (51-100)</div>
      <div class="grid" id="reading-grid"></div>
    </div>
  </div>

  <!-- Main Layout -->
  <div class="main-layout">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="search-box">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input type="text" id="search-input" placeholder="Cari soal atau kata kunci...">
      </div>
      <div class="controls">
        <select class="btn" id="filter-type">
          <option value="all">Semua Soal</option>
          <option value="listening">Listening</option>
          <option value="reading">Reading</option>
          <option value="direction">Direction</option>
        </select>
        <button class="btn" onclick="window.print()">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
          Print PDF
        </button>
        <button class="btn theme-toggle" id="theme-btn" title="Toggle Theme">
          <svg id="theme-icon-light" style="display:none;" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z"></path></svg>
          <svg id="theme-icon-dark" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
        </button>
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="content-scroll">
      <div class="container-width" id="questions-container">
        <!-- RENDERED DYNAMICALLY -->
      </div>
    </div>
  </div>

  <!-- Lightbox -->
  <div class="lightbox" id="lightbox">
    <img id="lightbox-img" src="" alt="Zoomed Image">
  </div>

  <!-- Javascript -->
  <script>
    const questionsData = {questions_json};
    const transcriptionsData = {transcriptions_json};
    
    // Correct answers mapping for Listening section (q1 to q50)
    const listeningCorrectAnswers = {
      "q1": "B",
      "q2": "A",
      "q3": "B",
      "q4": "B",
      "q5": "C",
      "q6": "C",
      "q7": "A",
      "q8": "C",
      "q9": "B",
      "q10": "C",
      "q11": "C",
      "q12": "B",
      "q13": "B",
      "q14": "B",
      "q15": "C",
      "q16": "B",
      "q17": "C",
      "q18": "C",
      "q19": "D",
      "q20": "B",
      "q21": "B",
      "q22": "A",
      "q23": "A",
      "q24": "C",
      "q25": "D",
      "q26": "A",
      "q27": "A",
      "q28": "B",
      "q29": "A",
      "q30": "C",
      "q31": "A",
      "q32": "A",
      "q33": "C",
      "q34": "B",
      "q35": "D",
      "q36": "A",
      "q37": "C",
      "q38": "C",
      "q39": "C",
      "q40": "A",
      "q41": "C",
      "q42": "C",
      "q43": "A",
      "q44": "B",
      "q45": "B",
      "q46": "D",
      "q47": "C",
      "q48": "A",
      "q49": "D",
      "q50": "B"
    };

    document.addEventListener("DOMContentLoaded", () => {
      const listeningGrid = document.getElementById("listening-grid");
      const readingGrid = document.getElementById("reading-grid");
      const questionsContainer = document.getElementById("questions-container");
      const searchInput = document.getElementById("search-input");
      const filterType = document.getElementById("filter-type");
      const themeBtn = document.getElementById("theme-btn");
      const totalCount = document.getElementById("total-count");
      
      let selectedAnswers = {};

      // Filter state
      let searchFilter = "";
      let typeFilter = "all";

      // Count non-direction questions
      const actualQuestionsCount = questionsData.filter(q => q.type !== 'direction').length;
      totalCount.textContent = actualQuestionsCount;

      // Populate navigation grid
      questionsData.forEach(q => {
        if (q.type === 'direction') return;
        
        const qNum = parseInt(q.id.replace(/[^\\d]/g, ''));
        const btn = document.createElement("a");
        btn.href = `#${q.id}`;
        btn.className = "grid-btn";
        btn.textContent = qNum;
        btn.title = `Soal ${qNum} (${q.type})`;
        
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const target = document.getElementById(q.id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // highlight the clicked button
            document.querySelectorAll(".grid-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
          }
        });

        if (qNum <= 50) {
          listeningGrid.appendChild(btn);
        } else {
          readingGrid.appendChild(btn);
        }
      });

      // Helper function to check if option starts with correct answer letter
      function isCorrectOption(opt, correctKey) {
        if (!correctKey) return false;
        const trimmed = opt.trim();
        return trimmed.startsWith(correctKey + ')') || trimmed.startsWith(correctKey + '. ') || trimmed === correctKey;
      }

      // Render Questions
      function renderQuestions() {
        questionsContainer.innerHTML = "";
        
        const filtered = questionsData.filter(q => {
          // Filter by type
          if (typeFilter !== 'all' && q.type !== typeFilter) return false;
          
          // Filter by search query
          if (searchFilter) {
            const searchLower = searchFilter.toLowerCase();
            const textMatch = q.question && q.question.toLowerCase().includes(searchLower);
            const idMatch = q.id && q.id.toLowerCase().includes(searchLower);
            const optionsMatch = q.options && q.options.some(opt => opt.toLowerCase().includes(searchLower));
            return textMatch || idMatch || optionsMatch;
          }
          
          return true;
        });

        if (filtered.length === 0) {
          questionsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
              Tidak ada soal yang cocok dengan pencarian Anda.
            </div>
          `;
          return;
        }

        filtered.forEach(q => {
          const card = document.createElement("div");
          card.className = "q-card";
          card.id = q.id;

          // Header
          const header = document.createElement("div");
          header.className = "q-card-header";
          
          const title = document.createElement("div");
          title.className = "q-id";
          title.textContent = q.type === 'direction' ? `Direction [${q.id.toUpperCase()}]` : `Question ${q.id.replace(/[^\\d]/g, '')}`;
          
          const badge = document.createElement("span");
          badge.className = `badge badge-${q.type}`;
          badge.textContent = q.type;

          header.appendChild(title);
          header.appendChild(badge);
          card.appendChild(header);

          // Card Body: two columns
          const cardBody = document.createElement("div");
          cardBody.className = "q-card-body";

          const cardLeft = document.createElement("div");
          cardLeft.className = "q-card-left";

          const qNum = parseInt(q.id.replace(/[^\\d]/g, ''));
          const isListening = q.type === 'listening' && qNum <= 50;

          if (!isListening) {
            cardLeft.style.flex = "1";
          }

          // Media (Image & Audio)
          const mediaContainer = document.createElement("div");
          mediaContainer.className = "media-container";

          // Use image or image_three_question_1
          const imgPath = q.image || q.image_three_question_1;
          if (imgPath) {
            const imgWrapper = document.createElement("div");
            imgWrapper.className = "question-image-wrapper";
            imgWrapper.innerHTML = `<img src="${imgPath}" alt="Soal ${q.id}" onerror="this.parentElement.style.display='none'">`;
            imgWrapper.addEventListener("click", () => showLightbox(imgPath));
            mediaContainer.appendChild(imgWrapper);
          }

          if (q.audio) {
            const audio = document.createElement("audio");
            audio.className = "audio-player";
            audio.src = q.audio;
            audio.controls = true;
            mediaContainer.appendChild(audio);
          }

          if (mediaContainer.children.length > 0) {
            cardLeft.appendChild(mediaContainer);
          }

          // Question Text
          if (q.question && q.question !== `${q.id.replace(/[^\\d]/g, '')}.`) {
            const text = document.createElement("div");
            text.className = "q-text";
            text.textContent = q.question;
            cardLeft.appendChild(text);
          }

          // Options List
          if (q.options && q.options.length > 0) {
            const optionsList = document.createElement("div");
            optionsList.className = "options-list";

            const correctKey = isListening ? listeningCorrectAnswers[q.id] : null;

            q.options.forEach((opt, idx) => {
              const item = document.createElement("div");
              item.className = "option-item";

              // Highlight correct answer
              if (correctKey && isCorrectOption(opt, correctKey)) {
                item.classList.add("correct-answer-option");
              }

              if (selectedAnswers[q.id] === opt) {
                item.classList.add("selected");
              }

              const radio = document.createElement("input");
              radio.type = "radio";
              radio.name = `radio-${q.id}`;
              radio.className = "option-radio";
              radio.checked = selectedAnswers[q.id] === opt;

              const label = document.createElement("span");
              label.textContent = opt;

              item.appendChild(radio);
              item.appendChild(label);

              item.addEventListener("click", () => {
                // Update selected answer
                selectedAnswers[q.id] = opt;
                // Update active sidebar state
                const gridBtn = document.querySelector(`.grid-btn[href="#${q.id}"]`);
                if (gridBtn) gridBtn.classList.add("visited");
                // Re-render only options of this card
                item.parentElement.querySelectorAll(".option-item").forEach(el => {
                  el.classList.remove("selected");
                  el.querySelector("input").checked = false;
                });
                item.classList.add("selected");
                radio.checked = true;
              });

              optionsList.appendChild(item);
            });

            cardLeft.appendChild(optionsList);
          }

          cardBody.appendChild(cardLeft);

          // Card Right: only for listening questions (correct answer & transcript)
          if (isListening) {
            const cardRight = document.createElement("div");
            cardRight.className = "q-card-right";

            // Correct Answer Title
            const answerTitle = document.createElement("div");
            answerTitle.className = "right-section-title";
            answerTitle.textContent = "Kunci Jawaban";
            cardRight.appendChild(answerTitle);

            // Correct Answer Value
            const correctKey = listeningCorrectAnswers[q.id];
            let correctText = "";
            if (q.options) {
              const found = q.options.find(opt => isCorrectOption(opt, correctKey));
              correctText = found ? found : `${correctKey})`;
            } else {
              correctText = `${correctKey})`;
            }

            const ansBox = document.createElement("div");
            ansBox.className = "correct-answer-box";
            ansBox.innerHTML = `<span class="correct-badge">${correctKey}</span> <span>${correctText}</span>`;
            cardRight.appendChild(ansBox);

            // Transcript Title
            const transTitle = document.createElement("div");
            transTitle.className = "right-section-title";
            transTitle.textContent = "Transkrip Audio";
            cardRight.appendChild(transTitle);

            // Transcript Text
            const transText = document.createElement("div");
            transText.className = "transcript-text";
            transText.textContent = transcriptionsData[q.id] || "Transkrip audio tidak tersedia.";
            cardRight.appendChild(transText);

            cardBody.appendChild(cardRight);
          }

          card.appendChild(cardBody);
          questionsContainer.appendChild(card);
        });
      }

      // Search & Filter Events
      searchInput.addEventListener("input", (e) => {
        searchFilter = e.target.value;
        renderQuestions();
      });

      filterType.addEventListener("change", (e) => {
        typeFilter = e.target.value;
        renderQuestions();
      });

      // Lightbox / Image Zoom
      const lightbox = document.getElementById("lightbox");
      const lightboxImg = document.getElementById("lightbox-img");

      function showLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add("active");
      }

      lightbox.addEventListener("click", () => {
        lightbox.classList.remove("active");
      });

      // Dark Mode Toggle
      themeBtn.addEventListener("click", () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (isDark) {
          document.documentElement.removeAttribute("data-theme");
          document.getElementById("theme-icon-light").style.display = "none";
          document.getElementById("theme-icon-dark").style.display = "block";
        } else {
          document.documentElement.setAttribute("data-theme", "dark");
          document.getElementById("theme-icon-light").style.display = "block";
          document.getElementById("theme-icon-dark").style.display = "none";
        }
      });

      // Initial Render
      renderQuestions();
    });
  </script>
</body>
</html>
"""
    
    # Replace placeholder tags with JSON serializations
    html_content = html_content.replace("{questions_json}", questions_json)
    html_content = html_content.replace("{transcriptions_json}", transcriptions_json)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    print(f"Success! Self-contained HTML recap file created at: {output_path}")

if __name__ == "__main__":
    generate_html()
