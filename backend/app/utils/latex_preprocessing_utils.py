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