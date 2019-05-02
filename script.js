function PacCoin() {
    this.blockSize = 32;
    this.moveRate = 5;

    this.map = new Map(this);
    this.pac = new Pac(this);

    this.width = this.map.lengthX * this.blockSize;
    this.height = this.map.lengthY * this.blockSize;

    this.canvas;
    this.context;

    this.start = function () {
        this.createCanvas();
        this.makeListeners();
        this.runGameLoop();
        setInterval(this.runGameLoop.bind(this), 10);
    };

    this.createCanvas = function () {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        document.body.prepend(this.canvas);

        this.context = this.canvas.getContext('2d');
    };

    this.makeListeners = function () {
        document.onkeydown = function (event) {
            this.pac.onKeydown(event);
        }.bind(this);

        document.onkeyup = function (event) {
            this.pac.onKeyup(event);
        }.bind(this);
    };

    this.runGameLoop = function () {
        this.context.beginPath();
        this.context.clearRect(0, 0, this.width, this.height);
        this.map.render();
        this.pac.render();
    };

    this.applySmoothCoord = function (fromPosition, toPosition) {
        if (fromPosition !== toPosition) {
            var newPosition = fromPosition + ((fromPosition < toPosition) ? 1 : -1);
            if (fromPosition < toPosition && newPosition > toPosition)
                return toPosition;
            else if (fromPosition > toPosition && newPosition < toPosition)
                return toPosition;
            return newPosition;
        }
        return fromPosition;
    };

    function Map(game) {
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
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [9, 9, 9, 9, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 9, 9, 9, 9],
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

        this.positionsType = {
            BISCUIT: 0,
            WALL: 1,
            PILL: 2,
            EMPTY: 9,
        };

        this.lengthX = this.matriz[0].length;
        this.lengthY = this.matriz.length;
        this.lineWidth = 6;

        this.WALL_DIRECTIONS = {
            VERTICAL: 'VERTICAL',
            VERTICAL_TOP: 'VERTICAL_TOP',
            VERTICAL_BOTTOM: 'VERTICAL_BOTTOM',
            HORIZONTAL: 'HORIZONTAL',
            HORIZONTAL_LEFT: 'HORIZONTAL_LEFT',
            HORIZONTAL_RIGHT: 'HORIZONTAL_RIGHT',
            CROSS: 'CROSS',
            LEFT_TOP: 'LEFT_TOP',
            LEFT_BOTTOM: 'LEFT_BOTTOM',
            RIGHT_TOP: 'RIGHT_TOP',
            RIGHT_BOTTOM: 'RIGHT_BOTTOM',
            BIFURC_TOP: 'BIFURC_TOP',
            BIFURC_BOTTOM: 'BIFURC_BOTTOM',
            BIFURC_LEFT: 'BIFURC_LEFT',
            BIFURC_RIGHT: 'BIFURC_RIGHT'
        };

        this.render = function () {
            for (var i = 0; i < this.matriz.length; i++) {
                for (var j = 0; j < this.matriz[i].length; j++)
                    this.renderBlock(i, j);
            }
        };

        this.renderBlock = function (i, j) {
            var block = this.matriz[i][j];
            var x = j * this.game.blockSize;
            var y = i * this.game.blockSize;
            var xEnd = x + this.game.blockSize;
            var yEnd = y + this.game.blockSize;
            var xMid = x + (this.game.blockSize / 2);
            var yMid = y + this.game.blockSize / 2;

            switch (block) {
                case this.positionsType.WALL: {
                    var direction = this.getWallDirection(i, j);

                    if (direction === this.WALL_DIRECTIONS.CROSS)
                        break;

                    this.game.context.beginPath();
                    this.game.context.strokeStyle = '#0000FF';
                    this.game.context.lineWidth = this.lineWidth;
                    this.game.context.lineCap = 'round';

                    if (direction.indexOf('HORIZONTAL') >= 0) {
                        if (direction === this.WALL_DIRECTIONS.HORIZONTAL) {
                            this.game.context.moveTo(x, yMid);
                            this.game.context.lineTo(xEnd, yMid);
                        }
                        else if (direction === this.WALL_DIRECTIONS.HORIZONTAL_LEFT) {
                            this.game.context.moveTo(x, yMid);
                            this.game.context.lineTo(xMid, yMid);
                        }
                        else if (direction === this.WALL_DIRECTIONS.HORIZONTAL_RIGHT) {
                            this.game.context.moveTo(xMid, yMid);
                            this.game.context.lineTo(xEnd, yMid);
                        }
                    }

                    if (direction.indexOf('VERTICAL') >= 0) {
                        if (direction === this.WALL_DIRECTIONS.VERTICAL) {
                            this.game.context.moveTo(xMid, y);
                            this.game.context.lineTo(xMid, yEnd);
                        }
                        else if (direction === this.WALL_DIRECTIONS.VERTICAL_TOP) {
                            this.game.context.moveTo(xMid, y);
                            this.game.context.lineTo(xMid, yMid);
                        }
                        else if (direction === this.WALL_DIRECTIONS.VERTICAL_BOTTOM) {
                            this.game.context.moveTo(xMid, yMid);
                            this.game.context.lineTo(xMid, yEnd);
                        }
                    }

                    if (direction === this.WALL_DIRECTIONS.LEFT_TOP || direction === this.WALL_DIRECTIONS.RIGHT_TOP ||
                        direction === this.WALL_DIRECTIONS.LEFT_BOTTOM || direction === this.WALL_DIRECTIONS.RIGHT_BOTTOM) {
                        var coordinates;

                        if (direction === this.WALL_DIRECTIONS.LEFT_TOP)
                            coordinates = this.getLeftTopCurveCoord(x, y);

                        if (direction === this.WALL_DIRECTIONS.RIGHT_TOP)
                            coordinates = this.getRightTopCurveCoord(x, y);

                        if (direction === this.WALL_DIRECTIONS.LEFT_BOTTOM)
                            coordinates = this.getLeftBottomCurveCoord(x, y);

                        if (direction === this.WALL_DIRECTIONS.RIGHT_BOTTOM)
                            coordinates = this.getRightBottomCurveCoord(x, y);

                        this.game.context.moveTo(coordinates.x1, coordinates.y1);
                        this.game.context.quadraticCurveTo(coordinates.xMid, coordinates.yMid, coordinates.x2, coordinates.y2);
                    }

                    if (direction === this.WALL_DIRECTIONS.BIFURC_LEFT || direction === this.WALL_DIRECTIONS.BIFURC_RIGHT ||
                        direction === this.WALL_DIRECTIONS.BIFURC_TOP || direction === this.WALL_DIRECTIONS.BIFURC_BOTTOM) {
                        var coordinates = {
                            curve01: { x1: 0, y1: 0, x2: 0, y2: 0, xMid: 0, yMid },
                            curve02: { x1: 0, y1: 0, x2: 0, y2: 0, xMid: 0, yMid }
                        };

                        if (direction === this.WALL_DIRECTIONS.BIFURC_LEFT) {
                            coordinates.curve01 = this.getRightTopCurveCoord(x, y);
                            coordinates.curve02 = this.getRightBottomCurveCoord(x, y);
                        }

                        if (direction === this.WALL_DIRECTIONS.BIFURC_RIGHT) {
                            coordinates.curve01 = this.getLeftTopCurveCoord(x, y);
                            coordinates.curve02 = this.getLeftBottomCurveCoord(x, y);
                        }

                        if (direction === this.WALL_DIRECTIONS.BIFURC_TOP) {
                            coordinates.curve01 = this.getRightBottomCurveCoord(x, y);
                            coordinates.curve02 = this.getLeftBottomCurveCoord(x, y);
                        }

                        if (direction === this.WALL_DIRECTIONS.BIFURC_BOTTOM) {
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
                case this.positionsType.BISCUIT: {
                    this.game.context.beginPath();
                    this.game.context.fillStyle = 'white';
                    this.game.context.fillRect(xMid, yMid, 4, 4);
                    break;
                }
                case this.positionsType.PILL: {
                    this.game.context.beginPath();
                    this.game.context.fillStyle = 'white';
                    this.game.context.arc(xMid, yMid, 8, 0, Math.PI * 2, true);
                    this.game.context.fill();
                    break;
                }
            }
        };

        this.getLeftTopCurveCoord = function (x, y) {
            return {
                x1: x + this.game.blockSize,
                y1: y + ((this.game.blockSize / 2)),
                x2: x + ((this.game.blockSize / 2)),
                y2: y + this.game.blockSize,
                xMid: x + (this.game.blockSize / 2),
                yMid: y + (this.game.blockSize / 2)
            };
        }

        this.getRightTopCurveCoord = function (x, y) {
            return {
                x1: x,
                y1: y + ((this.game.blockSize / 2)),
                x2: x + ((this.game.blockSize / 2)),
                y2: y + this.game.blockSize,
                xMid: x + (this.game.blockSize / 2),
                yMid: y + (this.game.blockSize / 2)
            };
        }

        this.getLeftBottomCurveCoord = function (x, y) {
            return {
                x1: x + ((this.game.blockSize / 2)),
                y1: y,
                x2: x + this.game.blockSize,
                y2: y + ((this.game.blockSize / 2)),
                xMid: x + (this.game.blockSize / 2),
                yMid: y + this.game.blockSize / 2
            };
        }

        this.getRightBottomCurveCoord = function (x, y) {
            return {
                x1: x + ((this.game.blockSize / 2)),
                y1: y,
                x2: x,
                y2: y + ((this.game.blockSize / 2)),
                xMid: x + (this.game.blockSize / 2),
                yMid: y + this.game.blockSize / 2
            };
        }

        this.getWallDirection = function (i, j) {
            if (this.wallIsLine(i, j)) {
                if (this.wallIsVertical(i, j))
                    return this.getWallVerticalDirection(i, j);
                else
                    return this.getWallHorizontalDirection(i, j);
            }
            else {
                if (this.wallIsBifurcLeft(i, j))
                    return this.WALL_DIRECTIONS.BIFURC_LEFT;
                if (this.wallIsBifurcBottom(i, j))
                    return this.WALL_DIRECTIONS.BIFURC_BOTTOM;
                if (this.wallIsBifurcTop(i, j))
                    return this.WALL_DIRECTIONS.BIFURC_TOP;
                if (this.wallIsBifurcRight(i, j))
                    return this.WALL_DIRECTIONS.BIFURC_RIGHT;
                if (this.wallIsLeftTop(i, j))
                    return this.WALL_DIRECTIONS.LEFT_TOP;
                if (this.wallIsLeftBottom(i, j))
                    return this.WALL_DIRECTIONS.LEFT_BOTTOM;
                if (this.wallIsRightTop(i, j))
                    return this.WALL_DIRECTIONS.RIGHT_TOP;
                if (this.wallIsRightBottom(i, j))
                    return this.WALL_DIRECTIONS.RIGHT_BOTTOM;
                else
                    return this.WALL_DIRECTIONS.CROSS;
            }
        }

        this.wallIsLine = function (i, j) {
            var onLeft = this.getLeftBlock(i, j);
            var onRight = this.getRightBlock(i, j);
            var onTop = this.getTopBlock(i, j);
            var onBottom = this.getBottomBlock(i, j);

            var onLeftTop = this.getLeftTopBlock(i, j);
            var onRightTop = this.getRightTopBlock(i, j);
            var onLeftBottom = this.getLeftBottomBlock(i, j);
            var onRightBottom = this.getRightBottomBlock(i, j);

            var WALL = this.positionsType.WALL;

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

        this.getWallHorizontalDirection = function (i, j) {
            var onLeft = this.getLeftBlock(i, j);
            var onRight = this.getRightBlock(i, j);

            var WALL = this.positionsType.WALL;
            
            if (onRight === WALL && onLeft !== WALL)
                return this.WALL_DIRECTIONS.HORIZONTAL_RIGHT;
            if (onLeft === WALL && onRight !== WALL)
                return this.WALL_DIRECTIONS.HORIZONTAL_LEFT;
            else
                return this.WALL_DIRECTIONS.HORIZONTAL;
        }

        this.getWallVerticalDirection = function (i, j) {
            var onTop = this.getTopBlock(i, j);
            var onBottom = this.getBottomBlock(i, j);

            var WALL = this.positionsType.WALL;
            
            if (onTop === WALL && onBottom !== WALL)
                return this.WALL_DIRECTIONS.VERTICAL_TOP;
            if (onBottom === WALL && onTop !== WALL)
                return this.WALL_DIRECTIONS.VERTICAL_BOTTOM;
            else
                return this.WALL_DIRECTIONS.VERTICAL;
        }

        this.wallIsVertical = function (i, j) {
            var onLeft = this.getLeftBlock(i, j);
            var onRight = this.getRightBlock(i, j);
            var onTop = this.getTopBlock(i, j);
            var onBottom = this.getBottomBlock(i, j);

            var WALL = this.positionsType.WALL;
            
            if (onBottom === WALL && onLeft !== WALL && onRight !== WALL)
                return true;

            return onLeft !== WALL && onRight !== WALL;
        }

        this.wallIsLeftTop = function (i, j) {
            return this.getRightBlock(i, j) === this.positionsType.WALL &&
                this.getBottomBlock(i, j) === this.positionsType.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsLeftBottom = function (i, j) {
            return this.getRightBlock(i, j) === this.positionsType.WALL &&
                this.getTopBlock(i, j) === this.positionsType.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsRightTop = function (i, j) {
            return this.getLeftBlock(i, j) === this.positionsType.WALL &&
                this.getBottomBlock(i, j) === this.positionsType.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsRightBottom = function (i, j) {
            return this.getLeftBlock(i, j) === this.positionsType.WALL &&
                this.getTopBlock(i, j) === this.positionsType.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsCross = function (i, j) {
            return this.getLeftBlock(i, j) === this.positionsType.WALL &&
                this.getRightBlock(i, j) === this.positionsType.WALL &&
                this.getTopBlock(i, j) === this.positionsType.WALL &&
                this.getBottomBlock(i, j) === this.positionsType.WALL;
        }

        this.wallIsBifurcLeft = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getLeftBlock(i, j) === this.positionsType.WALL &&
                this.getTopBlock(i, j) === this.positionsType.WALL &&
                this.getBottomBlock(i, j) === this.positionsType.WALL;
        }

        this.wallIsBifurcBottom = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getBottomBlock(i, j) === this.positionsType.WALL &&
                this.getLeftBlock(i, j) === this.positionsType.WALL &&
                this.getRightBlock(i, j) === this.positionsType.WALL;
        }

        this.wallIsBifurcTop = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getTopBlock(i, j) === this.positionsType.WALL &&
                this.getLeftBlock(i, j) === this.positionsType.WALL &&
                this.getRightBlock(i, j) === this.positionsType.WALL;
        }

        this.wallIsBifurcRight = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getRightBlock(i, j) === this.positionsType.WALL &&
                this.getTopBlock(i, j) === this.positionsType.WALL &&
                this.getBottomBlock(i, j) === this.positionsType.WALL;
        }

        this.getRightBlock = function (i, j) {
            var first = 0;
            var last = this.lengthX - 1;

            var iNext = i;
            var jNext = j + 1;

            if (jNext >= first && jNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getBottomBlock = function (i, j) {
            var first = 0;
            var last = this.lengthY - 1;

            var iNext = i + 1;
            var jNext = j;

            if (iNext >= first && iNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getLeftBlock = function (i, j) {
            var first = 0;
            var last = this.lengthX - 1;

            var iNext = i;
            var jNext = j - 1;

            if (jNext >= first && jNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getTopBlock = function (i, j) {
            var first = 0;
            var last = this.lengthY - 1;

            var iNext = i - 1;
            var jNext = j;

            if (iNext >= first && iNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getLeftBottomBlock = function (i, j) {
            var first = 0;
            var last = this.lengthX - 1;

            var iNext = i + 1;
            var jNext = j - 1;

            if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getRightBottomBlock = function (i, j) {
            var first = 0;
            var last = this.lengthY - 1;

            var iNext = i + 1;
            var jNext = j + 1;

            if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getLeftTopBlock = function (i, j) {
            var first = 0;
            var last = this.lengthX - 1;

            var iNext = i - 1;
            var jNext = j - 1;

            if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getRightTopBlock = function (i, j) {
            var first = 0;
            var last = this.lengthY - 1;

            var iNext = i - 1;
            var jNext = j + 1;

            if ((jNext >= first && jNext <= last) && iNext >= first && iNext <= last)
                return this.matriz[iNext][jNext];
            else
                return -1;
        }

        this.getIndexesByCoordinates = function(x, y, size, direction) {
            if (!size) size = this.game.blockSize;

            if (direction === 'UP')
                y -= size;
            else if (direction === 'LEFT')
                x -= size;

            var i = Math.min(Math.floor(y / size) + (y % size > 5 ? 1 : 0), this.matriz.length - 1);
            var j = Math.min(Math.floor(x / size) + (x % size > 5 ? 1 : 0), this.matriz[0].length - 1);

            return { i, j };
        }

        this.getPositionIByCoord = function(y, size) {
            if (!size) size = this.game.blockSize;

            var i = Math.min(Math.floor(y / size) + (y % size > 5 ? 1 : 0), this.matriz.length - 1);

            return i;
        }

        this.getPositionJByCoord = function(x, size) {
            if (!size) size = this.game.blockSize;

            var j = Math.min(Math.floor(x / size) + (x % size > 5 ? 1 : 0), this.matriz[0].length - 1);

            return j;
        }

        this.isCollidingWithWall = function(x, y, size, direction) {
            var indexes = this.getIndexesByCoordinates(x, y, size, direction);
            if (indexes.i >= this.matriz.length || indexes.j >= this.matriz[0].length)
                // return { type: this.positionsType.WALL, i: indexes.i, j: indexes.j };
                return true;
            else {
                var blockValue = this.matriz[indexes.i][indexes.j];
                return blockValue === this.positionsType.WALL;
            }
        }

        this.xCoordinateIsEnd = function(x, size) {
            var coords = this.getIndexesByCoordinates(x, 0, size, 'RIGHT');
            return coords.j >= (this.matriz.length - 1);
        }

        this.xCoordinateIsBegin = function(x) {
            return x <= 0;
        }

        this.yCoordinateIsEnd = function(y, size) {
            var coords = this.getIndexesByCoordinates(0, y, size, 'DOWN');
            return coords.i >= (this.matriz[0].length - 1);
        }

        this.yCoordinateIsBegin = function(y) {
            return y <= 0;
        }
    }

    function Pac(game) {
        this.game = game;

        this.image = null;
        this.imageUrl = 'assets/img/sb-icon.svg';
        this.size = this.game.blockSize;
        this.x = this.game.map.pacBornCoords.x;
        this.y = this.game.map.pacBornCoords.y;
        this.toX = this.x;
        this.toY = this.y;
        this.i = function() { return this.y / this.size; }; //this.game.map.getPositionIByCoord(this.y, this.size); };
        this.j = function() { return this.x / this.size; };// this.game.map.getPositionJByCoord(this.x, this.size); };
        this.direction = 'NONE';

        this.moveX = function (direction) {
            var changeDirection = (this.direction === 'LEFT' || this.direction === 'RIGHT') && this.direction !== direction;
            this.direction = direction;

            var currentX = this.x;

            if ((this.direction === 'LEFT' && !this.game.map.xCoordinateIsBegin(currentX)) ||
                (this.direction === 'RIGHT' && !this.game.map.xCoordinateIsEnd(currentX)))
            {
                var currentIndexes = this.game.map.getIndexesByCoordinates(currentX, this.y, this.size);
                var moveToJ = currentIndexes.j + (this.direction === 'RIGHT' ? 1 : 0);
                var _toX = moveToJ * this.size;

                if (!this.game.map.isCollidingWithWall(_toX, this.y, this.size))
                    this.toX = _toX + (direction === 'LEFT' ? -this.size : 0);
                else
                    this.toX =  currentIndexes.j * this.size;

            }
            this.toY = this.y;
        };
        this.moveY = function (direction) {
            var changeDirection = (this.direction === 'DOWN' || this.direction === 'UP') && this.direction !== direction;
            this.direction = direction;

            var currentY = this.y;

            if ((this.direction === 'UP' && !this.game.map.yCoordinateIsBegin(currentY)) ||
                (this.direction === 'DOWN' && !this.game.map.yCoordinateIsEnd(currentY)))
            {
                var currentIndexes = this.game.map.getIndexesByCoordinates(this.x, currentY, this.size);
                var moveToI = currentIndexes.i + (this.direction === 'DOWN' ? 1 : 0);
                var _toY = moveToI * this.size;

                if (!this.game.map.isCollidingWithWall(this.x, _toY, this.size))
                    this.toY = _toY + (direction === 'UP' ? -this.size : 0);
                else
                    this.toY =  currentIndexes.i * this.size;
            }
            this.toX = this.x;
        };

        this.onKeydown = function (event) {
            if (event.keyCode === 38) {
                this.moveY('UP');
            }
            else if (event.keyCode === 40) {
                this.moveY('DOWN');
            }
            else if (event.keyCode === 37) {
                this.moveX('LEFT');
            }
            else if (event.keyCode === 39) {
                this.moveX('RIGHT');
            }
        };

        this.onKeyup = function (event) {
            /* if ([37, 38, 39, 40].indexOf(event.keyCode) >= 0) {
                if (this.x !== this.toX) {
                    var diffX = Math.floor(Math.abs(this.x - this.toX) * .5);
                    this.toX += diffX * (this.x < this.toX ? -1 : 1);
                }
            } */
        };

        this.render = function () {
            this.updateCoordinates();

            var angle = this.calcAngle();
            this.game.context.beginPath();
            this.game.context.moveTo(this.x + (this.size / 2),
            this.y + (this.size / 2));
            this.game.context.fillStyle = '#FFFF00';
            this.game.context.arc(
                this.x + (this.size / 2),
                this.y + (this.size / 2),
                this.size / 2,
                Math.PI * angle.start, 
                Math.PI * angle.end,
                angle.direction
            );
            this.game.context.fill();

            /* if (!this.image) {
                this.image = new Image();
                this.image.onload = function () {
                    this.game.context.drawImage(this.image, this.x, this.y, this.size, this.size);
                }.bind(this);
                this.image.src = this.imageUrl;
            }
            else
                this.game.context.drawImage(this.image, this.x, this.y, this.size, this.size); */
        };

        this.updateCoordinates = function() {
            var nextX = this.game.applySmoothCoord(this.x, this.toX);
            var nextY = this.game.applySmoothCoord(this.y, this.toY);

            if (nextX !== this.x || nextY !== this.y) {
                if (!this.game.map.isCollidingWithWall(nextX, nextY, this.size, this.direction)){
                    this.x = nextX;
                    this.y = nextY;
                }
                else {
                    this.x = Math.floor(this.j()) * this.size;
                    this.y = Math.floor(this.i()) * this.size;
                    this.toX = this.x;
                    this.toY = this.y
                }
            }
            else
                console.log('i: ' + this.i(), 'j: ' + this.j(), this.x, this.y,);
        }

        this.calcAngle = function() { 
            if (this.direction == 'RIGHT' && (this.x % 10 < 5))
                return { start: 0.25, end: 1.75, direction: false };
            if (this.direction === 'DOWN' && (this.y % 10 < 5)) 
                return { start: 0.75, end: 2.25, direction: false };
            if (this.direction === 'UP' && (this.y % 10 < 5)) 
                return { start: 1.25, end: 1.75, direction: true };
            if (this.direction === 'LEFT' && (this.x % 10 < 5))         
                return { start: 0.75, end: 1.25, direction: true };
            
            return { start: 0, end: 2, direction: false };
        };

        this.checkCollision = function(x, y) {
            
        };
    }
};