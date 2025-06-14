
import type { Champion, ChampionCalculatorProps } from './types';
import { calculTauxReussite, calculSerieConsecutive } from './utils';

export const calculateExtremeChampions = ({ 
  joueursAnalyse, 
  getTitreGenre 
}: ChampionCalculatorProps): Champion[] => {
  const champions: Champion[] = [];
  const joueurs = Object.keys(joueursAnalyse);
  
  if (joueurs.length === 0) return champions;

  // Roi/Reine des 20
  const roi20 = joueurs.reduce((a, b) => 
    joueursAnalyse[a].vingt > joueursAnalyse[b].vingt ? a : b
  );
  
  champions.push({
    nom: roi20,
    titre: getTitreGenre(roi20, 'le roi des 20', 'la reine des 20'),
    valeur: `${joueursAnalyse[roi20].vingt} réussites critiques`,
    icon: <span style={{ fontSize: '24px' }}>🎯</span>,
    color: '#ED8936'
  });

  // Collectionneur de 1 (juste après le roi des 20)
  const reine1 = joueurs.reduce((a, b) => 
    joueursAnalyse[a].un > joueursAnalyse[b].un ? a : b
  );
  
  champions.push({
    nom: reine1,
    titre: getTitreGenre(reine1, 'le collectionneur de 1', 'la collectionneuse de 1'),
    valeur: `${joueursAnalyse[reine1].un} échecs critiques`,
    icon: <span style={{ fontSize: '24px' }}>💀</span>,
    color: '#9F7AEA'
  });

  // Le Chanceux (taux de réussite élevé)
  const chanceux = joueurs.reduce((a, b) => {
    const tauxA = calculTauxReussite(joueursAnalyse[a].resultats);
    const tauxB = calculTauxReussite(joueursAnalyse[b].resultats);
    return tauxA > tauxB ? a : b;
  });
  
  const tauxReussite = calculTauxReussite(joueursAnalyse[chanceux].resultats);
  if (tauxReussite >= 30) {
    champions.push({
      nom: chanceux,
      titre: getTitreGenre(chanceux, 'le chanceux', 'la chanceuse'),
      valeur: `${tauxReussite.toFixed(1)}% de réussite`,
      icon: <span style={{ fontSize: '24px' }}>🍀</span>,
      color: '#48BB78'
    });
  }

  // Le Malchanceux (plus longue série de jets ≤ 5)
  const malchanceStats: { [key: string]: number } = {};
  Object.entries(joueursAnalyse).forEach(([nom, stats]) => {
    malchanceStats[nom] = calculSerieConsecutive(stats.resultats, r => r <= 5);
  });
  
  const malchanceux = Object.entries(malchanceStats).reduce(([nomA, streakA], [nomB, streakB]) => 
    streakA > streakB ? [nomA, streakA] : [nomB, streakB]
  );
  
  if (malchanceux[1] >= 3) {
    champions.push({
      nom: malchanceux[0],
      titre: getTitreGenre(malchanceux[0], 'le malchanceux', 'la malchanceuse'),
      valeur: `${malchanceux[1]} jets ≤5 d'affilée`,
      icon: <span style={{ fontSize: '24px' }}>😰</span>,
      color: '#9CA3AF'
    });
  }

  return champions;
}; 