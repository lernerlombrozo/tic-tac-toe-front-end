import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Room } from './game/game';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  private mockRooms: Room[] = [new Room({name: 'david', size: 3, dimension: 2}),new Room({name: 'lerner', size: 4, dimension: 3})]

  public fetchRooms(): Observable<Room[]>{
    return of(this.mockRooms)
  }
}
