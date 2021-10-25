import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Game } from './game';
import { GameService } from './game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  public game$: Observable<Game | undefined> = this.gameService.game$.pipe(tap((game)=>{
    if(!game){
      this.fetchGameFromParams();
    }
  }));

  constructor(private readonly gameService: GameService, private readonly route: ActivatedRoute, private readonly router: Router) { }

  private fetchGameFromParams() : void {
    const gameName = this.route.snapshot.paramMap.get('game-name');
    if(!gameName){
      this.router.navigate(['..'])
      return;
    }
    this.gameService.loadGame(gameName).subscribe(()=>{});
  }
}
