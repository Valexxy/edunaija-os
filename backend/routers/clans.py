"""
EduNaija Clan War System — SQLite-backed, production-grade.
School-based clans with persistent XP, rivalries, and war sessions.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime, timezone, timedelta

from backend.database.sqlite_store import (
    get_connection, init_db,
    get_active_clan_rivalries,
    award_xp_with_streak,
)

router = APIRouter(prefix="/clans", tags=["Clan Wars"])


class ClanCreate(BaseModel):
    name: str
    description: str = ""
    school_affiliation: str = ""
    leader_key: str = "GUEST"
    emblem: str = "⚔️"


@router.post("/create")
async def create_clan(clan: ClanCreate):
    init_db()
    conn = get_connection(); c = conn.cursor()
    c.execute("SELECT id FROM clan_registry WHERE name=?", (clan.name,))
    if c.fetchone():
        conn.close(); raise HTTPException(status_code=400, detail="Clan name already exists. Choose a unique name.")
    clan_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    c.execute(
        "INSERT INTO clan_registry (id,name,description,leader_key,school_affiliation,emblem,total_xp,member_count,created_at) VALUES (?,?,?,?,?,?,0,1,?)",
        (clan_id, clan.name, clan.description, clan.leader_key, clan.school_affiliation, clan.emblem, now)
    )
    c.execute(
        "INSERT OR IGNORE INTO clan_memberships (id,clan_id,user_key,role,xp_contributed,joined_at) VALUES (?,?,?,?,0,?)",
        (str(uuid.uuid4()), clan_id, clan.leader_key, "leader", now)
    )
    conn.commit(); conn.close()
    return {"id": clan_id, "name": clan.name, "emblem": clan.emblem, "status": "created"}


@router.post("/join")
async def join_clan(clan_id: str, user_key: str = "GUEST"):
    init_db()
    conn = get_connection(); c = conn.cursor()
    c.execute("SELECT * FROM clan_registry WHERE id=?", (clan_id,))
    clan = c.fetchone()
    if not clan: conn.close(); raise HTTPException(status_code=404, detail="Clan not found")
    now = datetime.now(timezone.utc).isoformat()
    c.execute(
        "INSERT OR IGNORE INTO clan_memberships (id,clan_id,user_key,role,xp_contributed,joined_at) VALUES (?,?,?,?,0,?)",
        (str(uuid.uuid4()), clan_id, user_key, "member", now)
    )
    c.execute("UPDATE clan_registry SET member_count=member_count+1 WHERE id=?", (clan_id,))
    conn.commit(); conn.close()
    return {"message": "Joined clan successfully", "clan_name": clan["name"], "clan_emblem": clan["emblem"]}


@router.delete("/leave")
async def leave_clan(clan_id: str, user_key: str = "GUEST"):
    init_db()
    conn = get_connection(); c = conn.cursor()
    c.execute("DELETE FROM clan_memberships WHERE clan_id=? AND user_key=?", (clan_id, user_key))
    if c.rowcount > 0:
        c.execute("UPDATE clan_registry SET member_count=MAX(0,member_count-1) WHERE id=?", (clan_id,))
    conn.commit(); conn.close()
    return {"message": "Left clan"}


@router.get("/leaderboard")
async def clan_leaderboard():
    init_db()
    conn = get_connection(); c = conn.cursor()
    c.execute("SELECT id,name,emblem,school_affiliation,total_xp,member_count FROM clan_registry ORDER BY total_xp DESC LIMIT 20")
    clans = [dict(r) for r in c.fetchall()]; conn.close()
    for i, cl in enumerate(clans): cl["rank"] = i + 1
    return {"leaderboard": clans}


@router.get("/rivalries")
async def get_rivalries():
    """Returns active inter-school clan wars with live XP bars."""
    data = get_active_clan_rivalries()
    if not data:
        # Auto-create rivalries from seeded clans
        init_db()
        conn = get_connection(); c = conn.cursor()
        c.execute("SELECT id, total_xp FROM clan_registry ORDER BY total_xp DESC LIMIT 4")
        clans = c.fetchall()
        now = datetime.now(timezone.utc)
        end_dt = (now + timedelta(hours=24)).isoformat()
        now_iso = now.isoformat()
        if len(clans) >= 2:
            c.execute("INSERT OR IGNORE INTO clan_war_sessions (id,clan_a_id,clan_b_id,clan_a_xp,clan_b_xp,status,started_at,ends_at) VALUES (?,?,?,?,?,?,?,?)",
                (str(uuid.uuid4()), clans[0]["id"], clans[1]["id"], clans[0]["total_xp"], clans[1]["total_xp"], "active", now_iso, end_dt))
        if len(clans) >= 4:
            c.execute("INSERT OR IGNORE INTO clan_war_sessions (id,clan_a_id,clan_b_id,clan_a_xp,clan_b_xp,status,started_at,ends_at) VALUES (?,?,?,?,?,?,?,?)",
                (str(uuid.uuid4()), clans[2]["id"], clans[3]["id"], clans[2]["total_xp"], clans[3]["total_xp"], "active", now_iso, end_dt))
        conn.commit(); conn.close()
        data = get_active_clan_rivalries()
    return {"status": "success", "rivalries": data}


@router.get("/{clan_id}")
async def get_clan(clan_id: str):
    init_db()
    conn = get_connection(); c = conn.cursor()
    c.execute("SELECT * FROM clan_registry WHERE id=?", (clan_id,))
    clan = c.fetchone()
    if not clan: conn.close(); raise HTTPException(status_code=404, detail="Clan not found")
    c.execute(
        "SELECT cm.user_key,cm.role,cm.xp_contributed,u.full_name,u.state FROM clan_memberships cm LEFT JOIN users u ON u.registration_key=cm.user_key WHERE cm.clan_id=? ORDER BY cm.xp_contributed DESC",
        (clan_id,)
    )
    members = [dict(r) for r in c.fetchall()]; conn.close()
    return {"clan": dict(clan), "members": members}


@router.post("/contribute-xp")
async def contribute_xp(clan_id: str, user_key: str = "GUEST", xp_amount: int = 10):
    """Called when a student earns XP in study — flows into their clan's total."""
    init_db()
    conn = get_connection(); c = conn.cursor()
    c.execute("UPDATE clan_memberships SET xp_contributed=xp_contributed+? WHERE clan_id=? AND user_key=?",
              (xp_amount, clan_id, user_key))
    c.execute("UPDATE clan_registry SET total_xp=total_xp+? WHERE id=?", (xp_amount, clan_id))
    # Also update any active clan war sessions
    c.execute("UPDATE clan_war_sessions SET clan_a_xp=clan_a_xp+? WHERE clan_a_id=? AND status=?", (xp_amount, clan_id, "active"))
    c.execute("UPDATE clan_war_sessions SET clan_b_xp=clan_b_xp+? WHERE clan_b_id=? AND status=?", (xp_amount, clan_id, "active"))
    conn.commit(); conn.close()
    return {"status": "xp_contributed", "xp_amount": xp_amount}


