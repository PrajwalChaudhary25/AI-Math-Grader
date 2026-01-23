from sympy import Eq, symbols, simplify, expand, solve, logcombine, expand_log

def is_equation(obj):
    """Check if an object is a SymPy equation (Eq)."""
    return isinstance(obj, Eq)

def equations_equivalent(eq1, eq2, variable=None):
    """
    Check if two equations are algebraically equivalent.
    This means: eq1 ⟺ eq2 (one can be derived from the other).
    Handles logarithm properties and algebraic transformations.
    """
    if variable is None:
        variable = symbols('x')
    
    try:
        # If both are equations, check if their difference simplifies to 0
        if is_equation(eq1) and is_equation(eq2):
            # Method 1: Direct simplification check
            diff1 = eq1.lhs - eq1.rhs
            diff2 = eq2.lhs - eq2.rhs
            
            # Expand both differences to handle cases like x(x-4) vs x*x-4*x
            diff1_expanded = expand(diff1)
            diff2_expanded = expand(diff2)
            
            # Check if expanded forms are equal
            difference = expand(diff1_expanded - diff2_expanded)
            simplified = simplify(difference)
            
            if simplified == 0:
                return True
            
            # Method 2: Try expanding logarithms and checking again
            # Apply log properties: log(a) + log(b) = log(a*b)
        
            
            try:
                # Combine logarithms on both sides
                lhs1_combined = logcombine(eq1.lhs, force=True)
                rhs1_combined = logcombine(eq1.rhs, force=True)
                lhs2_combined = logcombine(eq2.lhs, force=True)
                rhs2_combined = logcombine(eq2.rhs, force=True)
                
                # Expand the arguments inside logarithms
                lhs1_combined = expand(lhs1_combined)
                rhs1_combined = expand(rhs1_combined)
                lhs2_combined = expand(lhs2_combined)
                rhs2_combined = expand(rhs2_combined)
                
                # Check if combined forms are equivalent
                diff1_combined = expand(lhs1_combined - rhs1_combined)
                diff2_combined = expand(lhs2_combined - rhs2_combined)
                
                difference_combined = expand(diff1_combined - diff2_combined)
                simplified_combined = simplify(difference_combined)
                
                if simplified_combined == 0:
                    return True
                    
                # Also try expanding logs
                lhs1_expanded = expand_log(eq1.lhs, force=True)
                rhs1_expanded = expand_log(eq1.rhs, force=True)
                lhs2_expanded = expand_log(eq2.lhs, force=True)
                rhs2_expanded = expand_log(eq2.rhs, force=True)
                
                # Expand algebraically
                lhs1_expanded = expand(lhs1_expanded)
                rhs1_expanded = expand(rhs1_expanded)
                lhs2_expanded = expand(lhs2_expanded)
                rhs2_expanded = expand(rhs2_expanded)
                
                diff1_expanded = lhs1_expanded - rhs1_expanded
                diff2_expanded = lhs2_expanded - rhs2_expanded
                
                difference_expanded = expand(diff1_expanded - diff2_expanded)
                simplified_expanded = simplify(difference_expanded)
                
                if simplified_expanded == 0:
                    return True
                    
            except Exception as e:
                print(f"Log expansion error: {e}")
            
            # Method 3: Check if one equation can be obtained by multiplying/factoring the other
            # This handles cases like x² - 4x = 25 ⟺ x² - 4x - 25 = 0
            if diff2_expanded != 0:
                try:
                    ratio = simplify(diff1_expanded / diff2_expanded)
                    if ratio.is_number and ratio != 0:
                        return True
                except:
                    pass
            return False
        # Handle cases where both inputs are expressions (not equations)
        elif not is_equation(eq1) and not is_equation(eq2):
            # Both are expressions, compare them directly
            diff = expand(eq1 - eq2)
            simplified = simplify(diff)
            
            if simplified == 0:
                return True
            
            # Try with log operations
            try:
                expr1_combined = expand(logcombine(eq1, force=True))
                expr2_combined = expand(logcombine(eq2, force=True))
                
                if simplify(expr1_combined - expr2_combined) == 0:
                    return True
                
                expr1_expanded = expand(expand_log(eq1, force=True))
                expr2_expanded = expand(expand_log(eq2, force=True))
                
                if simplify(expr1_expanded - expr2_expanded) == 0:
                    return True
            except:
                pass
            
        return False
        
    except Exception as e:
        print(f"Error checking equivalence: {e}")
        return False


def check_step_validity_algebraic(prev_eqs, curr_eqs):
    """
    Checks if current equation(s) can be algebraically derived from previous equation(s).
    Handles multiple solutions from \\pm notation.
    """
    x = symbols('x')
    
    try:
        # If we have multiple branches, check if at least one valid transformation exists
        for prev_eq in prev_eqs:
            for curr_eq in curr_eqs:
                if equations_equivalent(prev_eq, curr_eq, x):
                    return True
        
        # Also check solution set equivalence as a fallback
        prev_solutions = set()
        for eq in prev_eqs:
            if is_equation(eq):
                try:
                    sols = solve(eq, x)
                    if isinstance(sols, list):
                        prev_solutions.update(sols)
                    else:
                        prev_solutions.add(sols)
                except:
                    pass
        
        curr_solutions = set()
        for eq in curr_eqs:
            if is_equation(eq):
                try:
                    sols = solve(eq, x)
                    if isinstance(sols, list):
                        curr_solutions.update(sols)
                    else:
                        curr_solutions.add(sols)
                except:
                    pass
        
        # Check if solution sets match
        if prev_solutions and curr_solutions:
            # Must have same number of solutions
            if len(prev_solutions) != len(curr_solutions):
                return False
                
            # Check if every solution in prev_solutions matches some solution in curr_solutions
            for ps in prev_solutions:
                found_match = False
                for cs in curr_solutions:
                    try:
                        diff = simplify(ps - cs)
                        # Handle both numeric and symbolic comparisons
                        if hasattr(ps, 'is_number') and hasattr(cs, 'is_number'):
                            if ps.is_number and cs.is_number:
                                if abs(diff) < 1e-10:
                                    found_match = True
                                    break
                        if diff == 0:
                            found_match = True
                            break
                    except:
                        pass
                
                if not found_match:
                    return False
            
            return True
        
        return False
        
    except Exception as e:
        print(f"Error in validity check: {e}")
        return False