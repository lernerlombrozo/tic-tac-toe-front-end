import { Component, OnInit } from '@angular/core';
import { Game } from './game';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    let game = new Game({
      name: 'test',
      dimension: 3
    });
  }

}
