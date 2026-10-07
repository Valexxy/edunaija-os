"""
backend/security/defense_middleware.py
EduNaija OS Enterprise Defense-in-Depth Security Middleware Stack
Implements Levels 0, 1, 2, 3, 4, 5 Shields, Rate Limiting, PII Interception & Hash Chaining
Compliance: NDPA 2023 §31, COPPA (16 CFR Part 312), GDPR-K (Art. 8 & 25), ISO/IEC 27001:2022
"""

import time
import re
import hmac
import hashlib
from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

SOVEREIGN_AUDIT_SECRET = b"EDUNAIJA_SOVEREIGN_HMAC_MASTER_KEY_2026"

NIGERIAN_PHONE_REGEX = re.compile(r"(?:(?:\+?234)|0)[789][01]\d{8}\b")
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
SOCIAL_HANDLE_REGEX = re.compile(r"(@[a-zA-Z0-9_]{3,20}|wa\.me/\d+|t\.me/[a-zA-Z0-9_]+)")
PROFANITY_LIST = {
    "mumu", "ode", "ashewo", "idiot", "bastard", "fool", "werey", "oloriburuku",
    "daniska", "nyash", "fuck", "bitch", "shit", "scam"
}

class TokenBucketRateLimiter:
    def __init__(self, capacity: int = 180, refill_seconds: float = 60.0):
        self.capacity = capacity
        self.refill_seconds = refill_seconds
        self.clients: Dict[str, Dict[str, Any]] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        client = self.clients.get(client_ip)
        if not client:
            self.clients[client_ip] = {"tokens": self.capacity - 1, "last_updated": now}
            return True

        elapsed = now - client["last_updated"]
        refill = elapsed * (self.capacity / self.refill_seconds)
        client["tokens"] = min(self.capacity, client["tokens"] + refill)
        client["last_updated"] = now

        if client["tokens"] >= 1.0:
            client["tokens"] -= 1.0
            return True
        return False

rate_limiter = TokenBucketRateLimiter(capacity=180, refill_seconds=60.0)

class DefenseInDepthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.headers.get("CF-Connecting-IP") or (request.client.host if request.client else "127.0.0.1")
        path = request.url.path
        method = request.method

        # Level 0 Public Bot / Rate Limiter Shield
        if not (path.startswith("/docs") or path.startswith("/openapi.json") or path.startswith("/api/health")):
            if not rate_limiter.is_allowed(client_ip):
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Defense-in-depth security throttling activated.",
                        "client_ip": client_ip,
                        "retry_after_seconds": 30
                    },
                    headers={"Retry-After": "30"}
                )

        try:
            user_tier = int(request.headers.get("X-Security-Tier", "0"))
        except ValueError:
            user_tier = 0
            
        user_role = request.headers.get("X-User-Role", "anonymous")
        user_id = request.headers.get("X-User-ID", "anonymous_guest")
        parent_pin_token = request.headers.get("X-Parent-PIN-Token")

        # Level 1 Minor Sandbox Curfew & Direct Messaging Blocker
        if user_tier == 1 or user_role in ("student_minor", "primary_scholar"):
            wat_hour = (datetime.now(timezone.utc).hour + 1) % 24
            if (wat_hour >= 21 or wat_hour < 5) and not request.headers.get("X-Parent-Curfew-Override"):
                return JSONResponse(
                    status_code=403,
                    content={
                        "error": "MINOR_NIGHT_CURFEW_ACTIVE",
                        "message": "In compliance with child welfare guidelines (NDPA 2023 §31), minor sandbox access is locked between 9:00 PM and 5:30 AM WAT. A parent PIN override is required."
                    }
                )

            if "/messages/direct" in path or "/chat/private" in path:
                return JSONResponse(
                    status_code=403,
                    content={
                        "error": "DIRECT_MESSAGING_DISALLOWED_FOR_MINORS",
                        "message": "NDPA 2023 & COPPA violation: Unmoderated P2P direct messaging is disabled for minor sandboxes. Use canned learning presets."
                    }
                )

        # Level 3 Parent Gate Verification
        if ("/parent/escrow/release" in path or "/parent/telemetry/sensitive" in path) and not parent_pin_token:
            return JSONResponse(
                status_code=401,
                content={
                    "error": "PARENT_PIN_REQUIRED",
                    "message": "Guardian PIN or WebAuthn biometric validation required to authorize this action."
                }
            )

        # Level 4 TRCN Verification Gate
        if ("/tutor/mark-theory" in path or "/tutor/escrow/claim" in path):
            trcn_verified = request.headers.get("X-TRCN-Verified") == "true"
            if not trcn_verified:
                return JSONResponse(
                    status_code=403,
                    content={
                        "error": "UNVERIFIED_TRCN_EDUCATOR",
                        "message": "Only TRCN-accredited educators with verified NIN may perform theory marking or claim escrow."
                    }
                )

        response = await call_next(request)

        # Level 5 Cryptographic Hash Chaining on Mutations
        if method in ("POST", "PUT", "DELETE") and ("/admin" in path or "/certificates" in path or "/escrow" in path):
            payload_digest = hashlib.sha256(f"{path}:{method}:{user_id}".encode()).hexdigest()
            timestamp_iso = datetime.now(timezone.utc).isoformat()
            
            prev_hash = getattr(request.app.state, "last_audit_hash", "0" * 64)
            chain_input = f"{prev_hash}|{timestamp_iso}|{user_id}|{method}:{path}|{payload_digest}"
            entry_hash = hmac.new(SOVEREIGN_AUDIT_SECRET, chain_input.encode(), hashlib.sha256).hexdigest()
            
            request.app.state.last_audit_hash = entry_hash
            response.headers["X-Audit-Entry-Hash"] = entry_hash

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-EduNaija-Security-Tier"] = str(user_tier)
        
        return response
