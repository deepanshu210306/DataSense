# DataSense documentation

## Files in this folder

| File | Format | Use |
|------|--------|-----|
| `DataSense-Project-Documentation.tex` | LaTeX | Compile to **PDF** (best for formal submission) |
| `PROJECT_DOCUMENTATION.md` | Markdown | Open in **Word** or convert to `.docx` |

## Get a PDF (from LaTeX)

**Option A — Overleaf (easiest, no install)**

1. Go to [https://www.overleaf.com](https://www.overleaf.com)
2. New Project → Upload Project → upload `DataSense-Project-Documentation.tex`
3. Click **Recompile** → Download PDF

**Option B — Local (if you have MiKTeX or TeX Live)**

```bash
cd datasense/docs
pdflatex DataSense-Project-Documentation.tex
pdflatex DataSense-Project-Documentation.tex
```

Output: `DataSense-Project-Documentation.pdf`

## Get a Word file (.docx)

**Option A — Open Markdown in Word**

1. Open Microsoft Word
2. File → Open → select `PROJECT_DOCUMENTATION.md`
3. File → Save As → Word Document (`.docx`)

**Option B — Pandoc (best formatting)**

```bash
cd datasense/docs
pandoc PROJECT_DOCUMENTATION.md -o DataSense-Project-Documentation.docx
```

Install Pandoc: https://pandoc.org/installing.html

**Option C — PDF to Word**

Compile the LaTeX file to PDF, then open the PDF in Word (Word can convert PDF to editable document).

## What to present to your senior

1. **Executive summary** — Section 1 of the doc  
2. **Architecture diagram** — Section 3 (request flow)  
3. **Tech stack table** — Section 2  
4. **Live demo** — `npm run dev`, ask a Census 2011 question  
5. **Security** — API keys server-side only  
