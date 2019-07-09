import {bufferCount, distinctUntilChanged, filter, map, pairwise, switchMap, timeInterval} from "rxjs/operators";
import {combineLatest, EMPTY, Observable} from "rxjs";
import {

  Direction,
  TrackingData
} from './typings';

// const directionOp$ = tracker$.pipe(
//   filter(ev => ev),
//   map(ev => (ev && ev['x']) ? ev.x : null),
//   bufferCount(bufferSize),
//   map((posArray: number[]) => {
//     const total = posArray.reduce((p, c) => p+c);
//     return total/posArray.length;
//   }),
//   map(curr => {
//     if (!curr) {return}
//     if (curr > lastXPos) {
//       lastXPos=curr;
//       return Direction.right
//     } else {
//       lastXPos=curr;
//       return Direction.left
//     }
//   }),
//   distinctUntilChanged()
// );

export const getDirection$ = (tracker$: Observable<any>): Observable<Direction> => {

  return tracker$.pipe(
    filter(ev => ev && ev['x']),
    pairwise(),
    map(([prev ,curr]) => {
      if (!prev) {return}
      if (curr > prev) {
        return Direction.right
      } else {
        return Direction.left
      }
    }),
    distinctUntilChanged()
  );
};

// const speed$ = tracker$
//   .pipe(
//     pairwise(),
//     timeInterval(),
//     map(movement => {
//       const previousPos = movement.value[0];
//       const currentPos = movement.value[1];
//       let speed = null;
//       if (previousPos && currentPos) {
//         speed = calculateSpeed(currentPos.x, currentPos.y, previousPos.x, previousPos.y, movement.interval);
//       }
//       return speed;
//     })
//   );
//
// const averageDirection$ = directionOp$.pipe(
//   bufferCount(5),
//   map((directions) => {
//     return directions.filter(d => d == Direction.right).length >= 3 ? Direction.right : Direction.left
//   })
// );
//
// const leftInBox$ = combineLatest(leftBox.ballInBox$, averageDirection$, position$)
//   .pipe(
//     map(([inBox, directionOp, position]) => {
//       console.log(directionOp);
//       if (inBox && directionOp == Direction.left) {
//         this.drawMarker(position);
//         console.log('LEFT');
//         return position
//       } else if (directionOp == Direction.right) {
//         console.log('RIGHT!')
//       } else {
//         return null
//       }
//     })
//   );
//
// leftInBox$.subscribe(e=>e);
//
// let cantSeeTimer;
// const cantSeeBall$ = tracker$
//   .pipe(
//     bufferCount(20),
//     map( (trackerValue) => {
//         let val = false
//         if (trackerValue.every(val => val === undefined)) {
//           val = true
//         }
//         return val
//         //   cantSeeTimer = setTimeout(() => {
//         //     return 'true'
//         //   }, 2000)
//         // } else {
//         //   clearTimeout(cantSeeTimer);
//         //   return false
//         // }
//       }
//     )
//   );
//
// const boxBuffered$ = leftInBox$.pipe(bufferCount(5))
//
// // const goal = combineLatest(cantSeeBall$, boxBuffered$)
// //   .subscribe(
// //   ([cantSeeBall, boxBuffered]) => {
// //     if(cantSeeBall) {
// //       console.log('cant see for 20 frames');
// //
// //       if (boxBuffered.filter(pos => pos != 'false').length > 0) {
// //         console.log('SUSPECTED GOAL');
// //       }
// //     }
// //   }
// // );
//
// cantSeeBall$.pipe(
//   switchMap((cantSee) => {
//     return cantSee ? boxBuffered$ : EMPTY
//   }),
//   map(boxBuffered => boxBuffered.filter(pos => pos != 'false').length > 0),
//   // debounceTime(5000)
// ).subscribe(
//   value => {
//     if (value) {
//       console.log('GGGOOOAAALLLLLLLLLLLLL')
//       takeSnapshot(video, document.getElementById('pics'));
//     }
//   }
// );
//
// speed$.subscribe(speed => {
//   if (speed && speed > maxSpeed) {
//     maxSpeed = speed;
//     speedo.innerHTML = Math.round(maxSpeed).toString();
//   }
// });
//
// // position$.pipe(
// //   first()
// // ).subscribe( (pos) => {
// //   context.moveTo(pos.x, pos.y);
// // });
// //
// // position$.subscribe( (pos) => {
// //   context.lineTo(pos.x, pos.y);
// //   context.rect(pos.x, pos.y, 1, 5);
// //   context.strokeStyle = (currentDirection =='right') ? '#FF3EE4' : '#40ff40';
// //   context.stroke();
// //   context.beginPath();
// //   context.moveTo(pos.x, pos.y);
// // });
//
//
//
//
//
// function drawAim(curr, yPosAtGoalX, goalX) {
//   context.beginPath();
//   context.strokeStyle = '#000000'
//   context.moveTo(curr.x, curr.y);
//   context.rect(curr.x, curr.y, 10, 10)
//   context.lineTo(goalX, yPosAtGoalX);
//   context.stroke();
// }
//
//
// let timer3;
// position$.pipe( // this says goal when no now pos for 1sec
//   // map(pos => new Date().getTime()),
// ).subscribe(
//   (directionOp) => {
//     timer3 ? clearTimeout(timer3): null;
//     timer3 = setTimeout(() => {
//       // console.log('GOAL =>', currentDirection, 'no movements')
//     }, 1000)
//   }
// );
//
//
//
//
// let timer2;
// tracker$.subscribe( // this says goal if ball cannot be found for >1sec
//   value => {
//     if (value === undefined) {
//       timer2 = setTimeout(() => {
//         // console.log('GOAL =>', currentDirection, 'Cant see ball')
//       }, 2000)
//     } else {
//       clearTimeout(timer2);
//     }
//   }
// );