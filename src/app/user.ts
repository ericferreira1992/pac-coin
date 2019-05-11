import { PacCoin } from './pac-coin';

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
        let loseWindowEl = document.getElementById('lose-window');

        if (loseWindowEl) {
            loseWindowEl.classList.remove('fadeIn');
            loseWindowEl.classList.add('fadeOut');
    
            setTimeout(() => loseWindowEl.remove(), 500);
        }
    }

    private updateScores() {
        this.biscuitsGetted = this.biscuitsGettedCoords.length;
        this.pillsGetted = this.pillsGettedCoords.length;
    };
}