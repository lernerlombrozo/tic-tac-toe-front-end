import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppService } from '../app.service';
import { MockSocketsService } from '../mock-sockets.service';
import { SocketsService } from '../sockets.service';
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
    const subscription = this.gameService.game$.pipe(tap((game)=>{
      if(!game){
        this.fetchGameFromParams();
      }
    })).subscribe((game)=>{
      if(game){
        this.setGame(game);
      }
    })
    this.subscriptions.push(subscription);
  }

  public ngOnDestroy(){
    this.subscriptions.forEach((subscription)=>{
      subscription.unsubscribe();
    })

  }  

  private fetchGameFromParams() : void {
    const gameName = this.route.snapshot.paramMap.get('game-name');
    if(!gameName){
      this.router.navigate(['..'])
      return;
    }
    this.gameService.loadGame(gameName).subscribe((game)=>{
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
    this.gameService.move(position, this.appService.anonymousId)
  }
}
