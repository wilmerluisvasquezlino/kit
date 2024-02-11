class List<T> {
  items: T[];
  constructor(...items: T[]) {
    this.items = items;
  }
  group(callback: (item: T) => [string,string]): { key: string; value: string }[] {
    if (this.items.length === 0) return [];
    const [key, value] = callback(this.items[0]);
    const array: { key: string; value: string }[] = [{ key, value }];

    for (let index = 1; index < this.items.length; index++) {
      const [key, value] = callback(this.items[index]);
      if (array[array.length - 1].key === key) {
        array[array.length - 1].value += value;
      } else {
        array.push({ key, value });
      }
    }
    return array;
  }
  *[Symbol.iterator](): Generator<T, void, unknown> {
    for (let i = 0; i < this.items.length; i++) {
      yield this.items[i];
    }
  }
}

const tokends = new List<[string,string]>();

const g = tokends.group(([token, content]) => {
  return [token, content];
});
console.log(g);
