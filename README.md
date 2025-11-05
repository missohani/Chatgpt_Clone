# 💬 ChatGPT Clone

This is my **ChatGPT Clone**, a full-stack AI chat application that allows users to interact with an AI model in real time.  
It supports authentication, image upload, message storage, and a smooth animated UI. I integrated the **Google Gemini API** along with **React Query** for efficient data handling and used **MongoDB** for storing chat history.

---

## 🚀 Features

- 🔐 **User Authentication** – Implemented secure login and signup using **Clerk**.  
- ⚡ **Real-Time Chat** – Messages handled dynamically using React Query without reloads.  
- 🧠 **AI Integration** – Used **Google Gemini API** (and optional OpenAI API) for AI responses.  
- 🖼️ **Image Upload** – Allows users to upload images during chat.  
- 📱 **Responsive UI** – Designed using **Tailwind CSS** with **Framer Motion** animations.  
- 💾 **Data Storage** – Conversations are stored in **MongoDB** using **Mongoose**.

---

## 🛠️ Tech Stack

**Frontend:** React, Tailwind CSS, React Query, Framer Motion  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**Authentication:** Clerk  
**AI Integration:** Google Gemini API, OpenAI API  

---

## ⚙️ How It Works

1. User logs in or signs up using **Clerk Authentication**.  
2. After login, the user can start chatting with the AI model.  
3. Each message is processed by the backend using **Gemini** or **OpenAI API**.  
4. The AI’s reply is instantly displayed in the chat interface.  
5. All chat data is stored in **MongoDB** for persistence.

---

## 🖥️ Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/missohani/Chatgpt_Clone.git
   cd Chatgpt_Clone
