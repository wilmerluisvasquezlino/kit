export interface RegExpExecArrayWithIndices extends RegExpExecArray {
  indices: number[][];
}
export interface Collection {
  name: string;
  content: string;
}
interface TextMateGrammarsPatterns {
  contentName?: string;
  name?: string;
  end?: string | RegExp;
  begin?: string | RegExp;
  match?: string | RegExp;
  matchEnd?: string | RegExp;
  captures?: Record<number, string>;
  patterns?: TextMateGrammarsPatterns[];
}
interface TextMateGrammars {
  contentName: string;
  patterns: TextMateGrammarsPatterns[];
  repository?: Record<string, any>;
}
export interface State {
  scope: TextMateGrammarsPatterns[][];
  deleteLast(): void;
  add(patterns: TextMateGrammarsPatterns[]): void;
  getLast(): TextMateGrammarsPatterns[];
  // content: string;
}

export interface ScopeNames {
  names: string[];
  add(...args: string[]): void;
  getLast(): string;
  deleteLast(): void;
}
