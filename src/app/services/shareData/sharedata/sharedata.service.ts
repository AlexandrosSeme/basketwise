// src/app/services/shareData/sharedata.service.ts
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RequestsService } from '../../requests/requests.service';
import {
  TeamLogo,
  Player,
  TeamWithPlayers,
  TeamRosterResponse,
  EuroTeamsResponse
} from '../../interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class SharedataService {
  constructor(private req: RequestsService<any>) { }

  getTeamsWithPlayers(): Observable<TeamWithPlayers[]> {
    return forkJoin({
      euro: this.req.getEuroTeams2(),    // EuroTeamsResponse
      all: this.req.getAllTeams2()      // TeamRosterResponse
    }).pipe(
      map(
        ({ euro, all }) => {
          console.log(euro)
          console.log(all)
          // φτιάχνω index για logo+name
          const logos: Record<string, TeamLogo> = {};
          euro.data.forEach((el: any) => {
            logos[el.code] = {
              code: el.code,
              logo: el.images?.crest || '',
              name: el.name,
              primaryColor: el.primaryColor,
              secondaryColor: el.secondaryColor,
            };
          });

          // τώρα παίρνω το all.roster (πλέον υπάρχει!)
          return all.roster
            .map((teamObj: any) => {
              const logo = logos[teamObj.code];
              if (!logo) return null;
              // φιλτράρω τις ομάδες που δεν είναι Euroleague
              const players: Player[] = teamObj.roster.player.map((p: any) => ({
                id: p.code,
                name: p.name,
                number: p.dorsal,
                position: p.position
              }));
              return { teamData: logo, players };
            })
            .filter((tp: any): tp is TeamWithPlayers => tp !== null);
        })
    );
  }
}
