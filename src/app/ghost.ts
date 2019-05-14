import { Helper } from './helper';
import { DIRECTIONS } from './enums';
import { PacCoin } from './pac-coin';
import { BLOCK_TYPE } from './map';
import { isNullOrUndefined } from 'util';

export class Ghost {

    public game: PacCoin;
    public name: string;

    public size = 0;

    public bornCoordX: any = null;
    public bornCoordY: any = null;
    public bornCoordI: { begin: number, end: number };
    public bornCoordJ: { begin: number, end: number };

    public imagesPerState: { [key: string]: HTMLImageElement } = {
        WAITING: new Image(),
        STOP_WAITING: new Image(),
        HUNTING: new Image(),
        STUNNED: new Image(),
        STUNNED_BLINK: new Image(),
        DEAD_GO_HOME: new Image(),
        DEAD: new Image()
    };

    public x = 0;
    public y = 0;
    public toX = this.x;
    public toY = this.y;

    public direction = DIRECTIONS.NONE;
    public state = STATES.WAITING;

    public get image() { return this.imagesPerState[this.state]; };

    public leaveWaitingTime = 0;
    public renderWaitingTime = 0;
    public stunningWaitingTime = 0;
    public stunningBlinkAtEndOf = 0;

    public howLongIsTheWait = 0;

    public destinationToGo: any = null;
    public lastDestinationToGo: any = null;
    public arrayDirectionsToGo: any[] = [];

    constructor(game: PacCoin, name: string) {
        this.game = game;
        this.name = name;
    
        this.size = this.game.blockSize;
    
        this.bornCoordX = this.game.map.ghostBornCoords.x;
        this.bornCoordY = this.game.map.ghostBornCoords.y;
        this.bornCoordI = { begin: this.bornCoordY.begin / this.size, end: this.bornCoordY.end / this.size };
        this.bornCoordJ = { begin: this.bornCoordX.begin / this.size, end: this.bornCoordX.end / this.size };
    
        this.imagesPerState.WAITING.src = 'assets/img/ghosts/ghost.svg#' + this.name;
        this.imagesPerState.STOP_WAITING.src = 'assets/img/ghosts/ghost.svg#' + this.name;
        this.imagesPerState.HUNTING.src = 'assets/img/ghosts/ghost.svg#' + this.name
        this.imagesPerState.STUNNED.src = 'assets/img/ghosts/ghost.svg#stunned';
        this.imagesPerState.STUNNED_BLINK.src = 'assets/img/ghosts/ghost.svg#stunned_blink';
        this.imagesPerState.DEAD_GO_HOME.src = 'assets/img/ghosts/ghost.svg#dead';
        this.imagesPerState.DEAD.src = 'assets/img/ghosts/ghost.svg#dead';
    
        this.leaveWaitingTime = 5000 + ((this.ghostNumber() - 1) * 4000);
        this.renderWaitingTime = (this.ghostNumber() - 1) * 4000;
        this.stunningWaitingTime = 13000;
        this.stunningBlinkAtEndOf = 3000;
        
        this.initialize();
    }
    
    ghostNumber() { return parseInt(this.name); }
    
    i(round = false) {
        let size = this.size;
        let y = this.y;
        
        if (round && this.direction === DIRECTIONS.UP)
            y -= size;
        
        let i = Math.floor(y / size);

        if (round && y % size > 5)
            i++;
            
        return Math.min( i, this.game.map.matriz.length - 1);
    };

    j(round = false, direction?: string) {
        let size = this.size;
        let x = this.x;
        
        if (!direction)
            direction = this.direction;

        if (round && this.direction === DIRECTIONS.LEFT)
            x -= size;
        
        let j = Math.floor(x / size);

        if (round && x % size > 5)
            j++;

        return Math.min(j, this.game.map.matriz[0].length - 1);
    };

    initialize(){
        let initI = Helper.randomInterval(this.bornCoordI.begin, this.bornCoordI.end);
        let initJ = Helper.randomInterval(this.bornCoordJ.begin, this.bornCoordJ.end);
        this.startWaiting(initI, initJ);
    };

    private startWaiting(initI?: number, initJ?: number) {

        if (isNullOrUndefined(initI))
            initI = this.i();
        if (isNullOrUndefined(initJ))
            initJ = this.j();

        this.state = STATES.WAITING;
        this.x = initJ * this.size;
        this.y = initI * this.size;
        this.clearWalkCoordinates();

        if (this.bornCoordI.begin !== this.bornCoordI.end) {
            if (initI > this.bornCoordI.begin)
                this.goToTheDirection(DIRECTIONS.UP);
            else
                this.goToTheDirection(DIRECTIONS.DOWN);
        }
        else if (this.bornCoordJ.begin !== this.bornCoordJ.end) {
            if (initJ > this.bornCoordJ.begin)
                this.goToTheDirection(DIRECTIONS.LEFT);
            else
                this.goToTheDirection(DIRECTIONS.RIGHT);
        }
    }

    render(){
        if (this.game.isRunning)
            this.updateRenderWaitingTime();

        if (this.canRender()) {
            this.updateCoordinates();
            this.game.context.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    };

    private canRender() {
        return this.state !== STATES.WAITING || this.howLongIsTheWait >= this.renderWaitingTime;
    }

    updateCoordinates(){
        if (this.game.isRunning)
            switch(this.state) {
                case STATES.WAITING: {
                    let next = this.getNextCoordinates(SPEED.NORMAL);

                    if (next.x !== this.x || next.y !== this.y)
                        this.goToNextCoords(next.x, next.y);
                    else {
                        if (this.howLongIsTheWait >= this.leaveWaitingTime)
                            this.stopWaitingAndGoHunting();
                        else {
                            let limit = {
                                x: { min: this.bornCoordJ.begin * this.size, max: this.bornCoordJ.end * this.size },
                                y: { min: this.bornCoordI.begin * this.size, max: this.bornCoordI.end * this.size }
                            }

                            if (this.canGoInTheDirection(this.direction, this.x, this.y, limit))
                                this.goToTheDirection(this.direction);
                            else {
                                let direction = this.getReverseDirection();
                                
                                if (this.canGoInTheDirection(direction, this.x, this.y, limit))
                                    this.goToTheDirection(direction);
                                else {
                                    direction = this.getReverseOrientation();

                                    if (this.canGoInTheDirection(direction, this.x, this.y, limit))
                                        this.goToTheDirection(direction);
                                    else {
                                        let direction = this.getReverseDirection();

                                        if (this.canGoInTheDirection(direction, this.x, this.y, limit))
                                            this.goToTheDirection(direction);
                                    }
                                }
                            }
                        }
                    }

                    break;
                }
                case STATES.STOP_WAITING: {
                    let next = this.getNextCoordinates(SPEED.NORMAL);

                    if (next.x !== this.x || next.y !== this.y)
                        this.goToNextCoords(next.x, next.y);
                    else
                        this.goHunting();
                    break;
                }
                case STATES.HUNTING: {
                    if (!this.checkArriveTheDestination(true)) {
                        let next = this.getNextCoordinates(SPEED.NORMAL);
        
                        if (next.x !== this.x || next.y !== this.y)
                            this.goToNextCoords(next.x, next.y);
                        else {
                            let pacI = this.game.pac.i();
                            let pacJ = this.game.pac.j();
                            this.executeGoToDestination(pacI, pacJ);
                        }
                    }
                    else 
                        this.game.ghostFoundPac(this);
                    break;
                }
                case STATES.STUNNED:
                case STATES.STUNNED_BLINK: {;

                    let timeLeft = (this.stunningWaitingTime - this.howLongIsTheWait);

                    if (timeLeft > 0 && timeLeft <= this.stunningBlinkAtEndOf) {
                        if (timeLeft === this.stunningBlinkAtEndOf || timeLeft % 300 === 0)
                            this.state = (this.state === STATES.STUNNED) ? STATES.STUNNED_BLINK : STATES.STUNNED;
                    }
                    else
                        this.state = STATES.STUNNED;

                    let next = this.getNextCoordinates(SPEED.NORMAL)
                    if (next.x !== this.x || next.y !== this.y)
                        this.goToNextCoords(next.x, next.y);
                    else {
                        let pacPos = { i: this.game.pac.i(), j: this.game.pac.j() };

                        if (this.howLongIsTheWait >= this.stunningWaitingTime) {
                            this.goHunting();
                            this.updateCoordinates();
                        }
                        else if (this.checkCurrentDestinationToGoEquals(pacPos.i, pacPos.j) || this.checkArriveTheDestination()) {
                            let exceptions = [
                                { i: this.i(true), j: this.j(true) },
                                { i: this.destinationToGo.i, j: this.destinationToGo.j }
                            ];
                            let limits = this.createLimitThisPositions(pacPos.i, pacPos.j);
                            let coordinates = this.game.map.getRandomIndexesBlock([BLOCK_TYPE.BISCUIT, BLOCK_TYPE.PILL], exceptions, limits);
                            this.executeGoToDestination(coordinates.i, coordinates.j);
                        }
                        else
                            this.executeGoToDestination(this.destinationToGo.i, this.destinationToGo.j);
                    }
                    break;
                }
                case STATES.DEAD_GO_HOME: {
                    let next = this.getNextCoordinates(SPEED.FAST);
        
                    if (next.x !== this.x || next.y !== this.y)
                        this.goToNextCoords(next.x, next.y);
                    else if (!this.checkArriveTheDestination())
                        this.executeGoToDestination(this.destinationToGo.i, this.destinationToGo.j);
                    else {
                        this.howLongIsTheWait = this.renderWaitingTime; 
                        this.startWaiting();
                    }
                    break;
                }
                case STATES.DEAD: {
                    break;
                }
            }
    }

    public onPillGetted() {
        if (this.state === STATES.HUNTING) {
            this.state = STATES.STUNNED;
            this.howLongIsTheWait = 0;
            this.clearDestinationToGo();

            let pacPos = { i: this.game.pac.i(), j: this.game.pac.j() };
            let exceptions = [ { i: this.i(), j: this.j() } ];
            let limits = this.createLimitThisPositions(pacPos.i, pacPos.j);
            this.destinationToGo = this.game.map.getRandomIndexesBlock([BLOCK_TYPE.BISCUIT, BLOCK_TYPE.PILL], exceptions, limits);
        }
    }

    public goToHomeBecauseDead() {
        if (this.state === STATES.STUNNED || this.state === STATES.STUNNED_BLINK) {
            this.state = STATES.DEAD_GO_HOME;
            this.howLongIsTheWait = 0;
            this.clearDestinationToGo();

            let i = Helper.randomInterval(this.bornCoordI.begin, this.bornCoordI.end);
            let j = Helper.randomInterval(this.bornCoordJ.begin, this.bornCoordJ.end);
            this.destinationToGo = { i, j };
        }
    }

    private createLimitThisPositions(i: number, j: number) {
        let limits = {
            i: { begin: Math.max(i - 10, 0), end: Math.min(i + 10, this.game.map.lengthY - 1) },
            j: { begin: Math.max(j - 10, 0), end: Math.min(j + 10, this.game.map.lengthX - 1) }
        };

        return limits;
    }

    private clearDestinationToGo() {
        this.lastDestinationToGo = null;
        this.destinationToGo = null;
    }

    private clearWalkCoordinates() {
        this.toX = this.x;
        this.toY = this.y;
    }

    private executeGoToDestination(i: number, j: number) {
        if (!this.arrayDirectionsToGo.length ||
            !this.lastDestinationToGo ||
            this.lastDestinationToGo.i !== i ||
            this.lastDestinationToGo.j !== j)
        {
            let lastNextDirection = this.arrayDirectionsToGo.length ? this.arrayDirectionsToGo[0] : this.direction;
            this.arrayDirectionsToGo = [];
            this.lastDestinationToGo = null;
            this.destinationToGo = {
                i: i,
                j: j
            };

            this.goToDestination(lastNextDirection);
        }
        
        if (this.arrayDirectionsToGo.length) {
            let direction;
            
            do {
                direction = this.arrayDirectionsToGo[0];
                this.arrayDirectionsToGo = this.arrayDirectionsToGo.length ? this.arrayDirectionsToGo.slice(1) : [];
            }
            while(this.arrayDirectionsToGo.length && !this.canGoInTheDirection(direction))

            this.goToTheDirection(direction);
            this.updateCoordinates();
        }
    }

    getNextCoordinates(rate: number) {
        let nextX = this.x;
        let nextY = this.y;

        if (this.x !== this.toX && this.directionIsX()) {
            this.direction = this.x < this.toX ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            nextX = this.game.applySmoothCoord(this.x, this.toX, rate);
        }
        else if (this.x !== this.toX && this.y === this.toY) {
            this.direction = this.x < this.toX ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            nextX = this.game.applySmoothCoord(this.x, this.toX, rate);
        }
        else if (this.y !== this.toY && this.directionIsY()) {
            this.direction = this.y < this.toY ? DIRECTIONS.DOWN : DIRECTIONS.UP;
            nextY = this.game.applySmoothCoord(this.y, this.toY, rate);
        }
        else if (this.y !== this.toY && this.x === this.toX) {
            this.direction = this.y < this.toY ? DIRECTIONS.DOWN : DIRECTIONS.UP;
            nextY = this.game.applySmoothCoord(this.y, this.toY, rate);
        }

        return { x: nextX, y: nextY };
    }

    goToNextCoords(nextX: number, nextY: number) {
        if (!this.game.map.isCollidingWithWall(nextX, nextY, this.size)){
            this.x = nextX;
            this.y = nextY;
        }
        else {
            this.x = Math.floor(this.j()) * this.size;
            this.y = Math.floor(this.i()) * this.size;
            this.clearWalkCoordinates();
        }
    };

    goToTheDirection(direction: DIRECTIONS) {
        this.direction = direction;

        if (direction === DIRECTIONS.UP)
            this.toY = this.y - this.size;
        else if (direction === DIRECTIONS.DOWN)
            this.toY = this.y + this.size;
        else if (direction === DIRECTIONS.LEFT)
            this.toX = this.x - this.size;
        else if (direction === DIRECTIONS.RIGHT)
            this.toX = this.x + this.size;
    }

    canGoInTheDirection(direction: string, x?: number, y?: number, limit?: any) {
        if (isNullOrUndefined(x))
            x = this.x;
        if (isNullOrUndefined(y))
            y = this.y;

        if (direction === DIRECTIONS.UP)
            y -= this.size;
        else if (direction === DIRECTIONS.DOWN)
            y += this.size;
        else if (direction === DIRECTIONS.LEFT)
            x -= this.size;
        else if (direction === DIRECTIONS.RIGHT)
            x += this.size;

        if (limit) {
            if (x < limit.x.min || x > limit.x.max)
                return false;
            if (y < limit.y.min || y > limit.y.max)
                return false;
        }

        let block = this.game.map.getBlockByCoordinates(x, y, this.size);

        if (this.state === STATES.HUNTING || this.state === STATES.STUNNED)
            return block !== BLOCK_TYPE.WALL &&
                    block !== BLOCK_TYPE.PORTAL &&
                    block !== BLOCK_TYPE.PORTAL_PATH &&
                    block !== BLOCK_TYPE.GHOST_HOUSE;
        else if (this.state === STATES.DEAD_GO_HOME)
            return block !== BLOCK_TYPE.WALL &&
                    block !== BLOCK_TYPE.PORTAL &&
                    block !== BLOCK_TYPE.PORTAL_PATH;
        else
            return block !== BLOCK_TYPE.WALL;
    }

    stopWaitingAndGoHunting() {
        this.state = STATES.STOP_WAITING;

        // TRY TO EXIT THE Y AXIS
        for (let i = this.bornCoordI.begin; i <= this.bornCoordI.end; i = this.bornCoordI.end) {
            for (let j = this.bornCoordJ.begin; j <= this.bornCoordJ.end; j++) {
                let direction = null;
                let rate = 2;

                if (i === this.bornCoordI.begin && this.game.map.getTopBlock(i, j) !== BLOCK_TYPE.WALL) {
                    rate *= -1;
                    direction = DIRECTIONS.UP;
                }
                else if (i === this.bornCoordI.end && this.game.map.getBottomBlock(i, j) !== BLOCK_TYPE.WALL)
                    direction = DIRECTIONS.DOWN;

                if (direction) {
                    this.toX = j * this.size;
                    this.toY = (i + rate) * this.size;

                    if (this.x !== this.toX)
                        this.direction = this.x < this.toX ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
                    else
                        this.direction = direction;
                    return;
                }
            }   
        }

        // TRY TO EXIT THE X AXIS
        for (let j = this.bornCoordJ.begin; j <= this.bornCoordJ.end; j = this.bornCoordJ.end) {
            for (let i = this.bornCoordI.begin; i <= this.bornCoordI.end; i++) {
                let direction = null;
                let rate = 2;

                if (j === this.bornCoordJ.begin && this.game.map.getLeftBlock(i, j) !== BLOCK_TYPE.WALL) {
                    direction = DIRECTIONS.LEFT;
                    rate *= -1;
                }
                else if (j === this.bornCoordJ.end && this.game.map.getRightBlock(i, j) !== BLOCK_TYPE.WALL)
                    direction = DIRECTIONS.RIGHT;

                if (direction) {
                    this.toX = (j + rate) * this.size;
                    this.toY = i * this.size;


                    if (this.y !== this.toY)
                        this.direction = this.y < this.toY ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
                    else
                        this.direction = direction;
                    return;
                }
            }   
        }
    };

    private checkArriveTheDestination(enter: boolean = false): boolean {
        if (this.destinationToGo && this.destinationToGo.i && this.destinationToGo.j) {
            if (enter) {
                let diff = 0;
                let i = this.y / this.size;
                let j = this.x / this.size;

                if (this.destinationToGo.i === i)
                    diff = Math.abs(this.destinationToGo.j - j);
                else if (this.destinationToGo.j === j)
                    diff = Math.abs(this.destinationToGo.i - i);
                else
                    return false;
    
                return diff > 0 && diff <= .5;
            }
            else
                return this.destinationToGo.i === this.i() && this.destinationToGo.j === this.j();
        };

        return false;
    }

    private checkCurrentDestinationToGoEquals(i: number, j: number) {
        if (this.destinationToGo)
            return this.destinationToGo.i === i && this.destinationToGo.j === j;
        return false;
    }

    private goToDestination(lastDirection: DIRECTIONS) {
        if (this.destinationToGo && this.destinationToGo.i && this.destinationToGo.j) {
            if (this.checkCurrentDestinationToGoEquals(this.i(), this.j()))
                return;

            this.lastDestinationToGo = this.destinationToGo;
            let detination = this.lastDestinationToGo;

            let destX = detination.j * this.size;
            let destY = detination.i * this.size;

            let x = this.x;
            let y = this.y;

            let diffDistanceX = Math.abs(x - destX);
            let diffDistanceY = Math.abs(y - destY);

            let destDirectionX = destX < x ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
            let destDirectionY = destY < y ? DIRECTIONS.UP : DIRECTIONS.DOWN;

            let direction = lastDirection ? lastDirection : null;

            if (!lastDirection) {
                if (Helper.randomInterval(1, 999) % 2 > 0)
                    direction = (diffDistanceX > diffDistanceY) ? destDirectionX : destDirectionY;
                else
                    direction = (diffDistanceX > diffDistanceY) ? destDirectionY : destDirectionX;
            }

            let arrayDirections: any[] = [];

            let maxI = this.game.map.lengthY - 1;
            let maxJ = this.game.map.lengthX - 1;

            let getRateMovI = (direction: DIRECTIONS, destDirectionY: DIRECTIONS) => {
                let _direction = this.directionIsY(direction) 
                                        ? direction
                                        : destDirectionY;
                return _direction === DIRECTIONS.UP ? -1 : 1;
            };

            let getRateMovJ = (direction: DIRECTIONS, destDirectionX: DIRECTIONS) => {
                let _direction = this.directionIsX(direction) 
                                        ? direction
                                        : destDirectionX;
                return _direction === DIRECTIONS.LEFT ? -1 : 1;
            };

            let isReturning = (direction: DIRECTIONS) => {
                if (arrayDirections.length)
                    return this.getReverseDirection(direction) === arrayDirections[arrayDirections.length - 1];
                return false;
            };
            
            buildRoute:
            for(let i = this.i(true);  i >= 0 && i <= maxI; i += getRateMovI(direction, destDirectionY)) {
                for(let j = this.j(true); j >= 0 && j <= maxJ; j += getRateMovJ(direction, destDirectionX)) {
                    for (let attempts = 1; attempts <= 5; attempts++) {
                        if (attempts <= 4) {
                            if (this.canGoInTheDirection(direction, x, y)) {
                                arrayDirections.push(direction);
                                let lastDirection = direction;

                                if (this.directionIsX(direction))
                                    x += this.size * (direction === DIRECTIONS.LEFT ? -1 : 1);
                                else
                                    y += this.size * (direction === DIRECTIONS.UP ? -1 : 1);

                                diffDistanceX = Math.abs(x - destX);
                                diffDistanceY = Math.abs(y - destY);

                                if (diffDistanceX > 0 || diffDistanceY > 0) {
                                    destDirectionX = destX < x ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
                                    destDirectionY = destY < y ? DIRECTIONS.UP : DIRECTIONS.DOWN;
            
                                    if (this.state !== STATES.DEAD_GO_HOME) {
                                        if (Helper.randomInterval(1, 999) % 2 > 0)
                                            direction = (diffDistanceX > diffDistanceY) ? destDirectionX : destDirectionY;
                                        else
                                            direction = (diffDistanceX > diffDistanceY) ? destDirectionY : destDirectionX;
                                    }
                                    else {
                                        if (diffDistanceX === 0)
                                            direction = destDirectionY;
                                        else if (diffDistanceY === 0)
                                            direction = destDirectionX;
                                        else
                                            direction = (diffDistanceX > diffDistanceY) ? destDirectionX : destDirectionY;
                                    }

                                    if (isReturning(direction))
                                        direction = this.directionIsX(direction) ? destDirectionY : destDirectionX;
                                    
                                    if (lastDirection === direction && direction !== destDirectionX && direction !== destDirectionY)
                                        direction = this.directionIsX(direction) ? destDirectionY : destDirectionX;

                                    break;
                                }
                                else
                                    break buildRoute;
                            }
                            else {
                                if (attempts % 2 !== 0) {
                                    direction = this.directionIsX(direction) ? destDirectionY : destDirectionX;

                                    if (isReturning(direction))
                                        direction = this.getReverseDirection(direction);
                                }
                                else {
                                    if (!isReturning(this.getReverseDirection(direction)))
                                        direction = this.getReverseDirection(direction);
                                    else
                                        direction = this.directionIsX(direction) ? destDirectionY : destDirectionX;
                                }
                                
                            }
                        }
                        else {
                            break buildRoute;
                        }
                    }
                }
            }

            this.arrayDirectionsToGo = arrayDirections;
        }
    };

    goHunting() {
        this.state = STATES.HUNTING;
        this.clearDestinationToGo();
    };

    updateRenderWaitingTime() {
        this.howLongIsTheWait += this.game.timeToRerender;
    }

    directionIsX(direction?: string) {
        if (!direction) direction = this.direction;
        return direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;
    };
    directionIsY(direction?: string) {
        if (!direction) direction = this.direction;
        return direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN;
    };

    getReverseDirection(direction?: DIRECTIONS) {
        if (!direction)
            direction = this.direction;

        if (direction === DIRECTIONS.UP)
            return DIRECTIONS.DOWN;
        if (direction === DIRECTIONS.DOWN)
            return DIRECTIONS.UP;
        if (direction === DIRECTIONS.LEFT)
            return DIRECTIONS.RIGHT;
        if (direction === DIRECTIONS.RIGHT)
            return DIRECTIONS.LEFT;

        return DIRECTIONS.NONE;
    };
    getReverseOrientation(direction?: DIRECTIONS) {
        if (!direction)
            direction = this.direction;

        if (direction === DIRECTIONS.UP)
            return DIRECTIONS.LEFT;
        if (direction === DIRECTIONS.DOWN)
            return DIRECTIONS.RIGHT;
        if (direction === DIRECTIONS.LEFT)
            return DIRECTIONS.UP;
        if (direction === DIRECTIONS.RIGHT)
            return DIRECTIONS.DOWN;

        return DIRECTIONS.NONE;
    };
}
 
export enum SPEED {
    NORMAL = .8,
    FAST = 1.5,
    SLOW = .5,
};
 
export enum STATES {
    WAITING = 'WAITING',
    STOP_WAITING = 'STOP_WAITING',
    HUNTING = 'HUNTING',
    STUNNED = 'STUNNED',
    STUNNED_BLINK = 'STUNNED_BLINK',
    DEAD_GO_HOME = 'DEAD_GO_HOME',
    DEAD = 'DEAD',
};