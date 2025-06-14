
import type { Champion, ChampionCalculatorProps } from './types';
import { calculPourcentageTranche } from './utils';

export const calculateRangeChampions = ({ 
  joueursAnalyse, 
  getTitreGenre 
}: ChampionCalculatorProps): Champion[] => {
  const champions: Champion[] = [];
  const joueurs = Object.keys(joueursAnalyse);
  
  if (joueurs.length === 0) return champions;

  // High Roller (plus de jets ≥ 18)
  const highRollerStats: { [key: string]: number } = {};
  Object.entries(joueursAnalyse).forEach(([nom, stats]) => {
    highRollerStats[nom] = stats.resultats.filter(r => r >= 18).length;
  });
  
  const highRoller = Object.entries(highRollerStats).reduce(([nomA, countA], [nomB, countB]) => 
    countA > countB ? [nomA, countA] : [nomB, countB]
  );
  
  if (highRoller[1] >= 5) {
    champions.push({
      nom: highRoller[0],
      titre: getTitreGenre(highRoller[0], 'le high roller', 'la high roller'),
      valeur: `${highRoller[1]} jets ≥18`,
      icon: <span style={{ fontSize: '24px' }}>🎰</span>,
      color: '#F59E0B'
    });
  }

  // Maître du Milieu (plus de résultats entre 9 et 12)
  const milieuStats: { [key: string]: number } = {};
  Object.entries(joueursAnalyse).forEach(([nom, stats]) => {
    milieuStats[nom] = calculPourcentageTranche(stats.resultats, 9, 12);
  });
  
  const maitreMilieu = Object.entries(milieuStats).reduce(([nomA, pctA], [nomB, pctB]) => 
    pctA > pctB ? [nomA, pctA] : [nomB, pctB]
  );
  
  if (maitreMilieu[1] >= 25) {
    champions.push({
      nom: maitreMilieu[0],
      titre: getTitreGenre(maitreMilieu[0], 'le maître du milieu', 'la maîtresse du milieu'),
      valeur: `${maitreMilieu[1].toFixed(1)}% entre 9-12`,
      icon: <span style={{ fontSize: '24px' }}>⚖️</span>,
      color: '#8B5CF6'
    });
  }

  // Safe Player (moins de jets ≤ 3)
  const safeStats: { [key: string]: number } = {};
  Object.entries(joueursAnalyse).forEach(([nom, stats]) => {
    safeStats[nom] = stats.resultats.filter(r => r <= 3).length;
  });
  
  const safePlayer = Object.entries(safeStats).reduce(([nomA, countA], [nomB, countB]) => 
    countA < countB ? [nomA, countA] : [nomB, countB]
  );
  
  if (Object.keys(safeStats).length > 1) {
    champions.push({
      nom: safePlayer[0],
      titre: getTitreGenre(safePlayer[0], 'le safe player', 'la safe player'),
      valeur: `seulement ${safePlayer[1]} jets ≤3`,
      icon: <span style={{ fontSize: '24px' }}>🛡️</span>,
      color: '#10B981'
    });
  }

  return champions;
}; 