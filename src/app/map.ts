import { PacCoin } from './pac-coin';
import { DIRECTIONS } from './enums';

export class Map {
    
    private game: PacCoin;
    
    public matriz: number[][];

    public pacBornCoords: { x: number, y: number };
    public ghostBornCoords: {
        x: { begin: number, end: number },
        y: { begin: number, end: number }
    };

    public POSITION_TYPE = {
        BISCUIT: 0,
        WALL: 1,
        PILL: 2,
        GHOST_HOUSE: 6,
        PORTAL_PATH: 7,
        PORTAL: 8,
        EMPTY: 9,
    };

    public lengthX: number;
    public lengthY: number;
    public lineWidth = 6;

    constructor(game: PacCoin) {
        this.game = game;
    
        this.matriz = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
            [9, 9, 9, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 9, 9, 9],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 6, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [8, 7, 7, 7, 0, 0, 0, 1, 6, 6, 6, 1, 0, 0, 0, 7, 7, 7, 8],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [9, 9, 9, 1, 0, 1, 0, 0, 0, 9, 0, 0, 0, 1, 0, 1, 9, 9, 9],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
    
        this.pacBornCoords = {
            x: 9 * this.game.blockSize,
            y: 12 * this.game.blockSize
        };
    
        this.ghostBornCoords = {
            x: { begin: 8 * this.game.blockSize, end: 10 * this.game.blockSize },
            y: { begin: 10 * this.game.blockSize, end: 10 * this.game.blockSize },
        };
    
        this.lengthX = this.matriz[0].length;
        this.lengthY = this.matriz.length;
    }

    render() {
        for (let i = 0; i < this.matriz.length; i++) {
            for (let j = 0; j < this.matriz[i].length; j++)
                this.renderBlock(i, j);
        }
    };

    renderBlock(i: number, j: number) {
        let block = this.matriz[i][j];
        let x = j * this.game.blockSize;
        let y = i * this.game.blockSize;
        let xEnd = x + this.game.blockSize;
        let yEnd = y + this.game.blockSize;
        let xMid = x + (this.game.blockSize / 2);
        let yMid = y + this.game.blockSize / 2;

        switch (block) {
            case this.POSITION_TYPE.WALL: {
                let direction = this.getWallDirection(i, j);

                if (direction === WALL_DIRECTIONS.CROSS)
                    break;

                this.game.context.beginPath();
                this.game.context.strokeStyle = this.game.colors.wall;
                this.game.context.lineWidth = this.lineWidth;
                this.game.context.lineCap = 'round';

                if (direction.indexOf('HORIZONTAL') >= 0) {
                    if (direction === WALL_DIRECTIONS.HORIZONTAL) {
                        this.game.context.moveTo(x, yMid);
                        this.game.context.lineTo(xEnd, yMid);
                    }
                    else if (direction === WALL_DIRECTIONS.HORIZONTAL_LEFT) {
                        this.game.context.moveTo(x, yMid);
                        this.game.context.lineTo(xMid, yMid);
                    }
                    else if (direction === WALL_DIRECTIONS.HORIZONTAL_RIGHT) {
                        this.game.context.moveTo(xMid, yMid);
                        this.game.context.lineTo(xEnd, yMid);
                    }
                }

                if (direction.indexOf('VERTICAL') >= 0) {
                    if (direction === WALL_DIRECTIONS.VERTICAL) {
                        this.game.context.moveTo(xMid, y);
                        this.game.context.lineTo(xMid, yEnd);
                    }
                    else if (direction === WALL_DIRECTIONS.VERTICAL_TOP) {
                        this.game.context.moveTo(xMid, y);
                        this.game.context.lineTo(xMid, yMid);
                    }
                    else if (direction === WALL_DIRECTIONS.VERTICAL_BOTTOM) {
                        this.game.context.moveTo(xMid, yMid);
                        this.game.context.lineTo(xMid, yEnd);
                    }
                }

                if (direction === WALL_DIRECTIONS.LEFT_TOP || direction === WALL_DIRECTIONS.RIGHT_TOP ||
                    direction === WALL_DIRECTIONS.LEFT_BOTTOM || direction === WALL_DIRECTIONS.RIGHT_BOTTOM) {
                    let coordinates;

                    if (direction === WALL_DIRECTIONS.LEFT_TOP)
                        coordinates = this.getLeftTopCurveCoord(x, y);

                    if (direction === WALL_DIRECTIONS.RIGHT_TOP)
                        coordinates = this.getRightTopCurveCoord(x, y);

                    if (direction === WALL_DIRECTIONS.LEFT_BOTTOM)
                        coordinates = this.getLeftBottomCurveCoord(x, y);

                    if (direction === WALL_DIRECTIONS.RIGHT_BOTTOM)
                        coordinates = this.getRightBottomCurveCoord(x, y);

                    this.game.context.moveTo(coordinates.x1, coordinates.y1);
                    this.game.context.quadraticCurveTo(coordinates.xMid, coordinates.yMid, coordinates.x2, coordinates.y2);
                }

                if (direction === WALL_DIRECTIONS.BIFURC_LEFT || direction === WALL_DIRECTIONS.BIFURC_RIGHT ||
                    direction === WALL_DIRECTIONS.BIFURC_TOP || direction === WALL_DIRECTIONS.BIFURC_BOTTOM) {
                    let coordinates = {
                        curve01: { x1: 0, y1: 0, x2: 0, y2: 0, xMid: 0, yMid },
                        curve02: { x1: 0, y1: 0, x2: 0, y2: 0, xMid: 0, yMid }
                    };

                    if (direction === WALL_DIRECTIONS.BIFURC_LEFT) {
                        coordinates.curve01 = this.getRightTopCurveCoord(x, y);
                        coordinates.curve02 = this.getRightBottomCurveCoord(x, y);
                    }

                    if (direction === WALL_DIRECTIONS.BIFURC_RIGHT) {
                        coordinates.curve01 = this.getLeftTopCurveCoord(x, y);
                        coordinates.curve02 = this.getLeftBottomCurveCoord(x, y);
                    }

                    if (direction === WALL_DIRECTIONS.BIFURC_TOP) {
                        coordinates.curve01 = this.getRightBottomCurveCoord(x, y);
                        coordinates.curve02 = this.getLeftBottomCurveCoord(x, y);
                    }

                    if (direction === WALL_DIRECTIONS.BIFURC_BOTTOM) {
                        coordinates.curve01 = this.getRightTopCurveCoord(x, y);
                        coordinates.curve02 = this.getLeftTopCurveCoord(x, y);
                    }

                    this.game.context.moveTo(coordinates.curve01.x1, coordinates.curve01.y1);
                    this.game.context.quadraticCurveTo(
                        coordinates.curve01.xMid, coordinates.curve01.yMid,
                        coordinates.curve01.x2, coordinates.curve01.y2
                    );
                    
                    this.game.context.moveTo(coordinates.curve02.x1, coordinates.curve02.y1);
                    this.game.context.quadraticCurveTo(
                        coordinates.curve02.xMid, coordinates.curve02.yMid,
                        coordinates.curve02.x2, coordinates.curve02.y2
                    );
                }

                this.game.context.stroke();
                break;
            }
            case this.POSITION_TYPE.BISCUIT: {
                let indexes = this.game.map.getIndexesByCoordinates(x, y);
                if (!this.game.user.biscuitIsGetted(indexes.i, indexes.j)) {
                    let biscuitSize = 2;
                    this.game.context.beginPath();
                    this.game.context.fillStyle = this.game.colors.biscuit;
                    this.game.context.arc(xMid, yMid, biscuitSize, 0, Math.PI * 2, true);
                    this.game.context.fill();
                }
                break;
            }
            case this.POSITION_TYPE.PILL: {
                let indexes = this.game.map.getIndexesByCoordinates(x, y);
                if (!this.game.user.pillIsGetted(indexes.i, indexes.j)) {
                    let pillSize = 24;
                    this.game.context.drawImage(this.game.coinImg, xMid - (pillSize / 2), yMid - (pillSize / 2), pillSize, pillSize);
                }
                break;
            }
        }
    };

    getLeftTopCurveCoord(x: number, y: number) {
        return {
            x1: x + this.game.blockSize,
            y1: y + ((this.game.blockSize / 2)),
            x2: x + ((this.game.blockSize / 2)),
            y2: y + this.game.blockSize,
            xMid: x + (this.game.blockSize / 2),
            yMid: y + (this.game.blockSize / 2)
        };
    }

    getRightTopCurveCoord(x: number, y: number) {
        return {
            x1: x,
            y1: y + ((this.game.blockSize / 2)),
            x2: x + ((this.game.blockSize / 2)),
            y2: y + this.game.blockSize,
            xMid: x + (this.game.blockSize / 2),
            yMid: y + (this.game.blockSize / 2)
        };
    }

    getLeftBottomCurveCoord(x: number, y: number) {
        return {
            x1: x + ((this.game.blockSize / 2)),
            y1: y,
            x2: x + this.game.blockSize,
            y2: y + ((this.game.blockSize / 2)),
            xMid: x + (this.game.blockSize / 2),
            yMid: y + this.game.blockSize / 2
        };
    }

    getRightBottomCurveCoord(x: number, y: number) {
        return {
            x1: x + ((this.game.blockSize / 2)),
            y1: y,
            x2: x,
            y2: y + ((this.game.blockSize / 2)),
            xMid: x + (this.game.blockSize / 2),
            yMid: y + this.game.blockSize / 2
        };
    }

    getWallDirection(i: number, j: number): WALL_DIRECTIONS {
        if (this.wallIsLine(i, j)) {
            if (this.wallIsVertical(i, j))
                return this.getWallVerticalDirection(i, j);
            else
                return this.getWallHorizontalDirection(i, j);
        }
        else {
            if (this.wallIsBifurcLeft(i, j))
                return WALL_DIRECTIONS.BIFURC_LEFT;
            if (this.wallIsBifurcBottom(i, j))
                return WALL_DIRECTIONS.BIFURC_BOTTOM;
            if (this.wallIsBifurcTop(i, j))
                return WALL_DIRECTIONS.BIFURC_TOP;
            if (this.wallIsBifurcRight(i, j))
                return WALL_DIRECTIONS.BIFURC_RIGHT;
            if (this.wallIsLeftTop(i, j))
                return WALL_DIRECTIONS.LEFT_TOP;
            if (this.wallIsLeftBottom(i, j))
                return WALL_DIRECTIONS.LEFT_BOTTOM;
            if (this.wallIsRightTop(i, j))
                return WALL_DIRECTIONS.RIGHT_TOP;
            if (this.wallIsRightBottom(i, j))
                return WALL_DIRECTIONS.RIGHT_BOTTOM;
            else
                return WALL_DIRECTIONS.CROSS;
        }
    }

    wallIsLine(i: number, j: number) {
        let onLeft = this.getLeftBlock(i, j);
        let onRight = this.getRightBlock(i, j);
        let onTop = this.getTopBlock(i, j);
        let onBottom = this.getBottomBlock(i, j);

        let onLeftTop = this.getLeftTopBlock(i, j);
        let onRightTop = this.getRightTopBlock(i, j);
        let onLeftBottom = this.getLeftBottomBlock(i, j);
        let onRightBottom = this.getRightBottomBlock(i, j);

        let WALL = this.POSITION_TYPE.WALL;

        // HORIZONTAL
        if ((onLeft === WALL || onRight === WALL) && (onTop !== WALL && onBottom !== WALL))
            return true;
        else if (onLeft === WALL && onRight === WALL && (onTop === WALL && onLeftTop === WALL && onRightTop === WALL))
            return true;
        else if (onLeft === WALL && onRight === WALL && (onBottom === WALL && onLeftBottom === WALL && onRightBottom === WALL))
            return true;

        // VERTICAL
        if ((onTop === WALL || onBottom === WALL) && (onLeft !== WALL && onRight !== WALL))
            return true;
        else if (onTop === WALL && onBottom === WALL && (onLeft === WALL && onLeftTop === WALL && onLeftBottom === WALL))
            return true;
        else if (onTop === WALL && onBottom === WALL && (onRight === WALL && onRightTop === WALL && onRightBottom === WALL))
            return true;

        return false;
    }

    getWallHorizontalDirection(i: number, j: number) {
        let onLeft = this.getLeftBlock(i, j);
        let onRight = this.getRightBlock(i, j);

        let WALL = this.POSITION_TYPE.WALL;
        
        if (onRight === WALL && onLeft !== WALL)
            return WALL_DIRECTIONS.HORIZONTAL_RIGHT;
        if (onLeft === WALL && onRight !== WALL)
            return WALL_DIRECTIONS.HORIZONTAL_LEFT;
        else
            return WALL_DIRECTIONS.HORIZONTAL;
    }

    getWallVerticalDirection(i: number, j: number) {
        let onTop = this.getTopBlock(i, j);
        let onBottom = this.getBottomBlock(i, j);

        let WALL = this.POSITION_TYPE.WALL;
        
        if (onTop === WALL && onBottom !== WALL)
            return WALL_DIRECTIONS.VERTICAL_TOP;
        if (onBottom === WALL && onTop !== WALL)
            return WALL_DIRECTIONS.VERTICAL_BOTTOM;
        else
            return WALL_DIRECTIONS.VERTICAL;
    }

    wallIsVertical(i: number, j: number) {
        let onLeft = this.getLeftBlock(i, j);
        let onRight = this.getRightBlock(i, j);
        let onTop = this.getTopBlock(i, j);
        let onBottom = this.getBottomBlock(i, j);

        let WALL = this.POSITION_TYPE.WALL;
        
        if (onBottom === WALL && onLeft !== WALL && onRight !== WALL)
            return true;

        return onLeft !== WALL && onRight !== WALL;
    }

    wallIsLeftTop(i: number, j: number) {
        return this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL &&
            !this.wallIsCross(i, j);
    }

    wallIsLeftBottom(i: number, j: number) {
        return this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
            !this.wallIsCross(i, j);
    }

    wallIsRightTop(i: number, j: number) {
        return this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL &&
            !this.wallIsCross(i, j);
    }

    wallIsRightBottom(i: number, j: number) {
        return this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
            !this.wallIsCross(i, j);
    }

    wallIsCross(i: number, j: number) {
        return this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL;
    }

    wallIsBifurcLeft(i: number, j: number) {
        return !this.wallIsCross(i, j) &&
            this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL;
    }

    wallIsBifurcBottom(i: number, j: number) {
        return !this.wallIsCross(i, j) &&
            this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getRightBlock(i, j) === this.POSITION_TYPE.WALL;
    }

    wallIsBifurcTop(i: number, j: number) {
        return !this.wallIsCross(i, j) &&
            this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getRightBlock(i, j) === this.POSITION_TYPE.WALL;
    }

    wallIsBifurcRight(i: number, j: number) {
        return !this.wallIsCross(i, j) &&
            this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
            this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL;
    }

    getRightBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthX - 1;

        let iNext = i;
        let jNext = j + 1;

        if (jNext >= first && jNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getBottomBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthY - 1;

        let iNext = i + 1;
        let jNext = j;

        if (iNext >= first && iNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getLeftBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthX - 1;

        let iNext = i;
        let jNext = j - 1;

        if (jNext >= first && jNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getTopBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthY - 1;

        let iNext = i - 1;
        let jNext = j;

        if (iNext >= first && iNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getLeftBottomBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthX - 1;

        let iNext = i + 1;
        let jNext = j - 1;

        if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getRightBottomBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthY - 1;

        let iNext = i + 1;
        let jNext = j + 1;

        if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getLeftTopBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthX - 1;

        let iNext = i - 1;
        let jNext = j - 1;

        if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getRightTopBlock(i: number, j: number) {
        let first = 0;
        let last = this.lengthY - 1;

        let iNext = i - 1;
        let jNext = j + 1;

        if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
            return this.matriz[iNext][jNext];
        else
            return -1;
    }

    getBlockByIndexes(i: number, j: number) {
        return this.matriz[i][j];
    }

    getBlockByCoordinates(x: number, y: number, size?: number, direction?: any) {
        let indexes = this.getIndexesByCoordinates(x, y, size, direction);
        return this.matriz[indexes.i][indexes.j];
    }

    getIndexesByCoordinates(x: number, y: number, size?: number, direction?: any) {
        if (!size) size = this.game.blockSize;

        if (direction === DIRECTIONS.UP)
            y -= size;
        else if (direction === DIRECTIONS.LEFT)
            x -= size;

        let i = Math.max(Math.min(Math.floor(y / size) + (y % size > 5 ? 1 : 0), this.matriz.length - 1), 0);
        let j = Math.max(Math.min(Math.floor(x / size) + (x % size > 5 ? 1 : 0), this.matriz[0].length - 1), 0);

        return { i, j };
    }

    getPositionIByCoord(y: number, size?: number) {
        if (!size) size = this.game.blockSize;

        let i = Math.min(Math.floor(y / size) + (y % size > 5 ? 1 : 0), this.matriz.length - 1);

        return i;
    }

    getPositionJByCoord(x: number, size?: number) {
        if (!size) size = this.game.blockSize;

        let j = Math.min(Math.floor(x / size) + (x % size > 5 ? 1 : 0), this.matriz[0].length - 1);

        return j;
    }

    isCollidingWithWall(x: number, y: number, size?: number, direction?: any) {
        let indexes = this.getIndexesByCoordinates(x, y, size, direction);
        let block = this.matriz[indexes.i][indexes.j];
        return block === this.POSITION_TYPE.WALL;
    }

    pacCanGo(x: number, y: number, size?: number, direction?: any) {
        let indexes = this.getIndexesByCoordinates(x, y, size, direction);
        let block = this.matriz[indexes.i][indexes.j];
        return [
            this.POSITION_TYPE.WALL,
            this.POSITION_TYPE.GHOST_HOUSE
        ].indexOf(block) >= 0;
    }

    xCoordinateIsEnd(x: number, y: number) {
        let indexes = this.getIndexesByCoordinates(x, y, null, DIRECTIONS.RIGHT);
        let block = this.matriz[indexes.i][indexes.j];
        return indexes.j >= (this.matriz[0].length - 1) && block !== this.POSITION_TYPE.PORTAL;
    }

    xCoordinateIsBegin(x: number, y: number) {
        let indexes = this.getIndexesByCoordinates(x, y, null, DIRECTIONS.LEFT);
        let block = this.matriz[indexes.i][indexes.j];
        return indexes.j <= 0 && block !== this.POSITION_TYPE.PORTAL;
    }

    yCoordinateIsEnd(y: number, size?: number) {
        let indexes = this.getIndexesByCoordinates(0, y, size, DIRECTIONS.DOWN);
        let block = this.matriz[indexes.i][indexes.j];
        return indexes.i >= (this.matriz.length - 1) && block !== this.POSITION_TYPE.PORTAL;
    }

    yCoordinateIsBegin(y: number) {
        return y <= 0;
    }

    biscuitGettedByCoordinates(x: number, y: number, size?: number, direction?: any) {
        let indexes = this.getIndexesByCoordinates(x, y, size);
        let block = this.matriz[indexes.i][indexes.j];
        let isBiscuit = block === this.POSITION_TYPE.BISCUIT;

        let directionInX = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;
        let directionInY = direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN;

        if ((direction === DIRECTIONS.LEFT || (direction === DIRECTIONS.RIGHT && x >= indexes.j * size)) || (direction === DIRECTIONS.UP || (direction === DIRECTIONS.DOWN && y >= indexes.i * size))) {
            if (direction === DIRECTIONS.UP)
                y -= size;
            else if (direction === DIRECTIONS.LEFT)
                x -= size;

            if (isBiscuit)
                isBiscuit = (directionInX && x % size >= 5) || (directionInY && y % size >= 5);
            
            return isBiscuit;
        }
    }

    pillGettedByCoordinates(x: number, y: number, size?: number, direction?: DIRECTIONS) {
        let indexes = this.getIndexesByCoordinates(x, y, size);
        let block = this.matriz[indexes.i][indexes.j];
        let isPill = block === this.POSITION_TYPE.PILL;

        if (direction === DIRECTIONS.UP)
            y -= size;
        else if (direction === DIRECTIONS.LEFT)
            x -= size;

        let directionInX = direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT;
        let directionInY = direction === DIRECTIONS.UP || direction === DIRECTIONS.DOWN;

        if (isPill)
            isPill = (directionInX && x % size >= 5) || (directionInY && y % size >= 5);
        
        return isPill;
    }
}


export enum WALL_DIRECTIONS {
    VERTICAL = 'VERTICAL',
    VERTICAL_TOP = 'VERTICAL_TOP',
    VERTICAL_BOTTOM = 'VERTICAL_BOTTOM',
    HORIZONTAL = 'HORIZONTAL',
    HORIZONTAL_LEFT = 'HORIZONTAL_LEFT',
    HORIZONTAL_RIGHT = 'HORIZONTAL_RIGHT',
    CROSS = 'CROSS',
    LEFT_TOP = 'LEFT_TOP',
    LEFT_BOTTOM = 'LEFT_BOTTOM',
    RIGHT_TOP = 'RIGHT_TOP',
    RIGHT_BOTTOM = 'RIGHT_BOTTOM',
    BIFURC_TOP = 'BIFURC_TOP',
    BIFURC_BOTTOM = 'BIFURC_BOTTOM',
    BIFURC_LEFT = 'BIFURC_LEFT',
    BIFURC_RIGHT = 'BIFURC_RIGHT'
};