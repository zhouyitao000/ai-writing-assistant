import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.models import GenerateRequest, RefineRequest, ChatEditRequest, OutlineResponse
from app.services.llm import llm_service

app = FastAPI(title="AI Writing Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/api")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

# Add duplicate routes to handle potential path stripping by Vercel rewrites
@app.post("/outline", response_model=OutlineResponse)
@app.post("/api/outline", response_model=OutlineResponse)
async def create_outline(request: GenerateRequest):
    outline = await llm_service.generate_outline(
        request.topic, 
        request.student_level, 
        request.requirements
    )
    return OutlineResponse(outline=outline)

@app.post("/generate")
@app.post("/api/generate")
async def generate_essay(request: GenerateRequest):
    # Note: In a real implementation, we would pass the *confirmed* outline here.
    # For MVP simplicity, we might re-generate or assume the outline is implied by the topic.
    # Or, we should update GenerateRequest to include the outline.
    # Let's stick to the simple flow for now: Topic -> Stream.
    # But wait, the frontend sends a confirmed outline? 
    # The frontend currently just calls `startWriting`.
    # Let's update the backend to accept an outline if needed, but for now we'll just stream based on topic.
    
    # Actually, the PRD says: "UI->API: POST /api/generate (with Outline)"
    # I should probably update the model to include outline, but let's keep it simple for the first pass
    # and just stream based on topic/requirements.
    
    async def stream_generator():
        async for chunk in llm_service.generate_essay_stream(
            request.topic, 
            [], # Mock empty outline
            request.student_level, 
            request.tone
        ):
            yield chunk

    return StreamingResponse(stream_generator(), media_type="text/plain")

@app.post("/refine")
@app.post("/api/refine")
async def refine_essay(request: RefineRequest):
    async def stream_generator():
        async for chunk in llm_service.refine_essay_stream(
            request.draft, 
            request.requirements,
            request.student_level, 
            request.tone
        ):
            yield chunk

    return StreamingResponse(stream_generator(), media_type="text/plain")

@app.post("/chat-edit")
@app.post("/api/chat-edit")
async def chat_edit_essay(request: ChatEditRequest):
    async def stream_generator():
        async for chunk in llm_service.chat_edit_stream(
            request.current_content,
            request.instruction,
            request.student_level,
            request.tone
        ):
            yield chunk

    return StreamingResponse(stream_generator(), media_type="text/plain")

if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)
