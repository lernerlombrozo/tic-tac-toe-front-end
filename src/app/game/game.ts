export enum Players {
    P1 = 1,
    P2
}

export type Board1D = Array<0 | Players.P1 | Players.P2>;
export type Board2D = Board1D[];
export type Board3D = Board2D[];

export const boardFactory = (dimension: 2 | 3, size = 3): Board2D | Board3D  => {
    const board: Board2D | Board3D = [];
    if(dimension === 2){
        for(let x=0; x < size; x++){
            board.push([])
          for(let y=0; y < size; y++){
            (board[x] as Board1D).push(0);
          }
        }
    } 
    else {
        for(let x=0; x < size; x++){
            board.push([])
            for(let y=0; y < size; y++){
                (board[x] as Board2D).push([])
                for(let z=0; z < size; z++){
                    (board[x][y] as Board1D).push(0);
                }
            }
        }
    }
    return board;
}

export interface GameOptions {
    name: string;
    dimension: 2 | 3;
    size?: number;
}

export class Room {
    public name: string = '';
    public dimension: 2 | 3 = 2;
    public size: number = 3;

    constructor(gameOptions: GameOptions){
        const { name, dimension, size } = gameOptions;
        this.name = name;
        this.dimension = dimension;
        this.size = !size || size < 3 ? 3 : size;
    }
}

export class Game extends Room {
    public winner: Players | undefined;
    public readonly players : Players[] = [Players.P1];
    public readonly currentTurn = Players.P1;
    public board: Board2D | Board3D = [];

    constructor(gameOptions: GameOptions){
        super(gameOptions);
        this.board = boardFactory(this.dimension, this.size);
    }

    public playerJoin(): void {
        if(this.players.length === 2){
            return;
        }
        this.players.push(Players.P2);
    }

}
