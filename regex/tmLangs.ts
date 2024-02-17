import { TextMateGrammars } from "./types";

const RULES: TextMateGrammars[] = [];

RULES.push({
  contentName: "js",
  patterns: [
    {
      name: "comment",
      match: /\/\/.*/,
    },
    {
      name: "keyword",
      match: /\bof|var|import|as|For\b/,
    },
    {
      name: "entity.class",
      match: /[A-Z][a-zA-Z]+/,
    },
    {
      name: "string",
      begin: /"/,
      end: /"/,
      patterns: [
        {
          name: "constant",
          match: /\\./,
        },
      ],
    },

    {
      name: "text",
      match: /[a-z]+/,
    },
    {
      name: "punctuation.definition.block",
      match: /\{|\}/,
    },
    {
      name: "punctuation.definition.parameters",
      match: /\(|\)/,
    },
    {
      match: /((\d+)(\.?)(\d+))([a-z]+)?/,
      captures: {
        2: "number",
        3: "meta.decimal",
        4: "number",
        5: "keyword",
      },
    },
  ],
  repository: {},
});

export default RULES