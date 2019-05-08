import { Map } from './map';
import { Pac } from './pac';
import { User } from './user';
import { Ghost } from './ghost';

export class PacCoin {
    public blockSize = 26;
    public moveRate = 5;
    public timeToRerender = 10;

    public state: GAME_STATE = GAME_STATE.RUNNING;

    public colors = {
        background: '#424242',
        pac: '#FACD00',
        wall: '#00C8ba',
        biscuit: '#FACD00'
    };

    public map = new Map(this);
    public pac = new Pac(this);
    public user = new User(this);

    public ghosts = [
        new  Ghost(this, '01'),
        /* new  Ghost(this, '02'),
        new  Ghost(this, '03'),
        new  Ghost(this, '04'), */
    ];

    public width = this.map.lengthX * this.blockSize;
    public height = this.map.lengthY * this.blockSize;

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    public coinImg = new Image();

    public get isRunning() { return this.state === GAME_STATE.RUNNING; }
    
    constructor() {
        this.coinImg.src = 'assets/img/sb-coin.svg';
    }

    start () {
        this.createCanvas();
        this.makeListeners();
        this.runGameLoop();
        setInterval(this.runGameLoop.bind(this), this.timeToRerender);
    }

    private createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.backgroundColor = this.colors.background;
        document.body.style.backgroundColor = this.colors.background;
        document.body.prepend(this.canvas);

        this.createTitle();

        this.context = this.canvas.getContext('2d');
    }

    private createTitle() {
        let titleHtml = '' +
        '<div class="title" style="max-width: ' + this.width + 'px">'+
            '<h2 style="color: ' + this.colors.biscuit + '">'+
                'PAC-COIN'+
            '</h2>'+
            '<h6 style="color: #FFF">' +
                'Catch the coins!'+
            '</h6>'+
        '</div>';
        document.body.insertAdjacentHTML('afterbegin', titleHtml);
    }

    private makeListeners () {
        document.onkeydown = (event) => {
            this.pac.onKeydown(event);
        };

        document.onkeyup = (event) => {
            this.pac.onKeyup(event);
        };
    }

    private runGameLoop() {
        this.context.beginPath();
        this.context.clearRect(0, 0, this.width, this.height);
        this.map.render();
        this.pac.render();
        this.ghosts.forEach(function(ghost) {
            ghost.render();
        });
    };

    public ghostFoundPac() {
        this.state = GAME_STATE.GHOST_FOUND_PAC;
    }

    public pacFoundStunnedGhost(i: number, j: number) {
        let ghost = this.ghosts.find(g => g.i(true) === i && g.j(true) === j);
        if (ghost) {
            console.log(ghost);
        }
    }

    public onPacGettedPill() {
        this.ghosts.forEach((ghost) => {
            ghost.onPillGetted();
        });
    }

    public applySmoothCoord (fromPosition: number, toPosition: number, customRate?: number) {
        let rate = customRate ? customRate : 1;
        if (fromPosition !== toPosition) {
            let newPosition = fromPosition + ((fromPosition < toPosition) ? rate : -rate);
            if (fromPosition < toPosition && newPosition > toPosition)
                return toPosition;
            else if (fromPosition > toPosition && newPosition < toPosition)
                return toPosition;
            return newPosition;
        }
        return fromPosition;
    }
}

export enum GAME_STATE {
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    GHOST_FOUND_PAC = 'GHOST_FOUND_PAC',
    WIN = 'WIN',
    GAME_OVER = 'GAME_OVER'
}