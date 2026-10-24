import json
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
from pypdf import PdfReader
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import httpx

load_dotenv()

myApiKey = os.getenv("GROQ_API_KEY")
if not myApiKey:
    raise ValueError("GROQ_API_KEY not found in environment")

Client = Groq(api_key=myApiKey)
model = "openai/gpt-oss-120b"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- MODELS --------------------

class Experience(BaseModel):
    company: str | None = None
    role: str | None = None
    duration: str | None = None
    description: str | None = None
    skill_used: list[str] = []

class Resume(BaseModel):
    name: str | None = None
    mail: str | None = None
    phone: str | None = None
    total_experience: float | None = None
    skill: list[str] = []
    experiences: list[Experience] = []
    education: list[str] = []
    project: list[str] = []
    certification: list[str] = []

resume_schema = Resume.model_json_schema()

class chatRequest(BaseModel):
    question: str | None = None

# ----------------- RESUME PARSING --------------------------

def readPdf(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        pageText = page.extract_text()
        if pageText:
            text += pageText + "\n"
    return text

def resumeParser(resume_text):
    system_prompt = f"""
    You are an expert resume parser.

    Extract information from the resume based on its meaning,
    not only based on exact section headings.

    Different resumes may use different headings.

    For example:
    - Experience
    - Professional Experience
    - Work History
    - Employment
    - Internships

    These may all contain relevant experience.

    Skills may also appear in the skills section, work experience,
    internships or projects.

    Return ONLY valid JSON matching this schema:

    {resume_schema}

    Important rules:

    1. Do not invent information.
    2. If a value is not available, return null.
    3. If a list has no information, return an empty list.
    4. Include internships inside experiences.
    5. Extract skills mentioned across the entire resume.
    """
    user_prompt = f"""
    Parse the following resume:

    {resume_text}
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response = Client.chat.completions.create(
        model=model,
        messages=messages,
        response_format={"type": "json_object"},
    )
    raw_output = response.choices[0].message.content
    data = json.loads(raw_output)
    return Resume(**data)

# ---------------- CONFIG & CACHE ----------------
GITHUB_USER = "Kumaramit0809"
LEETCODE_USER = "Amit_Kumar_08"
PDF_PATH = Path(__file__).parent / "Amit_Kumar__CV.pdf"

_cache = {}

def cached(key, ttl, fn):
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < ttl:
        return hit[1]
    val = fn()
    _cache[key] = (time.time(), val)
    return val

def get_resume():
    return cached("resume", 3600, lambda: resumeParser(readPdf(PDF_PATH)))

# ---------------- TOOLS ----------------
def _gh(path):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "portfolio-bot"}
    if os.getenv("GITHUB_TOKEN"):
        headers["Authorization"] = f"Bearer {os.getenv('GITHUB_TOKEN')}"
    r = httpx.get(f"https://api.github.com{path}", headers=headers, timeout=10)
    r.raise_for_status()
    return r.json()

def get_github_profile():
    def fetch():
        user = _gh(f"/users/{GITHUB_USER}")
        repos = _gh(f"/users/{GITHUB_USER}/repos?per_page=100&sort=pushed")
        repos = [x for x in repos if not x["fork"]]
        repos.sort(key=lambda x: (x["stargazers_count"], x["pushed_at"]), reverse=True)
        return {
            "profile_url": user["html_url"],
            "public_repos": user["public_repos"],
            "followers": user["followers"],
            "top_repos": [
                {
                    "name": x["name"],
                    "description": x["description"],
                    "language": x["language"],
                    "stars": x["stargazers_count"],
                    "url": x["html_url"],
                    "last_pushed": x["pushed_at"],
                }
                for x in repos[:12]
            ],
        }
    return cached("github", 3600, fetch)

LC_HEADERS = {
    "Content-Type": "application/json",
    "Referer": "https://leetcode.com",
    "User-Agent": "Mozilla/5.0",
}

def _lc(query, variables):
    r = httpx.post(
        "https://leetcode.com/graphql",
        json={"query": query, "variables": variables},
        headers=LC_HEADERS,
        timeout=10,
    )
    r.raise_for_status()
    body = r.json()
    if body.get("errors") and not body.get("data"):
        raise RuntimeError(body["errors"][0].get("message", "LeetCode error"))
    return body["data"]

Q_STATS = """
query stats($u: String!) {
  matchedUser(username: $u) {
    username
    profile { ranking }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    tagProblemCounts {
      advanced { tagName problemsSolved }
      intermediate { tagName problemsSolved }
      fundamental { tagName problemsSolved }
    }
  }
  userContestRanking(username: $u) { attendedContestsCount rating globalRanking topPercentage }
}"""

def get_leetcode_stats():
    def fetch():
        d = _lc(Q_STATS, {"u": LEETCODE_USER})
        u = d.get("matchedUser")
        if not u:
            raise RuntimeError("LeetCode user not found")
        tags = [t for grp in (u.get("tagProblemCounts") or {}).values() for t in grp]
        tags.sort(key=lambda t: t["problemsSolved"], reverse=True)
        return {
            "profile_url": f"https://leetcode.com/u/{LEETCODE_USER}/",
            "global_ranking": (u.get("profile") or {}).get("ranking"),
            "solved_by_difficulty": {
                x["difficulty"]: x["count"] for x in u["submitStatsGlobal"]["acSubmissionNum"]
            },
            "top_topics": [{"topic": t["tagName"], "solved": t["problemsSolved"]} for t in tags[:8]],
            "contest": d.get("userContestRanking"),
        }
    return cached("lc_stats", 3600, fetch)

Q_RECENT = "query r($u: String!) { recentAcSubmissionList(username: $u, limit: 20) { title titleSlug timestamp } }"
Q_DIFF = "query q($s: String!) { question(titleSlug: $s) { difficulty topicTags { name } } }"
RANK = {"Hard": 0, "Medium": 1, "Easy": 2}

def get_leetcode_recent_solved():
    def fetch():
        subs = _lc(Q_RECENT, {"u": LEETCODE_USER}).get("recentAcSubmissionList") or []
        seen, out = set(), []
        for s in subs:
            if s["titleSlug"] in seen or len(out) >= 12:
                continue
            seen.add(s["titleSlug"])
            q = cached(
                "lcq:" + s["titleSlug"],
                86400,
                lambda s=s: _lc(Q_DIFF, {"s": s["titleSlug"]}).get("question") or {},
            )
            out.append({
                "title": s["title"],
                "difficulty": q.get("difficulty", "Unknown"),
                "topics": [t["name"] for t in q.get("topicTags", [])],
                "url": f"https://leetcode.com/problems/{s['titleSlug']}/",
            })
        out.sort(key=lambda x: RANK.get(x["difficulty"], 3))
        return {"recently_solved_hardest_first": out}
    return cached("lc_recent", 1800, fetch)

TOOL_FUNCS = {
    "get_github_profile": get_github_profile,
    "get_leetcode_stats": get_leetcode_stats,
    "get_leetcode_recent_solved": get_leetcode_recent_solved,
}
TOOL_LABELS = {
    "get_github_profile": "GitHub",
    "get_leetcode_stats": "LeetCode",
    "get_leetcode_recent_solved": "LeetCode",
}

def _tool(name, desc):
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": desc,
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    }

TOOLS = [
    _tool(
        "get_github_profile",
        "Live GitHub data for the candidate: public repo count, followers, and top repositories with languages and stars.",
    ),
    _tool(
        "get_leetcode_stats",
        "Live LeetCode stats for the candidate: problems solved by difficulty, top topics, ranking, contest rating.",
    ),
    _tool(
        "get_leetcode_recent_solved",
        "Candidate's recently accepted LeetCode problems with difficulty and topics, hardest first. Use for 'best/hardest problem solved'.",
    ),
]

# ---------------- AGENT LOOP ----------------
def agent_answer(question):
    resume = get_resume()
    systemPrompt = f"""You are an AI assistant representing the job candidate ({resume.name or 'Amit Kumar'}) in an interview with recruiters.

Candidate Resume Data:
{resume.model_dump_json(indent=2)}

Rules and Guardrails:

1. Representation & Tone:
   - Always represent the candidate professionally, positively, and accurately.
   - Speak in the first person ("I") or on behalf of the candidate as their AI representative.

2. Handling Negative / Trick Questions (e.g., "Why should we NOT hire you?"):
   - NEVER give self-defeating, disqualifying, or self-sabotaging answers. Never invent negative flaws or red flags.
   - If asked "Why should we not hire you?" or similar trick questions, pivot constructively:
     - Clarify that the only reason would be if the team is seeking a completely different tech stack or a non-technical domain where their background wouldn't align.
     - Emphasize strong core engineering skills, proven problem-solving track record, and high adaptability to learn whatever the team requires.
   - If asked about weaknesses, frame them honestly as areas of ongoing growth (e.g., continuously exploring advanced distributed systems / system design), backed by proactive learning.

3. Strict Accuracy & Tools:
   - Base all answers strictly on the resume data and real-time tool results. Never hallucinate fake experiences, companies, or credentials.
   - For GitHub or LeetCode questions, always invoke the corresponding tool first to cite real-time verified data and repo links.
   - If asked about something completely outside the candidate's background, say: "I don't have enough information on that, but I can share details on my demonstrated work in relevant technical projects."
   - Politely decline non-interview or irrelevant topics and steer the conversation back to technical skills and experience.

4. Conciseness:
   - Be concise, structured, and interview-appropriate."""

    messages = [{"role": "system", "content": systemPrompt}, {"role": "user", "content": question}]
    used = []
    for _ in range(5):
        resp = Client.chat.completions.create(model=model, messages=messages, tools=TOOLS, tool_choice="auto")
        msg = resp.choices[0].message
        if not msg.tool_calls:
            return msg.content, used
        messages.append({
            "role": "assistant",
            "content": msg.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments or "{}",
                    },
                }
                for tc in msg.tool_calls
            ],
        })
        for tc in msg.tool_calls:
            fn = TOOL_FUNCS.get(tc.function.name)
            try:
                result = fn() if fn else {"error": "unknown tool"}
                label = TOOL_LABELS.get(tc.function.name)
                if label and label not in used:
                    used.append(label)
            except Exception as e:
                result = {"error": f"could not fetch live data ({e})"}
            messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)[:6000]})

    final = Client.chat.completions.create(model=model, messages=messages)
    return final.choices[0].message.content, used

# ---------------- ROUTES ----------------
DIST = Path(__file__).parent.parent / "frontend" / "dist"

@app.get("/ui")
def ui():
    return FileResponse(DIST / "index.html")

@app.get("/")
def home():
    return get_resume().model_dump()

@app.post("/chat")
def chat(request: chatRequest):
    if not request.question:
        return JSONResponse({"error": "question is required"}, status_code=400)
    try:
        answer, used = agent_answer(request.question)
    except Exception as e:
        return JSONResponse({"error": f"model request failed: {e}"}, status_code=502)
    return {"answer": answer, "sources": used}

@app.get("/cv")
def cv():
    return FileResponse(PDF_PATH, media_type="application/pdf", filename="Amit_Kumar_CV.pdf")

@app.get("/stats")
def stats():
    out = {"years": None, "leetcode_solved": None, "contest_top_percent": None, "github_repos": None}
    try:
        out["years"] = get_resume().total_experience
    except Exception:
        pass
    try:
        lc = get_leetcode_stats()
        out["leetcode_solved"] = lc["solved_by_difficulty"].get("All")
        top = (lc.get("contest") or {}).get("topPercentage")
        if top:
            out["contest_top_percent"] = round(top)
    except Exception:
        pass
    try:
        out["github_repos"] = get_github_profile()["public_repos"]
    except Exception:
        pass
    return out

if (DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")