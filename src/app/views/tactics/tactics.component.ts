import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Tactic {
  name: string;
  events: any[];
}

@Component({
  selector: 'app-tactics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tactics.component.html',
  styleUrls: ['./tactics.component.scss']
})
export class TacticsComponent implements OnInit {
  players: any[] = [];
  ball: any = { x: 380, y: 210 };
  movements: any[] = [];
  passes: any[] = [];
  screenIndicator: any = null;
  selectedPlayerId: number | null = null;
  selectedBall = false;
  actionType: 'move' | 'pass' | 'screen' | null = null;
  tacticName = '';
  tactics: Tactic[] = [];
  selectedTacticIndex: number | null = null;
  private events: any[] = [];

  ngOnInit(): void {
    this.initializePlayers();
  }

  private initializePlayers(): void {
    this.players = [
      { id: 1, number: 1, x: 400, y: 200, color: 'green' },
      { id: 2, number: 2, x: 300, y: 500, color: 'green' },
      { id: 3, number: 3, x: 300, y: 50,  color: 'green' },
      { id: 4, number: 4, x: 100, y: 200, color: 'green' },
      { id: 5, number: 5, x: 250, y: 400, color: 'green' }
    ];
    this.ball = { x: 380, y: 210 };
  }

  // ─── Editing / Drawing ─────────────────────────────────────────────────────────

  selectPlayer(id: number, e?: MouseEvent) {
    e?.stopPropagation();
    this.selectedBall = false;
    this.selectedPlayerId = this.selectedPlayerId === id ? null : id;
  }
  selectBall(e: MouseEvent) {
    e.stopPropagation();
    this.selectedPlayerId = null;
    this.selectedBall = !this.selectedBall;
  }
  setAction(a: 'move' | 'pass' | 'screen') { this.actionType = a; }

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
    if (!this.selectedPlayerId) return;
    const p = this.players.find(pl => pl.id === this.selectedPlayerId)!;

    switch (this.actionType) {
      case 'move':
        this.events.push({ type: 'move', playerId: p.id, x, y });
        this.movements.push({ startX: p.x, startY: p.y, endX: x, endY: y });
        p.x = x; p.y = y;
        break;

      case 'screen':
        this.events.push({ type: 'screen', playerId: p.id, x, y });
        this.movements.push({ startX: p.x, startY: p.y, endX: x, endY: y });
        p.x = x; p.y = y;
        this.screenIndicator = { x, y };
        break;

      case 'pass':
        const recv = this.findClosestPlayer(x, y, p.id);
        if (!recv) break;
        this.events.push({ type: 'pass', from: p.id, to: recv.id });
        this.passes.push({
          startX: p.x, startY: p.y,
          endX: recv.x, endY: recv.y
        });
        this.ball.x = recv.x + 30;
        this.ball.y = recv.y;
        break;
    }

    this.actionType = null;
    this.selectedPlayerId = null;
  }

  private findClosestPlayer(x: number, y: number, exclude: number) {
    let best = null, md = Infinity;
    for (let q of this.players) {
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
    this.initializePlayers();
    this.ball = { x: 380, y: 210 };
  }

  // ─── Save / Load / Play ───────────────────────────────────────────────────────

  saveTactic() {
    if (!this.tacticName.trim()) return;
    this.tactics.push({
      name: this.tacticName.trim(),
      events: [...this.events]
    });
    this.tacticName = '';
    this.selectedTacticIndex = this.tactics.length - 1;
  }

  playTactic() {
    if (this.selectedTacticIndex == null) return;
    const { events } = this.tactics[this.selectedTacticIndex];
    this.resetVisual();

    let delay = 0;
    const step = 1000;
    for (let ev of events) {
      setTimeout(() => this.applyEvent(ev), delay);
      delay += step;
    }
  }

  private applyEvent(ev: any) {
    switch (ev.type) {
      case 'move': {
        const pl = this.players.find(p => p.id === ev.playerId)!;
        this.movements.push({
          startX: pl.x, startY: pl.y,
          endX: ev.x,   endY: ev.y
        });
        pl.x = ev.x; pl.y = ev.y;
        break;
      }
      case 'ballMove':
        this.ball.x = ev.x; this.ball.y = ev.y;
        break;
      case 'screen': {
        const pl2 = this.players.find(p => p.id === ev.playerId)!;
        this.movements.push({
          startX: pl2.x, startY: pl2.y,
          endX: ev.x,    endY: ev.y
        });
        pl2.x = ev.x; pl2.y = ev.y;
        this.screenIndicator = { x: ev.x, y: ev.y };
        break;
      }
      case 'pass': {
        const from = this.players.find(p => p.id === ev.from)!;
        const to   = this.players.find(p => p.id === ev.to)!;
        this.passes.push({
          startX: from.x, startY: from.y,
          endX: to.x,     endY: to.y
        });
        this.ball.x = to.x + 30;
        this.ball.y = to.y;
        break;
      }
    }
  }
}
