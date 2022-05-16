export class Escape {
  private val: string;
  constructor(val: string) {
    this.val = val;
  }

  get value() {
    return this.val;
  }

  static of(val: string) {
    return new Escape(val);
  }

  map(fn: (val: string) => string) {
    return new Escape(fn(this.val));
  }

  handle(char: string) {
    const valiReg = new RegExp('\\\\' + '\\' + char, 'g');
    const reg = new RegExp('\\\\' + '\\' + char, 'g');
    return valiReg.test(this.val) ? new Escape(this.val.replace(reg, char)) : this;
  }
}
