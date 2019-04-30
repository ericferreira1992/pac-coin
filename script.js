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
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        document.body.prepend(this.canvas);

        this.context = this.canvas.getContext("2d");
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

    this.applySmooth = function (fromPosition, toPosition) {
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
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
            [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
            [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];

        this.positionsType = {
            EMPTY: 0,
            WALL: 1,
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
                    this.game.context.strokeStyle = "#0000FF";
                    this.game.context.lineWidth = this.lineWidth;
                    this.game.context.lineCap = "round";

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
                case this.positionsType.EMPTY: {
                    this.game.context.beginPath();
                    this.game.context.fillStyle = 'white';
                    this.game.context.fillRect(xMid, yMid, 4, 4);
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
    }

    function Pac(game) {
        this.game = game;

        this.image = null;
        this.imageUrl = 'assets/img/sb-icon.svg';
        this.size = this.game.blockSize;
        this.x = 0;
        this.y = 0;
        this.toX = 0;
        this.toY = 0;

        this.moveX = function (value) {
            this.toX = (value > 0) ? Math.min(this.toX + value, this.game.width - this.size) : Math.max(this.toX + value, 0);
            this.toY = this.y;
        };
        this.moveY = function (value) {
            this.toY = (value > 0) ? Math.min(this.toY + value, this.game.height - this.size) : Math.max(this.toY + value, 0);
            this.toX = this.x;
        };

        this.onKeydown = function (event) {
            if (event.keyCode === 38)
                this.moveY(-this.game.moveRate);
            else if (event.keyCode === 40)
                this.moveY(this.game.moveRate);
            else if (event.keyCode === 37)
                this.moveX(-this.game.moveRate);
            else if (event.keyCode === 39)
                this.moveX(this.game.moveRate);
        };

        this.onKeyup = function (event) {
            if ([37, 38, 39, 40].indexOf(event.keyCode) >= 0) {
                if (this.x !== this.toX) {
                    var diffX = Math.floor(Math.abs(this.x - this.toX) * .5);
                    this.toX += diffX * (this.x < this.toX ? -1 : 1);
                }
            }
        };

        this.render = function () {
            this.game.context.beginPath();
            this.x = this.game.applySmooth(this.x, this.toX);
            this.y = this.game.applySmooth(this.y, this.toY);

            if (!this.image) {
                this.image = new Image();
                this.image.onload = function () {
                    this.game.context.drawImage(this.image, this.x, this.y, this.size, this.size);
                }.bind(this);
                this.image.src = this.imageUrl;
            }
            else
                this.game.context.drawImage(this.image, this.x, this.y, this.size, this.size);
        };
    }
};