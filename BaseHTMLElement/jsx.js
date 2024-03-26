export default function (input, opts = {}) {
    return parser(tokenizer(input), opts);
}


const parser = (tokens, opts = {}) => {
    let nodes = [];
    let current = 0;
    let token = tokens[current];

    const parseProps = () => {
        let props = {};
        let key = null;
        let last = null;

        while (current < tokens.length && token.type != 'endTag' && token.type != 'closeTag') {
            if (last && token.type === 'word') {
                props[last] = true;
                last = token.value;
            } else if (!key && token.type === 'word') {
                last = token.value;
            } else if (last && token.type === 'equals') {
                key = last;
                last = null;
            } else if (key && token.type === 'code') {
                if (opts.clbEval) {
                    props[key] = opts.clbEval(token.value);
                    // props[key] = eval(`(()=>{ return ${token.value}})()`);
                } else {
                    props[key] = token.value;
                }
                key = null;
                last = null;
            } else if (key && (token.type === 'number' || token.type === 'text' || token.type === 'boolean')) {
                props[key] = token.value;
                key = null;
                last = null;
            } else {
                throw `Invalid property value: ${key}=${token.value}`;
            }
            token = tokens[++current];
        }
        if (last) props[last] = true;
        return props;
    }

    const genNode = (tagType) => {
        token = tokens[++current];
        return {
            type: tagType,
            props: parseProps(),
            children: getChildren(tagType)
        };
    };

    const getChildren = (tagType) => {
        let children = [];
        while (current < tokens.length) {
            if (token.type === 'endTag') {
                if (token.value && token.value !== tagType) {
                    throw `Invalid closing tag: ${token.value}. Expected closing tag of type: ${tagType}`
                } else {
                    break;
                }
            }
            if (token.type === 'openTag') {
                children.push(genNode(token.value));
            } else if (token.type === 'text') {
                // if (token.value[0] === '{' && token.value[token.value.length - 1] === '}') {
                //     children.push(opts.clbEval(token.value.substring(1, token.value.length - 1)));
                // } else
                    children.push(token.value);
            }
            token = tokens[++current];
        }
        return children;
    }

    const result = getChildren();
    if (result.length === 1) return result[0];
    return result;
};

const WHITESPACE = /(\s|\t|\n|\r)/g;
const NUMBERS = /[0-9]/;
const NAME = /[0-9a-zA-Z_\.-]/;

const tokenizer = (input) => {
    let tokens = [];
    let current = 0;
    let inTag = false;

    while (current < input.length) {
        let char = input[current];

        const getToken = function (regex) {
            let value = '';
            while (regex.test(char) && current < input.length) {
                value += char;
                char = input[++current];
            }
            return value;
        }

        const getCode = () => {
            let code = '';
            let braceCount = 1;
            while (braceCount > 0 && current < input.length) {
                char = input[++current];
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
                code += char
            }
            return code.slice(0, -1).trim();
        };

        if (inTag) {
            if (char === '>') {
                inTag = false;
                tokens.push({type: 'closeTag'})
            } else if (char === '/' && input[current + 1] === '>') {
                inTag = false;
                tokens.push({type: 'endTag'})
                current++;
            } else if (char === '=') {
                tokens.push({type: 'equals'});
            } else if (char === '{') {
                tokens.push({
                    type: 'code',
                    value: getCode()
                })
            } else if (WHITESPACE.test(char)) {

            } else if (NUMBERS.test(char)) {
                tokens.push({
                    type: 'number',
                    value: Number(getToken(NUMBERS))
                });
                current--;
            } else if (NAME.test(char)) {
                const word = getToken(NAME);
                if (word === 'true' || word === 'false') {
                    tokens.push({
                        type: 'boolean',
                        value: word === 'true'
                    });
                } else {
                    tokens.push({
                        type: 'word',
                        value: word
                    });
                }
                current--;
            } else if (char === '\'') {
                char = input[++current]
                tokens.push({
                    type: 'text',
                    value: getToken(/[^\']/)
                });
            } else if (char === '"') {
                char = input[++current]
                tokens.push({
                    type: 'text',
                    value: getToken(/[^\"]/)
                });
            }
        }
        //Not tokenizing a tag definition
        else {
            //End tag
            if (char === '<' && input[current + 1] === '/') {
                char = input[++current]
                char = input[++current]
                tokens.push({
                    type: 'endTag',
                    value: getToken(NAME)
                })
            } else if (char === '<') {
                inTag = true;
                char = input[++current];
                tokens.push({
                    type: 'openTag',
                    value: getToken(NAME)
                })
                current--;
            } else {
                //Handle slush text
                let value = '';
                while (char !== '<' && current < input.length) {
                    value += char;
                    char = input[++current];
                }
                value = value.trim()
                if (value) {
                    tokens.push({
                        type: 'text',
                        value: value
                    });
                }
                current--;
            }
        }
        current++;
    }
    return tokens;
}