import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { MockSocketsService } from '../mock-sockets.service';
import { Game } from './game';
import { GameService } from './game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy{

  public game : Game | undefined;

  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly appService: AppService, private readonly gameService: GameService, private readonly route: ActivatedRoute, private readonly router: Router, private readonly mockSocketsService: MockSocketsService) { }


  public ngOnInit(){
    const game = this.gameService.currentGame;
    if(!game?.id){
      this.fetchGameFromParams();
      return;
    }
    this.setGameListener(game.id);
  }

  public ngOnDestroy(){
    this.subscriptions.forEach((subscription)=>{
      subscription.unsubscribe();
    })
  }  

  private fetchGameFromParams() : void {
    const gameName = this.route.snapshot.paramMap.get('game-id');
    if(!gameName){
      this.router.navigate(['..'])
      return;
    }
    this.gameService.loadGame(+gameName).subscribe((game)=>{
      this.setGame(game);
    });
  }

  private setGame(game:Game){
    this.game = game;
      if(game.id){
        this.setGameListener(game.id);
      }
  }

  private setGameListener(gameId: number){
    const gameSub = this.mockSocketsService.listen(gameId).subscribe((game:Game)=>{
      this.game = game;
    })
    this.subscriptions.push(gameSub);
  }

  public move(position: [number, number] | [number, number, number]){
    if(!this.appService.anonymousId){
      return;
    }
    this.gameService.move(position, this.appService.anonymousId).subscribe((res)=>{
      console.log(res);
    });
  }
}
