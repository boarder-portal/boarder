export enum Human {
  ALIEN = 'ALIEN',
  GIRL = 'GIRL',
  BOY = 'BOY',
  WOMAN = 'WOMAN',
  MAN = 'MAN',
  GRANDMA = 'GRANDMA',
  GRANDPA = 'GRANDPA',
}

export type RealHuman = Exclude<Human, Human.ALIEN>;
