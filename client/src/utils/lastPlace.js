// Whether `me` should hear the "last place" sound at the end of a session.
// `everyone` is the list of final entries ({ correct, wrong }), including `me`.
//  - Multiplayer: whoever failed the most questions (ties all qualify), unless
//    everyone failed the same number.
//  - Single player: failed more questions than they got right (accuracy < 50%).
export function isLastPlace(me, everyone) {
  if (!me) return false;
  const failed = (p) => p.wrong || 0;

  if (everyone.length < 2) {
    return failed(me) > (me.correct || 0);
  }

  const counts = everyone.map(failed);
  const worst = Math.max(...counts);
  return failed(me) === worst && worst > Math.min(...counts);
}
