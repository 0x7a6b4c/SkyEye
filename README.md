# Skyeye

**Skyeye** is a file-based CLI and a webapp (no database) security scanner that maps AWS Identity and Access Management (IAM) relationships. Supply one or more AWS credentials and Skyeye will:

1. **Enumerate** users, groups, roles, policies, actions and resources.
2. **Cross‑assume** between credentials to discover implicit permissions.
3. **Generate a rich JSON report** of every information it finds.
4. **Visualise** the result as an interactive tree in a Next.js frontend (if using webapp).

> When your vision reaches beyond your IAM scope

---

## 📚 Table of Contents

- [Key Features](#-key-features)
- [Demo](#-demo)
- [Quick Start $Docker Compose$](#-quick-start-docker-compose)
- [Install Locally $Dev Mode$](#-install-locally-dev-mode)
- [Configuration](#-configuration)
- [API Reference $FastAPI$](#-api-reference-fastapi)
- [Using Skyeye](#-using-skyeye)
- [License](#-license)

## 🖼️ Demo

![Skyeye demo screenshot](demo-images/homepage.png)

## ✨ Key Features

| Feature                                      | Description                                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Cross‑Entity Mode**                        | Feeds the output of one credential into another, discovering lateral‑movement paths automatically.                                        |
| **Severity mapping and MITRE Attack Matrix** | Map discovered actions for each credential to severity, vulnerabilities, methodology from the MITRE Attack Matrix for Cloud-based actions |
| **Fuzzing**                                  | Optional IAM fuzzing to search for undocumented actions.                                                                                  |
| **Historic Comparison**                      | Load multiple policy versions and see diffs colour‑coded (new 🟢, kept 🟠, removed 🔴).                                                   |
| **Progress & Logs**                          | Real‑time progress bar and server‑sent logs so you always know what the scanner is doing.                                                 |
| **Portable Output**                          | Outputs a single JSON file that can be archived or piped into other tools.                                                                |

## 📦 Quick Start (Docker Compose)

```bash
# 1. Clone the repo
$ git clone https://github.com/your‑org/skyeye.git && cd skyeye

# 2. Build and run both services
$ docker‑compose up --build

# 3. Open the app
Frontend  → http://localhost:3000
Backend UI → http://localhost:8000/docs
```

Behind the scenes Compose spins up two containers:

| Container           | Port  | Purpose                      |
| ------------------- | ----- | ---------------------------- |
| **skyeye‑backend**  |  8000 | FastAPI API (scan engine)    |
| **skyeye‑frontend** |  3000 | Next.js UI (tree visualiser) |

Environment variable `NEXT_PUBLIC_API_BASE_URL` (already set in _docker‑compose.yml_) tells the frontend where to find the API.

## 🛠️ Install Locally (Dev Mode)

```bash
# Backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload  # http://localhost:8000

# Frontend
cd skyeye‑frontend
npm install
npm run dev               # http://localhost:3000
```

## ⚙️ Configuration

| Variable                   | Default                 | Description                                     |
| -------------------------- | ----------------------- | ----------------------------------------------- |
| `THREADS`                  |  `20`                   | Number of parallel AWS SDK calls per credential |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Frontend → Backend URL                          |

All config can be set via `.env` or the container `environment:` block.

## 📑 API Reference (FastAPI)

| Method   | Path                                               | Purpose / Notes                                                                                                                                   |               |                                                            |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------- |
| **POST** | `/scan`                                            | Start a new scan.<br>**Body**:<br>`{ credentials: [ … ], mode: "cross‑entity" \| "separate‑entity", thread: int, fuzz: bool }` → `{ session_id }` |               |                                                            |
| **GET**  | `/sessions`                                        | Return a folder‑style tree (dates → sessions) used by the history sidebar.                                                                        |               |                                                            |
| **GET**  | `/sessions/{session_id}`                           | JSON summary of accounts → credentials for a scan.                                                                                                |               |                                                            |
| **GET**  | `/sessions/{session_id}/status`                    | `running` \| `fuzzing` \| `completed` \| `failed`.                                                                                                |               |                                                            |
| **GET**  | `/sessions/{session_id}/logs`                      | **Server‑Sent Events** stream of live scan logs.                                                                                                  |               |                                                            |
| **GET**  | `/sessions/{session_id}/{account_id}/{access_key}` | Raw JSON for a single credential set.<br>Optional query `mode=scan` or `mode=fuzz`.                                                               |               |                                                            |
| **POST** | `/update`                                          | Kick off a data update (MITRE ATT\&CK Cloud, AWS actions, managed policies).<br>**Body**:<br>\`{ types: \["mitre-attack-cloud"                    | "aws-actions" | "aws-managed-policies"], thread: int }` → `{ update_id }\` |
| **GET**  | `/update/{update_id}/status`                       | `running` \| `completed` \| `failed`.                                                                                                             |               |                                                            |
| **GET**  | `/update/{update_id}/logs`                         | **Server‑Sent Events** stream of update job logs.                                                                                                 |               |                                                            |

Open **`/docs`** (Swagger UI) or **`/redoc`** for interactive documentation generated automatically by FastAPI.

## 🖥️ Using Skyeye

1. provide Access Key + Secret Key + Region for AWS credentials in the scan form.
2. Click **Start Scan** → watch progress & live logs.
3. Once completed the visual tree appears – expand nodes to investigate statements, actions, and resources.

## 📄 License

Skyeye is released under the **MIT License**. See `LICENSE` for details.
