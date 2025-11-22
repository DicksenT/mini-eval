# Mini Code Evaluator — Architecture Document

This document explains the system design principles behind the evaluator.

---

## 🎯 Goal

Execute untrusted user code safely, reliably, and asynchronously — without blocking the API — while building a scalable architecture that mirrors real online judge systems.

---

# 1. High-Level Diagram

```mermaid
flowchart TD

A[Client] -->|POST /submission| B[API Server]

B -->|INSERT submission| C[(Postgres)]
B -->|enqueue| D[Redis Queue]

D -->|pop job| E[Worker Service]

E -->|run sandbox| F[Sandbox (vm2)]
F -->|output| E

E -->|UPDATE result| C

A -->|GET /submission/:id| B
B --> C
```

---

# 2. Components

## API Server (Express/Node)
- Stateless  
- Accepts code submissions  
- Stores metadata  
- Enqueues jobs  
- No long-running operations  

## Queue (BullMQ + Redis)
- Buffers load  
- Ensures FIFO  
- Handles retries  
- Allows worker autoscaling  

## Worker Service
- Independent container  
- Processes one job at a time (per concurrency slot)  
- Uses vm2 to run user code safely  
- Applies external timeout  
- Saves results to DB  

## Sandbox Layer
- vm2 virtual machine  
- Injects custom console  
- No fs, no require, no network  
- 10s timeout via Promise.race  
- Prevents escape attempts  

## Database (Postgres)
Stores:
- submission_id  
- code  
- language  
- status  
- result  
- duration  
- timestamps  

---

# 3. Request Lifecycle

1. Client submits code.
2. API stores submission in DB.
3. API enqueues job.
4. Worker picks a job.
5. Worker:
   - marks status as Running  
   - executes in sandbox  
   - stores result  
6. User polls until status becomes Completed.

---

# 4. Failure Modes & Mitigation

| Failure | Handling |
|--------|----------|
| Worker crash | Redis job not acknowledged → retried |
| Sandbox timeout | External Promise.race → mark Timeout |
| Syntax error | Return as Failed with error message |
| Queue overflow | Respond 429 + retry-after |
| Redis unavailable | API responds 503, no job loss |
| Postgres failure | Temporary failure retried or DLQ route |

---

# 5. Tradeoffs

### Async model vs Sync  
Async improves scalability. Sync would block API while running code (bad).

### vm2 vs Docker
vm2 → fast, simple for MVP  
Docker → safe & production-ready (future upgrade)

### Polling vs WebSockets
Polling → simpler and reliable  
WS → can be added for live logs later

### Single DB vs dedicated Result store
Single DB → simpler  
Result store → needed at massive scale

---

# 6. Scalability Considerations

- Horizontal worker containers  
- Redis clustering  
- Worker concurrency controls  
- Backpressure when queue > N  
- Separate read replicas for result-heavy workloads  
- Caching for recent polling  

---

# 7. Roadmap

- Add Docker runner per submission  
- Add Python/Go support  
- Add GraphQL subscription for streaming output  
- Implement DLQ (dead-letter queue)  
- Add OpenTelemetry tracing  

