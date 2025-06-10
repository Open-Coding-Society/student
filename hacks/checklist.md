---
layout: page
title: Checklist
permalink: /checklist/
author: Kush Kharia, Nikith Muralikrishnan
---

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Checklist Feature</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 700px;
      margin: 2rem auto;
      background: #f0f4f8;
      color: #333;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
    }
    h1 {
      text-align: center;
      color: #0a64a0;
      margin-bottom: 1.5rem;
    }
    .page-section {
      background: #fff;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      padding: 1rem 1.5rem;
      box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
    }
    .page-section h2 {
      border-bottom: 2px solid #0a64a0;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
      color: #0a64a0;
    }
    ul.checklist {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }
    ul.checklist li {
      margin-bottom: 0.8rem;
      display: flex;
      align-items: center;
    }
    ul.checklist li label {
      cursor: pointer;
      flex-grow: 1;
      user-select: none;
      font-weight: 600;
      font-size: 1.05rem;
      color: #333;
      transition: color 0.3s;
    }
    ul.checklist li input[type="checkbox"] {
      margin-right: 1rem;
      width: 20px;
      height: 20px;
      cursor: pointer;
    }
    ul.checklist li input[type="checkbox"]:checked + label {
      color: #0a64a0;
      text-decoration: line-through;
      opacity: 0.7;
    }
    #message {
      margin-top: 1rem;
      text-align: center;
      font-weight: 600;
      color: #0a64a0;
    }
    button#saveBtn {
      background-color: #0a64a0;
      border: none;
      padding: 0.6rem 1.2rem;
      color: white;
      font-weight: 700;
      font-size: 1rem;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 1rem;
      display: block;
      margin-left: auto;
      margin-right: auto;
      box-shadow: 0 3px 7px rgb(0 100 160 / 0.4);
      transition: background-color 0.3s;
    }
    button#saveBtn:hover {
      background-color: #074a75;
    }
  </style>
</head>
<body>
  <h1>My Checklist Progress</h1>

  <div id="checklistContainer"></div>

  <button id="saveBtn">Save Progress</button>
  <div id="message"></div>

  <script>
    const API_BASE = 'http://localhost:8587/api/checklist';
    const user = 'student1'; // fixed user for now, can make dynamic later

    // Checklist items split by page, 4 items each (20 total)
    const checklistItems = {
      "Page 1: Privacy & PII": [
        "Create an email account, speperate for school, junk, and important info",
        "Create GitHub account, not with school email",
        "Create Slack account for class-only communication",
        "Create Portfolio 2026 account"
      ],
      "Page 2: GitHub Pages": [
        "Create a new repository from the GitHub template",
        "Open your repository in the browser",
        "Commit your changes and publish your site by enabling GitHub Pages under Settings > Pages",
        "Create a new branch, make a change, open a pull request, and merge it into the main branch"
      ],
      "Page 3: GitHub Workflow Guide": [
        "Create and publish a personal portfolio repository using GitHub Pages",
        "Fork a class repository, make a feature branch, and submit a pull request",
        "Collaborate on a team project using branches, GitHub issues, and PR reviews",
        "Follow GitHub best practices by using meaningful commits"
      ],
      "Page 4: OS and Developer Tools Setup": [
        "Use mkdir, cd, and git clone in terminal to set up project folders",
        "Run your OS-specific activate.sh script to install tools",
        "Restart terminal and verify tool versions: Ruby, Python, Bundler, Jupyter",
        "On MacOS, fix Python/Jupyter paths using the correct ln -sF commands"
      ],
      "Page 5: VS Code Setup": [
        "Set Git email and username with git config",
        "Clone repo, activate virtual environment, and install packages",
        "Use make commands to run and test the local server",
        "Push changes to GitHub Pages"
      ]
    };

    // This will hold user's current progress status
    let progress = {};

    // Helper: Create checklist UI from progress object
    function renderChecklist() {
      const container = document.getElementById('checklistContainer');
      container.innerHTML = ''; // Clear previous

      for (const [pageTitle, items] of Object.entries(checklistItems)) {
        const section = document.createElement('section');
        section.classList.add('page-section');

        const title = document.createElement('h2');
        title.textContent = pageTitle;
        section.appendChild(title);

        const ul = document.createElement('ul');
        ul.classList.add('checklist');

        items.forEach(item => {
          const li = document.createElement('li');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = encodeURIComponent(item);
          checkbox.checked = !!progress[item];

          checkbox.addEventListener('change', () => {
            progress[item] = checkbox.checked;
          });

          const label = document.createElement('label');
          label.htmlFor = checkbox.id;
          label.textContent = item;

          li.appendChild(checkbox);
          li.appendChild(label);
          ul.appendChild(li);
        });

        section.appendChild(ul);
        container.appendChild(section);
      }
    }

    // Fetch checklist for user (GET)
    async function fetchChecklist() {
      try {
        const res = await fetch(`${API_BASE}?user=${encodeURIComponent(user)}`);
        if (!res.ok) {
          throw new Error(`GET failed with status ${res.status}`);
        }
        const data = await res.json();
        return data.progress;
      } catch (err) {
        console.warn("Checklist GET failed:", err.message);
        return null;
      }
    }

    // Create checklist for user (POST)
    async function createChecklist() {
      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({user, progress})
        });
        if (!res.ok) {
          throw new Error(`POST failed with status ${res.status}`);
        }
        const data = await res.json();
        return data.progress;
      } catch (err) {
        console.error("Checklist POST failed:", err.message);
        return null;
      }
    }

    // Update checklist for user (PUT)
    async function updateChecklist() {
      try {
        const res = await fetch(API_BASE, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({user, progress})
        });
        if (!res.ok) {
          throw new Error(`PUT failed with status ${res.status}`);
        }
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Checklist PUT failed:", err.message);
        return null;
      }
    }

    // Initialize: try fetching, create if missing
    async function init() {
      let fetchedProgress = await fetchChecklist();
      if (!fetchedProgress) {
        // initialize all items to false
        progress = {};
        for (const items of Object.values(checklistItems)) {
          items.forEach(item => {
            progress[item] = false;
          });
        }
        console.log("Creating new checklist for user...");
        const createdProgress = await createChecklist();
        if (createdProgress) {
          progress = createdProgress;
        } else {
          document.getElementById('message').textContent = "Error creating checklist.";
          return;
        }
      } else {
        progress = fetchedProgress;
      }
      renderChecklist();
    }

    // Save button event
    document.getElementById('saveBtn').addEventListener('click', async () => {
      const result = await updateChecklist();
      const msgDiv = document.getElementById('message');
      if (result) {
        msgDiv.textContent = "Progress saved!";
        setTimeout(() => msgDiv.textContent = '', 3000);
      } else {
        msgDiv.textContent = "Failed to save progress.";
      }
    });

    window.onload = init;
  </script>
</body>
</html>