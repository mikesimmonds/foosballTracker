import {bufferCount, distinctUntilChanged, filter, pairwise, map, timeInterval} from "rxjs/operators";
import {Direction} from './typings'

export function directionOp() {
  return input$ => input$.pipe(
    filter(ev => ev),
    map(ev => (ev && ev['x']) ? ev.x : null),
    bufferCount(2),
    map((posArray: number[]) => {
      const total = posArray.reduce((p, c) => p+c);
      return total/posArray.length;
    }),
    pairwise(),
    map(([prev, curr]) => {
      if (!curr) {return}
      if (curr > prev) {
        return Direction.right
      } else {
        return Direction.left
      }
    }),
    distinctUntilChanged()
  )
}

function calculateSpeed(x1, y1, x2, y2, interval): number {
  var c1 = Math.pow((x2 - x1), 2);
  var c2 = Math.pow((y2 - y1), 2);
  var distance = Math.sqrt(c1 + c2);
  return (distance / interval) * 1000;
}

export function speedOP() {
  return input$ => input$.pipe(
    pairwise(),
    timeInterval(),
    map(movement => {
      const previousPos = movement.value[0];
      const currentPos = movement.value[1];
      let speed = null;
      if (previousPos && currentPos) {
        speed = calculateSpeed(currentPos.x, currentPos.y, previousPos.x, previousPos.y, movement.interval);
      }
      return speed;
    })
  )
}

export function averageDirectionOP() {
  return (input$) => input$.pipe(
    bufferCount(5),
    map((directions) => {
      return directions.filter(d => d == Direction.right).length >= 3 ? Direction.right : Direction.left
    })
  )
}

let cantSeeTimer;
export function cantSeeBall(buffer: number) {
  return input$ => input$.pipe(
    bufferCount(buffer),
    map( (trackerValue) => {
        let val = false;
        if (trackerValue.every(val => val === undefined)) {
          val = true
        }
        return val
        //   cantSeeTimer = setTimeout(() => {
        //     return 'true'
        //   }, 2000)
        // } else {
        //   clearTimeout(cantSeeTimer);
        //   return false
        // }
      }
    ),
    distinctUntilChanged()
  );
}