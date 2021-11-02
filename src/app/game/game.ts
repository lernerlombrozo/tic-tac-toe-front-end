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

export class Game {
    public readonly name: string | undefined;
    public readonly dimension:  2 | 3 = 3;
    public readonly size: number; 
    public readonly player1: string | undefined;
    private _player2: string | undefined;
    public currentTurn = Players.P1;
    public winner: string | undefined;
    public board?: Board2D | Board3D = [];
    public readonly id?: number

    constructor(player1:string, gameOptions: GameOptions){
        this.player1 = player1;
        this.name = gameOptions.name;
        this.dimension = gameOptions.dimension;
        this.size = gameOptions.size || 3;
        this.board = boardFactory(gameOptions.dimension, gameOptions.size);
    }

    public set player2(playerId: string | undefined) {
        if(this._player2 || !playerId){
            return;
        }
        this._player2 = playerId;
    }

    public get player2(): string | undefined{
        return this._player2;
    }

}
