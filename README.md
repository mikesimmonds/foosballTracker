# foosballTracker
 Foosball table ball tracking. Based on tracking.js and using typescript and Rxjs

### Build instruction
Check the package.json scripts.</br>
npm start will get you a long way however!

### Architecture
Very briefly, the events emitteed by the object tracker are converted to an abservable stream (tracker$)
</br>
Various RxJs operators (operators.ts) are then used on this stream to change the values into something more usable eg speed$
