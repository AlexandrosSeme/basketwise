import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedataService } from '../../services/shareData/sharedata/sharedata.service';
import { TeamWithPlayers } from '../../services/interfaces/interfaces';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { RequestsService } from '../../services/requests/requests.service';

interface Tactic {
  name: string;
  events: any[];
  initialPositions?: { id: number; x: number; y: number }[];
}

@Component({
  selector: 'app-tactics',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule,
    MatSelectModule, MatOptionModule],
  templateUrl: './tactics.component.html',
  styleUrls: ['./tactics.component.scss']
})
export class TacticsComponent implements OnInit {
  players: any[] = [];
  players2: any[] = [];
  ball: any = { x: 380, y: 210 };
  movements: any[] = [];
  passes: any[] = [];
  screenIndicator: any = null;
  shootIndicator: any = null;
  selectedPlayerId: number | string | null = null;
  selectedBall = false;
  actionType: 'move' | 'pass' | 'screen' | 'shoot' | null = null;
  tacticName = '';
  tactics: Tactic[] = [];
  selectedTacticIndex: number | null = null;
  private events: any[] = [];
  teams: TeamWithPlayers[] = [];
  playerWithBall: number | null = null;
  selectedTeam: TeamWithPlayers | null = null;
  mappedTeam: any[] = [];
  playersAll: any[] = [];
  defaultPositions: any[] = []
  constructor(private share: SharedataService, private req: RequestsService<any>) { }

  ngOnInit(): void {
    this.initializePlayers();
    this.getPlayers();
    // this.getAllData();
  }

  getAllData(code?: string) {
    console.log('Code:', code);
    this.req.getAllPlayers(code).subscribe(
      (res) => {
        console.log('All Data:', res);
        this.playersAll = res
          .filter((el: any) => el.typeName === 'Player')
          .map((player: any) => ({
            dorsal: player.dorsal,
            image: player.images.headshot,
            positionName: player.positionName,
            id: player.person.code,
            name: player.person.name
          }));
        console.log('Filtered Players:', this.playersAll);
      }
    )
  }

  private initializePlayers(): void {
    // Initialize with empty arrays
    this.players2 = [];
    this.players = [];
    this.ball = { x: 380, y: 210 };
    this.playerWithBall = null;
  }

  private updateBallPosition() {
    if (this.playerWithBall) {
      const player = this.players2.find(p => p.id === this.playerWithBall);
      if (player) {
        this.ball.x = player.x + 30;
        this.ball.y = player.y;
      }
    }
  }

  getPlayers() {
    this.share.getTeamsWithPlayers().subscribe({
      next: (teams) => {
        this.teams = teams;
        console.log('Teams with players:', this.teams);
      },
      error: (err) => {
        console.error('Could not load teams:', err);
      }
    });

  }

  onTeamChange() {
    console.log('Selected team:', this.selectedTeam);
    this.getAllData(this.selectedTeam?.teamData.code)
    this.mappedTeam = [this.selectedTeam?.players];
    console.log('Mapped team:', this.mappedTeam);
    if (this.selectedTeam) {
      const firstFive = this.selectedTeam.players.slice(0, 5);
      console.log('firstFive:', firstFive);
      this.defaultPositions = [
        { x: 400, y: 200 },
        { x: 300, y: 500 },
        { x: 300, y: 50 },
        { x: 100, y: 200 },
        { x: 250, y: 400 }
      ];

      this.players2 = firstFive.map((player, index) => ({
        id: player.id,
        number: player.number,
        x: this.defaultPositions[index].x,
        y: this.defaultPositions[index].y,
        color: this.selectedTeam?.teamData.primaryColor,
        color2: this.selectedTeam?.teamData.secondaryColor,
        name: player.name
      }));
      console.log('this.Players:', this.players2);
      this.players = this.players2;
      console.log('this.PlayersAll:', this.playersAll);
    }
  }

  // ─── Editing / Drawing ─────────────────────────────────────────────────────────

  selectPlayer(id: number | string, e?: MouseEvent) {
    console.log('Selected player Event:', e?.target);
    e?.stopPropagation();
    this.selectedBall = false;
    this.selectedPlayerId = this.selectedPlayerId == id ? null : id;
    
    // If we're selecting a player and they're close to the ball, give them the ball
    if (this.selectedPlayerId) {
      const player = this.players2.find(p => p.id === this.selectedPlayerId);
      if (player) {
        const distanceToBall = Math.hypot(player.x - this.ball.x, player.y - this.ball.y);
        if (distanceToBall < 60) { // If player is close to the ball
          this.playerWithBall = player.id;
          this.updateBallPosition();
        }
      }
    }
    console.log('this.selectedPlayerId:', this.selectedPlayerId);
  }

  selectBall(e: MouseEvent) {
    e.stopPropagation();
    this.selectedPlayerId = null;
    this.selectedBall = !this.selectedBall;
  }

  setAction(a: 'move' | 'pass' | 'screen' | 'shoot') {
    this.actionType = a;
    if (a === 'shoot' && this.selectedPlayerId) {
      const player = this.players2.find(p => p.id === this.selectedPlayerId);
      if (player) {
        this.shootIndicator = { x: player.x, y: player.y };
      }
    } else {
      this.shootIndicator = null;
    }
  }

  onCourtClick(event: MouseEvent) {
    if (!this.actionType) return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 1) Move ball
    if (this.actionType === 'move' && this.selectedBall) {
      this.events.push({ type: 'ballMove', x, y });
      this.ball.x = x; this.ball.y = y;
      this.actionType = null; this.selectedBall = false;
      return;
    }

    // 2) Need a player selected
    if (!this.selectedPlayerId || this.selectedPlayerId == '') return;
    console.log('this.selectedPlayerId:', this.selectedPlayerId);
    const p = this.players2.find(pl => pl.id === this.selectedPlayerId)!;

    switch (this.actionType) {
      case 'move':
        this.events.push({ type: 'move', playerId: p.id, x, y });
        this.movements.push({ startX: p.x, startY: p.y, endX: x, endY: y });
        p.x = x; p.y = y;
        // Update ball position if this player has the ball
        if (this.playerWithBall === p.id) {
          this.ball.x = x + 30; // Ball follows player with offset
          this.ball.y = y;
        }
        break;

      case 'screen':
        this.events.push({ type: 'screen', playerId: p.id, x, y });
        this.movements.push({ startX: p.x, startY: p.y, endX: x, endY: y });
        p.x = x; p.y = y;
        if (this.playerWithBall === p.id) {
          this.updateBallPosition();
        }
        this.screenIndicator = { x, y };
        break;

      case 'shoot':
        this.events.push({ type: 'shoot', playerId: p.id, x, y });
        this.movements.push({ startX: p.x, startY: p.y, endX: x, endY: y });
        p.x = x; p.y = y;
        if (this.playerWithBall === p.id) {
          this.ball.x = x;
          this.ball.y = y - 50; // Ball goes up for the shot
          this.playerWithBall = null; // Ball is in the air
          this.updateBallPosition();
        }
        this.shootIndicator = { x, y };
        break;

      case 'pass':
        const recv = this.findClosestPlayer(x, y, p.id);
        if (!recv) break;
        this.events.push({ type: 'pass', from: p.id, to: recv.id });
        this.passes.push({
          startX: p.x, startY: p.y,
          endX: recv.x, endY: recv.y
        });
        this.playerWithBall = recv.id;
        this.updateBallPosition();
        break;
    }

    this.actionType = null;
    this.selectedPlayerId = null;
  }

  private findClosestPlayer(x: number, y: number, exclude: number) {
    let best = null, md = Infinity;
    for (let q of this.players2) {
      if (q.id === exclude) continue;
      const d = Math.hypot(q.x - x, q.y - y);
      if (d < md) { md = d; best = q; }
    }
    return md < 60 ? best : null;
  }

  // ─── Reset / Visual reset ─────────────────────────────────────────────────────

  resetEdit() {
    this.movements = [];
    this.passes = [];
    this.screenIndicator = null;
    this.shootIndicator = null;
    this.selectedPlayerId = null;
    this.selectedBall = false;
    this.actionType = null;
    this.events = [];
    this.initializePlayers();
  }
  private resetVisual() {
    this.movements = [];
    this.passes = [];
    this.screenIndicator = null;
    this.shootIndicator = null;
    this.initializePlayers();
  }

  // ─── Save / Load / Play ───────────────────────────────────────────────────────

  saveTactic() {
    if (!this.tacticName.trim()) return;
    // Save current player positions with the tactic
    const currentPlayerPositions = this.players2.map(player => ({
      id: player.id,
      x: player.x,
      y: player.y
    }));
    
    this.tactics.push({
      name: this.tacticName.trim(),
      events: [...this.events],
      initialPositions: currentPlayerPositions
    });
    this.tacticName = '';
    this.selectedTacticIndex = this.tactics.length - 1;
  }

  playTactic() {
    if (this.selectedTacticIndex == null) return;
    const tactic = this.tactics[this.selectedTacticIndex];
    
    // Reset visual elements but keep the players
    this.movements = [];
    this.passes = [];
    this.screenIndicator = null;
    this.shootIndicator = null;
    this.selectedPlayerId = null;
    this.selectedBall = false;
    this.actionType = null;
    
    // First, reset all players to their initial positions
    if (tactic.initialPositions) {
      // Create a map of initial positions for quick lookup
      const initialPositionsMap = new Map(
        tactic.initialPositions.map(pos => [pos.id, pos])
      );
      
      // Update each player's position
      this.players2.forEach(player => {
        const initialPos = initialPositionsMap.get(player.id);
        if (initialPos) {
          player.x = initialPos.x;
          player.y = initialPos.y;
        }
      });
    }

    // Find the first player with the ball from the events
    const firstBallEvent = tactic.events.find(ev => ev.type === 'pass' || ev.type === 'ballMove');
    if (firstBallEvent) {
      if (firstBallEvent.type === 'pass') {
        this.playerWithBall = firstBallEvent.to;
      } else {
        this.playerWithBall = null;
      }
      this.updateBallPosition();
    }

    // Clear any existing timeouts
    this.clearAllTimeouts();

    // Add a small delay before starting the events to ensure positions are updated
    setTimeout(() => {
      let delay = 0;
      const step = 1000;
      for (let ev of tactic.events) {
        const timeout = setTimeout(() => this.applyEvent(ev), delay);
        this.timeouts.push(timeout);
        delay += step;
      }
    }, 100);
  }

  private timeouts: ReturnType<typeof setTimeout>[] = [];

  private clearAllTimeouts() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  private applyEvent(ev: any) {
    switch (ev.type) {
      case 'move': {
        const pl = this.players2.find(p => p.id === ev.playerId)!;
        this.movements.push({
          startX: pl.x, startY: pl.y,
          endX: ev.x, endY: ev.y
        });
        pl.x = ev.x; pl.y = ev.y;
        if (this.playerWithBall === pl.id) {
          this.updateBallPosition();
        }
        break;
      }
      case 'ballMove':
        this.ball.x = ev.x; this.ball.y = ev.y;
        break;
      case 'screen': {
        const pl2 = this.players2.find(p => p.id === ev.playerId)!;
        this.movements.push({
          startX: pl2.x, startY: pl2.y,
          endX: ev.x, endY: ev.y
        });
        pl2.x = ev.x; pl2.y = ev.y;
        if (this.playerWithBall === pl2.id) {
          this.updateBallPosition();
        }
        this.screenIndicator = { x: ev.x, y: ev.y };
        break;
      }
      case 'shoot': {
        const pl3 = this.players2.find(p => p.id === ev.playerId)!;
        this.movements.push({
          startX: pl3.x, startY: pl3.y,
          endX: ev.x, endY: ev.y
        });
        pl3.x = ev.x; pl3.y = ev.y;
        if (this.playerWithBall === pl3.id) {
          this.ball.x = ev.x;
          this.ball.y = ev.y - 50;
          this.playerWithBall = null;
        }
        this.shootIndicator = { x: ev.x, y: ev.y };
        break;
      }
      case 'pass': {
        const from = this.players2.find(p => p.id === ev.from)!;
        const to = this.players2.find(p => p.id === ev.to)!;
        this.passes.push({
          startX: from.x, startY: from.y,
          endX: to.x, endY: to.y
        });
        this.playerWithBall = to.id;
        this.updateBallPosition();
        break;
      }
    }
  }
}
