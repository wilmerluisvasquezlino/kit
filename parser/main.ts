function Color(h: number, s: number, l: number) {
  return `hsl(${h},${s}%,${l}%)`;
}

class TextRegExp {
  text: string;
  lastIndex: number;
  isEndOfText: boolean;
  collection: { token: string; value: string }[];
  constructor(text: string) {
    this.text = text;
    this.lastIndex = 0;
    this.isEndOfText = false;
    this.collection = [];
  }
  next(regexp: string | RegExp): RegExpExecArray | null {
    const searchRegex = new RegExp(regexp, "dy");
    searchRegex.lastIndex = this.lastIndex;
    const result = searchRegex.exec(this.text);
    if (!result) return null;
    this.lastIndex = searchRegex.lastIndex;
    this.isEndOfText = this.lastIndex == this.text.length;
    return result;
  }
  findNextMatch(regex) {
    const result = this.next(regex);
    if (!result) return null;
    const captureIndices = result.indices.map(([start, end], i) => {
      return {
        index: start,
        start: start - result.index,
        end: end - result.index,
        length: end - start,
        match: result[i],
      };
    });
    return { index: result.index, text: result[0], captureIndices };
  }
  findNextWithGroupNames(
    regex: RegExp | string,
    matchCaptures: Record<number, string>
  ) {
    const result = this.findNextMatch(regex);
    if (!result) return null;

    const text = result.text.split("");
    const keys = text.map(() => "");

    Object.entries(matchCaptures).forEach(([group, name]) => {
      const { start, end } = result.captureIndices[group] ?? {
        start: 0,
        end: 0,
      };

      keys.fill(name, start, end);
    });

    if (text.length === 0) return [];

    const data: { token: string; value: string }[] = [
      { token: keys[0], value: text[0] },
    ];

    for (let i = 1; i < keys.length; i++) {
      const token = keys[i];

      if (data[data.length - 1].token === token) {
        data[data.length - 1].value += text[i];
        continue;
      }

      data.push({ token, value: text[i] });
    }

    this.collection.push(...data);
    return { groupedByToken: data };
  }
  log() {
    console.log(this.collection);
  }
  getGroupedByLine() {
    let cfg = [[]];
    this.collection.forEach(({ token, value }) => {
      value = value.split(/(?=\n)|(?<=\n)/);
      value.forEach((text) => {
        if (text === "\n") {
          cfg.push([]);
          return;
        }
        cfg[cfg.length - 1].push({ token, value: text });
      });
    });
    return cfg;
  }
  getHTMLRow() {
    return this.getGroupedByLine().map((tokends) => {
      if (tokends.length < 1) {
        return `<div><span>&nbsp;</span></div>`;
      }
      return `<div>${tokends
        .map(({ token, value }) => {
          value = value.replaceAll(" ", "&nbsp;");
          return `<span style="color: ${token}">${value}</span>`;
        })
        .join("")}</div>`;
    });
  }
}

const text = `const count = "manitos en la vida" 

  {name:look}
`;

const analiser = new TextRegExp(text);
analiser.findNextWithGroupNames(/(const) ([a-z]+) (=)\s*/, {
  1: Color(326, 100, 74),
  2: Color(265, 89, 78),
  3: Color(265, 89, 78),
});
analiser.findNextWithGroupNames(/"([^"]*)"/, {
  0: Color(65, 92, 76),
});

analiser.findNextWithGroupNames(/\s+/, {
  0: Color(65, 92, 76),
});

analiser.findNextWithGroupNames(/.+/, {
  0: Color(65, 92, 76),
});

console.log("🟢", analiser.getHTMLRow());

// export default class Syntax {
//   parser: TextRegExp;
//   rules: Record<string, any>;
//   constructor(text: string, rules: {}) {
//     this.parser = new TextRegExp(text);
//     this.rules = rules;
//   }
//   compile() {
//     let resultado = [];
//     let state: string[] = ["main"];

//     while (!this.parser.isEndOfText) {
//       let se = false;

//       for (let { match, name } of this.rules[state[0]]) {
//         let result = this.parser.next(match);
//         if (!result) continue;

//         let namedt = namedGroupsy(result, name);

//         resultado.push(...namedt);
//         se = true;
//         break;
//       }

//       if (se) continue;
//       let result = this.parser.next(".|s|\n|\r")!;
//       let namedy = { name: "", value: result[0] };
//       resultado.push(namedy);
//     }

//     return resultado;
//   }
// }
type Selectores =
  | "comment"
  | "comment.line"
  | "comment.block"
  | "comment"
  | "constant"
  | "entity"
  | "invalid"
  | "keyword"
  | "markup"
  | "meta"
  | "storage"
  | "string"
  | "support"
  | "variable";
type TextMateGramars = {
  scopeName: string;
  fileTypes?: string[];
  foldingStartMarker?: string;
  foldingStopMarker?: string;
  firstLineMatch?: RegExp;
  patterns: {
    name?: string;
    contentName?: string;
    match?: string | RegExp;
    begin?: string | RegExp;
    end?: string | RegExp;
    captures?: Record<number, Selectores>;
    beginCaptures?: Record<number, Selectores>;
    endCaptures?: Record<number, Selectores>;
    include?: string;
  }[];
  repository?: Record<string, TextMateGramars>;
};
const tmGramars: TextMateGramars[] = [];
tmGramars.push({
  scopeName: "source.js",
  patterns: [
    {
      name: "keyword.control",
      match: /\b(if|while|for|return)\b/,
      captures: {
        0: "comment",
      },
    },
    {
      name: "string.quoted.double",
      begin: /"/,
    },
  ],
});






