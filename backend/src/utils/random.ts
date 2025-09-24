const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));

export const pickOne = <T>(items: T[]): T => items[randomInt(0, items.length - 1)];

export const weightedPick = <T>(items: Array<{ item: T; weight: number }>): T => {
  const total = items.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return items[items.length - 1].item;
};
