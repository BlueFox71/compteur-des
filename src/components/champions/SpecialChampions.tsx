
import type { Champion, ChampionCalculatorProps } from './types';
import { calculMoyenne, calculProgression } from './utils';

export const calculateSpecialChampions = ({ 
  joueursAnalyse, 
  joueursConfig, 
  seancesFiltrees, 
  getTitreGenre 
}: ChampionCalculatorProps): Champion[] => {
  const champions: Champion[] = [];
  const joueurs = Object.keys(joueursAnalyse);
  
  if (joueurs.length === 0) return champions;

  // Le Perfectionniste (moyenne proche de 10,5)
  const perfectionniste = joueurs.reduce((a, b) => {
    const moyA = calculMoyenne(joueursAnalyse[a].resultats);
    const moyB = calculMoyenne(joueursAnalyse[b].resultats);
    const diffA = Math.abs(moyA - 10.5);
    const diffB = Math.abs(moyB - 10.5);
    return diffA < diffB ? a : b;
  });
  
  if (joueursAnalyse[perfectionniste].resultats.length >= 15) {
    const moyennePerfect = calculMoyenne(joueursAnalyse[perfectionniste].resultats);
    champions.push({
      nom: perfectionniste,
      titre: getTitreGenre(perfectionniste, 'le perfectionniste', 'la perfectionniste'),
      valeur: `moyenne ${moyennePerfect.toFixed(1)}`,
      icon: <span style={{ fontSize: '24px' }}>🎯</span>,
      color: '#7C3AED'
    });
  }

  // Most Improved (plus grande progression de moyenne)
  if (seancesFiltrees.length >= 4) {
    const improvementStats: { [key: string]: number } = {};
    Object.entries(joueursAnalyse).forEach(([nom, stats]) => {
      if (stats.resultats.length >= 10) {
        improvementStats[nom] = calculProgression(stats.resultats);
      }
    });
    
    if (Object.keys(improvementStats).length > 0) {
      const mostImproved = Object.entries(improvementStats).reduce(([nomA, progA], [nomB, progB]) => 
        progA > progB ? [nomA, progA] : [nomB, progB]
      );
      
      if (mostImproved[1] >= 1) {
        champions.push({
          nom: mostImproved[0],
          titre: getTitreGenre(mostImproved[0], 'most improved', 'most improved'),
          valeur: `+${mostImproved[1].toFixed(1)} de progression`,
          icon: <span style={{ fontSize: '24px' }}>📈</span>,
          color: '#EF4444'
        });
      }
    }
  }

  // Spécialistes par type de jet
  Object.entries(joueursAnalyse).forEach(([nom, stats]) => {
    Object.entries(stats.typeJets).forEach(([type, count]) => {
      const pourcentage = (count / stats.totalJets) * 100;
      if (pourcentage >= 40 && count >= 10) {
        champions.push({
          nom: nom,
          titre: getTitreGenre(nom, `maître ${type}`, `maîtresse ${type}`),
          valeur: `${pourcentage.toFixed(1)}% de ses jets`,
          icon: <span style={{ fontSize: '24px' }}>🎲</span>,
          color: '#065F46'
        });
      }
    });
  });

  // Boulet Attachant (plus faible moyenne, mais avec humour)
  const boulet = joueurs.reduce((a, b) => {
    const moyA = calculMoyenne(joueursAnalyse[a].resultats);
    const moyB = calculMoyenne(joueursAnalyse[b].resultats);
    return moyA < moyB ? a : b;
  });
  
  const moyenneBoulet = calculMoyenne(joueursAnalyse[boulet].resultats);
  if (joueurs.length > 1 && moyenneBoulet < 9.5) {
    champions.push({
      nom: boulet,
      titre: getTitreGenre(boulet, 'boulet attachant', 'boulet attachante'),
      valeur: `moyenne ${moyenneBoulet.toFixed(1)}`,
      icon: <span style={{ fontSize: '24px' }}>🤗</span>,
      color: '#F59E0B'
    });
  }

  return champions;
}; 