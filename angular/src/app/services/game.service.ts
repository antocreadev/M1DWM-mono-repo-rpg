import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { takeUntil, tap, finalize } from 'rxjs/operators';
import {
  TILE_TYPES,
  CHARACTER_TYPES,
  ENEMY_DESCRIPTIONS,
  TILE_DESCRIPTIONS,
  GAME_ITEMS
} from '../constants/game-constants';
import {
  Tile,
  Character,
  Enemy,
  GameState,
  AnimationState,
  ModalState,
  Item,
  TileType,
  ItemType,
  EnemyType
} from '../types/game-types';
import { BoardService } from './board.service';

// Délais pour les animations (en ms)
const ANIMATION_DELAYS = {
  DICE_ROLL: 100,
  MOVE: 500,
  TILE_EFFECT: 1000,
  COMBAT_ATTACK: 1500
};

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // États observables
  private gameStateSubject = new BehaviorSubject<GameState>('characterSelection');
  private characterSubject = new BehaviorSubject<Character | null>(null);
  private boardSubject = new BehaviorSubject<Tile[]>([]);
  private playerPositionSubject = new BehaviorSubject<number>(0);
  private diceResultSubject = new BehaviorSubject<number | null>(null);
  private messageSubject = new BehaviorSubject<string>('');
  private enemySubject = new BehaviorSubject<Enemy | null>(null);
  private inventorySubject = new BehaviorSubject<Item[]>([]);
  private healthSubject = new BehaviorSubject<number>(100);
  private isRollingSubject = new BehaviorSubject<boolean>(false);
  private animationStateSubject = new BehaviorSubject<AnimationState>({
    isMoving: false,
    movePath: [],
    currentMoveIndex: 0,
    isTileEffectProcessing: false,
    isPlayerAttacking: false,
    isEnemyAttacking: false
  });
  private modalStateSubject = new BehaviorSubject<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  private currentTileSubject = new BehaviorSubject<Tile | null>(null);
  private hasCompletedOneTurnSubject = new BehaviorSubject<boolean>(false);

  // Expositions publiques des observables
  gameState$ = this.gameStateSubject.asObservable();
  character$ = this.characterSubject.asObservable();
  board$ = this.boardSubject.asObservable();
  playerPosition$ = this.playerPositionSubject.asObservable();
  diceResult$ = this.diceResultSubject.asObservable();
  message$ = this.messageSubject.asObservable();
  enemy$ = this.enemySubject.asObservable();
  inventory$ = this.inventorySubject.asObservable();
  health$ = this.healthSubject.asObservable();
  isRolling$ = this.isRollingSubject.asObservable();
  animationState$ = this.animationStateSubject.asObservable();
  modalState$ = this.modalStateSubject.asObservable();
  currentTile$ = this.currentTileSubject.asObservable();

  private destroy$ = new Subject<void>();

  constructor(private boardService: BoardService) {
    this.initializeGame();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeGame(): void {
    const initialBoard = this.boardService.createBoard();
    this.boardSubject.next(initialBoard);
    this.activateTile(0, initialBoard);
  }

  // Sélection du personnage
  selectCharacter(type: string, color: string): void {
    const characterType = CHARACTER_TYPES.find(c => c.name === type);
    if (characterType) {
      const character: Character = {
        type,
        color,
        power: characterType.power as 'magic' | 'strength' | 'lifesteal',
        baseDamage: characterType.baseDamage
      };
      this.characterSubject.next(character);
      this.gameStateSubject.next('playing');
      this.messageSubject.next('Bienvenue sur le plateau ! Lancez les dés pour commencer.');
    }
  }

  // Lancer les dés
  rollDice(): void {
    if (this.isRollingSubject.value ||
      this.animationStateSubject.value.isMoving ||
      this.animationStateSubject.value.isTileEffectProcessing ||
      this.gameStateSubject.value !== 'playing') {
      return;
    }

    this.isRollingSubject.next(true);
    this.messageSubject.next('Lancement des dés...');

    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = timer(0, ANIMATION_DELAYS.DICE_ROLL)
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(timer(ANIMATION_DELAYS.DICE_ROLL * maxRolls)),
        tap(() => {
          rollCount++;
          this.diceResultSubject.next(Math.floor(Math.random() * 6) + 1);
        }),
        finalize(() => {
          const finalResult = Math.floor(Math.random() * 6) + 1;
          this.diceResultSubject.next(finalResult);
          this.isRollingSubject.next(false);
          this.prepareMovePath(finalResult);
        })
      )
      .subscribe();
  }

  // Préparer le chemin de déplacement
  private prepareMovePath(steps: number): void {
    const currentPosition = this.playerPositionSubject.value;
    const boardSize = this.boardSubject.value.length;
    const path = Array.from({ length: steps }, (_, i) => (currentPosition + i + 1) % boardSize);

    // Vérifier si on passe par la case départ
    if (path.some(pos => pos === 0) && currentPosition > 0) {
      this.hasCompletedOneTurnSubject.next(true);
    }

    this.animationStateSubject.next({
      ...this.animationStateSubject.value,
      isMoving: true,
      movePath: path,
      currentMoveIndex: 0
    });

    this.gameStateSubject.next('moving');
    this.messageSubject.next(`Vous avancez de ${steps} cases...`);

    this.startMovementAnimation();
  }

  // Animation de déplacement
  private startMovementAnimation(): void {
    const animationState = this.animationStateSubject.value;
    const movePath = animationState.movePath;
    const board = this.boardSubject.value;

    timer(0, ANIMATION_DELAYS.MOVE)
      .pipe(
        takeUntil(this.destroy$),
        takeUntil(timer(ANIMATION_DELAYS.MOVE * movePath.length)),
        tap((index) => {
          if (index < movePath.length) {
            const newPosition = movePath[index];
            this.playerPositionSubject.next(newPosition);

            // Mettre à jour le plateau
            const newBoard = board.map(tile => ({
              ...tile,
              isActive: tile.id === newPosition,
              isHighlighted: tile.id === newPosition
            }));

            this.boardSubject.next(newBoard);
            this.animationStateSubject.next({
              ...animationState,
              currentMoveIndex: index + 1
            });

            // Dernière étape
            if (index === movePath.length - 1) {
              this.animationStateSubject.next({
                ...animationState,
                isMoving: false,
                isTileEffectProcessing: true
              });

              setTimeout(() => {
                const tileAtPosition = newBoard.find(t => t.id === newPosition);
                if (tileAtPosition) {
                  this.currentTileSubject.next(tileAtPosition);
                  this.showTileModal(tileAtPosition, newPosition);
                }
              }, ANIMATION_DELAYS.MOVE);
            }
          }
        })
      )
      .subscribe();
  }

  // Afficher le modal de la case
  private showTileModal(tile: Tile, position: number): void {
    const tileDescription = tile.data.description || TILE_DESCRIPTIONS[tile.type];
    const hasCompletedTurn = this.hasCompletedOneTurnSubject.value;

    if (tile.type === TILE_TYPES.START && position === 0 && hasCompletedTurn) {
      this.modalStateSubject.next({
        isOpen: true,
        title: 'Victoire !',
        message: 'Félicitations ! Vous avez terminé le tour du plateau !',
        onConfirm: () => {
          this.closeModal();
          this.gameStateSubject.next('gameOver');
        }
      });
      return;
    }

    const modalTitle = this.getTileModalTitle(tile.type);
    this.modalStateSubject.next({
      isOpen: true,
      title: modalTitle,
      message: tileDescription,
      tileType: tile.type,
      onConfirm: () => {
        this.closeModal();
        this.gameStateSubject.next('tileEffect');
        this.processTileEffect(tile);
      }
    });
  }

  private getTileModalTitle(tileType: TileType): string {
    const titles: Record<TileType, string> = {
      [TILE_TYPES.START]: 'Case de départ',
      [TILE_TYPES.ITEM]: 'Case d\'objet',
      [TILE_TYPES.ENEMY]: 'Case d\'ennemi',
      [TILE_TYPES.HEAL]: 'Case de soin',
      [TILE_TYPES.TRAP]: 'Case piège',
      [TILE_TYPES.TELEPORT]: 'Case de téléportation',
      [TILE_TYPES.EMPTY]: 'Case'
    };
    return titles[tileType];
  }

  // Traiter l'effet de la case
  private processTileEffect(tile: Tile): void {
    const board = this.boardSubject.value.map(t => ({ ...t, isHighlighted: false }));
    this.boardSubject.next(board);

    switch (tile.type) {
      case TILE_TYPES.START:
        this.handleStartTileEffect();
        break;
      case TILE_TYPES.ITEM:
        this.handleItemTileEffect();
        break;
      case TILE_TYPES.ENEMY:
        this.handleEnemyTileEffect(tile);
        break;
      case TILE_TYPES.HEAL:
        this.handleHealTileEffect();
        break;
      case TILE_TYPES.TRAP:
        this.handleTrapTileEffect();
        break;
      case TILE_TYPES.TELEPORT:
        this.handleTeleportTileEffect(tile);
        break;
      default:
        this.handleEmptyTileEffect();
    }
  }

  // Gestion des différents types de cases
  private handleStartTileEffect(): void {
    if (this.playerPositionSubject.value === 0 && this.hasCompletedOneTurnSubject.value) {
      this.messageSubject.next('Félicitations ! Vous avez terminé le tour du plateau !');
      setTimeout(() => {
        this.endTileEffect();
        this.gameStateSubject.next('gameOver');
      }, ANIMATION_DELAYS.TILE_EFFECT);
    } else {
      this.messageSubject.next('Vous êtes sur la case départ.');
      setTimeout(() => {
        this.endTileEffect();
        this.gameStateSubject.next('playing');
      }, ANIMATION_DELAYS.TILE_EFFECT);
    }
  }

  private handleItemTileEffect(): void {
    const itemKeys = Object.keys(GAME_ITEMS);
    const randomItemKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
    const randomItem = {
      ...GAME_ITEMS[randomItemKey as keyof typeof GAME_ITEMS],
      effect: {
        ...GAME_ITEMS[randomItemKey as keyof typeof GAME_ITEMS].effect,
        currentUses: GAME_ITEMS[randomItemKey as keyof typeof GAME_ITEMS].effect.uses
      }
    };

    this.inventorySubject.next([...this.inventorySubject.value, randomItem]);
    this.messageSubject.next(`Vous avez trouvé un(e) ${randomItem.name} !`);

    setTimeout(() => {
      this.endTileEffect();
      this.gameStateSubject.next('playing');
    }, ANIMATION_DELAYS.TILE_EFFECT);
  }

  private handleEnemyTileEffect(tile: Tile): void {
    if (tile.data.enemyType) {
      const enemyType = tile.data.enemyType;
      const enemyInfo = ENEMY_DESCRIPTIONS[enemyType as keyof typeof ENEMY_DESCRIPTIONS];
      const enemyHealth = 50 + Math.floor(Math.random() * 50);

      const enemy: Enemy = {
        type: enemyType,
        health: enemyHealth,
        maxHealth: enemyHealth,
        power: 10 + Math.floor(Math.random() * 10),
        weakness: enemyInfo?.weakness || 'none'
      };

      this.enemySubject.next(enemy);
      this.messageSubject.next(`Vous rencontrez un ${enemyType} ! Préparez-vous au combat !`);

      setTimeout(() => {
        this.endTileEffect();
        this.gameStateSubject.next('combat');
      }, ANIMATION_DELAYS.TILE_EFFECT);
    }
  }

  private handleHealTileEffect(): void {
    const healAmount = 20 + Math.floor(Math.random() * 20);
    const newHealth = Math.min(100, this.healthSubject.value + healAmount);
    this.healthSubject.next(newHealth);
    this.messageSubject.next(`Vous vous soignez de ${healAmount} points de vie !`);

    setTimeout(() => {
      this.endTileEffect();
      this.gameStateSubject.next('playing');
    }, ANIMATION_DELAYS.TILE_EFFECT);
  }

  private handleTrapTileEffect(): void {
    const damage = 10 + Math.floor(Math.random() * 15);
    const newHealth = Math.max(0, this.healthSubject.value - damage);
    this.healthSubject.next(newHealth);
    this.messageSubject.next(`Vous tombez dans un piège ! Vous perdez ${damage} points de vie.`);

    setTimeout(() => {
      this.endTileEffect();
      if (newHealth <= 0) {
        this.gameStateSubject.next('gameOver');
      } else {
        this.gameStateSubject.next('playing');
      }
    }, ANIMATION_DELAYS.TILE_EFFECT);
  }

  private handleTeleportTileEffect(tile: Tile): void {
    if (typeof tile.data.destination === 'number') {
      const destination = tile.data.destination;
      this.messageSubject.next('Vous êtes téléporté à une autre position du plateau !');

      setTimeout(() => {
        this.playerPositionSubject.next(destination);
        const teleportBoard = this.boardSubject.value.map(t => ({
          ...t,
          isActive: t.id === destination
        }));
        this.boardSubject.next(teleportBoard);

        this.endTileEffect();
        this.gameStateSubject.next('playing');
      }, ANIMATION_DELAYS.TILE_EFFECT);
    }
  }

  private handleEmptyTileEffect(): void {
    this.messageSubject.next('Vous êtes sur une case vide.');
    setTimeout(() => {
      this.endTileEffect();
      this.gameStateSubject.next('playing');
    }, ANIMATION_DELAYS.TILE_EFFECT);
  }

  private endTileEffect(): void {
    this.animationStateSubject.next({
      ...this.animationStateSubject.value,
      isTileEffectProcessing: false
    });
  }

  // Activer une case spécifique
  private activateTile(position: number, board: Tile[]): void {
    const updatedBoard = board.map((tile, index) => ({
      ...tile,
      isActive: index === position
    }));
    this.boardSubject.next(updatedBoard);
  }

  closeModal(): void {
    this.modalStateSubject.next({
      isOpen: false,
      title: '',
      message: '',
      tileType: undefined,
      onConfirm: () => {} // Réinitialiser la fonction
    });
  }
  // Utiliser un objet
  useItem(item: Item): void {
    if (!item) return;

    if (this.gameStateSubject.value === 'combat') {
      this.handleCombatItemUse(item);
    } else {
      this.handleNonCombatItemUse(item);
    }

    this.updateInventoryAfterUse(item);
  }

  private handleCombatItemUse(item: Item): void {
    this.gameStateSubject.next('playerUseItem');
    this.animationStateSubject.next({
      ...this.animationStateSubject.value,
      isPlayerAttacking: true
    });

    const enemy = this.enemySubject.value;
    const character = this.characterSubject.value;

    switch (item.effect.type) {
      case 'heal':
        const newHealth = Math.min(100, this.healthSubject.value + item.effect.value);
        this.healthSubject.next(newHealth);
        this.messageSubject.next(`Vous utilisez ${item.name} et récupérez ${item.effect.value} points de vie.`);
        this.endPlayerAttack();
        break;

      case 'damage':
        if (enemy) {
          const damageMultiplier = this.calculateDamageMultiplier(enemy, character);
          const damage = Math.round(item.effect.value * damageMultiplier);
          const newEnemyHealth = Math.max(0, enemy.health - damage);

          this.enemySubject.next({ ...enemy, health: newEnemyHealth });
          this.messageSubject.next(`Vous utilisez ${item.name} et infligez ${damage} points de dégâts à l'ennemi.`);

          setTimeout(() => {
            this.animationStateSubject.next({
              ...this.animationStateSubject.value,
              isPlayerAttacking: false
            });

            if (newEnemyHealth <= 0) {
              this.messageSubject.next(`Vous avez vaincu le ${enemy.type} !`);
              this.gameStateSubject.next('playing');
            } else {
              this.startEnemyAttack();
            }
          }, ANIMATION_DELAYS.COMBAT_ATTACK / 2);
        }
        break;

      case 'defense':
        this.messageSubject.next(`Vous utilisez ${item.name} et vous êtes protégé contre la prochaine attaque.`);
        this.endPlayerAttack();
        break;

      default:
        this.messageSubject.next(`Vous utilisez ${item.name}.`);
        this.endPlayerAttack();
    }
  }

  private handleNonCombatItemUse(item: Item): void {
    switch (item.effect.type) {
      case 'heal':
        const newHealth = Math.min(100, this.healthSubject.value + item.effect.value);
        this.healthSubject.next(newHealth);
        this.messageSubject.next(`Vous utilisez ${item.name} et récupérez ${item.effect.value} points de vie.`);
        break;
      default:
        this.messageSubject.next(`Vous utilisez ${item.name}, mais cela n'a aucun effet pour le moment.`);
    }
  }

  private calculateDamageMultiplier(enemy: Enemy, character: Character | null): number {
    if (!character) return 1;

    if (enemy.weakness === 'magic' && character.power === 'magic') {
      return 1.5;
    } else if (enemy.weakness === 'physical' && character.power === 'strength') {
      return 1.5;
    }
    return 1;
  }

  private endPlayerAttack(): void {
    setTimeout(() => {
      this.animationStateSubject.next({
        ...this.animationStateSubject.value,
        isPlayerAttacking: false
      });
      this.gameStateSubject.next('combat');
    }, ANIMATION_DELAYS.COMBAT_ATTACK);
  }

  private startEnemyAttack(): void {
    this.gameStateSubject.next('enemyAttack');
    this.animationStateSubject.next({
      ...this.animationStateSubject.value,
      isEnemyAttacking: true
    });
    this.enemyAttack();
  }

  // Attaque de l'ennemi
  private enemyAttack(): void {
    const enemy = this.enemySubject.value;
    const character = this.characterSubject.value;
    const currentHealth = this.healthSubject.value;

    if (!enemy) return;

    setTimeout(() => {
      this.messageSubject.next(`Le ${enemy.type} vous attaque !`);

      setTimeout(() => {
        const enemyDamage = enemy.power;
        let newHealth = Math.max(0, currentHealth - enemyDamage);

        // Effet de vol de vie pour le vampire
        if (character?.type === 'Vampire') {
          const healAmount = Math.floor(character.baseDamage * 0.3);
          newHealth = Math.min(100, newHealth + healAmount);
          this.messageSubject.next(
            `Le ${enemy.type} vous inflige ${enemyDamage} points de dégâts mais vous regagnez ${healAmount} points de vie grâce à votre vol de vie.`
          );
        } else {
          this.messageSubject.next(`Le ${enemy.type} vous inflige ${enemyDamage} points de dégâts.`);
        }

        this.healthSubject.next(newHealth);

        setTimeout(() => {
          this.animationStateSubject.next({
            ...this.animationStateSubject.value,
            isEnemyAttacking: false
          });

          if (newHealth <= 0) {
            this.gameStateSubject.next('gameOver');
          } else {
            this.gameStateSubject.next('combat');
          }
        }, ANIMATION_DELAYS.COMBAT_ATTACK / 2);
      }, ANIMATION_DELAYS.COMBAT_ATTACK);
    }, ANIMATION_DELAYS.COMBAT_ATTACK / 2);
  }

  // Mettre à jour l'inventaire après utilisation
  private updateInventoryAfterUse(usedItem: Item): void {
    const currentInventory = this.inventorySubject.value;
    const itemIndex = currentInventory.findIndex(
      item => item.id === usedItem.id &&
        item.effect.currentUses === usedItem.effect.currentUses
    );

    if (itemIndex === -1) return;

    const updatedInventory = [...currentInventory];
    const item = updatedInventory[itemIndex];

    if (item.effect.uses && item.effect.currentUses !== undefined) {
      const newUses = item.effect.currentUses - 1;
      if (newUses <= 0) {
        updatedInventory.splice(itemIndex, 1);
      } else {
        updatedInventory[itemIndex] = {
          ...item,
          effect: {
            ...item.effect,
            currentUses: newUses
          }
        };
      }
    } else if (item.effect.uses === 1) {
      updatedInventory.splice(itemIndex, 1);
    }

    this.inventorySubject.next(updatedInventory);
  }

  // Attaquer l'ennemi
  attackEnemy(): void {
    const enemy = this.enemySubject.value;
    const character = this.characterSubject.value;
    const animationState = this.animationStateSubject.value;

    if (!enemy || !character ||
      animationState.isPlayerAttacking ||
      animationState.isEnemyAttacking) {
      return;
    }

    this.gameStateSubject.next('playerAttack');
    this.animationStateSubject.next({
      ...animationState,
      isPlayerAttacking: true
    });

    const characterConfig = CHARACTER_TYPES.find(c => c.name === character.type);
    if (!characterConfig) return;

    const damageMultiplier = this.calculateDamageMultiplier(enemy, character);
    const damage = Math.round(characterConfig.damage * damageMultiplier);

    if (damageMultiplier > 1) {
      const attackType = character.power === 'magic' ? 'magique' : 'physique';
      this.messageSubject.next(`Votre attaque ${attackType} est super efficace contre ${enemy.type} !`);
    } else {
      this.messageSubject.next(`Vous attaquez le ${enemy.type} !`);
    }

    setTimeout(() => {
      const newEnemyHealth = Math.max(0, enemy.health - damage);
      this.enemySubject.next({ ...enemy, health: newEnemyHealth });
      this.messageSubject.next(`Vous infligez ${damage} points de dégâts à l'ennemi !`);

      this.animationStateSubject.next({
        ...animationState,
        isPlayerAttacking: false
      });

      if (newEnemyHealth <= 0) {
        setTimeout(() => {
          this.messageSubject.next(`Vous avez vaincu le ${enemy.type} !`);
          this.gameStateSubject.next('playing');
        }, ANIMATION_DELAYS.COMBAT_ATTACK / 2);
      } else {
        this.startEnemyAttack();
      }
    }, ANIMATION_DELAYS.COMBAT_ATTACK);
  }

  // Redémarrer le jeu
  restartGame(): void {
    this.gameStateSubject.next('characterSelection');
    this.boardSubject.next(this.boardService.createBoard());
    this.playerPositionSubject.next(0);
    this.diceResultSubject.next(null);
    this.messageSubject.next('');
    this.enemySubject.next(null);
    this.inventorySubject.next([]);
    this.healthSubject.next(100);
    this.hasCompletedOneTurnSubject.next(false);
    this.animationStateSubject.next({
      isMoving: false,
      movePath: [],
      currentMoveIndex: 0,
      isTileEffectProcessing: false,
      isPlayerAttacking: false,
      isEnemyAttacking: false
    });
    this.activateTile(0, this.boardSubject.value);
  }
}
