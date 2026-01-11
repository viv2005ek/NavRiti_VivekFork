import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

# Initialize Gemini Client
client = genai.Client(api_key=API_KEY) if API_KEY else None

app = FastAPI(title="Market Synthesis & Ranking Engine")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class StudentReadiness(BaseModel):
    employability_score: float 
    score_breakdown: Dict[str, Any] 
    top_career_recommendations: List[Dict[str, Any]] 
    skill_gap_analysis: Optional[Dict[str, Any]] = {} 

class MarketAnalysisRequest(BaseModel):
    celestial_recommendations: List[Dict[str, Any]]
    parental_scores: List[Dict[str, Any]]
    societal_insights: Dict[str, Any]
    student_stage2: StudentReadiness

@app.post("/final-market-ranking")
async def final_market_ranking(data: MarketAnalysisRequest):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key missing")

    # The double braces {{ }} here are what prevents the 'unhashable' error
    prompt = f"""
    SYSTEM: You are a 2026 Market Intelligence Expert. 
    TASK: Re-rank the top 5 careers based on 2026 MARKET POTENTIAL.

    INPUT DATA:
    - Student Readiness: {data.student_stage2.employability_score}% 
    - Student Interests: {data.student_stage2.top_career_recommendations}
    - Celestial Trends: {data.celestial_recommendations}
    - Parental Scores: {data.parental_scores}
    - Societal Bias: {data.societal_insights}

    STRICT RULE: Return ONLY a valid JSON object.
    The JSON must have this exact structure:
    {{
      "analysis_report": "Summary of market reality.",
      "top_careers": [
        {{
          "career_name": "Name",
          "market_score": 0.95,
          "market_explanation": "Why this career is a powerhouse.",
          "focus_area": "What to focus on.",
          "achieving_steps": ["Step 1", "Step 2", "Step 3"]
        }}
      ],
      "conclusion": "Final outlook."
    }}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        # Clean AI response and parse
        raw_text = response.text.replace("```json", "").replace("```", "").strip()
        ai_data = json.loads(raw_text)

        return {
            "status": "success",
            "employability_baseline": data.student_stage2.employability_score,
            "analysis_report": ai_data.get("analysis_report", ""),
            "top_careers": ai_data.get("top_careers", []), 
            "conclusion": ai_data.get("conclusion", ""),
            "metadata": {"market_cycle": "2026-Q1"} # Fixed: standard dict here is fine
        }
    except Exception as e:
        print(f"Server-side Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
if __name__ == "__main__":
    import uvicorn
    # Port set to 8005 to match your React Dashboard URL
    uvicorn.run(app, host="0.0.0.0", port=8005)