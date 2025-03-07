export const upperCaseSnakeToCapital = (upperCaseWord) => {
  return capitalize(upperCaseWord.replace(/_/g, ' '));
};

export const capitalize = (words) => {
  return words.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}

export const capitalizeFirstWord = (words) => {
  if (!words) {
    return words;
  }
  const lowerCaseWords = words.toLowerCase();
  return lowerCaseWords.charAt(0).toUpperCase() + lowerCaseWords.substring(1);
}