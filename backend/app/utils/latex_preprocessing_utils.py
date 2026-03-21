import re

def latex_to_steps(latex_str):
    """Extract and clean steps from LaTeX aligned environment."""
    pattern = r"&(.*)"
    clean_pattern = r'\\text\s*\{.*?\}|\\\s*therefore,?|∴|\\\\|\\begin\s*\{.*?\}.*'
    lines = re.findall(pattern, latex_str)
    cleaned_arr = [re.sub(clean_pattern, '', item).strip() for item in lines]
    cleaned_arr = [re.sub(r'(\d)\s*([a-zA-Z])', r'\1*\2', item).strip() for item in cleaned_arr]
    cleaned_arr = [item for item in cleaned_arr if item]
    return cleaned_arr

def extract_question(latex_str):
    pattern = r"^(.*?)(?=@|\bSolution\b)"
    match = re.search(pattern, latex_str, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    else:
        return "No question found."
    
    
def extract_marks(text):
    # Only match marks in brackets/parens at the very end: [3], (4), [1+1], etc.
    pattern = r'[\[\(]\s*(\d+(?:\s*\+\s*\d+)*)\s*(?:marks?)?\s*[\]\)]$'
    matches = re.findall(pattern, text.strip(), re.IGNORECASE)
    
    if not matches:
        return {"marks": "unknown", "level": "Not specified"}
    
    # Extract all numbers and sum them
    total_marks = 0
    for match in matches:
        numbers = re.findall(r'\d+', match)
        total_marks += sum(map(int, numbers))
    
    if total_marks > 3 and total_marks <= 5:
        level = "Hard"
    elif total_marks == 2:
        level = "Medium"
    else:
        level = "Easy"
        
    return {"marks": total_marks, "level": level}