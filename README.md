# ⌛ Focus Flow – A Pomodoro App for Deep Work

**Focus Flow** is a minimalist, productivity-focused Pomodoro app built with React and Tailwind CSS. It helps you stay focused, track tasks, and manage time effectively with a clean UI and smart logic.

![image](https://github.com/user-attachments/assets/50edf336-535f-452b-a64a-a9afe9686529)
![image](https://github.com/user-attachments/assets/064fb988-d727-4f63-887b-edd1301357b1)
![image](https://github.com/user-attachments/assets/89e0ff16-eac0-4dc4-b3a8-26c0807374f0)


---

## 🚀 Tech Stack

- **React 19** – Modern, component-based UI
- **Vite** – Lightning-fast development & builds
- **TypeScript** – Safer and more structured code
- **Tailwind CSS** – Utility-first styling
- **ESLint** – Linting and code consistency

---

## 🎯 Why I Built This

I wanted a Pomodoro timer that:
- Tracks tasks and session progress
- Automatically manages focus/break cycles
- Encourages users to stay on track with a focus score
- Looks clean and works fast

The project was a chance to practice deeper React state logic, side-effects with `useEffect`, and UI/UX decisions under realistic constraints.

---

## ✨ Features

- ⏱️ **Smart Pomodoro Timer**  
  Switches between work and break sessions automatically

- 📋 **Task Management**  
  Add, track, and auto-cycle through tasks

- 🎯 **Focus Metrics**  
  Includes a Focus Score and Distraction Counter based on pause events

- 🧠 **Skip Break Option**  
  Let users dive back into work when they want

- 💾 **Built-in Resilience**  
  Prevents timer from starting when no active tasks exist

- 💡 **Lightweight & Minimal**  
  Focus on functionality first, without bloated dependencies

- 🔔 **End-of-Session Alarm**  
  Plays a sound when a Pomodoro or break session finishes, keeping you alert and in the flow


---

## 🧠 Challenges & Decisions

**Hardest part:**  
Getting the timer and task logic to stay in sync, especially across transitions and edge cases.

**How I solved it:**  
- Used `useEffect` with `setInterval` for timer management
- Built clear separation between work and break logic
- Auto-progressed tasks and added guard checks for edge cases
- Created a custom focus scoring system based on user interactions

**Tradeoffs made:**  
Chose to build most logic in a single component to move quickly. Refactoring into smaller components is a future goal.

**AI Assistance:**  
Used ChatGPT to explore state logic, edge cases, and feature planning — but made all final design and implementation decisions myself.

---
