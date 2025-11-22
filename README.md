# Mini Code Evaluator — Async Sandbox-Based Execution Engine

A lightweight, production-inspired code evaluation system that executes untrusted user code safely in an isolated sandbox using a queue–worker architecture.

This project mimics the core design of large-scale evaluators (e.g., CodeSignal, LeetCode, CodeRunner engines), focusing on:
- job queueing
- async execution
- sandboxed runtime
- safety model
- fault tolerance
- clean API contract

---

## 🚀 Features

- **Async submission → polling flow**
- **Sandboxed execution** with `vm2`
- **Time-limit & manual timeout race**
- **Worker pool via BullMQ**
- **PostgreSQL persistence**
- **Dockerized, horizontally scalable**
- **End-to-end logging and result storage**
- **Language support: JavaScript (extensible)**

---

## 🧩 Architecture Overview

The system consists of 5 components:

1. **API Server**
   - Receives submissions  
   - Stores metadata  
   - Enqueues job  

2. **Redis Queue (BullMQ)**
   - Stores pending jobs  
   - Ensures FIFO  
   - Handles retries and backpressure  

3. **Worker Service**
   - Picks jobs from queue  
   - Executes code in sandbox  
   - Enforces time & memory constraints  
   - Saves final result to Postgres  

4. **Sandbox Layer**
   - `vm2`-based isolation  
   - Prevents filesystem access  
   - Controlled `console.log`  
   - External timeout enforcement  

5. **PostgreSQL**
   - Stores submission metadata  
   - Status updates  
   - Final results  

---

## 🖥️ Execution Flow

1. **User submits code**  
   → `{ code, language }`

2. **API**  
   → Creates `submission_id`  
   → Saves status = `Pending`  
   → Enqueues job `{submission_id, code, ...}`  

3. **Worker**  
   → Marks status = `Running`  
   → Executes in sandbox  
   → Saves output
   → Marks status = `Completed` or `Failed`  

4. **Client polling**  
   → `/submission/:id` returns either:  
     - the status (`Pending | Running | Failed | Timeout`)  
     - OR the full record once completed  

---

## 🛡️ Sandbox Safety Model

| Risk | Mitigation |
|------|------------|
| Filesystem access | vm2 isolated context |
| Infinite loops | external Promise.race timeout |
| CPU hogging | worker concurrency limit |
| Memory abuse | vm2 memory limit + Docker memory cap |
| Escape attempts | no host API, no require, no fs |

---

## 📦 Data Model (Postgres)

```
submission_id  UUID (PK)
job_id         TEXT
code           TEXT
language       TEXT
status         TEXT
result         TEXT
created_at     TIMESTAMP
updated_at     TIMESTAMP
```

---

## 🔗 API Endpoints

### **POST /submission**
```
{
  "code": "2 + 2",
  "language": "JavaScript"
}
```

**Response**
```
{
  "submission_id": "uuid-string",
  "status": "Pending"
}
```

---

### **GET /submission/:id**

**While running**
```
"Running"
```

**Once completed**
```
{
  "submission_id": "...",
  "status": "Completed",
  "result": "4",
}
```

---

## 🐳 Running Locally (Docker)

```
docker-compose up --build
```

API → http://localhost:8080  
Worker + queue auto-start inside containers.

---

## 🧪 Testing (Manual E2E)

```
curl -X POST http://localhost:8080/code/create \
  -H "Content-Type: application/json" \
  -d '{"code":"3+3", "language":"JavaScript"}'
```

Take the `submission_id`:

```
curl http://localhost:8080/code/poll/<id>
```

---

## 📈 Future Improvements

- Move from vm2 → Docker-based runner  
- Add support for Python & Go  
- Add GraphQL subscription for live logs  
- Add caching layer for recent submissions  
- Rate limiting / auth  
- Dead-letter queue with retry policy  
- UI frontend (Next.js)  

---

## 🗣️ Interview Talking Points

- Designed an async evaluator similar to what powers online coding platforms  
- Used queue-based buffering to support horizontal scaling  
- Implemented safe execution with vm2 + external timeout  
- Architected a clean, extensible system ready for container runners  
- Clear separation between API, worker, sandbox, and data layer  
- Production-grade fault tolerance patterns (retry, DLQ considerations)  

---

## 📝 License

MIT
