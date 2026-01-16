from app.utils.logarithm_utils import normalize_logs
from app.services.parsing_service import parse_math_step
from app.services.equivalence_check_service import check_step_validity_algebraic

def check_steps(steps):
    """
    Validate each step in a sequence of mathematical transformations.
    Handles \\pm notation by checking both branches.
    """
    results = []
    
    # Normalize and parse first step
    normalized_steps = [normalize_logs(step) for step in steps]
    prev_eqs = parse_math_step(normalized_steps[0])
    
    # Check if parsing was successful
    if prev_eqs and len(prev_eqs) > 0 and prev_eqs[0] is not None:
        parsed_str = str(prev_eqs[0])
    else:
        parsed_str = "Failed"
    
    results.append({
        "step": steps[0],
        "valid": True,
        "comment": "Initial equation",
        "branches": len(prev_eqs) if prev_eqs else 0,
        "parsed": parsed_str
    })

    error_found = False

    for i in range(1, len(normalized_steps)):
        if error_found:
            results.append({
                "step": steps[i],
                "valid": False,
                "comment": "Previous error: cannot validate this step",
                "branches": 0,
                "parsed": "Skipped"
            })
            continue

        curr_eqs = parse_math_step(normalized_steps[i])
        
        # Check if parsing was successful
        if not curr_eqs or len(curr_eqs) == 0 or curr_eqs[0] is None:
            results.append({
                "step": steps[i],
                "valid": False,
                "comment": "Parsing failed",
                "branches": 0,
                "parsed": "Failed"
            })
            error_found = True
            continue

        valid = check_step_validity_algebraic(prev_eqs, curr_eqs)
        
        comment = "Valid algebraic transformation"
        if not valid:
            comment = "Invalid transformation - equations are not equivalent"
        if len(curr_eqs) > 1:
            comment += f" (checking {len(curr_eqs)} branches)"
        
        results.append({
            "step": steps[i],
            "valid": valid,
            "comment": comment,
            "branches": len(curr_eqs),
            "parsed": str(curr_eqs[0]) if curr_eqs and len(curr_eqs) > 0 else "Failed"
        })

        if not valid:
            error_found = True
        else:
            prev_eqs = curr_eqs

    return results