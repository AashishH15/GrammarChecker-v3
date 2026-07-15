import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const grammarPluginKey = new PluginKey("grammarHighlight");

// Walks the document and produces the plain text we send to the grammar
// backend along with a map from each text offset back to a ProseMirror
// position. The two must be built together so the offsets LanguageTool
// returns line up exactly with where we draw the squiggles.
export function buildTextWithMap(doc) {
  let text = "";
  const map = [];

  doc.descendants((node, pos) => {
    if (node.isText) {
      for (let i = 0; i < node.text.length; i++) {
        map[text.length] = pos + i;
        text += node.text[i];
      }
      return true;
    }
    // Put a newline between block boundaries so words from separate
    // paragraphs don't get glued together and flagged as errors.
    if (node.isTextblock && text.length > 0) {
      map[text.length] = pos;
      text += "\n";
    }
    return true;
  });

  return { text, map };
}

function decorationsFromMatches(doc, matches, map) {
  const decorations = [];
  for (const match of matches) {
    const from = map[match.offset];
    const lastCharPos = map[match.offset + match.length - 1];
    if (from == null) {
      continue;
    }
    const to = (lastCharPos ?? from) + 1;
    decorations.push(
      Decoration.inline(
        from,
        to,
        { class: "lex-error", "data-error-id": String(match.id) },
        { id: match.id },
      ),
    );
  }
  return DecorationSet.create(doc, decorations);
}

export function applyGrammarDecorations(editor, matches, map) {
  const decorations = decorationsFromMatches(editor.state.doc, matches, map);
  const tr = editor.state.tr.setMeta(grammarPluginKey, { decorations });
  editor.view.dispatch(tr);
}

export function clearGrammarDecorations(editor) {
  const tr = editor.state.tr.setMeta(grammarPluginKey, {
    decorations: DecorationSet.empty,
  });
  editor.view.dispatch(tr);
}

// Finds where a given error currently sits in the document. We look it up by
// id from the live decoration set so the range stays correct even if earlier
// edits or applied fixes have shifted everything around.
export function findErrorRange(editor, id) {
  const set = grammarPluginKey.getState(editor.state);
  if (!set) {
    return null;
  }
  const found = set.find().find((deco) => deco.spec && deco.spec.id === id);
  if (!found) {
    return null;
  }
  return { from: found.from, to: found.to };
}

export function applySuggestion(editor, id, replacement) {
  const range = findErrorRange(editor, id);
  if (!range) {
    return;
  }
  editor
    .chain()
    .focus()
    .insertContentAt({ from: range.from, to: range.to }, replacement)
    .command(({ tr, dispatch }) => {
      if (dispatch) {
        tr.setMeta(grammarPluginKey, { removeId: id });
      }
      return true;
    })
    .run();
}

export const GrammarHighlight = Extension.create({
  name: "grammarHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: grammarPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, old) {
            const meta = tr.getMeta(grammarPluginKey);
            if (meta && meta.decorations) {
              return meta.decorations;
            }
            let set = old.map(tr.mapping, tr.doc);
            if (meta && meta.removeId != null) {
              const gone = set
                .find()
                .filter((deco) => deco.spec && deco.spec.id === meta.removeId);
              set = set.remove(gone);
            }
            return set;
          },
        },
        props: {
          decorations(state) {
            return grammarPluginKey.getState(state);
          },
        },
      }),
    ];
  },
});
