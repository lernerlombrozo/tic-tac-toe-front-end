import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';
import { Board3D, Game, GameOptions } from '../game/game';
import { GameService } from '../game/game.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  constructor(private readonly appService: AppService, private readonly gameService: GameService, private readonly router: Router, private readonly route: ActivatedRoute) { }

  public games$: Observable<Game[]> | undefined;

  public isModalOpen = false;

  public toggleModal(){
    this.isModalOpen = !this.isModalOpen;
  }

  ngOnInit(): void {
    this.games$ = this.fetchGames();
  }

  private fetchGames(): Observable<Game[]>{
    return this.gameService.fetchGames();
  }

  public createNewGame(gameOptions:GameOptions) {
    if(!this.appService.anonymousId){
      console.log('issue with browser or app not initialized');
      return;
    }
    const game = new Game(this.appService.anonymousId, gameOptions);
    // game.board = {a:'asd'} as never as Board3D;
    // delete game.board;
    this.gameService.createGame(game)
    .subscribe((game)=>{
      if(!game.id){
        console.log('did not get game id');
        return;
      }
      this.goToGame(game.id);
    });
  }

  public joinGameById(gameId:number | undefined): void{
    const player2 = this.appService.anonymousId;
    if(!gameId || !player2){
      return;
    }
    this.gameService.joinGameById({
      id: gameId,
      player2
    })
    .subscribe((game)=>{
      this.goToGame(gameId);
    });
  }

  public goToGame(id: number){
    this.router.navigate(['..', 'game', id],{relativeTo: this.route});
  }

}
