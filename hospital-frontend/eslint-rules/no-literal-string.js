/**
 * Local stand-in for eslint-plugin-i18next's `no-literal-string`.
 *
 * Reports user-facing strings that bypass the translation function:
 *   - JSX text nodes containing words
 *   - placeholder / aria-label / title / alt attribute literals
 *
 * Technical attributes (className, to, href, type, name, id, role, ...) are
 * ignored, as are numbers, punctuation and anything inside a t() call.
 */

const JSX_TEXT_ALLOWLIST = new Set([
  '·', '•', '—', '–', '→', '←', '×', '✓', '*', '/', '|', '-', '+', ':', ',', '.', '?', '!', '&', '%',
]);

const ATTRIBUTES = new Set(['placeholder', 'aria-label', 'title', 'alt', 'aria-description']);

const IGNORED_ATTRIBUTES = new Set([
  'className', 'class', 'style', 'to', 'href', 'src', 'id', 'name', 'type', 'role', 'key',
  'value', 'target', 'rel', 'htmlFor', 'autoComplete', 'inputMode', 'method', 'action', 'accept',
  'pattern', 'form', 'as', 'variant', 'size', 'color', 'fill', 'stroke', 'width', 'height',
  'viewBox', 'xmlns', 'data-testid', 'aria-hidden', 'aria-haspopup', 'aria-expanded',
  'aria-controls', 'aria-selected', 'aria-live', 'aria-current', 'aria-modal', 'aria-invalid',
  'aria-describedby', 'aria-labelledby', 'lang', 'dir', 'encoding', 'dateTime', 'srcSet',
]);

const looksLikeSentence = (value) => {
  const text = value.trim();
  if (!text) return false;
  if (JSX_TEXT_ALLOWLIST.has(text)) return false;
  if (/^[\d\s.,:%/+-]+$/.test(text)) return false;
  if (!/[A-Za-zÀ-ÿ]{2,}/.test(text)) return false;
  // A bare 1-2 letter token such as "Dr" or "EN" is data, not prose.
  if (/^[A-Za-zÀ-ÿ]+$/.test(text) && text.length <= 2) return false;
  return true;
};

const isTranslated = (node) => {
  let current = node.parent;
  while (current) {
    if (current.type === 'CallExpression') {
      const callee = current.callee;
      const name = callee?.name ?? callee?.property?.name;
      if (name === 't' || name === 'tStatus') return true;
    }
    if (current.type === 'JSXAttribute' && IGNORED_ATTRIBUTES.has(current.name?.name)) return true;
    current = current.parent;
  }
  return false;
};

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded user-facing strings; use the translation function instead.',
    },
    schema: [
      {
        type: 'object',
        properties: { allowlist: { type: 'array', items: { type: 'string' } } },
        additionalProperties: false,
      },
    ],
    messages: {
      literal: 'Hardcoded user-facing string "{{text}}". Wrap it in t(\'someKey\').',
    },
  },

  create(context) {
    const allowlist = new Set(context.options[0]?.allowlist ?? []);

    const report = (node, text) => {
      const trimmed = text.trim();
      if (allowlist.has(trimmed)) return;
      if (!looksLikeSentence(trimmed)) return;
      if (isTranslated(node)) return;
      context.report({ node, messageId: 'literal', data: { text: trimmed.slice(0, 40) } });
    };

    return {
      JSXText(node) {
        report(node, node.value);
      },

      JSXAttribute(node) {
        const name = node.name?.name;
        if (!name || IGNORED_ATTRIBUTES.has(name) || !ATTRIBUTES.has(name)) return;

        if (node.value?.type === 'Literal' && typeof node.value.value === 'string') {
          report(node.value, node.value.value);
          return;
        }

        if (node.value?.type === 'JSXExpressionContainer') {
          const expression = node.value.expression;
          if (expression?.type === 'Literal' && typeof expression.value === 'string') {
            report(expression, expression.value);
          }
        }
      },

      'JSXExpressionContainer > Literal'(node) {
        if (typeof node.value !== 'string') return;
        const attribute = node.parent?.parent;
        if (attribute?.type === 'JSXAttribute') return;
        report(node, node.value);
      },
    };
  },
};

export default {
  meta: { name: 'i18n' },
  rules: {
    'no-literal-string': rule,
  },
};
