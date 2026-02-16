import { Human, RealHuman } from 'common/types/games/outerMinds/common';

export function humansIncludeRealHumans(humans: Human[], realHumans: RealHuman[]): boolean {
  const humansCopy = Array.from(humans);
  const realHumansCopy = Array.from(realHumans);

  for (let i = realHumans.length - 1; i >= 0; i--) {
    const humansIndex = humansCopy.indexOf(realHumansCopy[i]);

    if (humansIndex !== -1) {
      humansCopy.splice(i, 1);
    }
  }

  return realHumansCopy.length <= humansCopy.filter((human) => human === Human.ALIEN).length;
}
