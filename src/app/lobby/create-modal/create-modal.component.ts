import { Component, EventEmitter, Output } from '@angular/core';
import { GameOptions } from 'src/app/game/game';

@Component({
  selector: 'app-create-modal',
  templateUrl: './create-modal.component.html',
  styleUrls: ['./create-modal.component.scss']
})
export class CreateModalComponent {
  @Output() public readonly close = new EventEmitter<void>();
  @Output() public readonly startGame = new EventEmitter<GameOptions>();

  dimensions = [2,3];

  gameOptions:GameOptions = {
    name: '',
    dimension: 3,
    size: 3
  }

  closeModal(){
    this.close.emit()
  }

  createGame(){
    this.startGame.emit(this.gameOptions);
  }
}
