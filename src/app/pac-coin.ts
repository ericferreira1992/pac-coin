import { Map } from './map';
import { Pac } from './pac';
import { User } from './user';
import { Ghost } from './ghost';

export class PacCoin {
    public blockSize = 26;
    public moveRate = 5;
    public timeToRerender = 10;

    public state: GAME_STATE;

    public colors = {
        background: COLOR.DARK,
        pac: COLOR.GOLD,
        wall: COLOR.BLUE,
        biscuit: COLOR.GOLD
    };

    public map: Map;
    public pac: Pac;
    public user: User;
    
    public ghosts: Ghost[];

    public width: number;
    public height: number;

    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;

    public coinImg = new Image();

    public get isRunning() { return this.state === GAME_STATE.RUNNING; }

    private loop: NodeJS.Timer;
    private isStarted: boolean = false;
    
    constructor() {
        this.coinImg.src = 'assets/img/sb-coin.svg';
        this.state = GAME_STATE.STOPPED;
    }

    public start(restarting: boolean = false) {
        this.map = new Map(this);
        this.pac = new Pac(this);
        this.user = new User(this);

        this.ghosts = [
            new  Ghost(this, '01'),
            new  Ghost(this, '02'),
            new  Ghost(this, '03'),
            new  Ghost(this, '04'),
        ];

        this.width = this.map.lengthX * this.blockSize;
        this.height = this.map.lengthY * this.blockSize;

        if (!this.isStarted) {
            this.createCanvas();
            this.makeListeners();
        }

        if (!restarting) {
            this.user.showStartGameWindow();
            this.state = GAME_STATE.STOPPED;
        }
        else
            setTimeout(() => this.state = GAME_STATE.RUNNING, 500);

        this.runGameLoop();
        this.loop = setInterval(this.runGameLoop.bind(this), this.timeToRerender);

        this.isStarted = true;
    }

    public restart() {
        clearInterval(this.loop);
        this.closeAllOpenedWindows();
        this.start(true);
    }

    public resume(withRestart: boolean = false) {
        if (withRestart)
            this.restart();
        else {
            this.closeAllOpenedWindows();
            setTimeout(() => this.state = GAME_STATE.RUNNING, 500);
        }
    }

    public stop() {
        this.state = GAME_STATE.STOPPED;
    }

    private createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.backgroundColor = this.colors.background;
        document.body.style.backgroundColor = this.colors.background;
        document.body.prepend(this.canvas);

        this.defineSizeVarsStyle();
        this.createTitle();
        this.createFooter();

        this.context = this.canvas.getContext('2d');
    }

    private defineSizeVarsStyle() {
        document.documentElement.style.setProperty('--canvas-width', this.width + 'px');
        document.documentElement.style.setProperty('--canvas-height', this.height + 'px');

        document.documentElement.style.setProperty('--window-width', (this.width - 100) + 'px');

        document.documentElement.style.setProperty('--game-dark', COLOR.DARK);
        document.documentElement.style.setProperty('--game-blue', COLOR.BLUE);
        document.documentElement.style.setProperty('--game-gold', COLOR.GOLD);
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
        this.canvas.insertAdjacentHTML('beforebegin', titleHtml);
    }

    private createFooter() {
        let footerHtml = `
        <div class="footer" style="max-width: ${this.width}px">
            <p>Criado por Eric Andrade Ferreira</p>
            <p>
                Código fonte no 
                <a href="https://github.com/ericferreira1992/pac-coin" target="_blank">
                    Github
                </a>
            </p>
        </div>`;
        this.canvas.insertAdjacentHTML('afterend', footerHtml);
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

    public ghostFoundPac(ghost: Ghost) {
        this.state = GAME_STATE.GHOST_FOUND_PAC;
        this.showLooseWindow();
    }

    public showLooseWindow() {
        this.user.showLooseWindow();
    }

    public closeLooseWindow() {
        this.user.closeLooseWindow();
    }

    public closeAllOpenedWindows() {
        this.user.closeAllOpenedWindows();
    }

    public pacFoundStunnedGhost(ghost: Ghost) {
        ghost.goToHomeBecauseDead();
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
    STOPPED = 'STOPPED',
    RUNNING = 'RUNNING',
    PAUSED = 'PAUSED',
    GHOST_FOUND_PAC = 'GHOST_FOUND_PAC',
    WIN = 'WIN',
    GAME_OVER = 'GAME_OVER'
}

export enum COLOR {
    DARK = '#424242',
    GOLD = '#FACD00',
    BLUE = '#00C8ba',
}