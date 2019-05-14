import { PacCoin } from './pac-coin';
import { BLOCK_TYPE } from './map';

export class User {
    public game: PacCoin;

    public biscuitsGettedCoords: any[];
    public pillsGettedCoords: any[];

    public biscuitsGetted: number;
    public pillsGetted: number;

    constructor(game: PacCoin) {
        this.game = game;

        this.reset();
    }

    private reset() {
        this.biscuitsGettedCoords = [];
        this.pillsGettedCoords = [];
    };

    public setBiscuitGetted(i: number, j: number) {
        if (!this.biscuitIsGetted(i, j)) {
            this.biscuitsGettedCoords.push({ i, j });
            this.updateScores();
        }
    }

    public setPillGetted(i: number, j: number) {
        if (!this.pillIsGetted(i, j)) {
            this.pillsGettedCoords.push({ i, j });
            this.game.onPacGettedPill();
            this.updateScores();
        }
    }

    public biscuitIsGetted(i: number, j: number) {
        var exists = false;

        for (var coord of this.biscuitsGettedCoords) {
            if (coord.i === i && coord.j === j) {
                exists = true;
                break;
            }
        }

        return exists;
    }

    public pillIsGetted(i: number, j: number) {
        var exists = false;

        for (var coord of this.pillsGettedCoords) {
            if (coord.i === i && coord.j === j) {
                exists = true;
                break;
            }
        }

        return exists;
    }

    private createWindowElement(id: string) {
        let windowEl = document.createElement('div');
        windowEl.id = id;
        windowEl.className = 'suspended-window animated fadeIn';
        return windowEl;
    }

    private removeWindowElement(id: string) {
        let loseWindowEl = document.getElementById(id);
        if (loseWindowEl) {
            loseWindowEl.classList.remove('fadeIn');
            loseWindowEl.classList.add('fadeOut');
    
            setTimeout(() => loseWindowEl.remove(), 500);
        }
    }

    public showLooseWindow() {
        let loseWindowEl = this.createWindowElement('lose-window');
        loseWindowEl.innerHTML = 
        `
            <section class="animated flipInX">
                <h4>Você perdeu!</h4>

                <p>
                    Você não conseguiu pegar todas as coins<br/>
                    antes que os fantasmas lhe pegassem.
                </p>

                <button onclick="restart()">
                    Jogar novamente!
                </button>
            </section>
        `;

        document.body.prepend(loseWindowEl);
    }

    public closeLooseWindow() {
        this.removeWindowElement('lose-window');
    }

    public showStartGameWindow() {
        let loseWindowEl = this.createWindowElement('start-game-window');
        loseWindowEl.innerHTML = 
        `
            <section class="animated zoomIn">
                <h1>Pac-coin</h1>

                <p>
                    <span><strong>Bem-vindo!</strong></span>
                    Fuja dos fantasmas e pegue todas as <i>coins</i><br/>
                    que encontrar pelo caminho.
                </p>

                <button onclick="resume()">
                    Jogar
                </button>
            </section>
        `;

        document.body.prepend(loseWindowEl);
    }

    public closeStartGameWindow() {
        this.removeWindowElement('start-game-window');
    }

    public showWinGameWindow() {
        let loseWindowEl = this.createWindowElement('start-game-window');
        loseWindowEl.innerHTML = 
        `
            <section class="animated flipInX">
                <h1>Você ganhou!!</h1>

                <p>
                    Parabéns! Você pegou todas as coins antes mesmo
                    que os fantasmas o pegassem.
                </p>

                <button onclick="restart()">
                    Jogar novamente
                </button>
            </section>
        `;

        document.body.prepend(loseWindowEl);
    }

    public closeWinGameWindow() {
        this.removeWindowElement('start-game-window');
    }

    public closeAllOpenedWindows() {
        this.closeLooseWindow();
        this.closeStartGameWindow();
    }

    private gettedAllBiscuitsAndPills() {
        let allBiscuits = this.game.map.matriz.map((item, index) => {
            return this.game.map.matriz[index].filter((x) => x === BLOCK_TYPE.BISCUIT).length;
        }).reduce((prev, curr) => prev + curr, 0);

        let allPills = this.game.map.matriz.map((item, index) => {
            return this.game.map.matriz[index].filter((x) => x === BLOCK_TYPE.PILL).length;
        }).reduce((prev, curr) => prev + curr, 0);

        return allBiscuits === this.biscuitsGetted && allPills === this.pillsGetted;
    }

    private updateScores() {
        this.biscuitsGetted = this.biscuitsGettedCoords.length;
        this.pillsGetted = this.pillsGettedCoords.length;

        if (this.gettedAllBiscuitsAndPills()) {
            this.game.stop();
            this.showWinGameWindow();
        }
    };
}