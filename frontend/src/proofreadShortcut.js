import { Extension } from "@tiptap/core";

// Hijacks Mod-Enter inside the editor so it runs Proofread instead of
// inserting a line break. The actual handler is passed in as an option so it
// always calls back into the latest app state.
export const ProofreadShortcut = Extension.create({
  name: "proofreadShortcut",

  addOptions() {
    return {
      onProofread: () => {},
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Enter": () => {
        this.options.onProofread();
        return true;
      },
    };
  },
});
