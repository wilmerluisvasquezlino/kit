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

    const searchRegex = new RegExp(regexp, "dym") ;
    searchRegex.lastIndex = this.column;

    const result = searchRegex.exec(this.text[this.line]) as RegExpExecArrayWithIndices | null;

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
    matchCaptures: Record<number, string>
  ) {
    const result = this.findNext(regex);
    if (!result) return null;
    console.log(result);
    const text = result[0].split("");
    const keys = text.map(() => "");

    Object.entries(matchCaptures).forEach(([group, name]) => {
      const [start, end] = result.indices[group] ?? [0, 0];

      keys.fill(name, start, end);
    });


    if (text.length === 0) return [];

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

    return data;
  }
}

const a = new TextScanner(`VScode:dark(size: 12){

}`);

const d =a.findNextWithGroupNames(/[A-Z][a-zA-Z]+(\.|:)([a-z]+)/, {
  1: "punctuation",
  2: "prefix",
});
console.log(d)