// Types pour les champions et statistiques
export interface JoueurStats {
  totalJets: number;
  resultats: number[];
  moyennes: number[];
  vingt: number;
  un: number;
  typeJets: { [key: string]: number };
}

export interface Champion {
  nom: string;
  titre: string;
  valeur: string;
  icon: React.ReactNode;
  color: string;
}

export interface JoueurConfig {
  nom: string;
  sexe: 'M' | 'F';
}

export interface Seance {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin?: string;
  nombreJets: number;
  jets: any[];
  typeJetInconnu?: boolean;
  importee?: boolean;
  campagne?: string;
  episode?: string;
}

export interface ChampionCalculatorProps {
  joueursAnalyse: { [key: string]: JoueurStats };
  joueursConfig: { [key: string]: JoueurConfig };
  seancesFiltrees: Seance[];
  getTitreGenre: (joueurNom: string, titreMasculin: string, titreFeminin: string) => string;
} 