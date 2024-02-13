
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


(function(){
  const str = `
Mapa{
  Body(       src: "logo.png"  ;   use: 12  )
}
  `;


  const rules = {
    main:{
      match: /\s*([A-Za-z]+)\s*/,
      onMatch({textGroup}){

        return ["brac",textGroup[1]]
      }
    },
    brac:{
      match: /\{|\(/,
      onMatch({textGroup,text}){
        if (text == "{") {
          return ["main",text]
        }
        return ["attr",text]
      }
    },
    attr:{
      match: /\s*([a-zA-Z]+):\s*/,
      onMatch({textGroup,text}){
          return ["attrValue",textGroup[1]]
      }
    },
    attrValue:{
      match: /\s*([0-9]+|"[^"]*"|;|\))\s*/,
      onMatch({textGroup,text}){
        if (text == ";") {
          return ["attr",textGroup[1]]
          
        }
        if (text == ")") {
          return ["verify",textGroup[1]]
          
        }
        return ["attrValue",textGroup[1]]
      }
    },verify:{
      match: /\s*([0-9]+|"[^"]*"|;|\))\s*/,
      onMatch({textGroup,text}){
        if (text == ";") {
          return ["attr",textGroup[1]]
          
        }
        if (text == ")") {
          return ["verify",textGroup[1]]
          
        }
        return ["attrValue",textGroup[1]]
      }
    }
  }
  const tokends: string[] = []
  const tokenizer = new TextRegExp(str)

  let go = "main"

  for (let index = 0; index < 20; index++) {
    if (!rules[go]) {
      console.log("sigiente no encontrado")
      break
    }
    const result = tokenizer.findNextMatch(rules[go].match)
    if (result) {
      let [goi,m] = rules[go].onMatch(result) ?? []
      tokends.push(m)
      go = goi
    }else{
      console.log("Error: syntax error",rules[go].match)
      break;
    }
  }
  console.log(tokends)
})();