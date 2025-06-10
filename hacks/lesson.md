---
layout: lesson
title: Loops and Iteration
video_url: "https://www.youtube.com/watch?v=94UHCEmprCY"
hack_prompt: "What is the difference between a while loop and a for loop?"
permalink: /loops
toc: true
---

<div id="lesson-content">
  <p>Loops let you run a block of code over and over again. This is called <strong>iteration</strong>. Instead of copying and pasting code 10 times, loops do the repeating for you.</p>

  <h2>Why Use Loops?</h2>
  <ul>
    <li><strong>Efficiency:</strong> Save time by repeating code automatically.</li>
    <li><strong>Automation:</strong> Useful for lists, counting, checking input, and more.</li>
    <li><strong>Cleaner Code:</strong> Fewer lines, better structure.</li>
  </ul>

  <p>Let’s start by watching a short video to understand how loops work in programming.</p>
  {% include video.html %}

  <br><br><br><br>

  <p>Follow along as your teacher draws examples on the <strong>live whiteboard</strong> to reinforce what you learned.</p>
  {% include whiteboard.html %}

  <br><br><br><br>

  <h2>The <code>for</code> Loop</h2>
  <p><code>for</code> loops are great when you know how many times something should run. It repeats a fixed number of times.</p>
  <pre><code>for i in range(5):
    print(i)</code></pre>
  <p>This prints: <code>0 1 2 3 4</code></p>

  <h2>The <code>while</code> Loop</h2>
  <p><code>while</code> loops run as long as a condition is true. It’s useful when you don’t know how many times the loop needs to run.</p>
  <pre><code>x = 0
while x < 5:
    print(x)
    x += 1</code></pre>
  <p>This also prints: <code>0 1 2 3 4</code></p>

  <h2>Comparing <code>for</code> and <code>while</code></h2>
  <ul>
    <li><strong>For loop:</strong> Use when you know how many times to repeat.</li>
    <li><strong>While loop:</strong> Use when you repeat until something changes.</li>
  </ul>

  <h2>Looping Through Lists</h2>
  <p>We can use loops to go through all items in a list.</p>
  <pre><code>fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)</code></pre>

  <h2>Try It Yourself!</h2>
  <p>Try these short challenges on your own or with your group.</p>
  {% include hack.html %}

  <br><br><br><br>

  <h2>Review & Practice</h2>
  {% include flashcards.html %}
  <p>Review key terms that you need, and add your own flashcards below too!</p>

  <br><br><br><br>

  {% include flashcard-notes.html %}
  <p>Add your own flashcards here.</p>

  <br><br><br><br>

  <p>Let’s play a live multiplayer quiz game!</p>
  {% include game.html %}

  <br><br><br><br>

  <p>We’d love your feedback:</p>
  {% include poll.html %}

  <br><br><br><br>

  <h2>Homework Hacks</h2>
  <ol>
    <li><strong>Count Down:</strong> Use a <code>while</code> loop to print numbers from 10 to 1, then "Liftoff!".</li>
    <li><strong>Sum of Numbers:</strong> Write a <code>for</code> loop to find the sum of numbers 1 through 100.</li>
    <li><strong>Filter Even Numbers:</strong> Loop through a list and print only the even ones.</li>
  </ol>

  <br><br><br><br>

  <h2>Extra Practice</h2>
  {% include ai_comprehension.html %}
  <p>Optionally, you can try AI-generated questions to test your understanding of loops, or use this if you're coming back to study for a test on this lesson.</p>

</div>

{% include slim_sidebar.html %}
