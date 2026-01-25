from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional

class StudentLevel(str, Enum):
    FRESHMAN = "freshman"
    JUNIOR = "junior"
    GRAD = "grad"

class GenerateRequest(BaseModel):
    topic: str
    requirements: Optional[str] = ""
    student_level: StudentLevel = StudentLevel.JUNIOR
    tone: int = Field(50, ge=0, le=100)

class RefineRequest(BaseModel):
    draft: str
    requirements: Optional[str] = ""
    student_level: StudentLevel = StudentLevel.JUNIOR
    tone: int = Field(50, ge=0, le=100)

class ChatEditRequest(BaseModel):
    current_content: str
    instruction: str
    student_level: StudentLevel = StudentLevel.JUNIOR
    tone: int = Field(50, ge=0, le=100)

class OutlineItem(BaseModel):
    id: str
    title: str
    content: str

class OutlineResponse(BaseModel):
    outline: List[OutlineItem]
