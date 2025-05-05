import { Component } from '@angular/core';
import {Observable, take} from 'rxjs';
import { GameService } from '../../services/game.service';
import {AnimationState, GameState, Item, ModalState} from '../../types/game-types';
import {CharacterSelectionComponent} from '../character-selection/character-selection.component';
import {CombatScreenComponent} from '../combat-screen/combat-screen.component';
import {GameOverComponent} from '../game-over/game-over.component';
import {GameBoardComponent} from '../game-board/game-board.component';
import {PlayerStatusComponent} from '../player-status/player-status.component';
import {ModalComponent} from '../modal/modal.component';
import {InventoryModalComponent} from '../inventory-modal/inventory-modal.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import {DiceComponent} from '../dice/dice.component';


@Component({
  selector: 'app-rpg-board-game',
  templateUrl: './game.component.html',
  standalone: true,
  imports: [
    CommonModule,
    CharacterSelectionComponent,
    CombatScreenComponent,
    GameOverComponent,
    GameBoardComponent,
    PlayerStatusComponent,
    ModalComponent,
    InventoryModalComponent,
    AsyncPipe,
    DiceComponent,
  ],
  styleUrls: ['./game.component.css']
})
export class RpgBoardGameComponent {
  gameState$!: Observable<GameState>;
  character$!: Observable<any>;
  board$!: Observable<any>;
  diceResult$!: Observable<number | null>;
  message$!: Observable<string>;
  enemy$!: Observable<any>;
  inventory$!: Observable<Item[]>;
  health$!: Observable<number>;
  isRolling$!: Observable<boolean>;
  animationState$!: Observable<AnimationState>;
  modalState$!: Observable<ModalState>;


  isInventoryOpen = false;

  constructor(private gameService: GameService) {
    this.gameState$ = this.gameService.gameState$;
    this.character$ = this.gameService.character$;
    this.board$ = this.gameService.board$;
    this.diceResult$ = this.gameService.diceResult$;
    this.message$ = this.gameService.message$;
    this.enemy$ = this.gameService.enemy$;
    this.inventory$ = this.gameService.inventory$;
    this.health$ = this.gameService.health$;
    this.isRolling$ = this.gameService.isRolling$;
    this.animationState$ = this.gameService.animationState$;
    this.modalState$ = this.gameService.modalState$;
  }

  // Méthodes d'interaction avec le service
  selectCharacter(event: { type: string; color: string }): void {
    this.gameService.selectCharacter(event.type, event.color);
  }

  rollDice(): void {
    this.gameService.rollDice();
  }

  attackEnemy(): void {
    this.gameService.attackEnemy();
  }

  restartGame(): void {
    this.gameService.restartGame();
  }

  useItem(item: Item): void {
    this.gameService.useItem(item);
  }

  closeModal(): void {
    this.gameService.closeModal();
  }

  handleModalAction(): void {
    // Utiliser first() ou take(1) pour s'assurer que la souscription se termine après la première émission
    this.modalState$.pipe(take(1)).subscribe(modalState => {
      if (modalState?.onConfirm) {
        // Stocker la référence de la fonction avant de fermer le modal
        const onConfirmFn = modalState.onConfirm;

        // Exécuter cette fonction après un court délai
        setTimeout(() => {
          onConfirmFn();
        }, 0);
      }
    });
  }

  toggleInventory(open: boolean): void {
    this.isInventoryOpen = open;
  }

  isCombatState(gameState: GameState): boolean {
    return [
      'combat',
      'playerAttack',
      'enemyAttack',
      'playerUseItem'
    ].includes(gameState);
  }

  getDiceButtonText(
    isRolling: boolean,
    isMoving: boolean,
    isTileEffectProcessing: boolean,
    gameState: GameState
  ): string {
    if (isRolling) return 'Lancement...';
    if (isMoving) return 'Déplacement en cours...';
    if (isTileEffectProcessing) return 'Action en cours...';
    if (gameState !== 'playing') return 'Attendez...';
    return 'Lancer les dés';
  }
}
