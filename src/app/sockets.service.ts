import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  constructor() { }

  private pusher = new Pusher(environment.pusher.key, {
    cluster: environment.pusher.cluster
  });


  public listen<T>(channelName: string ,id: number, event: string): Observable<T>{
    return new Observable(subscriber => {
      const channel = this.pusher.subscribe(`${channelName}/${id}`);
      channel.bind(event, (data: T)=> {
        alert(JSON.stringify(data));
        subscriber.next(data)
      });
    })
  }
  
}
