from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from agents.chat_agent import run_chat_agent, stream_chat_agent
from agents.build_agent import run_build_agent, stream_build_agent, generate_step_content, generate_project_title
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

@app.post("/api/build/stream")
async def build_stream(request: BuildRequest):
    """Build Mode API - streaming task-oriented agent"""
    async def generate():
        try:
            async for token in stream_build_agent(
                request.user_input,
                request.history,
                request.current_step,
                request.completed_steps,
                request.phase,
                request.asset_data
            ):
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

@app.post("/api/build")
async def build(request: BuildRequest):
    """Build Mode API - task-oriented agent (non-streaming fallback)"""
    try:
        ai_response = run_build_agent(
            request.user_input,
            request.history,
            request.current_step,
            request.completed_steps,
            request.phase,
            request.asset_data
        )

        return {
            "message": ai_response,
            "current_step": request.current_step,
            "completed_steps": request.completed_steps,
            "asset_data": request.asset_data,
            "whitepaper_content": "",
            "contract_content": "",
            "history": request.history + [
                {"role": "user", "content": request.user_input},
                {"role": "assistant", "content": ai_response}
            ]
        }
    except Exception as e:
        return {
            "message": f"Error: {str(e)}",
            "current_step": request.current_step,
            "completed_steps": request.completed_steps,
            "asset_data": request.asset_data,
            "whitepaper_content": "",
            "contract_content": "",
            "history": request.history
        }


class ContentRequest(BaseModel):
    step: int
    phase: str
    history: List[Dict[str, Any]]
    asset_data: Dict[str, Any]


@app.post("/api/build/content")
async def build_content(request: ContentRequest):
    """Generate structured content for a completed step"""
    try:
        content = generate_step_content(
            request.step,
            request.phase,
            request.history,
            request.asset_data
        )
        return {"content": content, "success": True}
    except Exception as e:
        return {"content": "", "success": False, "error": str(e)}


class TitleRequest(BaseModel):
    history: List[Dict[str, Any]]
    asset_data: Dict[str, Any]


@app.post("/api/build/title")
async def build_title(request: TitleRequest):
    """Generate project title based on conversation"""
    try:
        title = generate_project_title(
            request.history,
            request.asset_data
        )
        return {"title": title, "success": True}
    except Exception as e:
        return {"title": "待命名项目", "success": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
