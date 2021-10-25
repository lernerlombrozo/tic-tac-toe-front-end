import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Room } from '../game/game';
import { GameService } from '../game/game.service';
import { RoomsService } from '../rooms.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {

  constructor(private readonly roomsService:RoomsService, private readonly gameService: GameService, private readonly router: Router, private readonly route: ActivatedRoute) { }

  public rooms$: Observable<Room[]> | undefined;

  ngOnInit(): void {
    this.rooms$ = this.fetchRooms();
  }

  private fetchRooms(): Observable<Room[]>{
    return this.roomsService.fetchRooms();
  }

  public createNewGame() {
    this.gameService.createGame({dimension:3, name: 'new game'}).subscribe((game)=>{
      this.goToGame(game.name);
    });
  }

  public goToGame(name: string){
    this.router.navigate(['..', 'game', name],{relativeTo: this.route});
  }

}
