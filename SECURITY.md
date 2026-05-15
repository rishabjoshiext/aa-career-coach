# Security notes

- This frontend does **not** require API keys or third-party LLM credentials. Career-coaching copy is generated from **static / deterministic** utilities in `src/utils/`.
- Do **not** add `VITE_*` secrets for paid APIs unless your org’s security review approves client-side keys (generally avoid).
- Keep `.env` and `.env.*` out of git (see `.gitignore`). Use `.env.example` for **non-secret** placeholders only.
