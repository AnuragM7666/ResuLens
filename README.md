## ResuLens — AI Resume Analyzer

Upload a PDF resume, paste a job description, and get a quick ATS-style score with simple tips to improve.

### What it does
- **Scores your resume** (overall + ATS, tone, content, structure, skills)
- **Gives clear tips** on what’s good and what to fix
- **Previews your resume** (PDF → image)
- **Saves results** so you can come back later

### Run it
Prereqs: Node 18+, internet (loads Puter SDK)

```bash
npm install
npm run dev
# open http://localhost:5173
```

Build/serve:
```bash
npm run build
npm start
```

### Use it
1. Go to `/upload`
2. Enter company, role, and paste the job description
3. Upload your PDF and start analysis
4. See your score and tips on `/resume/:id`
5. Home (`/`) shows your past analyses

### Notes
- If you’re redirected to `/auth`, click Sign In (uses Puter auth)
- PDF preview needs `public/pdf.worker.min.mjs` (already included)
- Dev helpers: debug info on home, wipe all data at `/wipe`

### Tech
React 19, React Router v7 (SSR), Tailwind 4, Vite 6, TypeScript, Zustand, Puter, pdfjs-dist


