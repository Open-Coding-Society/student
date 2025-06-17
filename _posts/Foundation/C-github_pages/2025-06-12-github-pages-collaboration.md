---
toc: false
layout: post
data: web-dev
title: VSCode & Collaboration
description: Collaborate in real time using VSCode Live Share, pair programming techniques, and effective version control to work like professional dev teams.
categories: ['Web Development', 'Collaboration']
permalink: /web-dev/collaboration
breadcrumb: true
---


# Collaboration & Teamwork in Web Development


In real-world software development, working together is just as important as writing code. This guide covers key collaboration tools and workflows, especially **VSCode Live Share**, **Git-based teamwork**, and **pair programming**.


---


## VSCode Live Share


VSCode Live Share lets you collaborate in real time. You and your teammates can edit, debug, and even use the terminal together — all from your own devices.


### How to Use Live Share


1. **Install the Live Share extension** in VSCode.
2. Click the **Live Share** button in the bottom bar to start a session.
3. Share the invite link with your partner(s).
4. Teammates can join and collaborate in your coding environment.
5. Use shared terminal, servers, and debugging tools together.


Live Share is perfect for:
- Pair programming
- Mentoring or tutoring
- Remote debugging
- Collaborative review sessions


---


## Pair Programming Strategies


Pair programming is when two developers work together at one workstation — one codes ("driver"), and the other reviews and guides ("navigator").


### How to Do It


- One person writes code, the other watches, gives ideas, and catches bugs.
- After 10–15 minutes, **switch roles**.
- Keep communication active and respectful.
- Use **Live Share** so you can work from separate computers.


### When to Pair Program vs Split Tasks


#### Split Work By Features (Best for Teams of 3+)


- Divide features logically: e.g., one person works on login, another on leaderboard, a third on game logic.
- Use branches to avoid merge conflicts.
- Later, **merge and integrate** your parts.


#### Pair Program When…


- Working on tricky features
- Debugging something complex
- Reviewing code before a big push


---


## Git Collaboration Basics


Version control is your safety net for team coding.


### Git Concepts to Know


- **Branching**: Work independently without breaking main 
 [Git Branching Basics](https://www.atlassian.com/git/tutorials/using-branches) 


- **Pull requests**: Share and review changes before merging 
 [About Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests) 


- **Commit messages**: Make them clear and specific (`feat: add navbar`, `fix: login redirect`) 
 [Writing Good Commit Messages](https://chris.beams.io/posts/git-commit/) *(third-party guide widely recommended)* 


- **Conflict resolution**: Use VSCode’s merge tools and communicate often 
 [Resolving a merge conflict using the command line](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts) 


### Tools to Use


- **GitHub**: Push/pull, open issues, and assign tasks 
 [GitHub Docs - About GitHub](https://docs.github.com/en/get-started/quickstart/github-flow) 
- **Kanban Boards**: for task tracking 
 [GitHub Projects (Kanban)](https://docs.github.com/en/issues/organizing-your-work-with-project-boards)


---
## Collaborative Blog Post in about.md with VSCode Live Share


### Purpose 
Practice real-time collaboration by writing and styling a short blog post together about something you both have in common.


### How It Works


1. **Chat In Person First** 
Talk to your partner about something you both enjoy — a favorite sport, hobby, subject, or interest.


2. **Start a Live Share Session** 
One partner starts VSCode Live Share and shares the invite link.


3. **Open the `about.md` file together**


4. **Write Together** 
In the same file, write a short blog post (2-3 sentences) about the shared interest.


5. **Add a Picture** 
Include a relevant image in the `images/` folder and embed it with inline styles to adjust the size or layout.


6. **Add Fun Styles** 
Use inline CSS styles inside your markdown (e.g., colors, margins, borders) to make your post visually appealing.


7. **Switch Roles** 
One person can write content while the other styles, then swap.


8. **Review Your Work Together** 
Talk about what you added and how the styles improve the look.


---


### Example


```markdown
## Our Shared Passion: Basketball


Basketball is an exciting game we both love. It’s fast-paced and helps us stay active.


We enjoy playing and watching games, especially during the playoffs!
```


---


## To Do More: Add a Button


Want to take your page up a notch? Try adding a **button** that links to your resume, project, or favorite site!


Use this guide to help you: 
[How to Add Buttons]({{ site.baseurl }}/aesthetihawk-guide-buttons)
