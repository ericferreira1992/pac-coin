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

    reset() {
        this.biscuitsGettedCoords = [];
        this.pillsGettedCoords = [];
    };

    setBiscuitGetted(i: number, j: number) {
        if (!this.biscuitIsGetted(i, j)) {
            this.biscuitsGettedCoords.push({ i, j });
            this.updateScores();
        }
    }

    setPillGetted(i: number, j: number) {
        if (!this.pillIsGetted(i, j)) {
            this.pillsGettedCoords.push({ i, j });
            this.updateScores();
        }
    }

    biscuitIsGetted(i: number, j: number) {
        var exists = false;

        for (var coord of this.biscuitsGettedCoords) {
            if (coord.i === i && coord.j === j) {
                exists = true;
                break;
            }
        }

        return exists;
    }

    pillIsGetted(i: number, j: number) {
        var exists = false;

        for (var coord of this.pillsGettedCoords) {
            if (coord.i === i && coord.j === j) {
                exists = true;
                break;
            }
        }

        return exists;
    }

    updateScores() {
        this.biscuitsGetted = this.biscuitsGettedCoords.length;
        this.pillsGetted = this.pillsGettedCoords.length;
    };
}