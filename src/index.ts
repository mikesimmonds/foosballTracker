import './assets/styles/style.css';
import '../public/JM.mp4';
import {Box} from "./box";
import {
  combineLatest,
  EMPTY,
  fromEvent,
  Observable,
  Subject
} from "rxjs";
import {
  bufferCount,
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  switchMap,
  timeInterval,
  tap, mergeMap
} from "rxjs/operators";

import {
  // getDirection$
} from './helpers';
import {
  Direction,
  TrackingData
} from './typings';

import {cantSeeBall, directionOp, speedOP} from './operators'

let tracker$;

const allPositionsEqual = arr => arr.every( v => v.x === arr[0].x && v.y === arr[0].y );
const allAreTrue = arr => arr.every( v => v === undefined );

var canvas = document.getElementById('canvas') as HTMLCanvasElement;
var boxCanvas = document.getElementById('boxCanvas') as HTMLCanvasElement;
var context = canvas.getContext('2d');
var boxContext = boxCanvas.getContext('2d');
var video = document.getElementById('video') as HTMLVideoElement;
const setLeftGoalButton: HTMLElement = document.getElementById('setLeftGoal');
const setRightGoalButton = document.getElementById('setRightGoal');
var speedo = document.getElementById('speedo');
var directionEl = document.getElementById('direction');
var cantSeeEl = document.getElementById('cantSee');
var cantSeeBuffer = document.getElementById('cantSeeBuffer');
var rightBoxEl = document.getElementById('rightBox');

let rbDirection$;
let lbDirection$;

let scoreLeft = 0;
let scoreRight = 0;

const goalX = 555;
const goalY1 = 200;
const goalY2 = 320;

function drawGoal() {
  context.beginPath();
  context.strokeStyle = '#f89224';
  context.moveTo(goalX, goalY1);
  context.lineTo(goalX, goalY2);
  context.stroke();
}

const ballPosition$ = new Subject();

let leftBox: Box;
let rightBox: Box;


export function clearScreen() {
  context.clearRect(0,0, 800, 500)
}

function trackTheBall() {
  let currentDirection: Direction = null;
  context.fillStyle = "#fff";
  context.strokeStyle = '#FF3EE4'

  var maxSpeed = 0;
  video.playbackRate = 1.0;

  // @ts-ignore
  var tracker = new tracking.ColorTracker(['yellow']);
  tracker.setMinDimension(5);

  // @ts-ignore
  tracking.track('#video', tracker);

  tracker$ = fromEvent(tracker, 'track')
    .pipe(
      map((ev): TrackingData => ev.data[0])
    );

  const position$ = tracker$
    .pipe(
      filter(TD => (TD && TD['x'] && TD['y'])),
      map((TD) => {
        return {
          x: TD.x,
          y: TD.y
        }
      }),
      tap(e => ballPosition$.next(e))
    );

  const direction$ = tracker$.pipe(
    directionOp()
  );

  direction$
    .subscribe((direction: Direction ) => {
      directionEl.innerText = direction;
      currentDirection = direction
    });

  const speed$ = tracker$.pipe(speedOP())

  speed$.subscribe(speed => {
    if (speed && speed > maxSpeed) {
      maxSpeed = speed;
      speedo.innerHTML = Math.round(maxSpeed).toString();
    }
  });

  const cantSeeBall$ = tracker$.pipe(
    cantSeeBall(15)
  );

  cantSeeBall$.subscribe(gone => {
    if (gone) {
      cantSeeEl.classList.add('red-background')
    } else {
      cantSeeEl.classList.remove('red-background')
    }
  });

  rbDirection$.subscribe(gone => {
    let timeout;
    if (gone == "Left") {
      timeout=null;
      rightBoxEl.classList.add('red-background')
      timeout = setTimeout(() => {
        rightBoxEl.classList.remove('red-background')
      },1000)
    } else {
      timeout=null;
      rightBoxEl.classList.remove('red-background')
    }
  });

  const rbBoth = combineLatest(rbDirection$, cantSeeBall$);

  rbBoth.subscribe(([direction, cantSee]) => {
    if (direction == 'Left' && cantSee) {
      console.log('>>>>');
      scoreLeft += 1;
      logScore();
    }

  });

  const lbBoth = combineLatest(rbDirection$, cantSeeBall$);

  lbBoth.subscribe(([direction, cantSee]) => {
    if (direction == 'Right' && cantSee) {
      console.log('<<<');
      scoreRight += 1;
      logScore()
    }

  });

  function logScore(){
    console.log(scoreLeft, scoreRight)
  }

  initGUIControllers(tracker);
}

window.onload = function () {
  drawGoal();
  leftBox = new Box(boxCanvas, boxContext, setLeftGoalButton, ballPosition$, Direction.left);
  rightBox = new Box(boxCanvas, boxContext, setRightGoalButton, ballPosition$, Direction.right);
  rbDirection$ = rightBox.direction$;
  lbDirection$ = rightBox.direction$;
  trackTheBall();
};
