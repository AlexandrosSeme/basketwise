import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RequestsService } from '../requests/requests.service';
import { SharedataService } from '../shareData/sharedata/sharedata.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerStatsService {
  private playersSubject = new BehaviorSubject<any[]>([]);
  private teamsSubject = new BehaviorSubject<any[]>([]);

  constructor(
    private req: RequestsService<any>,
    private share: SharedataService
  ) { }

  getTeamsWithPlayers(): Observable<any[]> {
    this.share.getTeamsWithPlayers().subscribe({
      next: (teams) => {
        this.teamsSubject.next(teams);
      },
      error: (err) => {
        console.error('Could not load teams:', err);
      }
    });
    return this.teamsSubject.asObservable();
  }

  getPlayersByTeam(teamCode: string): Observable<any[]> {
    this.req.getAllPlayers(teamCode).subscribe(
      (res) => {
        const players = res
          .filter((el: any) => el.typeName === 'Player' && el.active === true)
          .map((player: any) => ({
            ...player,
            stats: this.generatePlayerStats(player) // Generate random stats for demonstration
          }));
        this.playersSubject.next(players);
      }
    );
    return this.playersSubject.asObservable();
  }

  // Generate random stats for demonstration
  private generatePlayerStats(player: any) {
    return {
      pointsPerGame: Math.floor(Math.random() * 30) + 10,
      fieldGoalPercentage: Math.floor(Math.random() * 20) + 35,
      threePointPercentage: Math.floor(Math.random() * 20) + 30,
      assists: Math.floor(Math.random() * 10) + 2,
      rebounds: Math.floor(Math.random() * 10) + 3,
      steals: Math.floor(Math.random() * 3) + 1,
      blocks: Math.floor(Math.random() * 3) + 1
    };
  }
} 