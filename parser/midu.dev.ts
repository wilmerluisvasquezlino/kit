// class List {
//   mkl: any[];
//   constructor(...items:any[]) {
//     this.mkl = items;
//   }
//   [Symbol.iterator](){
//     return this.match();
//   }
//   *match() {
//     let i = 0
//     for (const iterator of this.mkl) {
//       yield [iterator,i];
//       i++

//     }
//   }
// }

// const frutas = new List("hola","mundo");
// console.log(frutas)

// for (const iterator of frutas) {
//   console.log(iterator);
// }

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
    return {
      index: result.index,
      text: result[0],
      textGroup: Array.from(result),
      captureIndices,
    };
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

// let Python = {
//   tab: 0,
//   value: [],
//   insert(text) {
//     this.value.push(`${" ".repeat(this.tab * 4)}${text}`);
//   },
//   add(i = 1) {
//     this.tab += i;
//   },
//   remove(i = 1) {
//     this.tab -= i;
//   },
// };

// let state = {
//   value: ["main"],
//   getLast() {
//     return this.value[this.value.length - 1];
//   },
//   add(st) {
//     this.value.push(st);
//   },
//   deleteLast() {
//     if (this.value.length > 1) {
//       this.value.pop();
//     }
//   },
// };

// let analizer = new TextPatternAnalyzer(
//   `
// App{
//   Row{
//     Column.center()
//     Input()
//     Input.color()
//   }
//   Grid(){

//   }
// }
// `.trim()
// );

// const define: Record<string, any[]> = {
//   main: [
//     {
//       match: /([A-Z][A-Za-z.]+)\s*(\(|\{)/,
//       onMatch({ text, captureIndices, textGroup }) {
//         const [_, tagName, $2] = textGroup;
//         Python.insert("tagName: " + tagName);
//         if ($2 == "(") {
//           Python.add();
//           state.add("attr");
//         } else {
//           Python.add();
//         }
//       },
//     },
//     {
//       match: /\}/,
//       onMatch({ capturesIndices }) {},
//     },
//   ],
//   attr: [
//     {
//       match: /\)(\{|\n|;)/,
//       onMatch({ captureIndices, textGroup }) {
//         const [_, $1] = textGroup;

//         if (["{"].includes($1)) {
//           state.deleteLast();
//           state.add("main");
//           Python.add();
//         } else {
//           state.deleteLast();
//           state.deleteLast();
//           Python.remove();
//         }
//       },
//     },
//     {
//       match: /[a-zA-Z]+/,
//       onMatch({ captureIndices, textGroup }) {
//         const [$0, $1] = textGroup;
//         Python.insert("attr: " + $0);
//       },
//     },
//   ],
// };

// let i = 0;
// while (i < 20) {
//   let encontrado = false;

//   for (const { match, onMatch } of define[state.getLast()]) {
//     const capture = analizer.findNextMatch(match);
//     if (capture) {
//       onMatch(capture);

//       encontrado = true;
//       break;
//     }
//   }

//   if (encontrado === false) {
//     const capture = analizer.findNextMatch(/\s+|\n|\t/);
//     if (!capture) {
//       console.log("Syntax Error: en el caracter", analizer.lastIndex);
//     }
//   }

//   i++;
// }

// console.log(Python.value.join("\n"));

function flut(array,call:(anterir,actual,sigiente)=>void) {
  for (let i = 1; i < array.length-1; i++) {
    call(array[i-1],array[i],array[i+1])
  }
}
interface RulesToken {
  match: RegExp; 
  token: string
}
interface RulesTokenResult {
  content: string
  token: string
}
function* tokenizer(str: string, rules: RulesToken[]): Generator<RulesTokenResult> {
  let result;
  let textRegex = new TextRegExp(str);

  while (!textRegex.isEndOfText) {
    let itWasFound = false;
    for (const { match, token } of rules) {
      const result = textRegex.findNextMatch(match);
      if (!result) continue;
      itWasFound = true;
      yield { content: result.text, token };
      break;
    }

    if (!itWasFound) break;
  }
}

const rules = [
  {
    match: / *# .+\n/,
    token: "tagName",
  },
  {
    match: / *# .+\n/,
    token: "tagName",
  },
  {
    match: /[A-Za-z.:]+\(/,
    token: "tagName.attr",
  },
  {
    match: /[A-Za-z.:]+\{/,
    token: "tagName",
  },
  {
    match: /[A-Za-z.]+:/,
    token: "nameAttr",
  },
  {
    match: /\(/,
    token: "bracketOpen",
  },
  {
    match: /\)/,
    token: "bracketClose",
  },
  {
    match: /\}/,
    token: "curlyBracessClose",
  },
  {
    match: /\{/,
    token: "curlyBracessOpen",
  },
  {
    match: /,/,
    token: "tagName",
  },
  {
    match: /"[^"]*"/,
    token: "braccesOpen",
  },
  {
    match: / +/,
    token: "space",
  },
  {
    match: /\n/,
    token: "lineBreack",
  },
];

const str = `
App{
  GoogleMaps(123,556){
    @ p:2 m:3 pl:3 w:34
  }
  Row{
    Column:center()
    Input(padding: "Hola Mundo", bild:45rem)
      # Hola a todos como estan amigos
      Parafrase{
        # dineo 
      }
      # amigos los amo
    Input.color() 
  }
  Grid(){

  }
}      `;

const tokends: RulesTokenResult[] = [];
for (let result of tokenizer(str, rules)) {

  tokends.push(result);
}

flut(tokends,(ant,current,next)=>{
  
})
console.log(tokends);

