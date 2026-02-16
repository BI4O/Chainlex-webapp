from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from agents.chat_agent import run_chat_agent, stream_chat_agent
import json

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

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Chat Mode API - streaming conversational agent"""
    async def generate():
        try:
            async for token in stream_chat_agent(request.user_input, request.history):
                # Send token as Server-Sent Event
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat Mode API - conversational agent (non-streaming fallback)"""
    try:
        # Run LangChain chat agent
        ai_response = run_chat_agent(request.user_input, request.history)

        return {
            "message": ai_response,
            "history": request.history + [
                {"role": "user", "content": request.user_input},
                {"role": "assistant", "content": ai_response}
            ]
        }
    except Exception as e:
        return {
            "message": f"Error: {str(e)}",
            "history": request.history
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
