type Content = {
  heading: string;
  body: {
    text: string;
  }[];
}[];

export function calculateMinutesForReading(content: Content): string {
  const totalMinutes = content.reduce((total, currentSection) => {
    const headingWords = currentSection.heading?.split(' ').length ?? 0;
    const bodyWords = currentSection.body.reduce(
      (totalBodyWords, currentElement) => {
        const elementWords = currentElement.text?.split(' ').length ?? 0;
        return totalBodyWords + elementWords;
      },
      0
    );

    return total + headingWords + bodyWords;
  }, 0);

  const minutesForReading = Math.ceil(totalMinutes / 200);

  return `${minutesForReading} min`;
}
