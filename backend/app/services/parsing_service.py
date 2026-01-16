from app.utils.parser_utils import handle_pm_notation
from sympy import Eq
from latex2sympy2 import latex2sympy

def parse_math_step(step_str):
    """
    Parses a math step string, handling \\pm notation.
    Returns a list of SymPy objects (equations or expressions).
    """
    variants = handle_pm_notation(step_str)
    results = []
    
    for variant in variants:
        if '=' in variant:
            parts = variant.split('=', 1)
            lhs = parts[0].strip()
            rhs = parts[1].strip() if len(parts) > 1 else ''
            
            if lhs and rhs:
                try:
                    results.append(Eq(latex2sympy(lhs), latex2sympy(rhs)))
                except Exception as e:
                    print(f"Error parsing '{variant}': {e}")
                    results.append(None)
            elif lhs:
                try:
                    results.append(latex2sympy(lhs))
                except Exception as e:
                    print(f"Error parsing '{variant}': {e}")
                    results.append(None)
            elif rhs:
                try:
                    results.append(latex2sympy(rhs))
                except Exception as e:
                    print(f"Error parsing '{variant}': {e}")
                    results.append(None)
        else:
            try:
                results.append(latex2sympy(variant.strip()))
            except Exception as e:
                print(f"Error parsing '{variant}': {e}")
                results.append(None)
    
    # Filter out None values
    results = [r for r in results if r is not None]
    return results if results else [None]