import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

let http_type = 'http'
let IP = 'localhost:8005';

@Injectable({
  providedIn: 'root'
})
export class RequestsService<T> {

  private ulr = 'http://localhost:8005/data/team/roster?season=E2024'

  private allTeams = http_type + '://' + IP + '/data/team/roster?team_code=all'
  private teamRoster = http_type + '://' + IP + '/data/team/roster?season=E2024';

    private euroTeams = "https://feeds.incrowdsports.com/provider/euroleague-feeds/v2/competitions/E/seasons/E2024/clubs"
    private euroPlayers = "https://feeds.incrowdsports.com/provider/euroleague-feeds/v2/competitions/E/players"

  constructor(private http: HttpClient) { }

  // GET REQUESTS==================================================================================
  
  getTeamRoster() {
    return this.http.get<T[]>(this.ulr).pipe(
      tap((Data) => { }),
      catchError((err) => {
        throw err
      }));
  }

  getAllTeams() {
    return this.http.get<T[]>(this.allTeams).pipe(
      tap((Data) => { }),
      catchError((err) => {
        throw err
      }));
  }

  getEuroTeams() {
    return this.http.get<T>(this.euroTeams).pipe(
      tap((Data) => { }),
      catchError((err) => {
        throw err
      })
    )
  }

  getEuroPlayers() {
    return this.http.get<T>(this.euroPlayers).pipe(
      tap((Data) => { }),
      catchError((err) => {
        throw err
      })
    )
  }
}
