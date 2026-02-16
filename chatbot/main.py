from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI(title="Lexstudio AI Backend")

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_input: str
    history: List[Dict[str, Any]]

class BuildRequest(BaseModel):
    user_input: str
    current_step: int
    completed_steps: List[int]
    phase: str
    asset_data: Dict[str, Any]
    history: List[Dict[str, Any]]

@app.get("/")
async def root():
    return {"message": "Lexstudio AI Backend", "status": "running"}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat Mode API - simple conversation"""
    # TODO: Implement Chat Agent
    return {
        "message": f"Echo: {request.user_input}",
        "history": request.history + [
            {"role": "user", "content": request.user_input},
            {"role": "assistant", "content": f"Echo: {request.user_input}"}
        ]
    }

@app.post("/api/build")
async def build(request: BuildRequest):
    """Build Mode API - task-oriented agent"""
    # TODO: Implement Build Agent
    return {
        "message": f"Build mode echo: {request.user_input}",
        "current_step": request.current_step,
        "completed_steps": request.completed_steps,
        "asset_data": request.asset_data,
        "whitepaper_content": "",
        "contract_content": "",
        "history": request.history + [
            {"role": "user", "content": request.user_input},
            {"role": "assistant", "content": f"Build mode echo: {request.user_input}"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
