import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GameOptions, Room } from '../game/game';
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

  public isModalOpen = false;

  public toggleModal(){
    this.isModalOpen = !this.isModalOpen;
  }

  ngOnInit(): void {
    this.rooms$ = this.fetchRooms();
  }

  private fetchRooms(): Observable<Room[]>{
    return this.roomsService.fetchRooms();
  }

  public createNewGame(gameOptions:GameOptions) {
    this.roomsService.createRoom(gameOptions)
    .pipe(switchMap(()=>this.gameService.createGame(gameOptions)))
    .subscribe((game)=>{
      this.goToGame(game.name);
    });
  }

  public goToGame(name: string){
    this.router.navigate(['..', 'game', name],{relativeTo: this.route});
  }

}
