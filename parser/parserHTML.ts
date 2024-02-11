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

function textReplace(text: string, rules) {
  let results: string[] = [];
  const analyzer = new TextRegExp(text);

  while (!analyzer.isEndOfText) {
    let isFind = false;
    for (const { match, onMatch } of rules) {
      const result = analyzer.findNextMatch(match);
      if (result) {
        if (onMatch != undefined) results.push(onMatch(result));
        isFind = true;
        break;
      }
    }

    if (!isFind) {
      const result = analyzer.findNextMatch(/\s|./);
      if (!result) break;
      results.push(result.text);
    }
  }

  return results.join("");
}
function $$(text,space = false) {
  text = text
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

  if (space) {
    text.replace(/ /g, "&nbsp;")
  }
  return text
}
  
function $(tag, attr: Record<string, string> | string, ...child) {
  if (typeof attr === "string") {
    return `<${tag}>${attr}${child.join("")}</${tag}>`;
  }
  attr = Object.entries(attr)
    .map(([key, value]) => `${key}="${value}`)
    .join(" ");

  if (child.length > 0) {
    return `<${tag} ${attr}>${child.join("")}</${tag}>`;
  }
  return `<${tag} ${attr}/>`;
}
{
  const text = `
Hold miner \`setBackground()\` *Capacity en la vidas* \\ !(https://look.com/log.png) Hole Munro que tal [VSCode API](https://www.vscode.dev/) <method>
  `;

  const rules = [
    {
      match: /\\(.)/,
      onMatch({ text, textGroup }) {
        return textGroup[1];
      },
    },
    {
      match: /`([^`]+)`/,
      onMatch({ text, textGroup }) {
        return $("code", textGroup[1]);
      },
    },
    {
      match: /\*([^*]+)\*/,
      onMatch({ text, textGroup }) {
        return $("b", textGroup[1]);
      },
    },
    {
      match: /!\(([^\)]+)\)/,
      onMatch({ text, textGroup }) {
        return $("img", { src: textGroup[1] }, 2, 3);
      },
    },
    {
      match: /\[(.+)\]\((.+)\)/,
      onMatch({ text, textGroup }) {
        return $("a", { href: textGroup[2] }, textGroup[1]);
      },
    },
  ];
  console.log(textReplace(text, rules));
}

