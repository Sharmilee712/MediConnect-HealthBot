# 🏥 HealthBot – WhatsApp-Based Health Assistance System

HealthBot is a multilingual AI-powered healthcare assistance system designed to connect users with healthcare support in rural and semi-urban areas. The system allows users to interact via WhatsApp, receive health guidance, track vaccinations, and escalate critical cases to ASHA workers through a real-time dashboard.

---

## 🚀 Project Overview

HealthBot utilizes a multi-service architecture to provide seamless interaction and monitoring:

* **📲 WhatsApp Integration:** Powered by Whatsapp API for global accessibility.
* **🧠 Natural Language Processing:** Rasa-driven intent detection and response generation.
* **🔧 Flask Backend:** Acts as the central nervous system, routing data between services.
* **🩺 ASHA Dashboard:** A dedicated interface for health workers to monitor and respond to alerts.
* **🐳 Dockerized:** Fully orchestrated using Docker Compose for "plug-and-play" deployment.
* **⚙️ Node.js Backend:** Handles webhook requests and connects all services
* **💉 Vaccine Tracking:** Stores and manages vaccination-related data


### System Data Flow
`User (WhatsApp) ⮕ whatsapp-web.js ⮕ Node.js Backend ⮕ Gemini API (AI Processing) ⮕ Rule-Based Engine ⮕ Alert System ⮕ ASHA Dashboard`

---

## 🏗️ Architecture & Project Structure

The project is organized into modular services for scalability:

```text
healthbot/
│
├── app.js                    # Main Node.js backend (core logic)
├── asha_dashboard/          # Dashboard for ASHA workers (Python + HTML)
├── vaccine_registrations.json # Stores vaccine data
├── alerts.json              # Stores emergency alerts
├── docker-compose.yml       # Container orchestration
├── Dockerfile               # Backend container config
└── README.md
```
## 🛠️ Tech Stack
```
Component        | Technology                  | Description
-----------------|-----------------------------|-----------------------------------------------------
Language         | JavaScript (Node.js)        | Core backend logic and processing
AI Model         | Gemini API                  | NLP, multilingual understanding, response generation
Messaging        | whatsapp-web.js             | WhatsApp integration (real-time communication)
Dashboard        | Python + HTML               | ASHA worker monitoring interface
Storage          | JSON Files                  | Stores alerts and vaccine data
Containerization | Docker                      | Ensures consistent deployment
Orchestration    | Docker Compose              | Manages multi-service setup

```

## ⚙️ How It Works
* User Interaction: The user sends a message via WhatsApp.
* Processing: Message is received through whatsapp-web.js and handled by Node.js backend
* AI Understanding: Gemini API processes the message and generates responses
* Emergency Detection: Rule-based + AI system detects critical conditions
* Escalation: If the NLP detects a serious symptom (e.g., "High Fever," "Chest Pain"), the backend pushes a notification to the ASHA Dashboard.
* Response: The user receives an automated response while the health worker is alerted for follow-up.

## 🐳 Running the Project (Docker Recommended)
# Step 1 – Clone Repository
Bash
* git clone [https://github.com/231901052/HealthBot.git](https://github.com/231901052/HealthBot.git)
* cd healthbot
## Step 2 – Add Environment Variables
* Navigate to .env file inside the backend/ directory and update with your credentials:
* Code snippet
GEMINI_API_KEY=your_api_key_here
## Step 3 – Build and Run
* Execute the following command to start all services:
Bash
* python3 runme.py
* Alternatively: docker-compose up --build
* docker ps
* docker logs -f <backend_container_id>
* QR is generated
* docker compose down - TO SHUT DOWN CONTAINER 
## Step 4 - Whatsapp Linking
* Whatsapp Settings -> Linked Device -> Scan the QR
* Anyone can text you "healthbot" to your number in whatsapp -> the system replys **NOW YOUR WHATSAPP NUMBER ACTS AS CHATBOT**
* Text "healthbot" in the chat to make The Bot alive
* Chatbot reply seamlessly 
## Step 5 – Access Services
ASHA Dashboard: http://localhost:6000

## 🧪 Testing the System
* Send a WhatsApp message like:

    "I have a high fever and a cough."

* Expected Result:

* The chatbot provides a preliminary response.

* The ASHA Dashboard receives a real-time alert for patient attention.

## 🔐 Key Features
✔ WhatsApp Integration via Whatsapp-WebHook.

✔ Real-time NLP for symptom classification.

✔ Modular Architecture using Docker Compose.

✔ Emergency Escalation system for health workers.

✔ Clean & Scalable code structure.
