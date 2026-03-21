from google import genai
from dotenv import load_dotenv
import json
import os
# for loading environment variables from a .env file

load_dotenv()

# 1. Setup - Initialize client with API key
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 3. Initialize Model configuration
response_schema = {
    "type": "object",
    "properties": {
        "question": {"type": "string"},
        "step_evaluations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "step_index": {"type": "integer"},
                    "step_content": {"type": "string"},
                    "awarded_marks": {"type": "number"},
                    "is_correct": {"type": "boolean"},
                    "technical_critique": {"type": "string"},
                    "pedagogical_feedback": {"type": "string"}
                },
                "required": ["step_index", "step_content", "awarded_marks", "is_correct", "technical_critique", "pedagogical_feedback"]
            }
        },
        "total_marks_awarded": {"type": "number"},
        "final_verdict": {"type": "string"},
        "total_marks": {"type": "number"}
    },
    "required": ["step_evaluations", "total_marks_awarded", "final_verdict", "total_marks"]
}

def grade_complete_solution(question_data, steps_list, total_marks, difficulty):
    # Constructing a detailed prompt that contextualizes the step-by-step logic
    prompt = f"""
    You are an AI Math Tutor grading a student's handwritten work (parsed via OCR).

    CONTEXT:
    - Difficulty: {difficulty}
    - Total Marks to Distribute: {total_marks}
    - Question Data: {question_data}
    
    STUDENT DATA (JSON):
    {json.dumps(steps_list, indent=2)}
    
    GRADING INSTRUCTIONS:
    1. Look at each 'step' and 'parsed' version. 
    2. Check if the transition from step(n) to step(n+1) is algebraically valid.
    3. Note the 'valid' flag and 'comment' provided in the data; these are hints from the symbolic engine.
    4. Apply 'Error Carried Forward' logic: If Step 2 is wrong, but Step 3 correctly follows the logic of the wrong Step 2, award partial marks for Step 3.
    5. 'technical_critique' should be for the student's logic, 'pedagogical_feedback' should be encouraging guidance.
    6. If the step in step list is correct, you should mark it as correct and award marks accordingly. If it's incorrect, provide constructive feedback and do not award marks.
    7. Follow the rule of error propagation: if a step is wrong then the subsequent steps after that are also wrong even if the logic is correct, so you should not award marks for those steps but you should provide feedback that the step is correct but it is based on a wrong step before it.
    8. For each step_evaluation, include the 'step_content' field with the actual mathematical step/equation from the student's work (in LaTeX format).
    9. Ensure all responses are in valid JSON format matching the required schema.
    """
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": response_schema
        }
    )
    return json.loads(response.text)
