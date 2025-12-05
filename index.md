---
layout: post 
title: Portfolio Home 
hide: true
show_reading_time: false
---

Hi! My name is [Your Full Name]

Welcome to My App

<div class="login-section">
    <input type="text" id="uid" placeholder="Username">
    <input type="password" id="password" placeholder="Password">
    <button id="loginBtn">Login</button>
    <div id="result"></div>
</div>

<script>
document.getElementById('loginBtn').addEventListener('click', async () => {
    const uid = document.getElementById('uid').value;
    const password = document.getElementById('password').value;
    
    const result = await login(uid, password);
    document.getElementById('result').textContent = JSON.stringify(result, null, 2);
});
</script>


### Development Environment

> Coding starts with tools, explore these tools and procedures with a click.

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
    <a href="https://github.com/Open-Coding-Society/student">
        <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
    <a href="https://open-coding-society.github.io/student">
        <img src="https://img.shields.io/badge/GitHub%20Pages-327FC7?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages">
    </a>
    <a href="https://kasm.opencodingsociety.com/">
        <img src="https://img.shields.io/badge/KASM-0078D4?style=for-the-badge&logo=kasm&logoColor=white" alt="KASM">
    </a>
    <a href="https://vscode.dev/">
        <img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="VSCode">
    </a>
</div>

<br>

### Class Progress

> Here is my progress through coding, click to see these online

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
    <a href="{{site.baseurl}}/snake" style="text-decoration: none;">
        <div style="background-color: #00FF00; color: black; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Snake Game
        </div>
    </a>
    <a href="{{site.baseurl}}/turtle" style="text-decoration: none;">
        <div style="background-color: #FF0000; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Turtle
        </div>
    </a>
</div>

<br>

<!-- Contact Section -->
### Get in Touch

> Feel free to reach out if you'd like to collaborate or learn more about our work.

<p style="color: #2A7DB1;">Open Coding Society: <a href="https://opencodingsociety.com" style="color: #2A7DB1; text-decoration: underline;">Socials</a></p>


<!-- Game Container -->
<div id="game-container"></div>

<!-- Load Game Scripts -->
<script type="module" src="{{site.baseurl}}/assets/js/DBS2/GameControl.js"></script>
<script type="module" src="{{site.baseurl}}/assets/js/DBS2/GameEnv.js"></script>
<script type="module" src="{{site.baseurl}}/assets/js/DBS2/Player.js"></script>
<!-- Add other necessary game files -->
```

**Key things to note:**
1. Use `{{site.baseurl}}` before your paths - this is crucial for GitHub Pages deployment
2. Use `type="module"` if your JS files use ES6 imports/exports
3. Make sure your main game initialization script is loaded last

**Questions to help me give you the exact fix:**

1. **Which file initializes your game?** Is it `GameControl.js`?
2. **Do your JS files use `import`/`export` statements?** (ES6 modules)
3. **Where in the page should the game appear?** Should it replace the login form or appear below it?
4. **What's your GitHub Pages URL?** (so I can see the actual deployment)

Can you also check your browser console and tell me the **full path** of the 404 error? It will look something like:
```
Failed to load resource: https://yourusername.github.io/yourrepo/some/path/file.js 