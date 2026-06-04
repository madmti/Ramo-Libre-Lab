// src/lib/utils/compiler.ts
// ============================================================
// Motor de Parsing DSL para el sistema de reglas académicas
// Recursive Descent Parser — sin dependencias externas
// ============================================================

// ============================================================
// SECCIÓN 1: DEFINICIÓN DEL AST
// ============================================================

/** Nodo hoja: número literal */
export type NumberNode = { type: 'number'; value: number };

/** Nodo hoja: referencia a variable (libre o calculada) */
export type VariableNode = { type: 'variable'; name: string };

/** Nodo de operación binaria: left OP right */
export type BinaryNode = {
	type: 'binary';
	operator: '+' | '-' | '*' | '/' | '**';
	left: ASTNode;
	right: ASTNode;
};

/** Nodo de agrupación explícita con paréntesis — preservado para LaTeX */
export type ParensNode = { type: 'parens'; expression: ASTNode };

/**
 * Nodo de función. Actualmente soportadas: prom(), cada(), escalon().
 * Para extender: agrega el nombre aquí y maneja la evaluación en `evaluateAST()`.
 * Candidatos futuros: sqrt, pow, min, max, round.
 */
export type FunctionNode = {
	type: 'function';
	name: string; // 'prom' | 'cada' | 'escalon' | 'sqrt' | 'pow' | …
	args: ASTNode[];
};

/** Unión de todos los nodos de expresión matemática */
export type ASTNode = NumberNode | VariableNode | BinaryNode | ParensNode | FunctionNode;

// — Statements (declaraciones de línea completa) —

/**
 * Asignación: `PC = prom(C1, C2)` o `NF = PC * 0.6 + Cert * 0.4`
 * Las variables en el `lhs` son "calculadas" y no se exponen como sliders.
 */
export interface AssignmentStatement {
	type: 'assignment';
	/** Variable que se define (lado izquierdo) */
	lhs: string;
	/** Expresión matemática (lado derecho) */
	expression: ASTNode;
	/** Texto original de la línea */
	raw: string;
	/** Etiqueta opcional: `Promedio Controles: PC = prom(C1,C2)` */
	label?: string;
}

/**
 * Restricción / Inecuación: `C1 >= 55`, `prom(C1,C2) <= 70`
 * Soporta: >=, <=, >, <, ==
 */
export interface ConstraintStatement {
	type: 'constraint';
	left: ASTNode;
	operator: '>=' | '<=' | '>' | '<' | '==';
	right: ASTNode;
	raw: string;
	label?: string;
}

/**
 * Dominio de variable: `dominio C1, C2 [0, 100]` o `C1, C2 in [0, 100]`
 * Soporta valores decimales en los límites.
 */
export interface DomainStatement {
	type: 'domain';
	variables: string[];
	min: number;
	max: number;
	raw: string;
}

export type StatementNode = AssignmentStatement | ConstraintStatement | DomainStatement;

// ============================================================
// SECCIÓN 2: TOKENIZADOR (Lexer) - CORREGIDO
// ============================================================

type TokenType = 'number' | 'id' | 'op' | 'comma' | 'lparen' | 'rparen' | 'colon' | 'eof';

interface Token {
	type: TokenType;
	value: string;
}

function tokenize(input: string): Token[] {
	const tokens: Token[] = [];
	// Prioridad estricta al operador doble '**' usando límites alternativos limpios
	const tokenRegex =
		/\s*(?:(\d+(?:\.\d+)?)|(\*\*|>=|<=|==|>|<|[+\-*/])|([a-zA-Z_]\w*)|(,)|(\()|(\))|(:))\s*/y;

	let lastIndex = 0;
	while (lastIndex < input.length) {
		tokenRegex.lastIndex = lastIndex;
		const match = tokenRegex.exec(input);
		if (!match) {
			lastIndex++;
			continue;
		}
		const [, num, op, id, comma, lparen, rparen, colon] = match;
		if (num !== undefined) tokens.push({ type: 'number', value: num });
		else if (op !== undefined) tokens.push({ type: 'op', value: op });
		else if (id !== undefined) tokens.push({ type: 'id', value: id });
		else if (comma !== undefined) tokens.push({ type: 'comma', value: ',' });
		else if (lparen !== undefined) tokens.push({ type: 'lparen', value: '(' });
		else if (rparen !== undefined) tokens.push({ type: 'rparen', value: ')' });
		else if (colon !== undefined) tokens.push({ type: 'colon', value: ':' });
		lastIndex = tokenRegex.lastIndex;
	}
	tokens.push({ type: 'eof', value: '' });
	return tokens;
}

// ============================================================
// SECCIÓN 3: PARSER MATEMÁTICO (Recursive Descent) - REESTRUCTURADO
// ============================================================

function createExpressionParser(tokens: Token[]) {
	let pos = 0;

	const peek = (): Token => tokens[pos];
	const consume = (): Token => tokens[pos++];

	const expectOp = (value: string): Token => {
		const t = tokens[pos];
		if (t.value !== value) throw new Error(`Se esperaba '${value}', se encontró '${t.value}'`);
		return tokens[pos++];
	};

	// primary → NUMBER | FUNC'('args')' | VARIABLE | '('expr')'
	function parsePrimary(): ASTNode {
		const t = peek();

		if (t.type === 'number') {
			consume();
			return { type: 'number', value: parseFloat(t.value) };
		}

		if (t.type === 'id') {
			const name = consume().value;
			if (peek().type === 'lparen') {
				consume(); // '('
				const args: ASTNode[] = [];
				if (peek().type !== 'rparen') {
					args.push(parseExpr());
					while (peek().type === 'comma') {
						consume(); // ','
						args.push(parseExpr());
					}
				}
				expectOp(')');
				return { type: 'function', name, args };
			}
			return { type: 'variable', name };
		}

		if (t.type === 'lparen') {
			consume(); // '('
			const expr = parseExpr();
			expectOp(')');
			return { type: 'parens', expression: expr };
		}

		throw new Error(`Token inesperado: '${t.value}'`);
	}

	// unary → ('-')? primary
	function parseUnary(): ASTNode {
		if (peek().type === 'op' && peek().value === '-') {
			consume();
			const operand = parsePrimary();
			return { type: 'binary', operator: '-', left: { type: 'number', value: 0 }, right: operand };
		}
		return parsePrimary();
	}

	// power → unary ('**' power)?
	// Aislamos el operador evaluando estrictamente contra el token '**' sanitizado
	function parsePower(): ASTNode {
		const left = parseUnary();
		if (peek().type === 'op' && peek().value === '**') {
			consume(); // Consumir '**'
			const right = parsePower(); // Recursión derecha para asociatividad correcta
			return { type: 'binary', operator: '**', left, right };
		}
		return left;
	}

	// mulDiv → power (('*' | '/') power)*
	// Aseguramos que el chequeo de multiplicaciones filtre textualmente operadores simples
	function parseMulDiv(): ASTNode {
		let left = parsePower();
		while (peek().type === 'op' && (peek().value === '*' || peek().value === '/')) {
			const op = consume().value as '*' | '/';
			const right = parsePower();
			left = { type: 'binary', operator: op, left, right };
		}
		return left;
	}

	// addSub → mulDiv (('+' | '-') mulDiv)*
	function parseAddSub(): ASTNode {
		let left = parseMulDiv();
		while (peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
			const op = consume().value as '+' | '-';
			const right = parseMulDiv();
			left = { type: 'binary', operator: op, left, right };
		}
		return left;
	}

	function parseExpr(): ASTNode {
		return parseAddSub();
	}

	return { parseExpr, peek };
}

// Función pública para parsear una sola expresión matemática
export function parseDSL(input: string): ASTNode {
	const tokens = tokenize(input);
	const { parseExpr } = createExpressionParser(tokens);
	return parseExpr();
}

// ============================================================
// SECCIÓN 4: PARSER DE DECLARACIONES (Statement Parser)
// ============================================================

/** Operadores relacionales válidos */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RELATIONAL_OPS = ['>=', '<=', '>', '<', '=='] as const;
type RelationalOp = (typeof RELATIONAL_OPS)[number];

/**
 * Divide una línea en [lado izquierdo, operador relacional, lado derecho].
 * Busca el primer operador relacional de mayor longitud primero (greedy).
 */
function splitOnRelational(line: string): [string, RelationalOp, string] | null {
	// Usamos una regex que capture los operadores relacionales pero ignorando explícitamente los '**'
	// Al buscar '==', nos aseguramos de que no venga precedido ni seguido por otro '*'
	const match = line.match(/(.+?)(>=|<=|(?<!\*External)==(?!\*)|>|<)(.+)/);

	if (match) {
		return [match[1].trim(), match[2] as RelationalOp, match[3].trim()];
	}
	return null;
}

/** Extrae `label:` de una línea si existe. Devuelve [label | undefined, restoDeLinea]. */
function extractLabel(line: string): [string | undefined, string] {
	// La etiqueta puede contener espacios: "Minimo Labs: C1 >= 20"
	// Usamos la primera aparición de ':' que NO sea parte de un operador (sin '=' a continuación)
	const colonIdx = line.indexOf(':');
	if (colonIdx !== -1) {
		// Verificar que el ':' no sea parte de '::' u otra construcción extraña
		const afterColon = line[colonIdx + 1];
		if (afterColon !== ':') {
			const possibleLabel = line.slice(0, colonIdx).trim();
			const rest = line.slice(colonIdx + 1).trim();
			// El label debe ser solo texto (sin operadores relacionales ni '=')
			if (possibleLabel && !/[=<>+\-*/()[\]]/.test(possibleLabel)) {
				return [possibleLabel, rest];
			}
		}
	}
	return [undefined, line];
}

/**
 * Parsea el script completo (string multi-línea) y devuelve un arreglo de StatementNodes.
 * Las líneas vacías y comentarios (`//`) son ignorados.
 */
export function parseScript(script: string): StatementNode[] {
	if (!script?.trim()) return [];

	const lines = script
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l.length > 0 && !l.startsWith('//'));

	const statements: StatementNode[] = [];

	for (const originalLine of lines) {
		try {
			const stmt = parseLine(originalLine);
			if (stmt) statements.push(stmt);
		} catch {
			// Línea inválida → la ignoramos silenciosamente (robustez para input parcial)
		}
	}

	return statements;
}

function parseLine(line: string): StatementNode | null {
	// — Dominio: `dominio C1, C2 [0, 100]` —
	if (/^dominio\b/i.test(line)) {
		return parseDomainStatement(line);
	}

	// — Dominio alternativo: `C1, C2 in [0, 100]` —
	if (/\bin\s*\[/.test(line)) {
		return parseDomainInStatement(line);
	}

	// — Extraer label opcional —
	const [label, rest] = extractLabel(line);

	// — Asignación: `PC = prom(C1, C2)` (usa `=` simple o `==` sin operador relacional a izquierda) —
	// Detectamos asignación cuando el LHS es un identificador simple y el operador es '=' o '=='
	// Dentro de function parseLine(line: string)
	const assignMatch = rest.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/); // Simplificado a '=' si '==' se maneja como restricción
	if (assignMatch) {
		const lhs = assignMatch[1].trim();
		const rhs = assignMatch[2].trim();

		const isAssignment = !splitOnRelational(rhs);
		if (isAssignment) {
			return {
				type: 'assignment',
				lhs,
				expression: parseDSL(rhs),
				raw: line,
				label
			} satisfies AssignmentStatement;
		}
	}

	// — Restricción / Inecuación —
	const parts = splitOnRelational(rest);
	if (parts) {
		const [leftStr, op, rightStr] = parts;
		return {
			type: 'constraint',
			left: parseDSL(leftStr),
			operator: op,
			right: parseDSL(rightStr),
			raw: line,
			label
		} satisfies ConstraintStatement;
	}

	return null; // No reconocido
}

// — Parsers de dominio —

function parseDomainStatement(line: string): DomainStatement {
	// `dominio C1, C2 [0, 100]`
	const match = line.match(
		/^dominio\s+(.+?)\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]$/i
	);
	if (!match) throw new Error(`Sintaxis de dominio inválida: ${line}`);
	const variables = match[1].split(',').map((v) => v.trim());
	return {
		type: 'domain',
		variables,
		min: parseFloat(match[2]),
		max: parseFloat(match[3]),
		raw: line
	};
}

function parseDomainInStatement(line: string): DomainStatement {
	// `C1, C2 in [0, 100]`
	const match = line.match(/^(.+?)\s+in\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]$/i);
	if (!match) throw new Error(`Sintaxis 'in' de dominio inválida: ${line}`);
	const variables = match[1].split(',').map((v) => v.trim());
	return {
		type: 'domain',
		variables,
		min: parseFloat(match[2]),
		max: parseFloat(match[3]),
		raw: line
	};
}

// ============================================================
// SECCIÓN 5: EVALUADOR
// ============================================================

/**
 * Evalúa un ASTNode de expresión matemática dado un contexto de variables.
 * Para extender con nuevas funciones: agrega un caso en el bloque `case 'function'`.
 */
function evaluateAST(node: ASTNode, context: Record<string, number>): number {
	switch (node.type) {
		case 'number':
			return node.value;

		case 'variable':
			// Si la variable no está en el contexto, retornamos 0 (degradación segura)
			return context[node.name] ?? 0;

		case 'parens':
			return evaluateAST(node.expression, context);

		case 'binary': {
			const l = evaluateAST(node.left, context);
			const r = evaluateAST(node.right, context);
			switch (node.operator) {
				case '+':
					return l + r;
				case '-':
					return l - r;
				case '*':
					return l * r;
				case '/':
					return r !== 0 ? l / r : 0; // División segura
				case '**':
					return Math.pow(l, r);
			}
			break;
		}

		case 'function': {
			const args = node.args.map((a) => evaluateAST(a, context));
			switch (node.name) {
				case 'prom':
					// Promedio aritmético de todos los argumentos
					return args.length > 0 ? args.reduce((a, b) => a + b, 0) / args.length : 0;

				case 'cada':
					// `cada(L1, L2, L3)` — mock estructural.
					// En evaluación simple devuelve el mínimo de los argumentos,
					// lo que semánticamente representa "todos deben cumplir".
					// TODO: Implementar evaluación de restricciones elemento-a-elemento
					// cuando el Statement tenga contexto completo.
					return args.length > 0 ? Math.min(...args) : 0;

				case 'escalon': {
					// Función Escalón Unitaria Pura: 1 si val >= 0, de lo contrario 0
					const val = args[0] ?? 0;
					return val >= 0 ? 1 : 0;
				}

				// — Extensión futura —
				// case 'sqrt': return Math.sqrt(args[0]);
				// case 'min': return Math.min(...args);
				// case 'max': return Math.max(...args);
				// case 'round': return Math.round(args[0]);

				default:
					console.warn(`Función no implementada: ${node.name}`);
					return 0;
			}
		}
	}
	return 0;
}

/**
 * Construye un contexto de evaluación resolviendo las variables calculadas (AssignmentStatements)
 * en orden topológico. Soporta dependencias como `NF = gamma * PC` donde `PC` está definida por
 * otra asignación en el mismo script.
 *
 * @param statements - Lista completa de statements del script
 * @param freeVariables - Valores actuales de las variables libres (desde los sliders)
 */
export function buildEvalContext(
	statements: StatementNode[],
	freeVariables: Record<string, number>
): Record<string, number> {
	// Empezamos con las variables libres del estado global
	const context: Record<string, number> = { ...freeVariables };

	// Obtenemos solo las asignaciones para resolverlas en orden
	const assignments = statements.filter((s): s is AssignmentStatement => s.type === 'assignment');

	// Resolución iterativa: hasta 10 pases para manejar dependencias entre asignaciones
	// (evita implementar un DAG completo para el caso de uso actual)
	const MAX_PASSES = 10;
	for (let pass = 0; pass < MAX_PASSES; pass++) {
		let changed = false;
		for (const stmt of assignments) {
			const newVal = evaluateAST(stmt.expression, context);
			if (context[stmt.lhs] !== newVal) {
				context[stmt.lhs] = newVal;
				changed = true;
			}
		}
		if (!changed) break; // Convergencia alcanzada
	}

	return context;
}

/**
 * Evalúa un Statement completo y devuelve un número o booleano.
 *
 * @param stmt - Cualquier StatementNode
 * @param statements - Lista completa para resolver dependencias
 * @param freeVariables - Variables libres del estado global
 */
export function evaluate(
	stmt: StatementNode,
	statements: StatementNode[],
	freeVariables: Record<string, number>
): number | boolean {
	const context = buildEvalContext(statements, freeVariables);

	switch (stmt.type) {
		case 'assignment':
			return evaluateAST(stmt.expression, context);

		case 'constraint': {
			const l = evaluateAST(stmt.left, context);
			const r = evaluateAST(stmt.right, context);
			switch (stmt.operator) {
				case '>=':
					return l >= r;
				case '<=':
					return l <= r;
				case '>':
					return l > r;
				case '<':
					return l < r;
				case '==':
					return Math.abs(l - r) < 1e-9;
			}
			break;
		}

		case 'domain':
			return true; // Los dominios no producen un valor evaluable
	}
}

/** Evalúa la expresión matemática de un assignment dado el contexto completo. */
export function evaluateExpression(
	node: ASTNode,
	statements: StatementNode[],
	freeVariables: Record<string, number>
): number {
	const context = buildEvalContext(statements, freeVariables);
	return evaluateAST(node, context);
}

// ============================================================
// SECCIÓN 6: EXTRACTORES DE INFORMACIÓN
// ============================================================

/**
 * Devuelve los nombres de las variables "calculadas" (definidas por un AssignmentStatement).
 * Estas variables NO deben tener sliders en la UI.
 */
export function extractCalculatedVars(statements: StatementNode[]): Set<string> {
	return new Set(
		statements.filter((s): s is AssignmentStatement => s.type === 'assignment').map((s) => s.lhs)
	);
}

/**
 * Extrae todas las variables "libres" referenciadas en expressions del script
 * (excluyendo las variables calculadas).
 */
export function extractFreeVariables(statements: StatementNode[]): string[] {
	const calculatedVars = extractCalculatedVars(statements);
	const allVars = new Set<string>();

	function collectFromAST(node: ASTNode) {
		switch (node.type) {
			case 'variable':
				allVars.add(node.name);
				break;
			case 'parens':
				collectFromAST(node.expression);
				break;
			case 'binary':
				collectFromAST(node.left);
				collectFromAST(node.right);
				break;
			case 'function':
				node.args.forEach(collectFromAST);
				break;
		}
	}

	for (const stmt of statements) {
		if (stmt.type === 'assignment') {
			collectFromAST(stmt.expression);
		} else if (stmt.type === 'constraint') {
			collectFromAST(stmt.left);
			collectFromAST(stmt.right);
		}
	}

	// Filtramos las variables calculadas: no deben aparecer como libres
	return Array.from(allVars).filter((v) => !calculatedVars.has(v));
}

/** Mantiene compatibilidad con el código existente */
export function extractVariables(statements: StatementNode[]): string[] {
	return extractFreeVariables(statements);
}

/** Construye el mapa de dominios { varName → { min, max } } */
export function extractDomains(
	statements: StatementNode[]
): Record<string, { min: number; max: number }> {
	const mapa: Record<string, { min: number; max: number }> = {};
	for (const stmt of statements) {
		if (stmt.type === 'domain') {
			for (const v of stmt.variables) {
				mapa[v] = { min: stmt.min, max: stmt.max };
			}
		}
	}
	return mapa;
}

// ============================================================
// SECCIÓN 7: GENERADOR DE LaTeX
// ============================================================

/** Convierte un ASTNode o StatementNode a una cadena LaTeX renderizable con KaTeX. */
export function toLatex(node: ASTNode | StatementNode): string {
	// — Statement completo —
	if ('raw' in node) {
		if (node.type === 'assignment') {
			const label = node.label ? `\\text{${node.label}}: \\;` : '';
			return `${label}\\text{${node.lhs}} = ${toLatex(node.expression)}`;
		}
		if (node.type === 'constraint') {
			const label = node.label ? `\\text{${node.label}}: \\;` : '';
			const l = toLatex(node.left);
			const r = toLatex(node.right);
			const opMap: Record<string, string> = {
				'>=': '\\geq',
				'<=': '\\leq',
				'>': '>',
				'<': '<',
				'==': '='
			};
			return `${label}${l} ${opMap[node.operator]} ${r}`;
		}
		if (node.type === 'domain') {
			return `\\text{${node.variables.join(',\\, ')}} \\in [${node.min},\\, ${node.max}]`;
		}
	}

	// — Expresión matemática pura —
	const ast = node as ASTNode;
	switch (ast.type) {
		case 'number':
			return ast.value.toString();

		case 'variable':
			// Subíndices: C1 → C_{1}, L12 → L_{12}
			return ast.name.replace(/^([A-Za-z_]+)(\d+)$/, '$1_{$2}');

		case 'parens':
			return `\\left(${toLatex(ast.expression)}\\right)`;

		case 'binary': {
			const l = toLatex(ast.left);
			const r = toLatex(ast.right);
			if (ast.operator === '*') return `${l} \\cdot ${r}`;
			if (ast.operator === '/') {
				// Para fracciones, quitamos los paréntesis superfluos (la línea de fracción agrupa visualmente)
				const cleanL = ast.left.type === 'parens' ? toLatex(ast.left.expression) : l;
				const cleanR = ast.right.type === 'parens' ? toLatex(ast.right.expression) : r;
				return `\\dfrac{${cleanL}}{${cleanR}}`;
			}
			if (ast.operator === '**') {
				// Para la base (izquierda), NO removemos los paréntesis si son de tipo 'parens',
				// al contrario, nos aseguramos de que se rendericen con \left( ... \right)
				const baseLatex =
					ast.left.type === 'parens' ? `\\left(${toLatex(ast.left.expression)}\\right)` : l;

				// Para el exponente (derecha), sí podemos limpiar los paréntesis externos si el usuario los puso,
				// ya que al estar en el superíndice ^{...} KaTeX ya los agrupa visualmente arriba.
				const exponenteLatex = ast.right.type === 'parens' ? toLatex(ast.right.expression) : r;

				return `${baseLatex}^{${exponenteLatex}}`;
			}
			return `${l} ${ast.operator} ${r}`;
		}

		case 'function': {
			if (ast.name === 'prom') {
				const sum = ast.args.map(toLatex).join(' + ');
				return `\\dfrac{${sum}}{${ast.args.length}}`;
			}
			if (ast.name === 'cada') {
				// Renderizamos cada() como "∀ args" para claridad visual
				return `\\forall \\left(${ast.args.map(toLatex).join(',\\, ')}\\right)`;
			}
			if (ast.name === 'escalon') {
				// Renderiza estilo theta de Heaviside: \theta(x)
				return `\\theta\\left(${toLatex(ast.args[0])}\\right)`;
			}
			// Función genérica: nombre en texto + args entre paréntesis
			return `\\operatorname{${ast.name}}\\left(${ast.args.map(toLatex).join(',\\, ')}\\right)`;
		}
	}
	return '';
}

// ============================================================
// SECCIÓN 8: UTILIDADES
// ============================================================

/**
 * Determina el `step` apropiado para un input range basado en los límites del dominio.
 * Si alguno de los límites tiene decimales → 0.1; si no → 1.
 */
export function domainStep(min: number, max: number): number {
	const hasDecimals = !Number.isInteger(min) || !Number.isInteger(max);
	return hasDecimals ? 0.1 : 1;
}

/** Clamp: limita `value` al rango [min, max]. */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/** Retorna el nombre para mostrar en la UI de un statement (label → raw). */
export function statementDisplayName(stmt: AssignmentStatement | ConstraintStatement): string {
	return stmt.label ?? stmt.raw;
}
