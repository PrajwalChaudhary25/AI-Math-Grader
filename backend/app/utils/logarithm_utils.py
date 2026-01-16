import re

def normalize_logs(latex):
    """
    Normalize logarithm notation for latex2sympy parsing.
    Keep LaTeX backslash notation but standardize the format.
    """
    # Standardize \ln to keep the backslash for latex2sympy
    # \ln is already in correct format for latex2sympy
    
    # Standardize \log_b(x) and \log_{b}(x) formats
    # latex2sympy expects: \log_{base}(argument)
    
    # Handle \log _5(x) (space after log) → \log_{5}(x)
    latex = re.sub(
        r'\\log\s+_([0-9]+)',
        r'\\log_{\1}',
        latex
    )
    
    # Handle \log_5(x) (no braces) → \log_{5}(x)
    latex = re.sub(
        r'\\log_([0-9]+)([^{])',
        r'\\log_{\1}\2',
        latex
    )
    
    return latex