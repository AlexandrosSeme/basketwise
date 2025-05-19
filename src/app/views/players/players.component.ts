import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexOptions } from 'ng-apexcharts';
import { PlayerStatsService } from '../../services/player-stats/player-stats.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { RequestsService } from '../../services/requests/requests.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss'
})
export class PlayersComponent implements OnInit {
  teams: any[] = [];
  selectedTeam: any = null;
  players: any[] = [];
  selectedPlayers: any[] = [];
  selectedPlayer1: any = null;
  selectedPlayer2: any = null;
  selectedPlayer: any = null;

  // Points per game chart
  public pointsChartOptions: ApexOptions = {
    series: [{
      name: 'Points',
      data: []
    }],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: [],
    },
    title: {
      text: 'Points Per Game',
      align: 'center'
    }
  };

  // Shooting percentage chart
  public shootingChartOptions: ApexOptions = {
    series: [{
      name: 'FG%',
      data: []
    }, {
      name: '3P%',
      data: []
    }],
    chart: {
      type: 'line',
      height: 350,
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      categories: [],
    },
    title: {
      text: 'Shooting Percentages',
      align: 'center'
    }
  };

  // Player comparison radar chart
  public radarChartOptions: ApexOptions = {
    series: [{
      name: '',
      data: []
    }, {
      name: '',
      data: []
    }],
    chart: {
      type: 'radar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    xaxis: {
      categories: ['Scoring', 'Passing', 'Rebounding', 'Defense', 'Athleticism']
    },
    title: {
      text: 'Player Comparison',
      align: 'center'
    }
  };

  constructor(private playerStatsService: PlayerStatsService, private req: RequestsService<any>) { }

  ngOnInit(): void {
    this.loadTeams();
    this.req.getPlayerStats().subscribe((playerStats: any) => {
      console.log(playerStats);
    })
  }

  loadTeams() {
    this.playerStatsService.getTeamsWithPlayers().subscribe(teams => {
      this.teams = teams;
      console.log(this.teams);
    });
  }

  onTeamChange() {
    // Reset all selections and data
    this.selectedPlayer1 = null;
    this.selectedPlayer2 = null;
    this.selectedPlayers = [];
    this.players = [];
    this.selectedPlayer = null;

    // Reset chart data
    this.pointsChartOptions = {
      ...this.pointsChartOptions,
      series: [{
        name: 'Points',
        data: []
      }],
      xaxis: {
        ...this.pointsChartOptions.xaxis,
        categories: []
      }
    };

    this.shootingChartOptions = {
      ...this.shootingChartOptions,
      series: [{
        name: 'FG%',
        data: []
      }, {
        name: '3P%',
        data: []
      }],
      xaxis: {
        ...this.shootingChartOptions.xaxis,
        categories: []
      }
    };

    this.radarChartOptions = {
      ...this.radarChartOptions,
      series: [{
        name: '',
        data: []
      }, {
        name: '',
        data: []
      }]
    };

    // Load new team data if a team is selected
    if (this.selectedTeam) {
      this.playerStatsService.getPlayersByTeam(this.selectedTeam.teamData.code).subscribe(players => {
        this.players = players;
        this.updateCharts();
      });
    }
  }

  onPlayerSelect() {
    if (this.selectedPlayers.length === 2) {
      this.updateRadarChart();
    }
  }

  private updateCharts() {
    // Update Points Chart
    console.log(this.players);
    this.pointsChartOptions = {
      ...this.pointsChartOptions,
      series: [{
        name: 'Points',
        data: this.players.map(p => p.stats.pointsPerGame)
      }],
      xaxis: {
        ...this.pointsChartOptions.xaxis,
        categories: this.players.map(p => p.person.name)
      }
    };

    // Update Shooting Chart
    this.shootingChartOptions = {
      ...this.shootingChartOptions,
      series: [{
        name: 'FG%',
        data: this.players.map(p => p.stats.fieldGoalPercentage)
      }, {
        name: '3P%',
        data: this.players.map(p => p.stats.threePointPercentage)
      }],
      xaxis: {
        ...this.shootingChartOptions.xaxis,
        categories: this.players.map(p => p.person.name)
      }
    };
  }

  selectPlayer1(player: any) {
    this.selectedPlayer1 = player;
    this.updateRadarChart();
  }

  selectPlayer2(player: any) {
    this.selectedPlayer2 = player;
    this.updateRadarChart();
  }

  updateRadarChart() {
    console.log(this.selectedPlayer1);
    console.log(this.selectedPlayer2);
    if (this.selectedPlayer1 && this.selectedPlayer2) {
      const categories = ['Points', 'Assists', 'Rebounds', 'Steals', 'Blocks', 'FG%', '3P%'];

      this.radarChartOptions = {
        series: [{
          name: this.selectedPlayer1.person.name,
          data: [
            this.selectedPlayer1.stats.pointsPerGame,
            this.selectedPlayer1.stats.assists,
            this.selectedPlayer1.stats.rebounds,
            this.selectedPlayer1.stats.steals,
            this.selectedPlayer1.stats.blocks,
            this.selectedPlayer1.stats.fieldGoalPercentage,
            this.selectedPlayer1.stats.threePointPercentage
          ]
        }, {
          name: this.selectedPlayer2.person.name,
          data: [
            this.selectedPlayer2.stats.pointsPerGame,
            this.selectedPlayer2.stats.assists,
            this.selectedPlayer2.stats.rebounds,
            this.selectedPlayer2.stats.steals,
            this.selectedPlayer2.stats.blocks,
            this.selectedPlayer2.stats.fieldGoalPercentage,
            this.selectedPlayer2.stats.threePointPercentage
          ]
        }],
        chart: {
          height: 350,
          type: 'radar',
          toolbar: {
            show: false
          }
        },
        xaxis: {
          categories: categories
        },
        yaxis: {
          show: false
        },
        stroke: {
          width: 2
        },
        fill: {
          opacity: 0.25
        },
        markers: {
          size: 0
        },
        legend: {
          position: 'bottom'
        }
      };
    }
  }

  onPlayerStatsChange() {
    // This method is called when a player is selected from the dropdown
    // You can add any additional logic here if needed
    console.log('Selected player stats:', this.selectedPlayer);
    this.req.getPlayerStats(this.selectedPlayer.person.code).subscribe((playerStats: any) => {
      console.log(playerStats);
    })
  }
}
