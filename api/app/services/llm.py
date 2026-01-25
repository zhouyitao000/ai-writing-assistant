import os
import json
from typing import AsyncGenerator, List
from openai import AsyncOpenAI
from dotenv import load_dotenv
from app.models import StudentLevel, OutlineItem

load_dotenv()

class LLMService:
    def __init__(self):
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            print("Warning: DEEPSEEK_API_KEY is not set.")
            
        self.client = AsyncOpenAI(
            api_key=api_key or "dummy", # Prevent immediate crash on init, fail on call
            base_url="https://api.deepseek.com"
        )
        self.model = "deepseek-chat"

    async def generate_outline(self, topic: str, level: StudentLevel, requirements: str) -> List[OutlineItem]:
        if not os.getenv("DEEPSEEK_API_KEY"):
             # Mock response if no key (for testing/demo purposes or fail gracefully)
             # But for now let's just fail or return mock to debug
             pass
             
        prompt = f"""
        You are a {level.value} university student.
        Task: Create a structured outline for an essay on "{topic}".
        Requirements: {requirements}
        
        Output Format: JSON array of objects with 'id', 'title', and 'content' keys.
        Example:
        [
            {{"id": "1", "title": "Introduction", "content": "Briefly introduce..."}},
            {{"id": "2", "title": "Key Point 1", "content": "Discuss..."}}
        ]
        Do not output markdown code blocks, just the raw JSON.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        # Clean up potential markdown formatting
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        try:
            data = json.loads(content)
            return [OutlineItem(**item) for item in data]
        except Exception as e:
            print(f"Error parsing outline JSON: {e}")
            # Fallback in case of parsing error
            return [
                OutlineItem(id="1", title="Introduction", content=f"Introduction to {topic}"),
                OutlineItem(id="2", title="Body Paragraph", content="Main arguments"),
                OutlineItem(id="3", title="Conclusion", content="Summary")
            ]

    async def generate_essay_stream(self, topic: str, outline: List[OutlineItem], level: StudentLevel, tone: int) -> AsyncGenerator[str, None]:
        # Convert tone (0-100) to description
        tone_desc = "very casual and simple" if tone < 30 else "academic and formal" if tone > 70 else "standard student tone"
        
        prompt = f"""
        Role: You are a {level.value} university student.
        Task: Write a short essay on "{topic}".
        Tone: {tone_desc}.
        Requirements: {', '.join([item.title for item in outline]) if outline else 'Follow standard essay structure'}.
        
        Important: Write naturally, like a student. Avoid AI-sounding phrases like "In conclusion" or "It is important to note".
        Be slightly imperfect but coherent.
        """

        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            temperature=0.8 # Higher temp for more natural/human-like variety
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def chat_edit_stream(self, current_content: str, instruction: str, level: StudentLevel, tone: int) -> AsyncGenerator[str, None]:
        tone_desc = "very casual" if tone < 30 else "highly academic" if tone > 70 else "balanced"
        
        prompt = f"""
        Role: You are a {level.value} university student acting as an editor.
        Task: Revise the following essay based strictly on the user's instruction.
        User Instruction: "{instruction}"
        Tone Goal: Maintain a {tone_desc} tone appropriate for a {level.value} student.
        
        Original Essay:
        {current_content}
        
        Output ONLY the fully revised essay. Do not output explanations like "I have updated the second paragraph". Just the new text.
        """

        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            temperature=0.7
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def refine_essay_stream(self, draft: str, requirements: str, level: StudentLevel, tone: int) -> AsyncGenerator[str, None]:
        tone_desc = "very casual" if tone < 30 else "highly academic" if tone > 70 else "balanced"
        
        prompt = f"""
        Role: You are a {level.value} university student.
        Task: Refine and rewrite the following draft.
        Goal: Make it sound more like a {level.value} student with a {tone_desc} tone.
        Specific Instructions: {requirements}
        
        Original Draft:
        {draft}
        
        Output ONLY the rewritten text. Do not add conversational filler like "Here is the refined version".
        """

        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            temperature=0.7
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

llm_service = LLMService()
