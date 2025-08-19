📚 AI Tutor – Doubt Section (Athena AI)

This is the AI Tutor project – currently focused on the Doubt Section, where students can ask subject-based questions and get AI-powered answers with chat history stored in Supabase.

Other modules (voice mode, revision planner, gamification, institute dashboard, etc.) are Work in Progress (WIP).

⸻

🚀 Features (Current Status)

✅ Working Now
	•	Chat-based Doubt Section
	•	AI responses via OpenRouter API (deepseek/deepseek-chat-v3-0324:free)
	•	Supabase integration for saving chat history and messages

🚧 Work in Progress
	•	Voice Mode
	•	Revision Planner
	•	Adaptive Difficulty Engine
	•	Institute Dashboard & Packages

⸻

🛠️ Tech Stack
	•	Frontend: React.js + CSS
	•	Backend: Node.js + Express
	•	Database: Supabase (PostgreSQL)
	•	AI Model: OpenRouter API

⸻

📂 Project Structure

ai-tutor/
│── backend/                # Node.js backend for AI + Supabase
│   ├── routes/aiRoutes.js
│   ├── controllers/aiController.js
│   ├── services/DoubtsService.js
│   ├── server.js
│   └── .env.example
│
│── frontend/               # React frontend (chat UI)
│   ├── src/
│   │   ├── components/ChatSection.js
│   │   ├── services/DoubtsService.js
│   │   └── App.js
│   └── .env.example
│
│── README.md


⸻

⚙️ Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/your-username/ai-tutor.git
cd ai-tutor


⸻

2️⃣ Backend Setup

cd backend
npm install

Create .env file:

PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key

Run backend:

npm start

➡ Runs on: http://localhost:5000

⸻

3️⃣ Frontend Setup

cd frontend
npm install

Create .env file:

REACT_APP_BACKEND_URL=http://localhost:5000

Run frontend:

npm start

➡ Open: http://localhost:3000

⸻

4️⃣ Supabase Setup
	1.	Create project in Supabase.
	2.	Copy Project URL + Service Role Key into .env.
	3.	Create tables:

create table doubts_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  subject text,
  created_at timestamp default now()
);

create table doubts_messages (
  id uuid primary key default uuid_generate_v4(),
  history_id uuid references doubts_history(id),
  sender text, -- 'user' or 'ai'
  message text,
  created_at timestamp default now()
);


⸻

🧪 Testing
	1.	Run backend + frontend.
	2.	Open http://localhost:3000.
	3.	Ask a doubt → get AI answer.
	4.	Chat history will be stored in Supabase.

⸻

📖 Roadmap
	•	Voice Mode
	•	Revision Planner
	•	Gamified Learning
	•	Multi-subject support
	•	Institute Dashboard

⸻

👨‍💻 Author

Developed entirely by Ritesh Jadhav

⸻
