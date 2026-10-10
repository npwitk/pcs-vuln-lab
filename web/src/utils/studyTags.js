// Selection logic for nested study tags (up to three levels, e.g. faculty ->
// program -> track), shared by the student picker and the admin course list.
// A selection keeps only the most specific tags, like the server does
// (server/services/studyTags.js normalizeTagIds): picking the AI track under
// CPE stores AI alone, and CPE shows as selected because of it.

// tree: [{ tag_id, children: [...] }] -> lookups.
export function indexTagTree(tree) {
  const parentOf = new Map();
  const childrenOf = new Map();
  const walk = (nodes, parentId) => {
    for (const node of nodes) {
      parentOf.set(node.tag_id, parentId);
      childrenOf.set(node.tag_id, (node.children || []).map(child => child.tag_id));
      walk(node.children || [], node.tag_id);
    }
  };
  walk(tree || [], null);
  return { parentOf, childrenOf };
}

function descendants(index, id) {
  const out = [];
  const stack = [...(index.childrenOf.get(id) || [])];
  while (stack.length) {
    const next = stack.pop();
    out.push(next);
    stack.push(...(index.childrenOf.get(next) || []));
  }
  return out;
}

function ancestors(index, id) {
  const out = [];
  for (let p = index.parentOf.get(id); p; p = index.parentOf.get(p)) out.push(p);
  return out;
}

// Selected itself, or through one of its sub-tags.
export function isTagOn(index, value, id) {
  if (value.includes(id)) return true;
  return descendants(index, id).some(d => value.includes(d));
}

// The selection after clicking a tag:
// - turning it on replaces its parent (a track implies its program)
// - turning it off drops it and its sub-tags; if that empties its parent's
//   branch, the parent stays selected on its own (un-picking the last track
//   keeps the program)
export function toggleTag(index, value, id) {
  if (!isTagOn(index, value, id)) {
    const implied = new Set(ancestors(index, id));
    return [...value.filter(v => !implied.has(v)), id];
  }
  const removed = new Set([id, ...descendants(index, id)]);
  const next = value.filter(v => !removed.has(v));
  const parent = index.parentOf.get(id);
  if (parent && !isTagOn(index, next, parent)) next.push(parent);
  return next;
}
