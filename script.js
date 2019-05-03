function PacCoin() {
    this.blockSize = 26;
    this.moveRate = 5;
    this.timeToRerender = 10;

    this.colors = {
        background: '#424242', // '#000000',
        pac: '#FACD00', // '#FFFF00',
        wall: '#00C8ba', // '#0000FF',
        biscuit: '#FACD00'
    };

    this.map = new Map(this);
    this.pac = new Pac(this);
    this.user = new User(this);

    this.ghosts = [
        new  Ghost(this, '01'),
    ];

    this.width = this.map.lengthX * this.blockSize;
    this.height = this.map.lengthY * this.blockSize;

    this.canvas;
    this.context;

    this.coinImg = new Image();
    this.coinImg.src = 'assets/img/sb-coin.svg';

    this.start = function () {
        this.createCanvas();
        this.makeListeners();
        this.runGameLoop();
        setInterval(this.runGameLoop.bind(this), this.timeToRerender);
    };

    this.createCanvas = function() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.backgroundColor = this.colors.background;
        document.body.style.backgroundColor = this.colors.background;
        document.body.prepend(this.canvas);

        this.createTitle();

        this.context = this.canvas.getContext('2d');
    };

    this.createTitle = function() {
        var titleHtml = '' +
        '<div class="title" style="max-width: ' + this.width + 'px">'+
            '<h2 style="color: ' + this.colors.biscuit + '">'+
                'PAC-COIN'+
            '</h2>'+
            '<h6 style="color: #FFF">' +
                'Catch the coins!'+
            '</h6>'+
        '</div>';
        document.body.insertAdjacentHTML('afterbegin', titleHtml);
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
        this.ghosts.forEach(function(ghost) {
            ghost.render();
        });
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

        this.POSITION_TYPE = {
            BISCUIT: 0,
            WALL: 1,
            PILL: 2,
            GHOST_HOUSE: 6,
            PORTAL_PATH: 7,
            PORTAL: 8,
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
                case this.POSITION_TYPE.WALL: {
                    var direction = this.getWallDirection(i, j);

                    if (direction === this.WALL_DIRECTIONS.CROSS)
                        break;

                    this.game.context.beginPath();
                    this.game.context.strokeStyle = this.game.colors.wall;
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
                case this.POSITION_TYPE.BISCUIT: {
                    let indexes = this.game.map.getIndexesByCoordinates(x, y);
                    if (!this.game.user.biscuitIsGetted(indexes.i, indexes.j)) {
                        let biscuitSize = 6;
                        // this.game.context.drawImage(this.game.coinImg, xMid - (biscuitSize / 2), yMid - (biscuitSize / 2), biscuitSize, biscuitSize);
                        this.game.context.beginPath();
                        this.game.context.fillStyle = this.game.colors.biscuit;
                        this.game.context.arc(xMid, yMid, 2, 0, Math.PI * 2, true);
                        this.game.context.fill();
                    }
                    break;
                }
                case this.POSITION_TYPE.PILL: {
                    let indexes = this.game.map.getIndexesByCoordinates(x, y);
                    if (!this.game.user.pillIsGetted(indexes.i, indexes.j)) {
                        let pillSize = 24;
                        this.game.context.drawImage(this.game.coinImg, xMid - (pillSize / 2), yMid - (pillSize / 2), pillSize, pillSize);
                        /* this.game.context.beginPath();
                        this.game.context.fillStyle = 'white';
                        this.game.context.arc(xMid, yMid, 8, 0, Math.PI * 2, true);
                        this.game.context.fill(); */
                    }
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

            var WALL = this.POSITION_TYPE.WALL;

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

            var WALL = this.POSITION_TYPE.WALL;
            
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

            var WALL = this.POSITION_TYPE.WALL;
            
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

            var WALL = this.POSITION_TYPE.WALL;
            
            if (onBottom === WALL && onLeft !== WALL && onRight !== WALL)
                return true;

            return onLeft !== WALL && onRight !== WALL;
        }

        this.wallIsLeftTop = function (i, j) {
            return this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsLeftBottom = function (i, j) {
            return this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsRightTop = function (i, j) {
            return this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsRightBottom = function (i, j) {
            return this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
                !this.wallIsCross(i, j);
        }

        this.wallIsCross = function (i, j) {
            return this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL;
        }

        this.wallIsBifurcLeft = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL;
        }

        this.wallIsBifurcBottom = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getRightBlock(i, j) === this.POSITION_TYPE.WALL;
        }

        this.wallIsBifurcTop = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getLeftBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getRightBlock(i, j) === this.POSITION_TYPE.WALL;
        }

        this.wallIsBifurcRight = function (i, j) {
            return !this.wallIsCross(i, j) &&
                this.getRightBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getTopBlock(i, j) === this.POSITION_TYPE.WALL &&
                this.getBottomBlock(i, j) === this.POSITION_TYPE.WALL;
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

            var i = Math.max(Math.min(Math.floor(y / size) + (y % size > 5 ? 1 : 0), this.matriz.length - 1), 0);
            var j = Math.max(Math.min(Math.floor(x / size) + (x % size > 5 ? 1 : 0), this.matriz[0].length - 1), 0);

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
            var block = this.matriz[indexes.i][indexes.j];
            return block === this.POSITION_TYPE.WALL;
        }

        this.pacCanGo = function(x, y, size, direction) {
            var indexes = this.getIndexesByCoordinates(x, y, size, direction);
            var block = this.matriz[indexes.i][indexes.j];
            return [
                this.POSITION_TYPE.WALL,
                this.POSITION_TYPE.GHOST_HOUSE
            ].indexOf(block) >= 0;
        }

        this.xCoordinateIsEnd = function(x, y) {
            var indexes = this.getIndexesByCoordinates(x, y, null, 'RIGHT');
            var block = this.matriz[indexes.i][indexes.j];
            return indexes.j >= (this.matriz[0].length - 1) && block !== this.POSITION_TYPE.PORTAL;
        }

        this.xCoordinateIsBegin = function(x, y) {
            var indexes = this.getIndexesByCoordinates(x, y, null, 'LEFT');
            var block = this.matriz[indexes.i][indexes.j];
            return indexes.j <= 0 && block !== this.POSITION_TYPE.PORTAL;
        }

        this.yCoordinateIsEnd = function(y, size) {
            var indexes = this.getIndexesByCoordinates(0, y, size, 'DOWN');
            return indexes.i >= (this.matriz.length - 1) && block !== this.POSITION_TYPE.PORTAL;
        }

        this.yCoordinateIsBegin = function(y) {
            return y <= 0;
        }

        this.biscuitGettedByCoordinates = function(x, y, size, direction) {
            var indexes = this.getIndexesByCoordinates(x, y, size);
            var block = this.matriz[indexes.i][indexes.j];
            let isBiscuit = block === this.POSITION_TYPE.BISCUIT;

            var directionInX = direction === 'LEFT' || direction === 'RIGHT';
            var directionInY = direction === 'UP' || direction === 'DOWN';

            if ((direction === 'LEFT' || (direction === 'RIGHT' && x >= indexes.j * size)) || (direction === 'UP' || (direction === 'DOWN' && y >= indexes.i * size))) {
                if (direction === 'UP')
                    y -= size;
                else if (direction === 'LEFT')
                    x -= size;
    
                if (isBiscuit)
                    isBiscuit = (directionInX && x % size >= 5) || (directionInY && y % size >= 5);
                
                return isBiscuit;
            }

        }

        this.pillGettedByCoordinates = function(x, y, size, direction) {
            var indexes = this.getIndexesByCoordinates(x, y, size);
            var block = this.matriz[indexes.i][indexes.j];
            let isPill = block === this.POSITION_TYPE.PILL;

            if (direction === 'UP')
                y -= size;
            else if (direction === 'LEFT')
                x -= size;

            var directionInX = direction === 'LEFT' || direction === 'RIGHT';
            var directionInY = direction === 'UP' || direction === 'DOWN';

            if (isPill)
                isPill = (directionInX && x % size >= 5) || (directionInY && y % size >= 5);
            
            return isPill;
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
        this.directionAfterEnd = null;
        this.direction = 'NONE';

        this.enteringPortal = false;
        this.enteringPortalEnding = false;
        
        this.i = function(round = false) {
            var size = this.size;
            var y = this.y;
            
            if (round && this.direction === 'UP')
                y -= size;
            
            var i = Math.floor(y / size) + ((round && y % size) > 5 ? 1 : 0);
            return Math.min( i, this.game.map.matriz.length - 1);
        };
        this.j = function(round = false) {
            var size = this.size;
            var x = this.x;
            
            if (round && this.direction === 'LEFT')
                x -= size;
            
            var j = Math.floor(x / size) + ((round && x % size) > 5 ? 1 : 0);
            return Math.min(j, this.game.map.matriz[0].length - 1);
        };

        this.moveX = function (direction) {
            var changeOrientation = this.direction !== 'LEFT' && this.direction !== 'RIGHT';
            var changeDirection = (this.direction === 'LEFT' || this.direction === 'RIGHT') && this.direction !== direction;

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

                if ((this.direction === 'LEFT' && !this.game.map.xCoordinateIsBegin(currentX, this.y)) ||
                    (this.direction === 'RIGHT' && !this.game.map.xCoordinateIsEnd(currentX, this.y)))
                {
                    var currentIndexes = this.game.map.getIndexesByCoordinates(currentX, this.y, this.size, this.direction);
                    var moveToJ = currentIndexes.j + (this.direction === 'RIGHT' ? 1 : 0); 
                    var _toX = moveToJ * this.size;

                    if (!this.game.map.pacCanGo(_toX, this.y, this.size)) {
                        if (currentX > this.size || currentX === 0)
                            _toX += direction === 'LEFT' ? -this.size : 0;

                        if (this.x === this.toX && _toX > 0)
                            _toX += this.direction === 'LEFT' ? -this.size : this.size;

                        this.enteringPortal = this.direction === 'LEFT' ? (_toX < 0) : (_toX > this.game.width);

                        this.toX = _toX;
                    }
                    else if (changeDirection)
                        this.toX =  currentIndexes.j * this.size;
                }
                this.toY = this.y;
            }
        };
        this.moveY = function (direction) {
            var changeOrientation = this.direction !== 'UP' && this.direction !== 'DOWN';
            var changeDirection = (this.direction === 'DOWN' || this.direction === 'UP') && this.direction !== direction;

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
    
                if ((this.direction === 'UP' && !this.game.map.yCoordinateIsBegin(currentY)) ||
                    (this.direction === 'DOWN' && !this.game.map.yCoordinateIsEnd(currentY)))
                {
                    var currentIndexes = this.game.map.getIndexesByCoordinates(this.x, currentY, this.size, this.direction);
                    var moveToI = currentIndexes.i + (this.direction === 'DOWN' ? 1 : 0);
                    var _toY = moveToI * this.size;

                    if (!this.game.map.pacCanGo(this.x, _toY, this.size, this.direction)) {
                        if (currentY > this.size || currentY === 0)
                            _toY = _toY + (direction === 'UP' ? -this.size : 0);

                        if (this.y === this.toY && _toY > 0)
                            _toY += this.direction === 'UP' ? -this.size : this.size;

                        this.enteringPortal = this.direction === 'LEFT' ? (_toY < 0) : (_toY > this.game.height);

                        this.toY = _toY;
                    }
                    else if (changeDirection)
                        this.toY =  currentIndexes.i * this.size;
                }
                this.toX = this.x;
            }
        };

        this.getDirectionByCode = function(keyCode) {
            switch(keyCode) {
                case 37: return 'LEFT';
                case 38: return 'UP';
                case 39: return 'RIGHT';
                case 40: return 'DOWN';
                default: return 'NONE';
            }
        };

        this.directionIsX = function(direction) {
            return direction === 'LEFT' || direction === 'RIGHT';
        };

        this.directionIsY = function(direction) {
            return direction === 'UP' || direction === 'DOWN';
        };

        this.onKeydown = function (event) {
            if ([37, 38, 39, 40].indexOf(event.keyCode) >= 0 && !this.enteringPortal) {
                var direction = this.getDirectionByCode(event.keyCode);
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
            }
        };

        this.onKeyup = function (event) {
            if ([37, 38, 39, 40].indexOf(event.keyCode) >= 0) {
                if (!this.enteringPortal) {
                    var direction = this.getDirectionByCode(event.keyCode);

                    if (this.directionIsX(direction))
                        this.stopMovimentX(direction);
                    else if (this.directionIsY(direction))
                        this.stopMovimentY(direction);
                }
            }
        };

        this.render = function () {
            this.updateCoordinates();

            var angle = this.calcAngle();
            this.game.context.beginPath();
            this.game.context.moveTo(this.x + (this.size / 2),
            this.y + (this.size / 2));
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

        this.stopMovimentX = function(directionToStop) {
            if (directionToStop === this.direction)
                this.toX = Math.max(Math.min(Math.floor(this.j(true)) * this.size, this.game.width - this.size), 0);
        };

        this.stopMovimentY = function(directionToStop) {
            if (directionToStop === this.direction)
                this.toY = Math.max(Math.min(Math.floor(this.i(true)) * this.size, this.game.height - this.size), 0);
        };

        this.updateCoordinates = function() {
            var nextX = this.game.applySmoothCoord(this.x, this.toX);
            var nextY = this.game.applySmoothCoord(this.y, this.toY);

            if (!this.enteringPortal) {
                if (nextX !== this.x || nextY !== this.y) {
                    if (!this.game.map.pacCanGo(nextX, nextY, this.size, this.direction)){
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
                        if (this.directionAfterEnd === 'LEFT' || this.directionAfterEnd === 'RIGHT')
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
                            if (this.direction === 'RIGHT') {
                                this.x = -this.size;
                                this.toX = 0;
                            }
                            else if (this.direction === 'LEFT') {
                                this.x = this.game.width;
                                this.toX = this.game.width - this.size;
                            }
                            else if (this.direction === 'DOWN') {
                                this.y = -this.size;
                                this.toY = 0;
                            }
                            else if (this.direction === 'LEFT') {
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
        };

        this.checkColisions = function() {
            var indexes = this.game.map.getIndexesByCoordinates(this.x, this.y, this.size);
            if (this.game.map.biscuitGettedByCoordinates(this.x, this.y, this.size, this.direction)) {
                this.game.user.setBiscuitGetted(indexes.i, indexes.j);
            }
            else if (this.game.map.pillGettedByCoordinates(this.x, this.y, this.size, this.direction)) {
                this.game.user.setPillGetted(indexes.i, indexes.j);
            }
        }

        this.calcAngle = function() { 
            if (this.direction === 'RIGHT' && (this.x % 10 < 5 || this.x == this.toX))
                return { start: 0.25, end: 1.75, direction: false };
            if (this.direction === 'DOWN' && (this.y % 10 < 5 || this.y == this.toY)) 
                return { start: 0.75, end: 2.25, direction: false };
            if (this.direction === 'UP' && (this.y % 10 < 5 || this.y == this.toY)) 
                return { start: 1.25, end: 1.75, direction: true };
            if (this.direction === 'LEFT' && (this.x % 10 < 5 || this.x == this.toX))         
                return { start: 0.75, end: 1.25, direction: true };
            
            return { start: 0, end: 2, direction: false };
        };
    }

    function User(game) {
        this.game = game;

        this.biscuitsGettedCoords;
        this.pillsGettedCoords;

        this.reset = function() {
            this.biscuitsGettedCoords = [];
            this.pillsGettedCoords = [];
        };

        this.setBiscuitGetted = function(i, j) {
            if (!this.biscuitIsGetted(i, j)) {
                this.biscuitsGettedCoords.push({ i, j });
                this.updateScores();
            }
        }

        this.setPillGetted = function(i, j) {
            if (!this.pillIsGetted(i, j)) {
                this.pillsGettedCoords.push({ i, j });
                this.updateScores();
            }
        }

        this.biscuitIsGetted = function(i, j) {
            var exists = false;

            for (var coord of this.biscuitsGettedCoords) {
                if (coord.i === i && coord.j === j) {
                    exists = true;
                    break;
                }
            }

            return exists;
        }

        this.pillIsGetted = function(i, j) {
            var exists = false;

            for (var coord of this.pillsGettedCoords) {
                if (coord.i === i && coord.j === j) {
                    exists = true;
                    break;
                }
            }

            return exists;
        }

        this.updateScores = function() {
            this.biscuitsGetted = this.biscuitsGettedCoords.length;
            this.pillsGetted = this.pillsGettedCoords.length;
        };

        this.reset();
    }

    function Ghost(game, name) {
        this.game = game;
        this.name = name;

        this.size = this.game.blockSize;

        this.bornCoordX = this.game.map.ghostBornCoords.x;
        this.bornCoordY = this.game.map.ghostBornCoords.y;
        this.bornCoordI = { begin: this.bornCoordY.begin / this.size, end: this.bornCoordY.end / this.size };
        this.bornCoordJ = { begin: this.bornCoordX.begin / this.size, end: this.bornCoordX.end / this.size };

        this.STATES = {
            WAITING: 'WAITING',
            STOP_WAITING: 'STOP_WAITING',
            HUNTERING: 'HUNTERING',
            STUNNED: 'STUNNED',
            DEAD_GO_HOME: 'DEAD_GO_HOME',
            DEAD: 'DEAD',
        };

        this.DIRECTIONS = {
            NONE: 'NONE',
            LEFT: 'LEFT',
            RIGHT: 'RIGHT',
            UP: 'UP',
            DOWN: 'DOWN',
        };

        this.imagesPerState = {
            WAITING: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            STOP_WAITING: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            HUNTERING: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            STUNNED: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            DEAD_GO_HOME: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' },
            DEAD: { normal: 'assets/img/ghosts/' + this.name + '.png', dead: 'assets/img/ghosts/' + this.name + '.png' }
        };

        this.x = 0;
        this.y = 0;
        this.toX = this.x;
        this.toY = this.y;

        this.ghostNumber = function() { return parseInt(this.name); }

        this.direction = this.DIRECTIONS.NONE;
        this.state = this.STATES.WAITING;

        this.image = new Image();
        this.image.src =  this.imagesPerState[this.state].normal;

        this.waitingTime = 5000 + ((this.ghostNumber() - 1) * 2000);
        this.howLongIsTheWait = 0;

        this.destinationToGo = { i: 0, j: 0 };
        
        this.i = function(round = false) {
            var size = this.size;
            var y = this.y;
            
            if (round && this.direction === 'UP')
                y -= size;
            
            var i = Math.floor(y / size) + ((round && y % size) > 5 ? 1 : 0);
            return Math.min( i, this.game.map.matriz.length - 1);
        };
        this.j = function(round = false, direction = null) {
            var size = this.size;
            var x = this.x;
            
            if (!direction)
                direction = this.direction;

            if (round && this.direction === 'LEFT')
                x -= size;
            
            var j = Math.floor(x / size) + ((round && x % size) > 5 ? 1 : 0);
            return Math.min(j, this.game.map.matriz[0].length - 1);
        };

        this.initialize = function(){
            var initI = Helper.randomInterval(this.bornCoordI.begin, this.bornCoordI.end);
            var initJ = Helper.randomInterval(this.bornCoordJ.begin, this.bornCoordJ.end);
    
            this.x = initJ * this.size;
            this.y = initI * this.size;
            this.toX = this.x;
            this.toY = this.y;
    
            if (this.bornCoordI.begin !== this.bornCoordI.end) {
                if (initI > this.bornCoordI.begin)
                    this.goToTheDirection(this.DIRECTIONS.UP);
                else
                    this.goToTheDirection(this.DIRECTIONS.DOWN);
            }
            else if (this.bornCoordJ.begin !== this.bornCoordJ.end) {
                if (initJ > this.bornCoordJ.begin)
                    this.goToTheDirection(this.DIRECTIONS.LEFT);
                else
                    this.goToTheDirection(this.DIRECTIONS.RIGHT);
            }
        };

        this.render = function() {
            this.updateWaitingTime();
            this.updateCoordinates();

            this.game.context.drawImage(this.image, this.x, this.y, this.size, this.size);
        };

        this.updateCoordinates = function() {
            var nextX = this.x;
            var nextY = this.y;

            if (this.x !== this.toX && this.directionIsX())
                nextX = this.game.applySmoothCoord(this.x, this.toX);
            else if (this.x !== this.toX && this.y === this.toY) {
                this.direction = this.x < this.toX ? this.DIRECTIONS.RIGHT : this.DIRECTIONS.LEFT;
                nextX = this.game.applySmoothCoord(this.x, this.toX);
            }
            else if (this.y !== this.toY && this.directionIsY())
                nextY = this.game.applySmoothCoord(this.y, this.toY);
            else if (this.y !== this.toY && this.x === this.toX) {
                this.direction = this.y < this.toY ? this.DIRECTIONS.DOWN : this.DIRECTIONS.UP;
                nextY = this.game.applySmoothCoord(this.y, this.toY);
            }
            
            switch(this.state) {
                case this.STATES.WAITING: {
                    if (nextX !== this.x || nextY !== this.y)
                        this.goToNextCoords(nextX,nextY);
                    else {

                        if (this.howLongIsTheWait >= this.waitingTime)
                            this.stopWaitingAndGoHunting();
                        else {
                            var limit = {
                                x: { min: this.bornCoordJ.begin * this.size, max: this.bornCoordJ.end * this.size },
                                y: { min: this.bornCoordI.begin * this.size, max: this.bornCoordI.end * this.size }
                            }
    
                            if (this.canGoInTheDirection(this.direction, limit))
                                this.goToTheDirection(this.direction);
                            else {
                                var direction = this.getReverseDirection();
                                
                                if (this.canGoInTheDirection(direction, limit))
                                    this.goToTheDirection(direction);
                                else {
                                    direction = this.getReverseOrientation();
    
                                    if (this.canGoInTheDirection(direction, limit))
                                        this.goToTheDirection(direction);
                                    else {
                                        var direction = this.getReverseDirection();
    
                                        if (this.canGoInTheDirection(direction, limit))
                                            this.goToTheDirection(direction);
                                    }
                                }
                            }
                        }
                    }

                    break;
                }
                case this.STATES.STOP_WAITING: {
                    if (nextX !== this.x || nextY !== this.y)
                        this.goToNextCoords(nextX, nextY);
                    else
                        this.goHunting();
                    break;
                }
                case this.STATES.HUNTERING: {
                    if (nextX !== this.x || nextY !== this.y)
                        this.goToNextCoords(nextX, nextY);
                    else {
                        this.destinationToGo = {
                            i: this.game.pac.i(true),
                            j: this.game.pac.j(true)
                        };

                        this.goToDestination();
                    }
                    break;
                }
                case this.STATES.STUNNED: {
                    break;
                }
                case this.STATES.DEAD_GO_HOME: {
                    break;
                }
                case this.STATES.DEAD: {
                    break;
                }
            }
        }

        this.goToNextCoords = function(nextX, nextY) {
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

        this.goToTheDirection = function(direction) {
            this.direction = direction;

            if (direction === this.DIRECTIONS.UP)
                this.toY = this.y - this.size;
            else if (direction === this.DIRECTIONS.DOWN)
                this.toY = this.y + this.size;
            else if (direction === this.DIRECTIONS.LEFT)
                this.toX = this.x - this.size;
            else if (direction === this.DIRECTIONS.RIGHT)
                this.toX = this.x + this.size;
        }

        this.canGoInTheDirection = function(direction, limit) {
            var x = this.x;
            var y = this.y;
            if (direction === this.DIRECTIONS.UP)
                y = (this.i(true, direction)) * this.size;
            else if (direction === this.DIRECTIONS.DOWN)
                y = (this.i(true, direction) + 1) * this.size;
            else if (direction === this.DIRECTIONS.LEFT)
                x = (this.j(true, direction)) * this.size;
            else if (direction === this.DIRECTIONS.RIGHT)
                x = (this.j(true, direction) + 1) * this.size;

            if (limit) {
                if (x < limit.x.min || x > limit.x.max)
                    return false;
                if (y < limit.y.min || y > limit.y.max)
                    return false;
            }

            return !this.game.map.isCollidingWithWall(x, y, this.size);
        }

        this.stopWaitingAndGoHunting = function() {
            this.state = this.STATES.STOP_WAITING;
            this.image.src = this.imagesPerState[this.state].normal;

            // TRY TO EXIT THE Y AXIS
            for (var i = this.bornCoordI.begin; i <= this.bornCoordI.end; i = this.bornCoordI.end) {
                for (var j = this.bornCoordJ.begin; j <= this.bornCoordJ.end; j++) {
                    var direction = null;
                    var rate = 2;

                    if (i === this.bornCoordI.begin && this.game.map.getTopBlock(i, j) !== this.game.map.POSITION_TYPE.WALL) {
                        rate *= -1;
                        direction = this.DIRECTIONS.UP;
                    }
                    else if (i === this.bornCoordI.end && this.game.map.getBottomBlock(i, j) !== this.game.map.POSITION_TYPE.WALL)
                        direction = this.DIRECTIONS.DOWN;

                    if (direction) {
                        this.toX = j * this.size;
                        this.toY = (i + rate) * this.size;

                        if (this.x !== this.toX)
                            this.direction = this.x < this.toX ? this.DIRECTIONS.RIGHT : this.DIRECTIONS.LEFT;
                        else
                            this.direction = direction;
                        return;
                    }
                }   
            }

            // TRY TO EXIT THE X AXIS
            for (var j = this.bornCoordJ.begin; j <= this.bornCoordJ.end; j = this.bornCoordJ.end) {
                for (var i = this.bornCoordI.begin; i <= this.bornCoordI.end; i++) {
                    var direction = null;
                    var rate = 2;

                    if (j === this.bornCoordJ.begin && this.game.map.getLeftBlock(i, j) !== this.game.map.POSITION_TYPE.WALL) {
                        direction = this.DIRECTIONS.LEFT;
                        rate *= -1;
                    }
                    else if (j === this.bornCoordJ.end && this.game.map.getRightBlock(i, j) !== this.game.map.POSITION_TYPE.WALL)
                        direction = this.DIRECTIONS.RIGHT;

                    if (direction) {
                        this.toX = (j + rate) * this.size;
                        this.toY = i * this.size;


                        if (this.y !== this.toY)
                            this.direction = this.y < this.toY ? this.DIRECTIONS.RIGHT : this.DIRECTIONS.LEFT;
                        else
                            this.direction = direction;
                        return;
                    }
                }   
            }
        };

        this.goToDestination = function() {
            if (this.destinationToGo && this.destinationToGo.i && this.destinationToGo.j) {
                var detination = this.destinationToGo;
                var destX = detination.j * this.size;
                var destY = detination.i * this.size;

                var diffDistanceX = Math.abs(this.x - destX);
                var diffDistanceY = Math.abs(this.y - destY);

                if (diffDistanceX > diffDistanceY) {
                    
                }
            }
        };

        this.goHunting = function() {
            this.state = this.STATES.HUNTERING;
            this.image.src = this.imagesPerState[this.state].normal;
        };

        this.updateWaitingTime = function() {
            if (this.state === this.STATES.WAITING)
                this.howLongIsTheWait += this.game.timeToRerender;
            else
                this.howLongIsTheWait = 0;
        }

        this.directionIsX = function() { return this.direction === 'LEFT' || this.direction === 'LEFT'; };
        this.directionIsY = function() { return this.direction === 'UP' || this.direction === 'DOWN'; };
        this.getReverseDirection = function() {
            if (this.direction === 'UP')
                return 'DOWN';
            if (this.direction === 'DOWN')
                return 'UP';
            if (this.direction === 'LEFT')
                return 'RIGHT';
            if (this.direction === 'RIGHT')
                return 'LEFT';

            return 'NONE';
        };
        this.getReverseOrientation = function() {
            if (this.direction === 'UP')
                return 'LEFT';
            if (this.direction === 'DOWN')
                return 'RIGHT';
            if (this.direction === 'LEFT')
                return 'UP';
            if (this.direction === 'RIGHT')
                return 'DOWN';

            return 'NONE';
        };

        this.initialize();
    }
};

Helper = {
    randomInterval: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}