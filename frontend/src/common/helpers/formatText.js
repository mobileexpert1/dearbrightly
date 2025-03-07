// Formats local timestamp to MM/dd/YY string format

export const capitalizeEnum = (sentence) => {
  var sentence = sentence.toLowerCase();
  var words = sentence.split('_');
  var capitalizedEnum = '';
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    capitalizedEnum += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
  }
  return capitalizedEnum;
}

export const upperCaseToKebabCase = (upperCaseWords) => {
  const newWord = upperCaseWords.replace(/ /g, '-').toLowerCase();
  return newWord;
};

export const kebabCaseToLowerCase = (words) => {
  const newWord = words.replace(/-/g, ' ').toLowerCase();
  return newWord;
};

// TODO - trim leading and trailing spaces
export const snakeCase = (words) => {
  const newWord = words.replace(/ /g, '_').toLowerCase();
  return newWord;
};