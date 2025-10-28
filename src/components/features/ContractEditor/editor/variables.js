export const applyVariablesToHtml = (html, values) => {
  if (!values) return html;
  return Object.keys(values).reduce((acc,k)=> acc.replaceAll(`{{${k}}}`, String(values[k] ?? "")), html);
};

export const applyVariablesToBlocks = (blocks, values) =>
  blocks.map(b => {
    if (!b.content) return b;
    return { ...b, content: applyVariablesToHtml(b.content, values) };
  });
