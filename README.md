# foosballTracker
Foosball table ball tracking.

### Build instruction
Check the package.json scripts.
{{{npm start}}} will get you a long way however!

### Architecture
Very briefly, the events emitteed by the object tracker are converted to an abservable stream (trascker$)
Various RxJs operators (operators.ts) are then used on this stream to change the values into something more usable eg speed$
