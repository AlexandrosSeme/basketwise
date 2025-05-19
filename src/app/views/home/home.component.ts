import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { SharedataService } from '../../services/shareData/sharedata/sharedata.service';
import { TeamWithPlayers }  from '../../services/interfaces/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  teams: TeamWithPlayers[] = [];

  constructor(private share: SharedataService) { }

  ngOnInit(): void {
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
}