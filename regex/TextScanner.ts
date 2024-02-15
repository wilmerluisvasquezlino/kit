import type { RegExpExecArrayWithIndices } from "./types";

class TextScanner {
  text: string[];
  line: number;
  lines: number;
  lastLineColumn: number;
  column: number;
  isEndOfText: boolean;
  constructor(text: string) {
    this.text = text.split("\n");
    this.column = 0;
    this.line = 0;
    this.lines = this.text.length;
    this.lastLineColumn = this.text[this.text.length - 1].length;
    this.isEndOfText = false;
  }

  findNext(regexp: string | RegExp): RegExpExecArrayWithIndices | null {
    if (this.isEndOfText) {
      throw new Error("¡I'm done !");
    }

    const searchRegex = new RegExp(regexp, "dy");
    searchRegex.lastIndex = this.column;

    const result = searchRegex.exec(
      this.text[this.line]
    ) as RegExpExecArrayWithIndices | null;

    if (result) {
      this.column = searchRegex.lastIndex;
      // console.log(this.line, this.column);

      if (this.line + 1 === this.lines && this.column == this.lastLineColumn) {
        this.isEndOfText = true;
      }

      if (this.column === this.text[this.line].length) {
        this.line += 1;
        this.column = 0;
      }

      return result;
    } else {
      return null;
      // return  `Line: ${this.line + 1}, Column: ${this.column + 1}, Text: ${this.text[
      //     this.line
      //   ].slice(this.column, this.column + 10)}`
      // ;
    }
  }
  findNextWithGroupNames(
    regex: RegExp | string,
    matchCaptures: Record<number, string> = {},
    name: string = ""
  ): { line: number; groups: any[] } | null {
    let line = this.line;
    const result = this.findNext(regex);
    if (!result) return null;
    // console.log(result);
    const text = result[0].split("");
    const keys = text.map(() => name);
    if (result[0] == "12sw") {
      console.log(result);
      console.log(result[0]);
    }
    Object.entries(matchCaptures).forEach(([group, name]) => {
      const [start, end] = result.indices[group] ?? [0, 0];

      keys.fill(name, start - result.index, end - result.index);
    });

    if (text.length === 0) return {};

    const data: { name: string; content: string }[] = [
      { name: keys[0], content: text[0] },
    ];

    for (let i = 1; i < keys.length; i++) {
      const name = keys[i];

      if (data[data.length - 1].name === name) {
        data[data.length - 1].content += text[i];
        continue;
      }

      data.push({ name, content: text[i] });
    }
    return { line, groups: data };
  }
}
interface TextMateGrammars {
  contentName: string;
  patterns: any[];
  repository: Record<string, any>;
}
const RULES: TextMateGrammars[] = [];

RULES.push({
  contentName: "js",
  patterns: [
    {
      match: /([A-Z][a-zA-Z]+)(\.|:)([a-z]+)/,
      captures: {
        1: "entity.class",
        2: "punctuacion",
        3: "method",
      },
    },
    {
      name: "punctuation",
      match: /\(/,
    },
    {
      name: "text",
      match: /[a-z]+/,
    },
    {
      match: /((\d+)(\.?)(\d+))([a-z]+)/,
      captures: {
        2: "number",
        3: 'meta.decimal',
        4: "number",
        5: "prefix",
      },
    },
  ],
  repository: {},
});

const a = new TextScanner(`VScode:dark(size: 12sw){
     34.4sh         wwwwwwwwwwww
}`);

const patterns = RULES.find((m) => m.contentName === "js");
interface Collection {
  name: string;
  content: string;
}
const collection: Collection[][] = [];
for (let ai = 0; ai < a.lines; ai++) {
  collection.push([]);
}
console.log(collection);

for (let index = 0; index < 22; index++) {
  if (a.isEndOfText) {
    break;
  }
  let isFind = false;

  for (const { match, captures, name } of patterns.patterns) {
    const result = a.findNextWithGroupNames(match, captures, name);
    if (result) {
      collection[result.line].push(...result.groups);
      isFind = true;
      break;
    }
  }

  if (!isFind) {
    const result = a.findNextWithGroupNames(/\s+|./, {});
    collection[result.line].push(...result.groups);
  }
}

console.log(collection);
