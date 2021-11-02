import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { Game } from './game/game';
import { GameService } from './game/game.service';

@Injectable({
  providedIn: 'root'
})
export class MockSocketsService {

  constructor(private readonly gameService:GameService){}

  // breaking single responsibility principle, should instead use http service or pass in a callback function
  public listen(gameId: number): Observable<Game>{
    return new Observable((subscriber)=>{
      interval(2000).subscribe(()=>{
        this.gameService.loadGame(gameId).subscribe((game:Game)=>{
          subscriber.next(game)
        })
      })
    })
  }
}
