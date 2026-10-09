# -*- coding: utf-8 -*-
import logging
import math
import re
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger(__name__)

try:
    import sympy as sp
    from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
    SYMPY_AVAILABLE = True
except ImportError:
    SYMPY_AVAILABLE = False
    logger.warning('SymPy not installed in current environment. Using deterministic fallback parser.')

class SymPyVerifier:
    def __init__(self):
        if SYMPY_AVAILABLE:
            self.transformations = standard_transformations + (implicit_multiplication_application,)
        else:
            self.transformations = ()

    def verify_algebraic_equivalence(self, expression_a: str, expression_b: str) -> Tuple[bool, str]:
        if not SYMPY_AVAILABLE:
            return self._deterministic_fallback_equivalence(expression_a, expression_b)
        try:
            clean_a = self._clean_math_str(expression_a)
            clean_b = self._clean_math_str(expression_b)
            expr_a = parse_expr(clean_a, transformations=self.transformations)
            expr_b = parse_expr(clean_b, transformations=self.transformations)
            diff = sp.simplify(expr_a - expr_b)
            is_equivalent = bool(diff == 0)
            feedback = 'Expressions are mathematically equivalent.' if is_equivalent else f'Difference: {diff}'
            return is_equivalent, feedback
        except Exception as e:
            logger.error(f'SymPy equivalence check error: {e}')
            return False, f'Verification failed: {str(e)}'

    def solve_equation(self, equation_str: str, target_var: str = 'x') -> Tuple[bool, List[str]]:
        if not SYMPY_AVAILABLE:
            return False, ['SymPy not installed']
        try:
            var = sp.Symbol(target_var)
            if '=' in equation_str:
                lhs_str, rhs_str = equation_str.split('=', 1)
                lhs = parse_expr(self._clean_math_str(lhs_str), transformations=self.transformations)
                rhs = parse_expr(self._clean_math_str(rhs_str), transformations=self.transformations)
                eq = sp.Eq(lhs, rhs)
            else:
                eq = parse_expr(self._clean_math_str(equation_str), transformations=self.transformations)
            solutions = sp.solve(eq, var)
            formatted_solutions = [str(sp.simplify(sol)) for sol in solutions]
            return True, formatted_solutions
        except Exception as e:
            logger.error(f'SymPy solve equation error: {e}')
            return False, [f'Error: {str(e)}']

    def evaluate_numerical_expression(self, expression_str: str) -> Tuple[bool, float, str]:
        try:
            clean = self._clean_math_str(expression_str)
            if SYMPY_AVAILABLE:
                expr = parse_expr(clean, transformations=self.transformations)
                val = float(expr.evalf())
                return True, val, str(sp.simplify(expr))
            else:
                allowed = set('0123456789+-*/(). ^%')
                if all(c in allowed for c in clean):
                    safe_clean = clean.replace('^', '**')
                    val = float(eval(safe_clean, {'__builtins__': {}}, {}))
                    return True, val, str(val)
                return False, 0.0, 'Unsafe expression'
        except Exception as e:
            return False, 0.0, str(e)

    def _clean_math_str(self, text: str) -> str:
        text = text.strip().replace('$', '')
        text = text.replace(chr(215), '*').replace(chr(247), '/')
        text = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'()/()', text)
        text = re.sub(r'\\sqrt\{([^}]+)\}', r'sqrt()', text)
        return text

    def _deterministic_fallback_equivalence(self, a: str, b: str) -> Tuple[bool, str]:
        ca = self._clean_math_str(a).replace(' ', '')
        cb = self._clean_math_str(b).replace(' ', '')
        if ca == cb:
            return True, 'Identical string representation.'
        return False, 'SymPy required for advanced algebraic equivalence.'

sympy_verifier = SymPyVerifier()
