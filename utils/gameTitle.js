// Display name for a game: its saved set's name, otherwise a label for the
// quick-start testament pick ('both' | 'Old Testament' | 'New Testament').
function gameTitle(game) {
  if (game?.set?.name) return game.set.name;
  if (game?.testament === 'Old Testament' || game?.testament === 'New Testament') {
    return `${game.testament} Quiz`;
  }
  if (game?.testament === 'both') return 'Mixed Quiz';
  return 'Quick Game'; // older games saved before the testament was recorded
}

module.exports = { gameTitle };
