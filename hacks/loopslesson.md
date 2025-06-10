---
layout: lesson
title: Loops and Iteration
video_url: "https://www.youtube.com/watch?v=94UHCEmprCY"
hack_prompt: "What is the difference between a while loop and a for loop?"
permalink: /loopslesson/
---

# Loops and Iteration

Loops let you run a block of code over and over again. This is called **iteration**. Instead of copying and pasting code 10 times, loops do the repeating for you.

## Why Use Loops?

- **Efficiency:** Save time by repeating code automatically.
- **Automation:** Useful for lists, counting, checking input, and more.
- **Cleaner Code:** Fewer lines, better structure.

Let’s start by watching a short video to understand how loops work in programming.

{% include video.html %}

Follow along as your teacher draws examples on the **live whiteboard** to reinforce what you learned.

{% include whiteboard.html %}

## The `for` Loop

`for` loops are great when you know how many times something should run. It repeats a fixed number of times.

```python
for i in range(5):
    print(i)
```

This prints: `0 1 2 3 4`

## The `while` Loop

`while` loops run as long as a condition is true. It’s useful when you don’t know how many times the loop needs to run.

```python
x = 0
while x < 5:
    print(x)
    x += 1
```

This also prints: `0 1 2 3 4`

## Comparing `for` and `while`

- **For loop:** Use when you know how many times to repeat.
- **While loop:** Use when you repeat until something changes.

## Looping Through Lists

We can use loops to go through all items in a list.

```python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
```

## Try It Yourself!

Try these short challenges on your own or with your group.

{% include hack.html %}

## Review & Practice

{% include flashcards.html %}
Review key terms that you need, and add your own flashcards below too!

{% include flashcard-notes.html %}
Add your own flashcards here.

Let’s play a live multiplayer quiz game!

{% include game.html %}

We’d love your feedback:

{% include poll.html %}

## Homework Hacks

1. **Count Down:** Use a `while` loop to print numbers from 10 to 1, then "Liftoff!".
2. **Sum of Numbers:** Write a `for` loop to find the sum of numbers 1 through 100.
3. **Filter Even Numbers:** Loop through a list and print only the even ones.

## Extra Practice

{% include ai_comprehension.html %}
Optionally, you can try AI-generated questions to test your understanding of loops, or use this if you're coming back to study for a test on this lesson.

{% include slim_sidebar.html %}

<style>
  h2 {
    color: white;
  }
</style>