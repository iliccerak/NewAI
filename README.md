
# NewAI Enterprise System Architecture

## 1. System Overview (ASCII)
```text
[ USER INTERFACE ] <---> [ CORE ORCHESTRATOR ] <---> [ INTELLIGENCE PROVIDER ]
       |                         |                          |
       | (React 18 SPA)          | (Gemini SDK)             | (Google GenAI)
       |                         |                          |
[ PERSISTENCE LAYER ] <----------+--------------------------+ [ MEMORY ENGINE ]
       |                                                    |
       | (LocalStorage/Vault)                               | (Context Windowing)
```

## 2. Locked Tech Stack
- **Frontend Framework:** React 18.3.1 (Strict Mode)
- **Language:** TypeScript 5.4+
- **Styling:** Tailwind CSS 3.4.1 (Utility-First Architecture)
- **AI Integration:** `@google/genai` (Native JS SDK)
- **State Management:** React Functional Hooks + Storage Persistence
- **Utilities:** `uuid`, `Lucide React` (concepts implemented via SVG)

## 3. Deployment Strategy
- **Environment:** Single-Page Application (SPA)
- **Distribution:** CDN-optimized static assets
- **Security:** API Key isolation through environment injection
- **Scaling:** Client-side orchestration reduces server-side latency overhead

## 4. Prompt Engineering System
NewAI utilizes a layered prompt assembly:
1. **System Layer:** Hard-coded professional constraints.
2. **Context Layer:** Sliding window (20 messages) with role labeling.
3. **Execution Layer:** User intent with mode-specific reasoning budgets.

## 5. Security Protocols
- **Abuse Detection:** Input sanitization on user message submission.
- **Privacy:** Local-first persistence (LocalStorage) with no shared server state.
- **Guardrails:** System-level instructions for safety and technical accuracy.
