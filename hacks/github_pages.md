---

layout: page
title: GitHub Pages
description: This page will teach you how to set up GitHub Pages on a browser version of Visual Studio Code (VSCode)
permalink: /tools/github/pages
menu: nav/tools_setup.html
toc: true
---

<h3>This page will teach you how to run GitHub Pages using the browser version of Visual Studio Code (VSCode)</h3>


<details style="border: 2px solid #003366; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> What is GitHub Pages?</summary>
  <div style="margin-top: 10px;">
    <p><strong>GitHub Pages</strong> is a free service provided by GitHub that allows you to host <em>static websites</em> directly from a GitHub repository. It’s perfect for project documentation, portfolios, and personal websites. Once your site is published, it can be accessed through a unique GitHub URL — no extra hosting setup required!</p>
    <img src="{{site.baseurl}}/images/github-pages.jpg" alt="GitHub Pages" style="width:50%; border-radius: 12px;"/>
  </div>
</details>

<details style="border: 2px solid #003366; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> What is Visual Studio Code?</summary>
  <div style="margin-top: 10px;">
    <p><strong>Visual Studio Code (VSCode)</strong> is a free, open-source code editor developed by Microsoft. It’s lightweight, highly customizable, and supports many programming languages. It includes powerful features like syntax highlighting, debugging tools, Git integration, and extensions.</p>
    <p>Even better: you can use VSCode <strong>in your browser</strong> by visiting <code>vscode.dev</code> — no installation required!</p>
    <img src="{{site.baseurl}}/images/vscodeimage.png" alt="VSCode" style="width:20%; border-radius: 12px;"/>
  </div>
</details>

<details style="border: 2px solid #003366; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> First Steps: Start Your Own Site</summary>
  <div style="margin-top: 10px;">
    <p>1. Click the link below to open the starter repository:  
      🔗 <a href="https://github.com/nighthawkcoders/portfolio_2025.git" target="_blank">Mr. Mortenson's Repository</a>
    </p>
    <p>2. On the GitHub page, click the green <strong>"Use this template"</strong> button.</p>
    <img src="{{site.baseurl}}/images/first_step.png" alt="Use Template Button" style="width:50%; border-radius: 12px;"/>
    <br>
    <p>3. Select <strong>“Create a new repository”</strong>.</p>
    <p>4. Give your new repository a name — follow Mr. Mortenson’s instructions for naming it.</p>
    <img src="{{site.baseurl}}/images/step_2.png" alt="New Repo Page" style="width:50%; border-radius: 12px;"/>
    
  </div>
</details>

<details style="border: 2px solid #003366; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> Next Steps: Edit Your Site in the Browser</summary>
  <div style="margin-top: 10px;">
    <p>Now that you've created your own copy of the site:</p>
    <ol>
      <li>Open a new browser tab.</li>
      <li>Type the following URL, <strong>and please remember to replace the placeholders:</strong></li>
    </ol>
    <pre><code>vscode.dev/github/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME</code></pre>
    <p> You can write and edit your HTML, CSS, and JavaScript files directly in your browser.</p>
    <p> Be sure to <strong>commit</strong> any changes you make so they appear on your live website.</p>
  </div>
</details>

<details style="border: 2px solid #003366; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> Publish with GitHub Pages</summary>
  <div style="margin-top: 10px;">
    <p>Once you’ve made changes to your site:</p>
    <ol>
      <li>Go to your repository on GitHub.</li>
      <li>Click <strong>Settings > Pages</strong>.</li>
      <li>Under <strong>Source</strong>, choose your main branch (e.g., <code>main</code> or <code>master</code>) and click <strong>Save</strong>.</li>
      <li>After a moment, your website will be live at(<strong>remember to change the link for your website!</strong>):</li>
    </ol>
    <pre><code>your_github_username.github.io/your_repository_name/</code></pre>
  </div>
</details>

<details style="border: 2px solid #003366; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> Summary</summary>
  <div style="margin-top: 10px;">
    <ul>
      <li>GitHub Pages hosts your static website — no server required.</li>
      <li>VSCode in the browser lets you code anytime, anywhere.</li>
      <li>All you need is a GitHub account and a browser — no installations!</li>
    </ul>
  </div>
</details>


<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f6f6fa;
      color: #222;
      margin: 0;
      padding: 24px;
    }
    .quiz-container {
      max-width: 600px;
      margin: 40px auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px #0001;
      padding: 32px;
      position: relative;
      overflow: hidden;
    }
    .flashcard {
      transition: all 0.5s ease;
      opacity: 1;
      transform: translateX(0);
    }
    .flashcard.fade-out {
      opacity: 0;
      transform: translateX(-100%);
    }
    h2 {
      color: #ffffff;
    }
    .question {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 20px;
      color: #222;
    }
    .options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .options button {
      width: 100%;
      background: #e6e8ff;
      border-radius: 6px;
      padding: 16px;
      border: 1px solid #ccc;
      color: #222;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
      box-sizing: border-box;
    }
    .options button:hover {
      background: #d1d5ff;
      transform: scale(1.03);
    }
    .score {
      font-size: 1.2em;
      margin-top: 24px;
      text-align: center;
    }
    .attempts-summary {
      margin-top: 20px;
      text-align: center;
    }
    .attempts-summary p {
      margin: 6px 0;
    }
    #nextBtn {
      display: none;
    }
    .points {
      margin-top: 16px;
      font-size: 1.1em;
      font-weight: bold;
      text-align: center;
      color: #2c2a5d;
    }
  </style>
</head>
<body>

<h2> Test your knowledge of Github Pages! <h2>

  <div class="quiz-container">
    <div id="flashcard" class="flashcard">
      <div class="question" id="question"></div>
      <div class="options" id="options"></div>
    </div>
    <div class="score" id="score"></div>
    <button id="nextBtn">Next</button>
    <div class="points" id="pointsDisplay">Points: 100</div>
    <button id="resetPointsBtn" style="margin-top: 10px;">Reset Points</button>
  </div>

  <script>
    const questions = [
      {
        q: "What is the primary use of GitHub Pages?",
        options: [
          "Hosting full-stack web applications",
          "Running JavaScript servers in the cloud",
          "Hosting static websites directly from a GitHub repository",
          "Managing GitHub repositories with extra memory"
        ],
        answer: 2
      },
      {
        q: "What makes the browser version of VSCode especially useful for students?",
        options: [
          "It automatically publishes your website",
          "It allows editing code directly in the browser without installing anything",
          "It adds hosting to your GitHub Pages project",
          "It only works with Node.js projects"
        ],
        answer: 1
      },
      {
        q: "Which of the following is a required step to publish your site with GitHub Pages?",
        options: [
          "Installing VSCode extensions",
          "Using a fork of the original repository",
          "Enabling GitHub Pages in the repository’s Settings tab",
          "Switching your repository to private mode"
        ],
        answer: 2
      },
      {
        q: "When using the browser version of VSCode, what is the correct format for opening your repo?",
        options: [
          "github.dev/username/repo",
          "vscode.github.io/username/repo",
          "github.vscode.com/repo-name",
          "vscode.dev/github/your_username/your_repository"
        ],
        answer: 3
      },
      {
        q: "After enabling GitHub Pages, where will your site be available?",
        options: [
          "github.com/pages/your_site",
          "your_github_username.github.io/your_repository_name/",
          "vscode.dev/your_site",
          "localhost:3000"
        ],
        answer: 1
      }
    ];

    const QUIZ_ID = "github_pages";

    let queue = [...questions];
    let stats = new Array(questions.length).fill(0);
    let currentIndex = 0;
    let totalAttempts = 0;

    const questionDiv = document.getElementById("question");
    const optionsDiv = document.getElementById("options");
    const scoreDiv = document.getElementById("score");
    const flashcardDiv = document.getElementById("flashcard");
    const nextBtn = document.getElementById("nextBtn");

    function renderFlashcard() {
      flashcardDiv.classList.remove("fade-out");
      const q = queue[0];
      currentIndex = questions.indexOf(q);
      stats[currentIndex]++;

      questionDiv.textContent = q.q;
      optionsDiv.innerHTML = "";
      q.options.forEach((option, i) => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.addEventListener("click", () => handleAnswer(i));
        optionsDiv.appendChild(btn);
      });
    }

    // Global point tracking
    const POINTS_KEY = 'global_quiz_points';
    const pointsDisplay = document.getElementById("pointsDisplay");
    const resetPointsBtn = document.getElementById("resetPointsBtn");

    // Initialize or retrieve points
    function initializePoints() {
      if (!localStorage.getItem(POINTS_KEY)) {
        localStorage.setItem(POINTS_KEY, '100');
      }
      updatePointsDisplay();
    }

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

    resetPointsBtn.addEventListener("click", () => {
      const quizzes = ["github_workflow", "github_pages", "accounts"];
      const incomplete = quizzes.filter(q => localStorage.getItem(`quiz_done_${q}`) !== "true");

      if (incomplete.length > 0) {
        alert(`Please complete the following quiz(es) before resetting your points:\n- ${incomplete.join("\n- ")}`);
        return;
      }

      // Reset points
      setPoints(100);
      alert("Points successfully reset to 100!");

      // Reset completion status for all quizzes
      quizzes.forEach(q => {
        localStorage.setItem(`quiz_done_${q}`, "false");
      });
    });

    function handleAnswer(selected) {
      const correct = queue[0].answer;
      const wasCorrect = selected === correct;
      totalAttempts++;

      flashcardDiv.classList.add("fade-out");
      setTimeout(() => {
        if (!wasCorrect) queue.push(queue[0]);
        queue.shift();

        if (queue.length > 0) {
          renderFlashcard();
        } else {
          showResults();
        }
      }, 500);
    }

    function showResults() {
      questionDiv.style.display = "none";
      optionsDiv.style.display = "none";
      nextBtn.style.display = "none";
      flashcardDiv.style.display = "none";

      const incorrectAttempts = totalAttempts - questions.length;
      const currentPoints = getPoints();
      const newPoints = Math.max(0, currentPoints - incorrectAttempts);
      setPoints(newPoints);

      let resultHTML = `
        <div style="background:#808080;padding:24px;border-radius:10px;">
          <h2 style="color:#2c2a5d;">Quiz Complete!</h2>
          <p style="font-size:1.1em;">You completed the flashcards in <strong>${totalAttempts}</strong> attempts.</ p>
          <p style="font-size:1.1em;color:#2c2a5d;">You lost <strong>${incorrectAttempts}</strong> point(s).</p>
          <p style="font-size:1.2em;color:#2c2a5d;"><strong>Current Points: ${newPoints}</strong></p>
          <div class="attempts-summary">
      `;
      questions.forEach((q, i) => {
        resultHTML += `<p><strong>Q${i + 1}</strong> attempted <strong>${stats[i]}</strong> time(s)</p>`;
      });
      resultHTML += "</div></div>";

      scoreDiv.innerHTML = resultHTML;
      localStorage.setItem(`quiz_done_${QUIZ_ID}`, "true");

    }
    
    initializePoints();
    renderFlashcard();
  </script>

<details style="border: 2px solid #006600; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> 🧠 Test Your Knowledge</summary>
  <div style="margin-top: 10px;">
    <p>Ready to check your understanding?</p>
    <a href="{{site.baseurl}}/githubquiz_2/" style="background-color: #006600; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-weight: bold;">
      Take the Quiz
    </a>
  </div>
</details>

