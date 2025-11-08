# 🧠 AI UI Generator — Text-to-UI Builder

A **Figma-like AI-driven UI Generator** built with **Next.js 14, Tailwind CSS, and Gemini API**, capable of transforming natural language prompts into **production-ready UI layouts** (JSON-based DSL).  
It supports smart variant generation, visual rendering, and a **Prompt Hub** for saving and showcasing designs.

![Preview](public/preview.png)

---

## 🚀 Overview

The **AI UI Generator** allows users to type prompts like:

> “Create a modern SaaS landing page with hero section, feature cards, and pricing table.”

…and instantly generates structured UI layouts composed of:
`container`, `card`, `text`, `image`, `button`, and `input`.

Each generated layout is **automatically normalized and rendered** into a beautiful, minimal interface — inspired by **Apple Design & Material 3 principles**.

---

## 🧩 Key Features

### 🎨 Intelligent UI Generation
- Uses **Gemini 2.5 Flash / Pro** for smart, prompt-driven UI layout creation.  
- Automatically maps component types and their hierarchy into JSON-based DSL.  
- Produces consistent, aesthetic, and semantically structured outputs.

### 🧱 Real-Time Rendering
- Renders AI-generated DSL directly into live **React + Tailwind components**.
- Supports nested containers, typography variants, buttons, cards, and images.

### 🔍 Prompt Hub (Community Space)
- Stores generated designs locally.
- Includes search, preview, and voting system.
- Perfect for demoing or sharing AI UI templates.

### 🧠 Prompt Engineering
- Optimized system prompt instructs Gemini to use only six core UI elements.
- Uses **few-shot examples** and **response normalization** via Zod schemas.
- Ensures JSON integrity, removing markdown noise and fixing invalid fields.

### 💾 Offline Fallback
- Includes a local archetype generator (`local-archetypes.ts`) to simulate Gemini output when API is disabled or quota is exceeded.

---

## 🧮 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animation** | Framer Motion |
| **AI Model** | Gemini 2.5 Flash / Pro |
| **Validation** | Zod Schemas |
| **Persistence** | LocalStorage |
| **Deployment** | Vercel |
| **Language** | TypeScript |

---

## 🏗️ Architecture

```plaintext
app/
 ├── ai-ui-generator/
 │   ├── page.tsx                → Main UI
 │   ├── api/generate/variants/  → Gemini generation API
 │   └── components/RenderNode.tsx → JSON-to-UI renderer
lib/
 ├── ui-schema.ts                → Defines and normalizes the UIDSL
 ├── gemini-prompt.ts            → Prompt instructions for Gemini
 ├── local-archetypes.ts         → Offline fallback templates
 ├── ollama-json.ts              → JSON cleaner & schema validator
public/
 └── preview.png


⚙️ Setup & Installation

1️⃣ Clone the repository
git clone https://github.com/susovonandremi/prompt-ut.git
cd prompt-ut

2️⃣ Install dependencies
npm install

3️⃣ Configure Environment

Create a .env.local file:

GEMINI_API_KEY=your_google_gemini_key
GEMINI_MODEL=gemini-2.5-flash

4️⃣ Run locally
npm run dev


Then open → http://localhost:3000/ai-ui-generator

🧰 Developer Notes

-To disable generation (e.g., protect from public spam):

const GENERATION_DISABLED = true;


Fallback automatically activates local templates when:
- API key is missing

- Gemini quota exceeds (429)

- Model is overloaded (503)

🧠 Example Output

Prompt:

“Create a grocery shopping app UI with home, featured items, and cart summary.”

Generated Structure:

13 container · 31 text · 5 button · 2 image · 6 card


✅ These tags summarize how many UI components were generated in the layout, helping analyze Gemini’s output density and variety.

🧑‍💻 Future Enhancements

🌐 Public Prompt Hub with backend database

🎨 Custom themes (Apple Neumorphism / Material 3)

🧩 Drag-and-drop editor for generated UI

💬 AI chat assistant to refine UI iteratively

📱 Responsive UI previews

💡 Inspiration

This project was inspired by:

Figma AI

Lovable.io

Vercel v0.dev

The dream of fusing design intelligence and code automation.

🧾 License

MIT License © 2025 Susovon Sarkar (Remi)

✨ Author

👨‍🎨 Susovon Sarkar (Remi)
🎓 University of Engineering & Management, Kolkata
💼 UI/UX Designer • AI Enthusiast • Developer