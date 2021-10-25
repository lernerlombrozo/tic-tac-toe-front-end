export enum Players {
    P1,
    P2
}

type Board1D = Array<0 | 1 | 2>;
export type Board2D = Board1D[];
export type Board3D = Board2D[];

export const boardFactory = (dimension: 2 | 3, size = 3): Board2D | Board3D  => {
    const row: Board1D = [];
    for (let i = 0; i < size; i++){
        row.push(0);
    }
    const board2D: Board2D = [];
    for(let i = 0; i < size; i++){
        board2D.push(row);
    }
    if(dimension === 2){
        return board2D;
    }
    const board3D: Board3D = [];
    for(let i = 0; i < size; i++){
        board3D.push(board2D);
    } 
    return board3D;
}

export interface GameOptions {
    name: string;
    dimension: 2 | 3;
    size?: number;
}

export class Game {
    public winner: Players | undefined;
    public name?: string;
    public readonly players : Players[] = [Players.P1];
    public readonly currentTurn = Players.P1;
    public board: Board2D | Board3D = [];

    constructor(gameOptions: GameOptions){
        const { name, dimension, size } = gameOptions;
        this.name = name;
        this.board = boardFactory(dimension, size);
    }

    public playerJoin(): void {
        if(this.players.length === 2){
            return;
        }
        this.players.push(Players.P2);
    }

}
