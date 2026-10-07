from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
from .room_manager import CompetitionManager

router = APIRouter(prefix="/competition", tags=["competition"])
manager = CompetitionManager(supabase_client=None)

@router.post("/create")
async def create_room(host_id: str, subject: str):
    room_code = await manager.create_room(host_id, subject)
    return {"room_code": room_code}

@router.post("/join/{room_code}")
async def join_room(room_code: str, user_id: str):
    res = await manager.join_room(room_code, user_id)
    return res

@router.post("/start/{room_code}")
async def start_room(room_code: str):
    if room_code in manager.rooms:
        await manager.rooms[room_code].start()
        return {"status": "started"}
    return {"error": "Room not found"}

@router.post("/answer/{room_code}")
async def submit_answer(room_code: str, user_id: str, answer: str):
    return await manager.submit_answer(room_code, user_id, answer)

@router.get("/leaderboard/{room_code}")
async def get_leaderboard(room_code: str):
    return await manager.get_live_leaderboard(room_code)

@router.get("/rooms")
async def list_rooms():
    return {"rooms": list(manager.rooms.keys())}

@router.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        pass
