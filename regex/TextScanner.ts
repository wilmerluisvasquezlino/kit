import RULES from "./tmLangs";
import type {
  Collection,
  RegExpExecArrayWithIndices,
  ScopeNames,
  State,
  TextMateGrammarsPatterns,
} from "./types";

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

        // if (this.text[this.line]) {
        //   if (this.text[this.line].length === 0) {
        //     this.line+=1
        //   }
        // }
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
    if (text.length === 0)
      return { line, groups: [{ name, content: "" }] };

    Object.entries(matchCaptures).forEach(([group, name]) => {
      const [start, end] = result.indices[Number(group)] ?? [0, 0];

      keys.fill(name, start - result.index, end - result.index);
    });

    // agrupamiento
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


export function syntaxHig(text:string, lang:string) {
  const textToBeAnalyzed = new TextScanner(text);
  const patterns = RULES.find((m) => m.contentName === lang);

  if (patterns === undefined) return null;

  const state: State = {
    scope: [patterns.patterns],
    getLast() {
      return this.scope[this.scope.length - 1];
    },
    deleteLast() {
      if (this.scope.length === 1) return null;
      this.scope.pop();
    },
    add(patterns) {
      this.scope.push(patterns);
    },
  };
  const scopeNames: ScopeNames = {
    names: [],
    add(...args:string[]) {
      for (const m of args) {
        this.names.push(m);
      }
    },
    getLast() {
      return this.names[this.names.length-1];
    },
    deleteLast() {
      if (this.names.length > 1) this.names.pop();
    },
  };
  scopeNames.add(patterns.contentName);
  // Rellenando la Coleccion
  const collection: Collection[][] = [];
  for (let ai = 0; ai < textToBeAnalyzed.lines; ai++) {
    collection.push([]);
  }
  // console.log(collection);

  while (!textToBeAnalyzed.isEndOfText) {
    if (textToBeAnalyzed.isEndOfText) {
      break;
    }
    let isFind = false;

    for (const {
      match,
      matchEnd,
      captures,
      begin,
      name,
      end,
      patterns,
    } of state.getLast()) {
      if (matchEnd) {
        const result = textToBeAnalyzed.findNextWithGroupNames(
          matchEnd,
          captures,
          name ?? scopeNames.getLast()
        );
        if (result) {
          scopeNames.deleteLast();
          collection[result.line].push(...result.groups);
          isFind = true;
          state.deleteLast();
          break;
        }
      }
      if (match) {
        const result = textToBeAnalyzed.findNextWithGroupNames(
          match,
          captures,
          name ?? scopeNames.getLast()
        );
        if (result) {
          collection[result.line].push(...result.groups);
          isFind = true;

          break;
        }
      } else {
        if (!begin) break;
        const result = textToBeAnalyzed.findNextWithGroupNames(
          begin,
          captures,
          name
        );
        if (result) {
          scopeNames.add(name ?? '');
          collection[result.line].push(...result.groups);
          isFind = true;

          const copyPatterns: TextMateGrammarsPatterns[] = [];
          if (patterns) {
            copyPatterns.push(...[...patterns]);
          }

          const matchEnd = { matchEnd: end, name };
          copyPatterns.push(matchEnd);

          state.add(copyPatterns);
          break;
        }
      }
    }

    // is Find match
    if (!isFind) {
      const result = textToBeAnalyzed.findNextWithGroupNames(
        /\s+|.|/,
        {},
        scopeNames.getLast()
      )!;
      collection[result.line].push(...result.groups);
    }
  }

  const collection2 = collection.map((line) => {
    let keys = line.map(({ name }) => name);
    let text = line.map(({ content }) => content);

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
  });

  console.log(collection2);
  // return collection;
}

syntaxHig(
  `
HStack( src: " ", alignItems: .center){
  Image( src: "hola que tal \\n \\" hola a todos", alignItems: .center){

  }
  VStack(){
    Girid{ }
  }
}

`,
  "js"
);
