export * from './interfaces';

export interface PlayerDTO {
  name: string;
  dorsal: string;
  position: string;
  code: string;
  /* … άλλα πεδία αν θέλεις … */
}

export interface TeamRosterEntry {
  code: string;
  roster: {
    player: PlayerDTO[];
  };
  /* … ό,τι άλλο επιστρέφει το allTeams API … */
}

export interface TeamRosterResponse {
  roster: TeamRosterEntry[];
}

export interface EuroTeamDTO {
  code: string;
  name: string;
  images: { crest: string };
  roster: { player: PlayerDTO[] };
}

export interface EuroTeamsResponse {
  data: EuroTeamDTO[];
}

export interface TeamLogo {
  code: string;
  logo: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Player {
  id: string | number;
  name: string;
  number: string;
  position: string;
}

export interface TeamWithPlayers {
  teamData: TeamLogo;
  players: Player[];
}