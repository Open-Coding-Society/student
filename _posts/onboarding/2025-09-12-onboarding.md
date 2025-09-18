---
title: Tools Onboarding
comments: true
layout: post
permalink: /onboarding/tools-steps
description: An interactive onboarding experience to help you set up tools more smoothly
author: Evan S, West S, Ethan W, Nico D, William W, Shay M
---
<style>
.step-container {
  border: 2px solid #333;
  border-radius: 12px;
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  background: #1e1e1e; /* dark background */
  color: #f0f0f0;       /* light text */
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
}

.step-header {
  border-bottom: 2px solid #444;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}

.step-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: bold;
  color: #ffffff; /* bright white title */
}

.step-body {
  flex: 1;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.5;
  color: #ddd; /* softer white for body text */
}

.step-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #333;
  padding-top: 0.5rem;
}

.step-footer button {
  background: #007bff;    /* blue accent */
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.step-footer button:hover {
  background: #3399ff;
}

.step-footer span {
  font-size: 0.9rem;
  color: #aaa;
}
</style>

<div id="step_div" class="step-container">
    <!-- Content will be injected by JS -->
</div>

<script type="module">
import { step as Step } from "/CSPeople/assets/js/onboarding/step.js";
console.log("Loaded js in md")
// Create steps
new Step("HTML for example.", "Intro Example 1", 0)
new Step("HTML for example.", "Intro Example 2 ", 0)
new Step("HTML for example.", "Intro Example 3", 0)

new Step("HTML for example.", "Windows Example 1", 1)
new Step("HTML for example.", "Windows Example 2", 1)
new Step("HTML for example.", "Windows Example 3", 1)

new Step("HTML for example.", "Mac Example 1", 2)
new Step("HTML for example.", "Mac Example 2", 2)
new Step("HTML for example.", "Mac Example 3", 2)

// Initial render
Step.selectOS(0)
Step.RenderStep();
</script>
