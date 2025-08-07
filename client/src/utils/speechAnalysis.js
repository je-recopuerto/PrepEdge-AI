const fillerWords = ["uh", "um", "like", "you know", "so"];

export function analyzeSpeech(wordsWithTimestamps) {
  const analyzedWords = [];
  let previousTime = null;

  for (let i = 0; i < wordsWithTimestamps.length; i++) {
    const { word, time, confidence } = wordsWithTimestamps[i];
    const lower = word.toLowerCase();
    const pauseDuration = previousTime ? time - previousTime : 0;
    previousTime = time;

    let label = "normal";
    let tooltip = "";

    if (fillerWords.includes(lower)) {
      label = "filler";
      tooltip = `Filler word "${word}"`;
    } else if (pauseDuration > 0.5) {
      label = "pause";
      tooltip = `Pause > ${pauseDuration.toFixed(2)}s`;
    } else if (confidence < 0.6) {
      label = "low-confidence";
      tooltip = `Low confidence: ${(confidence * 100).toFixed(1)}%`;
    }

    analyzedWords.push({ word, label, tooltip });
  }

  return analyzedWords;
}
