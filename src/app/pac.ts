import { PacCoin } from './pac-coin';
import { DIRECTIONS } from './enums';
import { Helper } from './helper';

import {STATES as GHOST_STATE} from './ghost';
import { BLOCK_TYPE } from './map';
import { isNullOrUndefined } from 'util';

export class Pac {
    public game: PacCoin;

    public capImage = {
        LEFT: { img: new Image(), rateX: -.15, rateY: .2 },
        RIGHT: { img: new Image(), rateX: .15, rateY: .2 },
        UP: { img: new Image(), rateX: .2, rateY: -.15 },
        DOWN: { img: new Image(), rateX: .2, rateY: .15 }
    };
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

        this.capImage.LEFT.img.src = 'assets/img/cap.svg#left';
        this.capImage.RIGHT.img.src = 'assets/img/cap.svg#right';
        this.capImage.UP.img.src = 'assets/img/cap.svg#up';
        this.capImage.DOWN.img.src = 'assets/img/cap.svg#down';
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
        if (direction !== this.direction && direction !== this.directionAfterEnd) {
            var changeOrientation = this.direction !== DIRECTIONS.LEFT && this.direction !== DIRECTIONS.RIGHT;
            var changeDirection = (this.direction === DIRECTIONS.LEFT || this.direction === DIRECTIONS.RIGHT) && this.direction !== direction;
            let lastDirection = this.direction;
    
            if (changeOrientation) {
                this.directionAfterEnd = direction;
                return;
            }
            else {
                this.directionAfterEnd = null;
                this.direction = direction;

                if (changeDirection) {
                    if (this.x !== this.toX) {
                        if (lastDirection === DIRECTIONS.LEFT)
                            this.toX = (Math.floor(this.toX / this.size) + 1) * this.size;
                        else
                            this.toX = (Math.floor(this.toX / this.size) - 1) * this.size;
                    }
                }
            }
        }
    };
    private moveY(direction: any) {
        if (direction !== this.direction && direction !== this.directionAfterEnd) {
            var changeOrientation = this.direction !== DIRECTIONS.UP && this.direction !== DIRECTIONS.DOWN;
            var changeDirection = (this.direction === DIRECTIONS.DOWN || this.direction === DIRECTIONS.UP) && this.direction !== direction;
            let lastDirection = this.direction;

            if (changeOrientation) {
                this.directionAfterEnd = direction;
                return;
            }
            else {
                this.directionAfterEnd = null;
                this.direction = direction;    

                if (changeDirection) {
                    if (this.y !== this.toY) {
                        if (lastDirection === DIRECTIONS.UP)
                            this.toY = (Math.floor(this.toY / this.size) + 1) * this.size;
                        else
                            this.toY = (Math.floor(this.toY / this.size) - 1) * this.size;
                    }
                }
            }
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

    directionIsX(direction?: any) {
        if (!direction) direction = this.direction;
        return direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;
    };
    directionIsY(direction?: any) {
        if (!direction) direction = this.direction;
        return direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN;
    };

    onKeydown(event: any) {
        if (this.game.isRunning) {
            if ([37, 38, 39, 40].indexOf(event.keyCode) >= 0 && !this.enteringPortal) {
                if (event.keyCode === 38)
                    this.moveY(DIRECTIONS.UP);
                else if (event.keyCode === 40)
                    this.moveY(DIRECTIONS.DOWN);
                else if (event.keyCode === 37)
                    this.moveX(DIRECTIONS.LEFT);
                else if (event.keyCode === 39)
                    this.moveX(DIRECTIONS.RIGHT);
            }
        }
    };

    render() {
        this.updateCoordinates();

        this.renderPac();
        this.renderCap();

        this.checkPacFoundGhostStunned();
    };

    private renderPac() {
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
    }
    private renderCap() {
        if (this.game.isSocialBank()) {
            let direction = this.direction === DIRECTIONS.NONE ? DIRECTIONS.LEFT : this.direction;
            let image = this.capImage[direction].img;
            let x = this.x - (this.size * this.capImage[direction].rateX);
            let y = this.y - (this.size * this.capImage[direction].rateY);
            this.game.context.drawImage(image, x, y,  Math.floor(this.size), Math.floor(this.size));
        }
    }

    private checkPacFoundGhostStunned() {
        if (this.game.isRunning) {
            let i = this.y / this.size;
            let j = this.x / this.size;
            
            let stunnedGhosts = this.game.ghosts.filter(x => (x.state === GHOST_STATE.STUNNED || x.state === GHOST_STATE.STUNNED_BLINK));
            for (let ghost of stunnedGhosts) {
                let diff = 0;

                let ghostI = (ghost.y + ghost.leftoverSize) / ghost.blockSize;
                let ghostJ = (ghost.x + ghost.leftoverSize) / ghost.blockSize;
    
                if (i !== ghostI || j !== ghostJ) {

                    if (i !== ghostI && j !== ghostJ) {
                        if (this.directionIsX(ghost.direction))
                            ghostI = ghost.y / ghost.blockSize;
                        else
                            ghostJ = ghost.x / ghost.blockSize;

                        if (i !== ghostI && j !== ghostJ)
                            continue;
                    }

                    if (ghostI === i)
                        diff = Math.abs(ghostJ - j);
                    else if (ghostJ === j)
                        diff = Math.abs(ghostI - i);
                    else
                        continue;
            
                    if (diff >= 0 && diff <= .8)
                        this.game.pacFoundStunnedGhost(ghost);
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
                if (this.directionIsX())
                    this.enteringPortal = this.direction === DIRECTIONS.LEFT ? (nextX < 0) : (nextX + this.size) > this.game.width;
                else if (this.directionIsY())
                    this.enteringPortal = this.direction === DIRECTIONS.UP ? (nextY < 0) : (nextY + this.size) > this.game.height;
            }
    
            if (!this.enteringPortal) {
                if (nextX !== this.x || nextY !== this.y) {
                    if (this.game.map.pacCanGo(nextX, nextY, this.size)){
                        this.x = nextX;
                        this.y = nextY;
    
                        this.checkColisions();
                    }
                    else {
                        this.x = this.j(this.direction === DIRECTIONS.LEFT) * this.size;
                        this.y = this.i(this.direction === DIRECTIONS.UP) * this.size;
                        this.toX = this.x;
                        this.toY = this.y;
                    }
                }
                else {
                    if (this.directionAfterEnd && this.canGoInTheDirection(this.directionAfterEnd))
                        this.direction = this.directionAfterEnd;
                    
                    if (this.canGoInTheDirection(this.direction)) {
                        this.goToTheDirection(this.direction);
                        this.updateCoordinates();
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
        if (direction !== DIRECTIONS.NONE) {
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

            let block = this.game.map.getBlockByCoordinates(x, y, this.size);
            return [ BLOCK_TYPE.WALL, BLOCK_TYPE.GHOST_HOUSE ].every(x => block !== x);
        }
        return false;
    }

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