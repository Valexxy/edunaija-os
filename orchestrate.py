"""
EduNaija OS — Antigravity Agent Orchestrator
Uses the Google Antigravity SDK to spawn an AI architect agent
that helps with development tasks using the project context.

Usage:
    python orchestrate.py                          # Interactive mode
    python orchestrate.py --task schema            # Generate DB schema
    python orchestrate.py --task viral             # Design viral mechanics
    python orchestrate.py --task rag               # Design RAG pipeline
"""

import asyncio
import sys
import argparse
from pathlib import Path

from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
from google.antigravity.utils.interactive import run_interactive_loop


def load_project_context() -> str:
    """Load the full project blueprint as agent memory."""
    context_file = Path(__file__).parent / "edunaija_context.md"
    if context_file.exists():
        return context_file.read_text(encoding="utf-8")
    return ""


SYSTEM_INSTRUCTIONS = """
You are an expert Lead Architect and CTO for a Nigerian EdTech startup building
EduNaija OS — a Telegram-native AI tutor for 2.2 million Nigerian students.

STRICT OPERATIONAL RULES:
1. ZERO CAC: Every feature must enable viral growth (referrals, shares, FOMO)
2. LOW DATA: Optimize for 2G/3G Nigerian networks (text-first, no heavy images)
3. ZERO HARDWARE: Use only free-tier cloud services (Supabase, Render, Cloudflare)
4. RAG CONFINEMENT: AI answers ONLY from past question database, NEVER from general knowledge
5. NO MOBILE APP: Platform lives exclusively on Telegram Bot API
6. PAYSTACK ONLY: All payments via Paystack (Nigerian gateway, no Stripe)
7. VC METRICS: Every decision must optimize for: DAU, K-factor, LTV, CAC=0

TECH STACK:
- Backend: FastAPI (Python) on Render free tier
- Bot: python-telegram-bot v21 (async)
- AI: Google Gemini 1.5 Flash
- RAG: Supabase pgvector (768-dim embeddings)
- Workflows: n8n (self-hosted on Render)
- Cache: Upstash Redis
- SMS: Africa's Talking
- Payments: Paystack

MONETIZATION:
- Hearts (20/day free) — FOMO engine
- Cram Pass: ₦200/24hrs
- Season Pass: ₦5,000 (Jan-April)
- Parent Dashboard: ₦3,000/month
- B2B Tutorial License: ₦50,000/month
"""


TASK_PROMPTS = {
    "schema": (
        "Generate the complete Supabase PostgreSQL schema for the EduNaija OS. "
        "Include: users, subscriptions, past_questions (with pgvector), quiz_sessions, "
        "user_answers, weak_topics, referrals, payments, heart_transactions, leaderboard. "
        "Add Row Level Security policies, indexes, triggers, and pgvector similarity functions."
    ),
    "viral": (
        "Design the complete viral mechanics engine. Detail the Heart system state machine, "
        "referral flow with fraud detection, WhatsApp share verification, streak bonuses, "
        "and leaderboard scoring formula. Calculate expected K-factor (viral coefficient)."
    ),
    "rag": (
        "Design the RAG pipeline for JAMB past questions. Detail: embedding strategy (Gemini), "
        "similarity search with pgvector, strict anti-hallucination prompt templates, "
        "confidence scoring, and the ingestion pipeline for PDF past question papers."
    ),
    "vc": (
        "Create a VC pitch deck outline for EduNaija OS. Include: problem/solution, "
        "market size (3.5M students), revenue projections (Month 1-18), unit economics "
        "(LTV/CAC ratio), competitive moat, team requirements, and funding ask."
    ),
    "launch": (
        "Create a 24-hour launch playbook. How do we get 1,000 users on day 1 "
        "using zero budget? Include: WhatsApp group seeding strategy, influencer outreach "
        "script, tutorial center partnership pitch, and referral launch mechanics."
    ),
}


async def run_task(task_name: str):
    """Run a specific development task."""
    project_memory = load_project_context()

    system_instructions = SYSTEM_INSTRUCTIONS
    if project_memory:
        system_instructions += f"\n\n--- PROJECT CONTEXT ---\n{project_memory}"

    config = LocalAgentConfig(
        system_instructions=system_instructions,
        capabilities=CapabilitiesConfig(),  # Enable write tools for code generation
    )

    prompt = TASK_PROMPTS.get(task_name, task_name)

    print(f"\n🚀 EduNaija OS — Agent Orchestrator")
    print(f"📋 Task: {task_name}")
    print("=" * 60)

    async with Agent(config) as agent:
        response = await agent.chat(prompt)

        async for token in response:
            sys.stdout.write(token)
            sys.stdout.flush()

        print("\n" + "=" * 60)
        print("✅ Task complete!")


async def run_interactive():
    """Start an interactive development session."""
    project_memory = load_project_context()

    system_instructions = SYSTEM_INSTRUCTIONS
    if project_memory:
        system_instructions += f"\n\n--- PROJECT CONTEXT ---\n{project_memory}"

    print("\n🚀 EduNaija OS — Interactive Development Session")
    print("📚 Project context loaded. Ask me anything about the architecture!")
    print("   Type 'exit' to quit.\n")

    config = LocalAgentConfig(
        system_instructions=system_instructions,
        capabilities=CapabilitiesConfig(),
    )

    async with Agent(config) as agent:
        await run_interactive_loop(agent)


def main():
    parser = argparse.ArgumentParser(
        description="EduNaija OS — Antigravity Agent Orchestrator"
    )
    parser.add_argument(
        "--task",
        choices=list(TASK_PROMPTS.keys()) + ["custom"],
        help="Predefined task to run",
        default=None,
    )
    parser.add_argument(
        "--prompt",
        help="Custom prompt for the agent",
        default=None,
    )
    args = parser.parse_args()

    if args.task:
        asyncio.run(run_task(args.task))
    elif args.prompt:
        asyncio.run(run_task(args.prompt))
    else:
        asyncio.run(run_interactive())


if __name__ == "__main__":
    main()

