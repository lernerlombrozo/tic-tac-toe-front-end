import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Game } from './game/game';
import { GameService } from './game/game.service';

@Injectable({
  providedIn: 'root'
})
export class MockSocketsService {

  constructor(private readonly gameService:GameService){}

  // breaking single responsibility principle, should instead use http service or pass in a callback function
  public listen(gameId: number): Observable<Game>{
    return interval(2000).pipe(switchMap((x)=>{
      return this.gameService.loadGame(gameId);
    }))
  }
}
