// Fonctions utilitaires pour les calculs statistiques

export const calculEcartType = (resultats: number[]): number => {
  if (resultats.length === 0) return 0;
  const moyenne = resultats.reduce((sum, val) => sum + val, 0) / resultats.length;
  const variance = resultats.reduce((sum, val) => sum + Math.pow(val - moyenne, 2), 0) / resultats.length;
  return Math.sqrt(variance);
};

export const calculMoyenne = (resultats: number[]): number => {
  if (resultats.length === 0) return 0;
  return resultats.reduce((sum, val) => sum + val, 0) / resultats.length;
};

export const calculTauxReussite = (resultats: number[], seuil: number = 15): number => {
  if (resultats.length === 0) return 0;
  return (resultats.filter(r => r >= seuil).length / resultats.length) * 100;
};

export const calculSerieConsecutive = (resultats: number[], condition: (r: number) => boolean): number => {
  let currentStreak = 0;
  let maxStreak = 0;
  
  resultats.forEach(resultat => {
    if (condition(resultat)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
};

export const calculPourcentageTranche = (resultats: number[], min: number, max: number): number => {
  if (resultats.length === 0) return 0;
  return (resultats.filter(r => r >= min && r <= max).length / resultats.length) * 100;
};

export const calculProgression = (resultats: number[]): number => {
  if (resultats.length < 10) return 0;
  
  const premiersJets = resultats.slice(0, Math.floor(resultats.length / 3));
  const derniersJets = resultats.slice(-Math.floor(resultats.length / 3));
  
  const moyenneDebut = calculMoyenne(premiersJets);
  const moyenneFin = calculMoyenne(derniersJets);
  
  return moyenneFin - moyenneDebut;
}; 