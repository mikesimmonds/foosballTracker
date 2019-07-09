import {
  bufferCount,
  debounceTime,
  distinctUntilChanged,
  filter,
  last,
  map,
  pairwise,
  reduce,
  tap
} from "rxjs/operators";
import {EMPTY, fromEvent} from "rxjs";
import {Direction} from "tty";


export interface BoxPos {
  posX: number,
  posY: number,
  width: number,
  height: number
}

export class Box  {

  constructor (
    private canvas,
    private canvasContext: CanvasRenderingContext2D,
    private boxDrawButtonEl: HTMLElement,
    private ballPosition$,
    private goalDirection
  )
  {
    console.log('123', this.restoreBoxPosition());
    this.drawBox(this.restoreBoxPosition());
    this.setup();
    this.ballPosition$ = ballPosition$.asObservable();
    setTimeout(() => {
      this.markInBox();
    }, 100);
    this.drawGoal();
    this.logGoalbound();
    console.log(this.boxPos);
  }

  boxPos;

  editable = false;
  mouseDownListener;
  mouseUpListener;

  boxPath;

  mouseDownPos;
  mouseUpPos;

  goalX = 55;
  goalY1 = 200;
  goalY2 = 320;

  // State of play
  /*
  I've made imporvement aot the way the boxes are done,
  they no longer have a config obj but store their previously drawn pos in localstorage
  This is great for refresh!
  Next steps:
  make second goal
  dont autoplay - 2 goals should be set, then enable play button
  tidy index.ts
  *make goalbound work
   - set goalmouth position
  send prev ball pos to class (the pairwise reqs 2 values, so the first box pos is lost. bad for long fast goals)

   */

// dumped this here
  logGoalbound() {
    this.ballPosition$.pipe(
      bufferCount(2),
      map(arr => {
        const total = arr.reduce((acc, curr, i, ar) => {
          if (!curr.x || !curr.y) {return}
          acc.x += curr.x;
          acc.y += curr.y;
          return acc
        },{x: 0, y: 0});
        const averagex = total.x/arr.length;
        const averagey = total.y/arr.length;
        return {averagex, averagey}
      }),
      pairwise()
    ).subscribe(([prev,curr]) => {
      const xDif = curr.x - prev.x;
      const yDif = curr.y - prev.y;
      const ratio = yDif/xDif;
      const distFromGoal = this.goalX - prev.x;
      const yPosAtGoalX = (ratio * distFromGoal) + prev.x ;
      if (xDif > 0 && yPosAtGoalX > this.goalY1 && yPosAtGoalX < this.goalY2) {
        // console.log(xDif, yDif);
        // console.log(ratio, distFromGoal, yPosAtGoalX);
        // video.pause();
        console.log('goal bound');
      }
    });
  }





  drawGoal() {
    this.logGoalbound();
    this.canvasContext.beginPath();
    this.canvasContext.strokeStyle = '#f89224';
    this.canvasContext.moveTo(this.goalX, this.goalY1);
    this.canvasContext.lineTo(this.goalX, this.goalY2);
    this.canvasContext.stroke();
  }



  setup() {
    this.boxDrawButtonEl.addEventListener('click', ()=> this.startBoxDrawListeners());
  }

  ballInBox$ = this.ballPosition$.pipe(
    map((pos) => {
      if (pos.x > this.boxPos.posX
        && pos.y > this.boxPos.posY
        && pos.x < this.boxPos.posX + this.boxPos.width
        && pos.y < this.boxPos.posY + this.boxPos.height){
        return pos
      } else {
        return null
      }
    }),
  );

  bufferSize = 3;
  markerColor = '#ed11ed';


  public direction$ = this.ballInBox$.pipe(
    filter(e=>!!e),
    bufferCount(this.bufferSize),
    map(direction => {
      let arr = [];
      direction.forEach(d=> arr.push(d.x));
      let otherarr = arr.reduce((acc, val, i, ) => {
        return acc+val
      });
      return otherarr;
    })
    ,
    map(x => x/this.bufferSize),
    pairwise(),
    map(([one, two]) => {
      return one>two
    }),
    map((acc) => {
      // console.log(acc);
      return acc ? 'Right': 'Left'
    }),
    distinctUntilChanged()
  );

  setMarkerColor = this.direction$.subscribe(
    direction => {
      if (direction == 'Left') {
        this.markerColor= '#Fedd11';
      } else {
        this.markerColor = '#ed11ed'
      }
    }
  )

  markInBox() {
    this.ballInBox$.subscribe(
      (ballPos) => {
        if (ballPos) {
          this.drawMarker(ballPos, this.markerColor);
        }
      }
    )
  }

  startBoxDrawListeners() {
    let posX;
    let posY
    const that =this;
    this.mouseDownListener = this.canvas.addEventListener('mousedown', function (e) {
      const position = that.getCursorPosition(that.canvas, e);
      posX = position[0];
      posY = position[1];
    }, {once: true});
    this.mouseUpListener = this.canvas.addEventListener('mouseup', function (e) {
      let width = that.getCursorPosition(that.canvas, e)[0] - posX;
      let height = that.getCursorPosition(that.canvas, e)[1] - posY;
      that.storeBoxPosition({posX, posY, width, height});
      that.clearBox(this.boxPos)
      that.drawBox({posX, posY, width, height});
    }, {once: true});
  }

  storeBoxPosition(boxPos: BoxPos) {
    window.localStorage.setItem(`${this.goalDirection}Box`, JSON.stringify(boxPos))
  }

  restoreBoxPosition() {
    const boxPosition = window.localStorage.getItem(`${this.goalDirection}Box`);
    if (boxPosition) {
      return JSON.parse(boxPosition)
    } else {
      return {posX: 0, posY: 0, width: 0, height: 0}
    }

  }

  public toggleEditable() {
    if (!this.editable) {
      const that = this;
      this.editable = true;
      console.log('editable:', this.editable);
    } else {
      this.editable = false;
      console.log('editable:', this.editable);
    }
  }

  drawBox (newBoxPos: BoxPos) {
    this.boxPath = this.canvasContext.beginPath();
    this.canvasContext.strokeStyle = '#000000';
    this.canvasContext.rect(newBoxPos.posX, newBoxPos.posY, newBoxPos.width, newBoxPos.height);
    this.canvasContext.stroke();
    console.log('drawing');
    this.setPos(newBoxPos)
    this.toggleEditable()
    // document.getElementById('setLeftButton').addEventListener("click", ev => this.toggleEditable())
  }

  clearBox(boxPox: BoxPos) {
    this.canvasContext.clearRect(this.boxPos.posX-10, this.boxPos.posY-10, this.boxPos.width+20, this.boxPos.height+20);
  }

  setPos (boxPos) {
    this.boxPos = boxPos
  }

  getCursorPosition(canvas, event) {
    console.log('curespor os fn');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x,y];
  }

  drawMarker(pos, color = '#ef2312') {
    this.canvasContext.beginPath();
    this.canvasContext.strokeStyle = color;
    this.canvasContext.rect(pos.x, pos.y, 3, 2);
    this.canvasContext.stroke();
  }


}
