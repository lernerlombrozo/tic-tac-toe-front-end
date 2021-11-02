import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Game } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public currentGame: Game | undefined = undefined;

  get game$(): Observable<Game | undefined> {
    return this.game.asObservable();
  }

  private readonly game = new BehaviorSubject<Game | undefined>(this.currentGame);

  constructor(private readonly httpClient: HttpClient){}

  updateGame(game: Game): void {
    this.currentGame = game;
    this.game.next(this.currentGame);
  }

  clearGame(): void {
    this.currentGame = undefined;
    this.game.next(this.currentGame);
  }

  public fetchGames(): Observable<Game[]> {
    return this.httpClient.get<Game[]>(`${environment.apiUrl}/games`);

  }

  public createGame(game: Game): Observable<Game> {
    return this.httpClient.post<Game>(`${environment.apiUrl}/games`, game);

  };

  public joinGameById(game: {id: number, player2: string}): Observable<Game>{
    return this.httpClient.post<Game>(`${environment.apiUrl}/games/join`, game);
  }

  public move(move: [number, number] | [number, number, number], player: string): Observable<Game>{
    const game = {
      move, player, id: this.currentGame?.id
    }
    return this.httpClient.post<Game>(`${environment.apiUrl}/games/move`, game);
  }

  public loadGame(id: number): Observable<Game> {
    // TODO load actual new game
    return this.httpClient.get<Game>(`${environment.apiUrl}/games/${id}`);
  }
}
