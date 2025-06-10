---
layout: page
title: Github Workflow
description: This guide introduces the main ways you'll use GitHub in your coursework — whether working alone, contributing to shared code, or collaborating in teams.
permalink: /tools/github/workflow
menu: nav/tools_setup.html
toc: true
search_exclude: false
---

## Reference Repository

**Purpose:**  
To study and test code without making changes to the original repository.

**Typical Actions:**
- Clone the repository to your local machine  
- Explore code and structure  
- Run or test locally if needed  
- No contributions or pull requests allowed

**Example Use Case:**  
Cloning the `pages` repository to follow class lessons without modifying it.

---

## Owner / Collaborator Repository

> **Full control over your own project or shared team repo**

**Purpose:**  
To create and maintain your own project or collaborate directly with a team.

**Typical Actions:**
- Create your repository (often from a template)
- Edit, push, and merge branches
- Use GitHub Pages or GitHub Actions for deployment
- Manage issues and pull requests (if collaborating)

**Example Use Case:**  
Building your personal portfolio site using a student template.

---

## Fork → Branch → Pull Request

> **Contribute to someone else’s project (like lessons or shared resources)**

**Purpose:**  
To make contributions to repositories you don’t own via a pull request.

**Typical Actions:**
1. Fork the target repository to your account  
2. Create a new branch for your changes  
3. Make and commit your edits  
4. Open a pull request for review  
5. Await merge by the repo owner

**Example Use Case:**  
Updating a lesson file in `pages` and submitting a pull request for review.

---

## Team Project (Two Collaboration Models)

> **Work with a group to build a shared project**

**Option 1: All Are Collaborators**
- Everyone works in one shared repository
- Direct access to push and merge code

**Option 2: Scrum Master + Contributors**
- One student (Scrum Master) owns the main repo
- Others fork, create branches, and submit pull requests
- Scrum Master reviews and merges contributions

**Scrum Master's Role:**
- Set up the repo (from template like `starter_flask`)
- Merge pull requests
- Manage issues and project settings
- Deploy project via GitHub Actions

**Contributors' Role:**
- Fork the main repo
- Develop on feature branches
- Submit pull requests for review

**Example Use Case:**  
A team project where Emma manages the main repo and other members contribute features like login or homepage through PRs.

---

## Use Case Comparison

| Scenario            | You Use...         | Your Role       | Workflow               | Deployment            |
|---------------------|--------------------|------------------|-------------------------|------------------------|
| Personal Portfolio  | Your own repo      | Owner            | Direct edit & publish   | GitHub Pages           |
| Class Lessons       | `pages`            | Contributor      | Fork → PR               | Instructor-controlled  |
| Solo Project        | `starter_flask`    | Owner            | Clone → Push            | GitHub Pages / API     |
| Team Project        | `starter_flask`    | Scrum / Member   | Fork or Direct PR       | GitHub Actions         |
| Code Reference Only | `pages`            | Reader           | Clone only              | Local testing only     |

---

## Best Practices

**✅ Use branches for all new work**
- Never work directly on `main`
- Create branches like `feature/navbar` or `fix/footer-bug`

**✅ Write clear, specific commit messages**
- Describe what you did and why
- Good: `Add user authentication and route protection`
- Bad: `stuff done`

**✅ Pull before you push**
- Always run `git pull origin main` before pushing
- Prevents merge conflicts

**✅ Submit small, focused pull requests**
- One feature or fix per PR
- Easier to review and manage

**✅ Use GitHub tools for coordination**
- Issues: Track bugs or features
- Kanban boards: Organize your sprint tasks
- Pull Requests: Share code for review and discussion

---

Need more help? Visit the class repo, join a discussion thread, or ask a teammate — real collaboration starts here.

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
    q: "You want to contribute a bug fix to a repository you do not have direct access to. What is the most appropriate GitHub workflow to follow?",
    options: [
      "Clone the repository, make changes on main, and push directly",
      "Fork the repository, edit on main, and request a merge via PR",
      "Fork the repository, create a feature branch, make changes, and submit a pull request",
      "Request write access and push directly to the upstream repository"
    ],
    answer: 2
  },
  {
    q: "In a team project using the Scrum Master + Contributors model, who is responsible for merging new code into the main repository?",
    options: [
      "Each contributor, after testing their feature",
      "The person who writes the most code",
      "All team members equally",
      "The Scrum Master, after reviewing submitted pull requests"
    ],
    answer: 3
  },
  {
    q: "Which of the following actions is least aligned with GitHub best practices for collaborative development?",
    options: [
      "Committing directly to main to speed up delivery",
      "Creating a feature/payment-gateway branch before starting a new feature",
      "Writing commit messages like 'Fix auth redirect logic'",
      "Pulling the latest changes from main before pushing your branch"
    ],
    answer: 0
  },
  {
    q: "Why might a student choose to clone the pages repository rather than fork it?",
    options: [
      "They want to contribute to the class curriculum",
      "They want to deploy it using GitHub Pages",
      "They want to explore or run the code locally without making contributions",
      "They need to take ownership of the repository and manage pull requests"
    ],
    answer: 2
  },
  {
    q: "Which workflow is best for managing a team project where members work on separate features and merge changes into one repository?",
    options: [
      "Everyone edits directly on the main branch to avoid confusion",
      "Each contributor uses a fork, works on feature branches, and submits pull requests to the main repo",
      "Assign only one developer to write code while others review",
      "Each member clones the repo and uploads changes via email"
    ],
    answer: 1
  }
];

    const QUIZ_ID = "github_workflow";

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
