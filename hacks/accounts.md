---
toc: false
comments: true
layout: post
title: Accounts
description: This class will require you to make a Portfolio 2026 Web Site, a GitHub Account, a Slack Account, and as part of final exam will require you update your LinkedIn account.
author: Kush Kharia
dcategories: [DevOps]
permalink: /tools/accounts
---

## What Is PII?

**PII (Personal Identifiable Information)** is any detail that can identify you—like your name, address, or account info.

In this course, you may share or work with PII. Let’s make sure it’s handled wisely.

---

<div style="display: flex; align-items: flex-start; gap: 24px; margin-top: 20px;">

  <img src="{{site.baseurl}}/images/accounts.png" alt="PII graphic" style="width:50%; max-width:400px; border-radius: 12px;"/>


<div id="pii-container"></div>

<script>
  const piiData = {
    Public: [
      "Name, Email, Photo",
      "Schools, City, Property",
      "Credit Reports, Router Info"
    ],
    Sensitive: [
      "Birthdate, Address, Phone",
      "Place of Birth, Maiden Names",
      "Driver’s License"
    ],
    Private: [
      "Social Security Number",
      "Login Credentials",
      "Two-Factor Sources"
    ]
  };

  const container = document.getElementById("pii-container");
  const heading = document.createElement("h3");
  heading.textContent = "Know Your PII";
  container.appendChild(heading);

  Object.entries(piiData).forEach(([category, items]) => {
    const button = document.createElement("button");
    button.textContent = `▶ ${category}`;
    button.style.margin = "10px 0";
    button.style.padding = "8px 14px";
    button.style.border = "none";
    button.style.borderRadius = "8px";
    button.style.backgroundColor = "#2c2a5d";  // dark blue/purple
    button.style.color = "white";
    button.style.fontSize = "16px";
    button.style.cursor = "pointer";
    button.style.transition = "background-color 0.3s";

    button.onmouseover = () => button.style.backgroundColor = "#3a3770";
    button.onmouseout = () => button.style.backgroundColor = "#2c2a5d";

    const list = document.createElement("ul");
    list.style.display = "none";
    list.style.margin = "8px 0 16px 20px";

    items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.style.padding = "4px 0";
      list.appendChild(li);
    });

    button.addEventListener("click", () => {
      list.style.display = list.style.display === "none" ? "block" : "none";
    });

    container.appendChild(button);
    container.appendChild(list);
  });
</script>

</div>

<div style="display: flex; align-items: flex-start; gap: 24px; margin-top: 12px;">

  <img src="{{site.baseurl}}/images/mfa.jpg" alt="Multi-Factor-Authentication" style="width:50%; min-width:120px; border-radius: 12px;" title='This is an Multi-Factor-Authentication'/>

  <div>
    <strong>Protect Your Information</strong>
    <ul>
      <li>Use <strong>Multi-Factor Authentication (MFA)</strong></li>
      <li>Create <strong>strong, unique passwords</strong></li>
      <li>Keep your <strong>software updated</strong></li>
      <li><strong>Encrypt</strong> data and backups</li>
      <li>Secure your <strong>Wi-Fi and router</strong></li>
      <li>Use <strong>biometrics</strong> where possible</li>
    </ul>
  </div>

</div>

---

### Online Risks

- **Phishing & malware** try to steal your data
- **Social engineering** tricks you into revealing info
- **Respond quickly** if compromised: update passwords and review your security

---

# Nighthawk Coders Accounts

In this lesson, you'll create several accounts and provide a public-facing name and email for some of them.

<div style="display: flex; align-items: flex-start; gap: 32px; margin-top: 16px;">

  <div>
    <h3><u style="color:white">Email Accounts</u></h3>
    Used for communication with your teacher and classmates.<br>
     Tip: Use different emails for junk, school, and important info.
    <h3><u style="color:white">Github Account</u></h3>
    Create a public-facing account for coding.<br>
     Use a junk/common email, not your school email.
    <h3><u style="color:white">GitHub Pages</u></h3>
    Build a public portfolio site.<br>
     It will be Google-indexed and viewable by anyone.
    <h3><u style="color:white">Slack Account</u></h3>
    Class-only communication tool.<br>
     Use a junk/common email. PII is limited to classmates and teacher.
    <h3><u style="color:white">Portfolio 2026 Account</u></h3>
    Tied to your GitHub ID.<br>
     Used for course tools, services, and analytics.
  </div>

  <img src="{{site.baseurl}}/images/12we.png" alt="Account Types" style="width:600px; border-radius: 12px;"/>
</div>

## PII Strategy on Account Creation

It is in the your interest that you establish and continually refine your PII (Personal Identifiable Information) strategy. It is likely that you are already active in sharing common PII, considering for yourself what is OK to share. As you progress in the digital world, you will likely need to adapt.

### Key Points to Consider:

1. **Categorize Information**: 
   - **Public Information**: Information you are comfortable sharing publicly, such as your name and general interests.

     <img src="{{site.baseurl}}/images/information.jpg" alt="Multi-Factor-Authentication" style="width:25%; min-width:120px; border-radius: 12px;"/>

   - **Sensitive Information**: Information that should be shared cautiously, such as your full birth date and phone number.
        <img src="{{site.baseurl}}/images/something.png" alt="Multi-Factor-Authentication" style="width:50%; min-width:120px; border-radius: 24px;"/>

   - **Highly Confidential Information**: Information that should be kept strictly private, like social security number and internet access credentials.

        <img src="{{site.baseurl}}/images/confidential.jpeg" alt="Multi-Factor-Authentication" style="width:40%; min-width:120px; border-radius: 12px;"/>


2. **Use Different Email Accounts**: 
   - Maintain different email accounts for different purposes (e.g., junk email, common email, work/school email, important email). This helps manage the type and volume of information you receive and sets expectations for the importance of the information.

3. **Be Prepared for Security Incidents**: 
   - Anticipate that you may be hacked and will need to secure any vulnerabilities. Regularly update your passwords and use multi-factor authentication where possible.

4. **Adapt and Evolve**: 
   - As you gain more experience and your digital footprint grows, continually reassess and adapt your PII strategy to ensure it remains effective.

### Parting Advice:

Be cautious with the information you share online. Protect your personal data by using separate email accounts, staying aware of security risks, and adapting your practices as the digital world evolves. Taking steps now helps safeguard your digital identity in the future.


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

<h2> Test your knowledge of Github Pages!</h2>

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
        q: "Which of the following is the best example of Highly Confidential Information?",
        options: [
          "Your address",
          "Your full birth date",
          "Your Wi-Fi password",
          "Your city of residence"
        ],
        answer: 2
      },
      {
        q: "Why is it recommended to use different email accounts for different purposes?",
        options: [
          "To make it easier to remember passwords",
          "To separate types of information and reduce risk if one account is compromised",
          "Because email providers require it",
          "To avoid receiving any spam"
        ],
        answer: 1
      },
      {
        q: "Which of these is NOT a good security practice?",
        options: [
          "Enabling multi-factor authentication",
          "Using the same password for all accounts",
          "Regularly updating your software",
          "Using a password manager"
        ],
        answer: 1
      },
      {
        q: "If you receive an unexpected email asking for your login credentials, what should you do?",
        options: [
          "Reply with your credentials to be helpful",
          "Click any links to see where they go",
          "Ignore or report the email as phishing",
          "Report it to the proper authorities"
        ],
        answer: 2
      },
      {
        q: "Which of the following is considered Sensitive (but not Highly Confidential) Information?",
        options: [
          "Your birth year",
          "Your street address",
          "Your GitHub profile picture",
          "Your public portfolio link"
        ],
        answer: 1
      }
    ];

    const QUIZ_ID = "accounts";

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
      localStorage.setItem(`quiz_done_${QUIZ_ID}`, "true")
    }
    
    initializePoints();
    renderFlashcard();
  </script>


<details style="border: 2px solid #006600; border-radius: 12px; padding: 10px; margin-bottom: 16px; box-shadow: 2px 2px 10px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1.1rem;">
  <summary style="font-weight: bold; cursor: pointer;"> 🧠 Test Your Knowledge</summary>
  <div style="margin-top: 10px;">
    <p>Ready to check your understanding?</p>
    <a href="{{site.baseurl}}/piiquiz/" style="background-color: #006600; color: white; padding: 10px 15px; border-radius: 8px; text-decoration: none; font-weight: bold;">
      Take the Quiz
    </a>
  </div>

</details>
