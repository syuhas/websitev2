Prism.languages.python = {
	'comment': {
		pattern: /(^|[^\\])#.*/,
		lookbehind: true,
		greedy: true
	},

	'dbops': /\b(?:filter|query|commit|close|remove|rollback|and_|add|first|one)\b/,

	'builtin': /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|input|int|intern|isinstance|issubclass|iter|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,

	'string-interpolation': {
		pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
		greedy: true,
		inside: {
			'interpolation': {
				// "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
				pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
				lookbehind: true,
				inside: {
					'format-spec': {
						pattern: /(:)[^:(){}]+(?=\}$)/,
						lookbehind: true
					},
					'conversion-option': {
						pattern: /![sra](?=[:}]$)/,
						alias: 'punctuation'
					},
					rest: null
				}
			},
			'bracket': /[{}]/,
			'string': /[\s\S]+/
		}
	},
	'triple-quoted-string': {
		pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
		greedy: true,
		alias: 'string'
	},
	'string': {
		pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
		greedy: true
	},
	'function': {
		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
		lookbehind: true
	},
	'class-name': {
		pattern: /(\bclass\s+)\w+/i,
		lookbehind: true
	},
	'decorator': {
		pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
		lookbehind: true,
		alias: ['annotation', 'punctuation'],
		inside: {
			'punctuation': /\./
		}
	},
	
	'variable': {
		pattern: /^\s*(\w+)\s*(?==)/m,
		lookbehind: false,
		alias: 'variable',
	},

	

	'library': {
		pattern: /\b(?:os|sys|re|json|datetime|time|random|math|numpy|pandas|matplotlib|seaborn|scipy|sklearn|tensorflow|keras|torch|torchvision|cv2|typing|List|Dict|Union|boto3.session|boto3.resource|boto3.client|boto3.s3.transfer|botocore.exceptions|ClientError|boto3|loguru|logger|logging|sqlalchemy.orm|sqlalchemy.ext.declarative|sqlalchemy.ext.declarative.api|sqlalchemy.ext.declarative.base|sqlalchemy.ext.declarative|sqlalchemy|declarative_base|create_engine|select|relationship|scoped_session|sessionmaker|Column|Integer|String|DateTime|ForeignKey|Table|MetaData|create_all|DECIMAL|BigInteger|concurrent.futures|ThreadPoolExecutor|itertools|islice|Exception)\b/,
		alias: 'library',
		greedy: true
	},

	'classcall' : {
		pattern: /([A-Z0-9]+){2,}/g,
		alias: 'classcall',
		greedy: true
	},

	'functioncall': {
		pattern: /([a-zA-Z]+)(?=\()/m,
		alias: 'functioncall',
		greedy: false
	},


	'innerparen': {
		// pattern: /{}()/,
		pattern: /(?<=[(]([^()])*)\(|\)(?=[^()]*[)])/g,
		alias: 'innerparen',
		greedy: true
	},
	// 'innerbracket': {
	// 	// pattern: /{}()/,
	// 	pattern: /(?<=[([{][^([{]*)[\(\[\{]|[\)\]\}](?=[^)\]}]*[)\]}])/m,
	// 	alias: 'paren',
	// 	greedy: true
	// },
	// 'innercurly': {
	// 	// pattern: /{}()/,
	// 	pattern: /(?<=[([{][^([{]*)[\(\[\{]|[\)\]\}](?=[^)\]}]*[)\]}])/m,
	// 	alias: 'paren',
	// 	greedy: true
	// },

	// 'inner-paren': {

	'classdef': /\b(?:class|def)\b/,
	'keyword': /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
	// 'builtin': /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
	'boolean': /\b(?:False|None|True)\b/,
	'number': /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
	'operator': /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
	'punctuation': /[{}[\];(),.:]/
};

Prism.languages.python['string-interpolation'].inside['interpolation'].inside.rest = Prism.languages.python;

Prism.languages.py = Prism.languages.python;
