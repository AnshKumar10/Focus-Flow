# Focus Flow ⌛ - Pomodoro App

## 🧠 What was the hardest part to build? How did you approach it?

The hardest part was getting the **timer and task tracking to work well together**. I had to make sure the app knew whether it was a work or break session, which task was active, and what to do when the timer hit zero.

To handle this, I:
- Used one `useEffect` to manage the countdown timer
- Created a clear `toggleTimer` function to pause and start the timer
- Used another `useEffect` to react when time ran out and switch sessions

Breaking the logic into small pieces helped avoid bugs and made the code easier to understand.

---

## ⚖️ What tradeoffs did you make and why?

I decided to **keep everything in one big component** instead of splitting it into smaller ones. This made the code a bit messier, but it helped me move faster and stay focused on getting features to work first. For a real app, I would break it up later.

---

## ⏱ If you had 2 more hours, what would you improve?

1. **Split the UI into smaller components** – like `TaskList`, `Timer`, and `FocusMetrics` for better structure.
2. **Save tasks and sessions** using LocalStorage so users don’t lose their progress when they refresh the page.
3. **Add a settings panel** to let users customize timer lengths and break durations.
4. **Polish the UI** – smoother animations, light/dark theme toggle.
5. **Show Pomodoro history** – a simple list or chart showing completed sessions over time.

---

## 🤖 Did you use AI tools (e.g., ChatGPT, Copilot)? How and why?

Yes, I used **ChatGPT** during development to:
- Write the basic layout and structure of the app
- Help break down the timer and state logic
- Plan extra features like focus scoring and skip break
- Write this reflection at the end

AI helped me move faster by taking care of repetitive or confusing parts so I could focus on building the core features. I still made all the final decisions on structure, logic, and UX myself.

---

## 🧭 What decisions did you make beyond the suggestions?

- I added a **Focus Score and Distraction Counter** to track how focused a user was during a session.
- I used **Tailwind CSS** for fast, responsive styling with a clean look.
- I included a **"Skip Break" button** so users can jump back into work without waiting.

---
