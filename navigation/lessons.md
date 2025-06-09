---
layout: page
title: Lessons
permalink: /tools/lessons
toc: true
---

<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background:rgb(0, 0, 0);
      margin: 0;
      padding: 0;
    }
    .directory-container {
  /* Center this container instead */
      margin: 40px auto;
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 90vw;
    }
    h1 {
      color: #ffffff;
      margin-bottom: 24px;
    }
    .button {
      display: block;
      width: 100%;
      margin: 12px 0;
      background:rgb(202, 202, 202);         /* light gray */
      border-radius: 6px;
      padding: 16px;
      border: 1px solid #ccc;
      color: #222;                 /* black text */
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
      box-sizing: border-box;
      text-align: center;
      text-decoration: none;
    }
    .button:hover {
      background: rgb(164, 162, 162);
      transform: scale(1.03);
    }
    .points-section {
      margin-top: 30px;
      background: rgb(50, 44, 44);
      padding: 10px;
      border-radius: 8px;
      font-size: 18px;        /* Larger font for points */
      color: #333;
    }
    #pointsDisplay {
      font-size: 18px;        /* Match .points-section font size */
      margin-bottom: 8px;
    }
    #resetPointsBtn {
      margin-top: 10px;
      background: #888;
      font-size: 14px;        
      padding: 8px 0;         /* Half the .button padding */
      width: 50%;
      border-radius: 6px;
      color: #fff;
      border: none;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    #resetPointsBtn:hover {
      background: #555;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
    }
    .score-container {
      background-color: #ffffff;
      color: #333;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    #submitScoreBtn {
      background-color: #007BFF;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    #submitScoreBtn:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="directory-container">
    <a href="{{ site.baseurl }}/tools/github/workflow" class="button">GitHub Workflow</a>
    <a href="{{ site.baseurl }}/tools/github/pages" class="button">GitHub Pages</a>
    <a href="{{ site.baseurl }}/tools/accounts" class="button">Accounts</a>
    <div class="points-section">
      <div id="pointsDisplay">Current Points: 100</div>
      <button id="resetPointsBtn">Save & Reset</button>
    </div>

<div class="footer">
  Complete all lessons and lose the least amount of points!
</div>

<script type="module">
  import { pythonURI, fetchOptions } from '{{ site.baseurl }}/assets/js/api/config.js';

  const POINTS_KEY = 'global_quiz_points';
  const QUIZ_KEYS = ['quiz_done_github_workflow', 'quiz_done_github_pages', 'quiz_done_accounts'];
  const pointsDisplay = document.getElementById("pointsDisplay");
  const saveResetBtn = document.getElementById("resetPointsBtn");
  const totalScore = parseInt(localStorage.getItem(POINTS_KEY) || '100', 10);
  const sectionId = 1;

  function getPoints() {
    return parseInt(localStorage.getItem(POINTS_KEY) || '100', 10);
  }

  function setPoints(value) {
    localStorage.setItem(POINTS_KEY, value.toString());
    updatePointsDisplay();
  }

  function updatePointsDisplay() {
    pointsDisplay.textContent = `Points: ${getPoints()}`;
  }

  async function saveAndReset() {

    const totalScore = parseInt(localStorage.getItem(POINTS_KEY) || '100');
    const sectionId = 1;

    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("You must be logged in to submit your score.");
            return;
    }

    const incomplete = QUIZ_KEYS.filter(key => localStorage.getItem(key) !== 'true');
    if (incomplete.length > 0) {
      alert(`You must complete all quizzes before saving and resetting.\nQuizzes remaining: ${incomplete.length}`);
      return;
    }

    try {
        const response = await fetch(`${pythonURI}/api/scores`, {
            ...fetchOptions,
            method: "POST",
            headers: {
                ...fetchOptions.headers,
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                value: totalScore,
                section_id: sectionId
            })
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || `Error: ${response.status}`);
        }

      setPoints(100);
      QUIZ_KEYS.forEach(key => localStorage.setItem(key, 'false'));
      alert("Score saved and points reset successfully!");
    } catch (error) {
      console.error("Failed to submit score:", error.message || error);
      alert("Failed to submit score: " + error.message);
    }
  }

  saveResetBtn.addEventListener("click", saveAndReset);
  updatePointsDisplay();
</script>

