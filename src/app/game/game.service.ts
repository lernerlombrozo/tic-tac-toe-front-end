import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Game, GameOptions } from './game';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public currentGame: Game | undefined = undefined;

  get game$(): Observable<Game | undefined> {
    return this.game.asObservable();
  }

  private readonly game = new BehaviorSubject<Game | undefined>(this.currentGame);

  updateGame(game: Game): void {
    this.currentGame = game;
    this.game.next(this.currentGame);
  }

  clearGame(): void {
    this.currentGame = undefined;
    this.game.next(this.currentGame);
  }

  public createGame(gameOptions: GameOptions): Observable<Game> {
    // TODO create actual new game
    return of(new Game(gameOptions)).pipe(tap((game)=>{
      this.updateGame(game);
    }));
  }

  public loadGame(name: string): Observable<Game> {
    // TODO load actual new game
    return of(new Game({name, dimension: 3})).pipe(tap((game)=>{
      this.updateGame(game);
    }));
  }
}
