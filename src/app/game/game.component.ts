import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  constructor(private readonly gameService: GameService, private readonly route: ActivatedRoute, private readonly router: Router) { }


  public ngOnInit(){
    const subscription = this.gameService.game$.pipe(tap((game)=>{
      console.log(game);
      if(!game){
        this.fetchGameFromParams();
      }
    })).subscribe((game)=>{
      this.game = game;
    })
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
    });
  }
}
