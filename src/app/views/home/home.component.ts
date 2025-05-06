import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../../services/requests/requests.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {
  teams: any[] = [];
  teamsLogo = [
    { code: 'BER', logo: 'https://upload.wikimedia.org/wikipedia/en/f/fb/ALBA_Berlin_logo.svg' },
    { code: 'BAS', logo: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Basket_Zaragoza_logo.svg' },
    { code: 'BAR', logo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_logo.svg' },
    { code: 'ASV', logo: 'https://upload.wikimedia.org/wikipedia/en/e/e4/ASVEL_logo_2018.svg' },
    { code: 'PAN', logo: 'https://upload.wikimedia.org/wikipedia/en/2/2b/Panathinaikos_BC_logo.svg' },
    { code: 'MAD', logo: 'https://upload.wikimedia.org/wikipedia/en/9/98/Real_Madrid_CF.svg' },
    { code: 'IST', logo: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Anadolu_Efes_S.K._logo.svg' },
    { code: 'RED', logo: 'https://upload.wikimedia.org/wikipedia/en/d/d8/KK_Crvena_zvezda_logo.svg' },
    { code: 'MUN', logo: 'https://upload.wikimedia.org/wikipedia/en/e/e5/FC_Bayern_Munich_logo_%282017%29.svg' },
    { code: 'TEL', logo: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Maccabi_Tel_Aviv_B.C._logo.svg' },
    { code: 'PRS', logo: 'https://upload.wikimedia.org/wikipedia/en/2/28/Partizan_Belgrade_logo.svg' },
    { code: 'VIR', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c9/Virtus_Segafredo_Bologna_logo.svg' },
    { code: 'MCO', logo: 'https://upload.wikimedia.org/wikipedia/en/e/e5/AS_Monaco_Basket_logo.svg' },
    { code: 'MIL', logo: 'https://upload.wikimedia.org/wikipedia/en/c/c2/Olimpia_Milano_logo.svg' },
    { code: 'ULK', logo: 'https://upload.wikimedia.org/wikipedia/en/6/61/BC_Žalgiris_logo.svg' },  // προσωρινό
    { code: 'OLY', logo: 'https://upload.wikimedia.org/wikipedia/en/f/fb/Olympiacos_B.C._logo.svg' },
    { code: 'PAR', logo: 'https://upload.wikimedia.org/wikipedia/en/2/28/Partizan_Belgrade_logo.svg' },
    { code: 'ZAL', logo: 'https://upload.wikimedia.org/wikipedia/en/6/61/BC_Žalgiris_logo.svg' }
  ];


  constructor(private req: RequestsService<any>) { }

  ngOnInit(): void {
    this.req.getAllTeams().subscribe((res: any) => {
      res.roster.forEach((code: any) => {
        this.teamsLogo.forEach((codeLogo: any) => {
          if (code.code == codeLogo.code) {
            this.teams.push(codeLogo)
          }
        });
      });
      console.log(this.teams)
    });

    this.req.getEuroTeams().subscribe((res: any) => {
      console.log(res)
    });
    this.req.getEuroPlayers().subscribe((res: any) => {
      console.log(res)
    });
  }

}
