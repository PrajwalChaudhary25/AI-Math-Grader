from sympy import Eq, symbols, simplify, expand, solve, logcombine, expand_log, nsimplify
from sympy import log as sym_log


def is_equation(obj):
    """Check if an object is a SymPy equation (Eq)."""
    return isinstance(obj, Eq)

# from claude
# very robust code till now
# most useful
# working
# use this
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
            lhs1 = eq1.lhs
            lhs2 = eq2.lhs
            rhs1 = eq1.rhs
            rhs2 = eq2.rhs
            
            # Check RHS match
            rhs_match = simplify(rhs1 - rhs2) == 0
            if not rhs_match:
                try:
                    rhs1_val = expand(simplify(rhs1))
                    rhs2_val = expand(simplify(rhs2))
                    rhs_match = simplify(rhs1_val - rhs2_val) == 0
                except:
                    pass
            
            # Method 0: Handle exponent extraction FIRST (before other methods)
            # Pattern: eq1 is base^expr1 = base^expr2, eq2 is expr1 = expr2
            try:
                # Check if eq1 has exponential form on LHS
                if lhs1.is_Pow:
                    lhs1_base, lhs1_exp = lhs1.as_base_exp()
                    
                    # Try to find a base in eq1.rhs by converting numeric to symbolic
                    # If rhs1 is numeric, try to express it as a power of the same base
                    if rhs1.is_number:
                        try:
                            # Use nsimplify to convert float back to power form if possible
                            rhs1_sym = nsimplify(rhs1)
                            
                            # Check if we can express rhs1 as a power of lhs1_base
                            
                            if lhs1_base > 0 and lhs1_base != 1:
                                # rhs1 = lhs1_base^x implies x = log(rhs1) / log(lhs1_base)
                                rhs_exp_calc = sym_log(rhs1_sym, lhs1_base)
                                rhs_exp_calc = simplify(rhs_exp_calc)
                                
                                # Check if this gives us an integer or simple expression
                                if rhs_exp_calc.is_rational or rhs_exp_calc.is_integer:
                                    # eq1 is a^X = a^Y form
                                    # Check if eq2 is: X = Y
                                    if simplify(lhs2 - lhs1_exp) == 0 and simplify(rhs2 - rhs_exp_calc) == 0:
                                        return True
                                    # Also check reversed: Y = X
                                    if simplify(lhs2 - rhs_exp_calc) == 0 and simplify(rhs2 - lhs1_exp) == 0:
                                        return True
                        except:
                            pass
                    elif rhs1.is_Pow:
                        # Both sides are powers
                        rhs1_base, rhs1_exp = rhs1.as_base_exp()
                        
                        # If bases match
                        if simplify(lhs1_base - rhs1_base) == 0:
                            # For a^X = a^Y, we need X = Y
                            if simplify(lhs2 - lhs1_exp) == 0 and simplify(rhs2 - rhs1_exp) == 0:
                                return True
                            # Also check reversed
                            if simplify(lhs2 - rhs1_exp) == 0 and simplify(rhs2 - lhs1_exp) == 0:
                                return True
                        
            except Exception as e:
                pass
            
            # Method 1: Special handling for logarithmic equations
            # Extract and compare log arguments if both have logs
            if lhs1.has(sym_log) and lhs2.has(sym_log) and rhs_match:
                try:
                    # Combine logs in both expressions
                    lhs1_combined = logcombine(lhs1, force=True)
                    lhs2_combined = logcombine(lhs2, force=True)
                    
                    # Extract argument of the log
                    def get_log_arg(expr):
                        """Get the argument (first arg) of a log expression."""
                        if expr.is_Function and expr.func == sym_log:
                            return expr.args[0] if expr.args else None
                        return None
                    
                    arg1 = get_log_arg(lhs1_combined)
                    arg2 = get_log_arg(lhs2_combined)
                    
                    if arg1 is not None and arg2 is not None:
                        # Fully expand and simplify both arguments
                        arg1_norm = expand(simplify(arg1))
                        arg2_norm = expand(simplify(arg2))
                        
                        # Check if the arguments are equivalent
                        arg_diff = expand(simplify(arg1_norm - arg2_norm))
                        
                        if arg_diff == 0:
                            # Arguments are equivalent and RHS matches
                            return True
                        
                except Exception as e:
                    pass  # Continue to other methods
            
            # Method 2: Direct algebraic equivalence on equation differences
            try:
                diff1 = expand(eq1.lhs - eq1.rhs)
                diff2 = expand(eq2.lhs - eq2.rhs)
                
                # Check if expanded forms are equivalent
                difference = expand(diff1 - diff2)
                simplified = simplify(difference)
                
                if simplified == 0:
                    return True
                
            except Exception:
                pass
            
            # Method 2b: Cross-check (LHS1 vs LHS2, RHS1 vs RHS2)
            # For simplifications like: (a-b) + c = simplified_form
            # where both sides should eventually equal
            try:
                # Simplify and expand all terms
                lhs1_simp = simplify(expand(lhs1))
                lhs2_simp = simplify(expand(lhs2))
                rhs1_simp = simplify(expand(rhs1))
                rhs2_simp = simplify(expand(rhs2))
                
                # Check if LHS of eq1 equals LHS of eq2 (both simplify to same thing)
                if simplify(lhs1_simp - lhs2_simp) == 0:
                    # LHS are equivalent, check RHS
                    if simplify(rhs1_simp - rhs2_simp) == 0:
                        return True
                
                # Also check if the full equations match after simplification
                # (lhs1 - rhs1) should equal (lhs2 - rhs2) when both are simplified
                eq1_simplified = simplify(lhs1_simp - rhs1_simp)
                eq2_simplified = simplify(lhs2_simp - rhs2_simp)
                if simplify(eq1_simplified - eq2_simplified) == 0:
                    return True
                    
            except Exception:
                pass
            
            # Method 3: Check solution equivalence as fallback
            try:
                sols1 = solve(eq1, variable)
                sols2 = solve(eq2, variable)
                
                if sols1 and sols2:
                    # Normalize solution sets
                    sols1_list = [sols1] if not isinstance(sols1, list) else sols1
                    sols2_list = [sols2] if not isinstance(sols2, list) else sols2
                    
                    sols1_simplified = [simplify(s) for s in sols1_list]
                    sols2_simplified = [simplify(s) for s in sols2_list]
                    
                    # Check if solution sets match
                    if len(sols1_simplified) == len(sols2_simplified):
                        all_match = True
                        for s1 in sols1_simplified:
                            found = False
                            for s2 in sols2_simplified:
                                if simplify(s1 - s2) == 0:
                                    found = True
                                    break
                            if not found:
                                all_match = False
                                break
                        if all_match:
                            return True
            except:
                pass

            # Method 4: Handle exponential property: a^X = a^Y → X = Y
            try:               
                # Check if both sides are powers with same base
                lhs1_base = None
                lhs1_exp = None
                lhs2_base = None
                lhs2_exp = None
                
                # Try to extract base and exponent from LHS of eq1
                if lhs1.is_Pow:
                    lhs1_base, lhs1_exp = lhs1.as_base_exp()
                
                # Try to extract base and exponent from LHS of eq2  
                if lhs2.is_Pow:
                    lhs2_base, lhs2_exp = lhs2.as_base_exp()
                
                # If both have same base and RHS match, compare exponents
                if (lhs1_base is not None and lhs2_base is not None and 
                    lhs1_base == lhs2_base and rhs_match):
                    # For a^X = a^Y, we need X = Y
                    exp_diff = simplify(lhs1_exp - lhs2_exp)
                    if exp_diff == 0:
                        return True
                        
            except Exception:
                pass
            
            return False
        else:
            try:
                # First check if one is a log expression and the other is not
                # This prevents false positives like log(...) == 5
                expr1_has_log = eq1.has(sym_log)
                expr2_has_log = eq2.has(sym_log)
                
                # If only one has log, they can't be equivalent unless proven symbolically
                if expr1_has_log != expr2_has_log:
                    # Only check symbolic equivalence, not numerical
                    eq1_sim = simplify(eq1)
                    eq2_sim = simplify(eq2)
                    
                    # Check if simplification removes the difference
                    if simplify(eq1_sim - eq2_sim) == 0:
                        return True
                    
                    # Check numerical equivalence to 2 decimal places
                    try:
                        val1 = float(eq1_sim.evalf())
                        val2 = float(eq2_sim.evalf())
                        
                        # Round to 2 decimal places and compare
                        if round(val1, 2) == round(val2, 2):
                            return True
                    except (TypeError, AttributeError, ValueError):
                        pass
                    
                    # They're structurally different
                    return False
                
                eq1_sol = solve(eq1)
                eq2_sol = solve(eq2)
                if eq1_sol == eq2_sol:
                    return True
                
                eq1_sim = simplify(eq1)
                eq2_sim = simplify(eq2)
                if eq1_sim == eq2_sim:
                    return True
                
                # For logarithm expressions, try expanding with change of base
                if eq1.has(sym_log) or eq2.has(sym_log):
                    try:
                        # Try combining logs and expanding
                        eq1_expanded = expand_log(eq1_sim, force=True)
                        eq2_expanded = expand_log(eq2_sim, force=True)
                        
                        if simplify(eq1_expanded - eq2_expanded) == 0:
                            return True
                        
                        # Try combining in the other direction
                        eq1_combined = logcombine(eq1_sim, force=True)
                        eq2_combined = logcombine(eq2_sim, force=True)
                        
                        if simplify(eq1_combined - eq2_combined) == 0:
                            return True
                            
                    except Exception as log_error:
                        print(f"Log manipulation error: {log_error}")
                
                # Numerical comparison as fallback for logarithmic expressions
                if eq1_sol and eq2_sol:
                    try:
                        # Normalize to lists
                        sols1_list = eq1_sol if isinstance(eq1_sol, list) else [eq1_sol]
                        sols2_list = eq2_sol if isinstance(eq2_sol, list) else [eq2_sol]
                        
                        # Check if same number of solutions
                        if len(sols1_list) == len(sols2_list):
                            all_match = True
                            for s1 in sols1_list:
                                found = False
                                for s2 in sols2_list:
                                    try:
                                        # Evaluate numerically
                                        num1 = complex(s1.evalf())
                                        num2 = complex(s2.evalf())
                                        
                                        # Round to 2 decimal places for comparison
                                        num1_rounded = round(num1.real, 2) + round(num1.imag, 2) * 1j
                                        num2_rounded = round(num2.real, 2) + round(num2.imag, 2) * 1j
                                        
                                        if num1_rounded == num2_rounded:
                                            found = True
                                            break
                                    except (TypeError, AttributeError, ValueError):
                                        # Try symbolic comparison as backup
                                        if simplify(s1 - s2) == 0:
                                            found = True
                                            break
                                
                                if not found:
                                    all_match = False
                                    break
                            
                            if all_match:
                                return True
                                
                    except Exception as eval_error:
                        print(f"Numerical evaluation error: {eval_error}")
                
                # Try direct numerical comparison ONLY if both are the same type
                # (both have logs or both don't have logs)
                if expr1_has_log == expr2_has_log:
                    try:
                        diff = simplify(eq1_sim - eq2_sim)
                        
                        # Only do numerical comparison if diff is a number
                        if diff.is_number:
                            diff_val = complex(diff.evalf())
                            # Check if rounded difference is zero (to 2 decimal places)
                            if round(abs(diff_val), 2) == 0:
                                return True
                                
                    except Exception as diff_error:
                        print(f"Difference evaluation error: {diff_error}")
                    
            except Exception as e:
                print(f"Solution comparison error: {e}")

                
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
    y = symbols('y')
    
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
