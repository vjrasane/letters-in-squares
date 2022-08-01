
import draw, { Options, Square } from ".";

export type CharState = {
	char: string,
	state: 'correct' | 'almost' | 'wrong'
}

const countWordChars = (c: string, word: string): number => {
	return word.split('').filter(w => w === c).length;
  };
  
  const countCorrectChars = (c: string, word: string, guess: string): number => {
	return word.split('').filter((w, i) => w === c && guess.charAt(i) === c).length;
  }; 
  
  const countStateChars = (c: string, word: Array<CharState>): number => {
	return word.filter(s => s.state === 'almost' && s.char === c).length;
  };
  

const getGuessState = (guess: string, word: string): Array<CharState> => {
	return guess.split('').reduce(
	  (acc: Array<CharState>, char, i) => {
		if (word.charAt(i) === char) 
		  return [...acc, { char, state: 'correct' }];
		if (countCorrectChars(char, word, guess) + countStateChars(char, acc) <
		   countWordChars(char, word)) 
		  return [...acc, { char, state: 'almost'}];
		return [...acc, { char, state: 'wrong' }];
	  }, []
	);
  };

const getSquareColor = (state: CharState["state"]): string => {
	switch(state) {
		case 'correct':
			return '#6ca965';
		  case 'almost':
			return '#c8b653';
		  default:
			return '#787c7f';
	}
}

export default (word: string, guesses: Array<string>, options: Options = {}) => {
	return draw(
		guesses
			.map((g) => getGuessState(g, word))
			.map((g) => g.map(s => ({ 
				letter: s.char.toUpperCase(),
				squareColor: getSquareColor(s.state)
			}))),
			{
				textColor: "white",
				borderColor: null,
				...options
			}
	)
}
