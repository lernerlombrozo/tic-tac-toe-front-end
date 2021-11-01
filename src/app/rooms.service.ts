import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GameOptions, Room } from './game/game';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  constructor(private readonly httpClient: HttpClient){}

  public fetchRooms(): Observable<Room[]>{
    return this.httpClient.get<Room[]>(`${environment.apiUrl}/rooms`);
  }

  public fetchRoom(roomId: string): Observable<Room[]>{
    return this.httpClient.get<Room[]>(`${environment.apiUrl}/rooms/${roomId}`);
  }

  public createRoom(room: GameOptions): Observable<Room[]>{
    return this.httpClient.post<Room[]>(`${environment.apiUrl}/rooms`, room);
  }

  public editRoom(room: Room): Observable<Room[]>{
    return this.httpClient.put<Room[]>(`${environment.apiUrl}/rooms/${room.name}`, room);
  }

  public deleteRoom(): Observable<Room[]>{
    return this.httpClient.delete<Room[]>(environment.apiUrl + '/rooms', {});
  }
}
