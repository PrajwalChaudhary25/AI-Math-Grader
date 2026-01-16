
def handle_pm_notation(latex_str):
    """
    Detects \\pm and splits into two separate expressions.
    Returns a list of expressions (one if no \\pm, two if \\pm exists).
    """
    if r'\pm' not in latex_str:
        return [latex_str]
    
    # Replace \pm with + for first case and - for second case
    plus_case = latex_str.replace(r'\pm', '+')
    minus_case = latex_str.replace(r'\pm', '-')
    
    return [plus_case, minus_case]