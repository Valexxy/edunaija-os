"""
Router for 100% Sponsor Accountability Ledger & CSR Grant Impact Telemetry
"""
from fastapi import APIRouter
from backend.database.sqlite_store import get_sponsor_accountability_ledger

router = APIRouter(prefix="/sponsors", tags=["Sponsor Accountability Ledger"])

@router.get("/ledger")
def get_ledger_endpoint():
    """Returns the complete balanced accountability ledger, grant allocations, student fee receipts, and impact metrics."""
    return get_sponsor_accountability_ledger()