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
    2. Check if the mathematical/algebraic work shown in that specific step is valid. is_correct should be True if the step itself is mathematically sound.
    3. Note the 'valid' flag and 'comment' provided in the data; these are hints from the symbolic engine.
    4. 'technical_critique' should evaluate the mathematical correctness of the step shown, 'pedagogical_feedback' should be encouraging guidance or point out missing pieces.
    5. **STRICT RULE - CRITICAL**: If is_correct is True, then awarded_marks MUST be > 0. If is_correct is False, then awarded_marks MUST be 0. NO EXCEPTIONS. If the math shown is right, the step is correct and must be awarded marks.
    6. Follow the rule of error propagation: if a step is algebraically wrong (is_correct: False) then subsequent steps are also wrong even if their logic appears correct. Do not award marks for subsequent steps, but note in feedback that they're based on an incorrect prior step.
    7. For each step_evaluation, include the 'step_content' field with the actual mathematical step/equation from the student's work (in LaTeX format).
    8. Distribute marks evenly across all correct steps. If total_marks is 4 and there are 8 correct steps, each correct step gets 0.5 marks.
    9. Missing steps (like domain checks for logarithmic equations) should be addressed in the final_verdict, NOT by marking preceding correct steps as incorrect.
    10. Ensure all responses are in valid JSON format matching the required schema.
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
