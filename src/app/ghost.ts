import { Helper } from './helper';
import { DIRECTIONS } from './enums';

export class Ghost {

    public game: any;
    public name: string;

    public size = 0;

    public bornCoordX: any = null;
    public bornCoordY: any = null;
    public bornCoordI: { begin: number, end: number };
    public bornCoordJ: { begin: number, end: number };

    public imagesPerState: any = [];

    public x = 0;
    public y = 0;
    public toX = this.x;
    public toY = this.y;

    public direction = DIRECTIONS.NONE;
    public state = STATES.WAITING;

    public image = new Image();

    public leaveWaitingTime = 0;
    public renderWaitingTime = 0;
    public howLongIsTheWait = 0;

    public destinationToGo: any = null;
    public lastDestinationToGo: any = null;
    public arrayDirectionsToGo: any[] = [];

    constructor(game: any, name: string){
        this.game = game;
        this.name = name;
    
        this.size = this.game.blockSize;
    
        this.bornCoordX = this.game.map.ghostBornCoords.x;
        this.bornCoordY = this.game.map.ghostBornCoords.y;
        this.bornCoordI = { begin: this.bornCoordY.begin / this.size, end: this.bornCoordY.end / this.size };
        this.bornCoordJ = { begin: this.bornCoordX.begin / this.size, end: this.bornCoordX.end / this.size };
    
        this.imagesPerState = {
            WAITING: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            STOP_WAITING: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            HUNTING: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            STUNNED: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            DEAD_GO_HOME: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            DEAD: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' }
        };
    
        this.image.src =  this.imagesPerState[this.state].normal;
    
        this.leaveWaitingTime = 5000 + ((this.ghostNumber() - 1) * 4000);
        this.renderWaitingTime = ((this.ghostNumber() - 1) * 4000);
        
        this.initialize();
    }
    
    ghostNumber() { return parseInt(this.name); }
    
    i(round = false) {
        let size = this.size;
        let y = this.y;
        
        if (round && this.direction === DIRECTIONS.UP)
            y -= size;
        
        let i = Math.floor(y / size) + ((round && y % size) > 5 ? 1 : 0);
        return Math.min( i, this.game.map.matriz.length - 1);
    };

    j(round = false, direction?: string) {
        let size = this.size;
        let x = this.x;
        
        if (!direction)
            direction = this.direction;

        if (round && this.direction === DIRECTIONS.LEFT)
            x -= size;
        
        let j = Math.floor(x / size) + ((round && x % size) > 5 ? 1 : 0);
        return Math.min(j, this.game.map.matriz[0].length - 1);
    };

    initialize(){
        let initI = Helper.randomInterval(this.bornCoordI.begin, this.bornCoordI.end);
        let initJ = Helper.randomInterval(this.bornCoordJ.begin, this.bornCoordJ.end);

        this.x = initJ * this.size;
        this.y = initI * this.size;
        this.toX = this.x;
        this.toY = this.y;

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
    };

    render(){
        this.updaterenderWaitingTime();

        if (this.howLongIsTheWait >= this.renderWaitingTime) {
            this.updateCoordinates();
            this.game.context.drawImage(this.image, this.x, this.y, this.size, this.size);
        }
    };

    updateCoordinates(){
        let nextX = this.x;
        let nextY = this.y;

        let rate = .8;

        if (this.x !== this.toX && this.directionIsX())
            nextX = this.game.applySmoothCoord(this.x, this.toX, rate);
        else if (this.x !== this.toX && this.y === this.toY) {
            this.direction = this.x < this.toX ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
            nextX = this.game.applySmoothCoord(this.x, this.toX, rate);
        }
        else if (this.y !== this.toY && this.directionIsY())
            nextY = this.game.applySmoothCoord(this.y, this.toY, rate);
        else if (this.y !== this.toY && this.x === this.toX) {
            this.direction = this.y < this.toY ? DIRECTIONS.DOWN : DIRECTIONS.UP;
            nextY = this.game.applySmoothCoord(this.y, this.toY, rate);
        }
        
        switch(this.state) {
            case STATES.WAITING: {
                if (nextX !== this.x || nextY !== this.y)
                    this.goToNextCoords(nextX,nextY);
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
                if (nextX !== this.x || nextY !== this.y)
                    this.goToNextCoords(nextX, nextY);
                else
                    this.goHunting();
                break;
            }
            case STATES.HUNTING: {
                if (nextX !== this.x || nextY !== this.y) {
                    this.goToNextCoords(nextX, nextY);
                }
                else {
                    let pacI = this.game.pac.i();
                    let pacJ = this.game.pac.j();

                    if (!this.arrayDirectionsToGo.length ||
                        !this.lastDestinationToGo ||
                        this.lastDestinationToGo.i !== pacI ||
                        this.lastDestinationToGo.j !== pacJ)
                    {
                        let lastNextDirection = this.arrayDirectionsToGo.length ? this.arrayDirectionsToGo[0] : null;
                        this.arrayDirectionsToGo = [];
                        this.lastDestinationToGo = null;
                        this.destinationToGo = {
                            i: pacI,
                            j: pacJ
                        };

                        this.goToDestination(lastNextDirection);
                    }
                    
                    if (this.arrayDirectionsToGo.length) {
                        let direction = this.arrayDirectionsToGo[0];
                        this.arrayDirectionsToGo = this.arrayDirectionsToGo.length ? this.arrayDirectionsToGo.slice(1) : [];
                        this.goToTheDirection(direction);
                        this.updateCoordinates();
                    }
                }
                break;
            }
            case STATES.STUNNED: {
                break;
            }
            case STATES.DEAD_GO_HOME: {
                break;
            }
            case STATES.DEAD: {
                break;
            }
        }
    }

    goToNextCoords(nextX: number, nextY: number) {
        if (!this.game.map.isCollidingWithWall(nextX, nextY, this.size)){
            this.x = nextX;
            this.y = nextY;
        }
        else {
            this.x = Math.floor(this.j()) * this.size;
            this.y = Math.floor(this.i()) * this.size;
            this.toX = this.x;
            this.toY = this.y;
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

    canGoInTheDirection(direction: string, x: number, y: number, limit?: any) {
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

        if (this.state === STATES.HUNTING)
            return block !== this.game.map.POSITION_TYPE.WALL &&
                    block !== this.game.map.POSITION_TYPE.PORTAL &&
                    block !== this.game.map.POSITION_TYPE.PORTAL_PATH &&
                    block !== this.game.map.POSITION_TYPE.GHOST_HOUSE;
        else
            return block !== this.game.map.POSITION_TYPE.WALL;
    }

    stopWaitingAndGoHunting() {
        this.state = STATES.STOP_WAITING;
        this.image.src = this.imagesPerState[this.state].normal;

        // TRY TO EXIT THE Y AXIS
        for (let i = this.bornCoordI.begin; i <= this.bornCoordI.end; i = this.bornCoordI.end) {
            for (let j = this.bornCoordJ.begin; j <= this.bornCoordJ.end; j++) {
                let direction = null;
                let rate = 2;

                if (i === this.bornCoordI.begin && this.game.map.getTopBlock(i, j) !== this.game.map.POSITION_TYPE.WALL) {
                    rate *= -1;
                    direction = DIRECTIONS.UP;
                }
                else if (i === this.bornCoordI.end && this.game.map.getBottomBlock(i, j) !== this.game.map.POSITION_TYPE.WALL)
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

                if (j === this.bornCoordJ.begin && this.game.map.getLeftBlock(i, j) !== this.game.map.POSITION_TYPE.WALL) {
                    direction = DIRECTIONS.LEFT;
                    rate *= -1;
                }
                else if (j === this.bornCoordJ.end && this.game.map.getRightBlock(i, j) !== this.game.map.POSITION_TYPE.WALL)
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

    goToDestination(lastDirection: DIRECTIONS) {
        if (this.destinationToGo && this.destinationToGo.i && this.destinationToGo.j) {
            if (this.destinationToGo.i === this.i() &&  this.destinationToGo.j === this.j())
                return;

            this.lastDestinationToGo = this.destinationToGo;
            let detination = this.lastDestinationToGo;

            let destX = detination.j * this.size;
            let destY = detination.i * this.size;

            let x = this.x;
            let y = this.y;

            let diffDistanceX = Math.abs(this.x - destX);
            let diffDistanceY = Math.abs(this.y - destY);

            let destDirectionX = destX < this.x ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
            let destDirectionY = destY < this.x ? DIRECTIONS.UP : DIRECTIONS.DOWN;

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

            let getLastDirection = () => {
                return arrayDirections.length ? arrayDirections[arrayDirections.length - 1] : '';
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

                                if (this.directionIsX(direction))
                                    x += this.size * (direction === DIRECTIONS.LEFT ? -1 : 1);
                                else
                                    y += this.size * (direction === DIRECTIONS.UP ? -1 : 1);

                                diffDistanceX = Math.abs(x - destX);
                                diffDistanceY = Math.abs(y - destY);

                                if (diffDistanceX > 0 || diffDistanceY > 0) {
                                    destDirectionX = destX < x ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
                                    destDirectionY = destY < y ? DIRECTIONS.UP : DIRECTIONS.DOWN;
            
                                    if (Helper.randomInterval(1, 999) % 2 > 0)
                                        direction = (diffDistanceX > diffDistanceY) ? destDirectionX : destDirectionY;
                                    else
                                        direction = (diffDistanceX > diffDistanceY) ? destDirectionY : destDirectionX;

                                    if (isReturning(direction))
                                        direction = this.directionIsX(direction) ? destDirectionY : destDirectionX;

                                    let lastDirection = getLastDirection();
                                    
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
        this.image.src = this.imagesPerState[this.state].normal;
    };

    updaterenderWaitingTime() {
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
 
export enum STATES {
    WAITING = 'WAITING',
    STOP_WAITING = 'STOP_WAITING',
    HUNTING = 'HUNTING',
    STUNNED = 'STUNNED',
    DEAD_GO_HOME = 'DEAD_GO_HOME',
    DEAD = 'DEAD',
};