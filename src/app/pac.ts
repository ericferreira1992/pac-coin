import { PacCoin } from './pac-coin';
import { DIRECTIONS } from './enums';
import { Helper } from './helper';

import {STATES as GHOST_STATE} from './ghost';

export class Pac {
    public game: PacCoin;

    public image: any = null;
    public imageUrl = 'assets/img/sb-icon.svg';
    public size = 0;
    public x = 0;
    public y = 0;
    public toX = this.x;
    public toY = this.y;
    public directionAfterEnd: any = null;
    public direction: DIRECTIONS = DIRECTIONS.NONE;

    public enteringPortal = false;
    public enteringPortalEnding = false;

    constructor(game: PacCoin) {
        this.game = game;

        this.size = this.game.blockSize;
        this.x = this.game.map.pacBornCoords.x;
        this.y = this.game.map.pacBornCoords.y;
        this.toX = this.x;
        this.toY = this.y;
    }
    
    public i(round = false) {
        var size = this.size;
        var y = this.y;
        
        if (round && this.direction === DIRECTIONS.UP)
            y -= size;
        
        var i = Math.floor(y / size) + ((round && y % size) > 5 ? 1 : 0);
        return Math.min( i, this.game.map.matriz.length - 1);
    };
    public j(round = false) {
        var size = this.size;
        var x = this.x;
        
        if (round && this.direction === DIRECTIONS.LEFT)
            x -= size;
        
        var j = Math.floor(x / size) + ((round && x % size) > 5 ? 1 : 0);
        return Math.min(j, this.game.map.matriz[0].length - 1);
    };

    public get iFractioned() { return this.y / this.size; }
    public get jFractioned() { return this.x / this.size; }

    private moveX(direction: any) {
        var changeOrientation = this.direction !== DIRECTIONS.LEFT && this.direction !== DIRECTIONS.RIGHT;
        var changeDirection = (this.direction === DIRECTIONS.LEFT || this.direction === DIRECTIONS.RIGHT) && this.direction !== direction;

        if (changeOrientation && this.y !== this.toY) {
            this.toY = Math.floor(this.i(true)) * this.size;
            this.directionAfterEnd = direction;
            return;
        }
        else
            this.directionAfterEnd = null;

        if (!changeOrientation || this.y === this.toY) {
            this.direction = direction;

            if (changeDirection)
                this.toX = this.x;

            var currentX = this.x;

            if ((this.direction === DIRECTIONS.LEFT && !this.game.map.xCoordinateIsBegin(currentX, this.y)) ||
                (this.direction === DIRECTIONS.RIGHT && !this.game.map.xCoordinateIsEnd(currentX, this.y)))
            {
                var currentIndexes = this.game.map.getIndexesByCoordinates(currentX, this.y, this.size, this.direction);
                var moveToJ = currentIndexes.j + (this.direction === DIRECTIONS.RIGHT ? 1 : 0); 
                var _toX = moveToJ * this.size;

                if (this.game.map.pacCanGo(_toX, this.y, this.size)) {
                    if (currentX === 0)
                        _toX += direction === DIRECTIONS.LEFT ? -this.size : 0;

                    if (this.x === this.toX && _toX > 0)
                        _toX += this.direction === DIRECTIONS.LEFT ? -this.size : this.size;

                    this.enteringPortal = this.direction === DIRECTIONS.LEFT ? (_toX < 0) : (_toX > this.game.width);

                    this.toX = _toX;
                }
                else if (changeDirection)
                    this.toX =  currentIndexes.j * this.size;
            }
            this.toY = this.y;
        }
    };
    private moveY(direction: any) {
        var changeOrientation = this.direction !== DIRECTIONS.UP && this.direction !== DIRECTIONS.DOWN;
        var changeDirection = (this.direction === DIRECTIONS.DOWN || this.direction === DIRECTIONS.UP) && this.direction !== direction;

        if (changeOrientation && this.x !== this.toX) {
            this.toX = Math.floor(this.j(true)) * this.size;
            this.directionAfterEnd = direction;
            return;
        }
        else
            this.directionAfterEnd = null;

        if (!changeOrientation || this.x === this.toX) {
            this.direction = direction;

            if (changeDirection)
                this.toY = this.y;

            var currentY = this.y;

            if ((this.direction === DIRECTIONS.UP && !this.game.map.yCoordinateIsBegin(currentY)) ||
                (this.direction === DIRECTIONS.DOWN && !this.game.map.yCoordinateIsEnd(currentY)))
            {
                var currentIndexes = this.game.map.getIndexesByCoordinates(this.x, currentY, this.size, this.direction);
                var moveToI = currentIndexes.i + (this.direction === DIRECTIONS.DOWN ? 1 : 0);
                var _toY = moveToI * this.size;

                if (this.game.map.pacCanGo(this.x, _toY, this.size)) {
                    if (currentY === 0)
                        _toY += _toY + (direction === DIRECTIONS.UP ? -this.size : 0);

                    if (this.y === this.toY && _toY > 0)
                        _toY += this.direction === DIRECTIONS.UP ? -this.size : this.size;

                    this.enteringPortal = (this.direction.toString() === DIRECTIONS.LEFT) ? (_toY < 0) : (_toY > this.game.height);

                    this.toY = _toY;
                }
                else if (changeDirection)
                    this.toY =  currentIndexes.i * this.size;
            }
            this.toX = this.x;
        }
    };

    public getDirectionByCode(keyCode: any) {
        switch(keyCode) {
            case 37: return DIRECTIONS.LEFT;
            case 38: return DIRECTIONS.UP;
            case 39: return DIRECTIONS.RIGHT;
            case 40: return DIRECTIONS.DOWN;
            default: return 'NONE';
        }
    };

    public getCodeByDirection(direction: DIRECTIONS) {
        switch(direction) {
            case DIRECTIONS.LEFT: return 37;
            case DIRECTIONS.UP: return 38;
            case DIRECTIONS.RIGHT: return 39;
            case DIRECTIONS.DOWN: return 40;
            default: return 0;
        }
    };

    directionIsX(direction: any) {
        if (!direction) direction = this.direction;
        return direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;
    };
    directionIsY(direction: any) {
        if (!direction) direction = this.direction;
        return direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN;
    };

    onKeydown(event: any) {
        if (this.game.isRunning) {
            if ([37, 38, 39, 40].indexOf(event.keyCode) >= 0 && !this.enteringPortal) {
                if (event.keyCode === 38) {
                    this.moveY(DIRECTIONS.UP);
                }
                else if (event.keyCode === 40) {
                    this.moveY(DIRECTIONS.DOWN);
                }
                else if (event.keyCode === 37) {
                    this.moveX(DIRECTIONS.LEFT);
                }
                else if (event.keyCode === 39) {
                    this.moveX(DIRECTIONS.RIGHT);
                }
            }
        }
    };

    onKeyup(event: any) {
        if (this.game.isRunning) {
            if ([37, 38, 39, 40].indexOf(event.keyCode) >= 0) {
                if (!this.enteringPortal) {
                    var direction = this.getDirectionByCode(event.keyCode);
    
                    if (this.directionIsX(direction))
                        this.stopMovimentX(direction);
                    else if (this.directionIsY(direction))
                        this.stopMovimentY(direction);
                }
            }
        }
    };

    render() {
        this.updateCoordinates();

        var angle = this.calcAngle();
        this.game.context.beginPath();
        this.game.context.moveTo(this.x + (this.size / 2), this.y + (this.size / 2));
        this.game.context.fillStyle = this.game.colors.pac;
        this.game.context.arc(
            this.x + (this.size / 2),
            this.y + (this.size / 2),
            this.size / 2,
            Math.PI * angle.start, 
            Math.PI * angle.end,
            angle.direction
        );
        this.game.context.fill();

        this.checkPacFoundGhostStunned();
    };

    private checkPacFoundGhostStunned() {
        if (this.game.isRunning) {
            let i = this.y / this.size;
            let j = this.x / this.size;
            
            let stunnedGhosts = this.game.ghosts.filter(x => (x.state === GHOST_STATE.STUNNED || x.state === GHOST_STATE.STUNNED_BLINK));
            for (let ghost of stunnedGhosts) {
                let diff = 0;
    
                if (ghost.i() === i)
                    diff = Math.abs(ghost.j() - j);
        
                if (ghost.j() === j)
                    diff = Math.abs(ghost.i() - i);
        
                if (diff > 0 && diff <= .5) {
                    this.game.pacFoundStunnedGhost(ghost);
                    break;
                }
            }
        }
    }

    stopMovimentX(directionToStop: any) {
        if (directionToStop === this.direction)
            this.toX = Math.max(Math.min(Math.floor(this.j(this.direction === DIRECTIONS.RIGHT)) * this.size, this.game.width - this.size), 0);
    };

    stopMovimentY(directionToStop: any) {
        if (directionToStop === this.direction)
            this.toY = Math.max(Math.min(Math.floor(this.i(this.direction === DIRECTIONS.DOWN)) * this.size, this.game.height - this.size), 0);
    };

    updateCoordinates() {
        if (this.game.isRunning) {
            var nextX = this.game.applySmoothCoord(this.x, this.toX);
            var nextY = this.game.applySmoothCoord(this.y, this.toY);
    
            if (!this.enteringPortal) {
                if (nextX !== this.x || nextY !== this.y) {
                    // let canParseDirection = !Helper.hasDecimal(this.y / this.size) && !Helper.hasDecimal(this.x / this.size);
                    // if (this.game.map.pacCanGo(nextX, nextY, this.size, canParseDirection ? this.direction : null)){
                    if (this.game.map.pacCanGo(nextX, nextY, this.size)){
                        this.x = nextX;
                        this.y = nextY;
    
                        this.checkColisions();
                    }
                    else {
                        this.x = Math.floor(this.j()) * this.size;
                        this.y = Math.floor(this.i()) * this.size;
                        this.toX = this.x;
                        this.toY = this.y
                    }
                }
                else {
                    if (this.directionAfterEnd) {
                        if (this.directionAfterEnd === DIRECTIONS.LEFT || this.directionAfterEnd === DIRECTIONS.RIGHT)
                            this.moveX(this.directionAfterEnd);
                        else
                            this.moveY(this.directionAfterEnd);
                    }
                }
            }
            else {
                if (nextX !== this.x || nextY !== this.y) {
                    this.x = nextX;
                    this.y = nextY;
    
                    if (this.x === this.toX && this.y === this.toY) {
    
                        if (!this.enteringPortalEnding) {
                            this.enteringPortalEnding = true;
                            if (this.direction === DIRECTIONS.RIGHT) {
                                this.x = -this.size;
                                this.toX = 0;
                            }
                            else if (this.direction === DIRECTIONS.LEFT) {
                                this.x = this.game.width;
                                this.toX = this.game.width - this.size;
                            }
                            else if (this.direction === DIRECTIONS.DOWN) {
                                this.y = -this.size;
                                this.toY = 0;
                            }
                            else if (this.direction === DIRECTIONS.UP) {
                                this.y = this.game.height;
                                this.toY = this.game.height - this.size;
                            }
                        }
                        else{
                            this.enteringPortal = false;
                            this.enteringPortalEnding = false;
                        }
                    }
                }
            }
        }
    };

    checkColisions() {
        var indexes = this.game.map.getIndexesByCoordinates(this.x, this.y, this.size, this.direction);
        
        if (this.game.map.biscuitGettedByCoordinates(this.x, this.y, this.size, this.direction)) {
            this.game.user.setBiscuitGetted(indexes.i, indexes.j);
        }
        else if (this.game.map.pillGettedByCoordinates(this.x, this.y, this.size, this.direction)) {
            this.game.user.setPillGetted(indexes.i, indexes.j);
        }
    }

    calcAngle() { 
        if (this.direction === DIRECTIONS.RIGHT && (this.x % 10 < 5 || this.x == this.toX))
            return { start: 0.25, end: 1.75, direction: false };
        if (this.direction === DIRECTIONS.DOWN && (this.y % 10 < 5 || this.y == this.toY)) 
            return { start: 0.75, end: 2.25, direction: false };
        if (this.direction === DIRECTIONS.UP && (this.y % 10 < 5 || this.y == this.toY)) 
            return { start: 1.25, end: 1.75, direction: true };
        if (this.direction === DIRECTIONS.LEFT && (this.x % 10 < 5 || this.x == this.toX))         
            return { start: 0.75, end: 1.25, direction: true };
        
        return { start: 0, end: 2, direction: false };
    };
}