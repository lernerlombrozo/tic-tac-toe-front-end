import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private key = 'tic_tac_toe';
  public anonymousId: string | undefined;

  public initializeId(): void{
    let anonymousId = this.getAnonymousId();
    if(!anonymousId){
      anonymousId = this.createAnonymousId();
      this.setAnonymousId(anonymousId);
    }
    this.anonymousId = anonymousId;
  }

  private getAnonymousId(): string | null{
    return localStorage.getItem(this.key)
  }

  private createAnonymousId(): string{
    return Date.now().toString();
  }

  private setAnonymousId(id: string): void{
    return localStorage.setItem(this.key, id)
  }
  
}
