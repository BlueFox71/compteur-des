import { 
  PlusOutlined, 
  BarChartOutlined, 
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Tooltip from 'antd/lib/tooltip';
import Select from 'antd/lib/select';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { 
  PageContainer, 
  StyledCard, 
  StyledTitle, 
  StyledText, 
  GridContainer,
  FlexContainer 
} from '../styles';
import { 
  calculateAllChampions, 
  getChampionTooltip
} from '../components/champions';
import { API_URL } from '../utils/api';

const { Option, OptGroup } = Select;

interface Seance {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin?: string;
  duree?: number | string;
  nombreJets: number;
  jets: any[];
  typeJetInconnu?: boolean;
  importee?: boolean;
  campagne?: string;
  episode?: string;
}

interface StatsCard {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

interface ActionCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [joueursConfig, setJoueursConfig] = useState<{[key: string]: {nom: string, sexe: 'M' | 'F'}}>({});
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [filtreType, setFiltreType] = useState<'general' | 'campagne' | 'seance'>('general');
  const [campagneSelectionnee, setCampagneSelectionnee] = useState<string>('');
  const [seanceSelectionnee, setSeanceSelectionnee] = useState<string>('');
  
  // États pour l'affichage
  const [filtresVisibles, setFiltresVisibles] = useState(false);
  const [championsEtendus, setChampionsEtendus] = useState(false);

  useEffect(() => {
    document.title = 'Compteur de dés - Accueil';
    
    // Charger les séances et la configuration
    Promise.all([
      fetch(`${API_URL}/api/seances`).then(res => res.json()),
      fetch(`${API_URL}/api/config`).then(res => res.json()),
      fetch(`${API_URL}/api/campagnes`).then(res => res.json())
    ])
    .then(([seancesData, configData, campagnesData]) => {
      setSeances(seancesData.seances || []);
      setCampagnes(campagnesData.campagnes || []);
      
      // Transformer la config des joueurs en objet indexé par nom
      const joueursObj: {[key: string]: {nom: string, sexe: 'M' | 'F'}} = {};
      (configData.joueurs || []).forEach((joueur: any) => {
        joueursObj[joueur.nom] = {
          nom: joueur.nom,
          sexe: joueur.sexe || 'M' // Par défaut masculin si pas spécifié
        };
      });
      setJoueursConfig(joueursObj);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, []);

  // Fonction pour adapter les titres selon le sexe
  const getTitreGenre = (joueurNom: string, titreMasculin: string, titreFeminin: string) => {
    const sexe = joueursConfig[joueurNom]?.sexe || 'M';
    return sexe === 'F' ? `${joueurNom} ${titreFeminin}` : `${joueurNom} ${titreMasculin}`;
  };

  // Fonction pour filtrer les séances selon les critères
  const getSeancesFiltrees = () => {
    switch (filtreType) {
      case 'campagne':
        return campagneSelectionnee ? seances.filter(s => s.campagne === campagneSelectionnee) : seances;
      case 'seance':
        return seanceSelectionnee ? seances.filter(s => s.id === seanceSelectionnee) : seances;
      default:
        return seances;
    }
  };

  // Calculer les statistiques des joueurs
  const joueurStats = useMemo(() => {
    const seancesFiltrees = getSeancesFiltrees();
    const totalJets = seancesFiltrees.reduce((acc, seance) => acc + seance.nombreJets, 0);
    const convertirDureeEnHeures = (duree: number | string | undefined): number => {
      if (!duree) return 0;
      if (typeof duree === 'number') return duree;
      
      // Formats supportés: "5h30", "1h45", "1h", "3h15", etc.
      const match = duree.toString().match(/^(\d+)h?(\d+)?$/);
      if (!match) return 0;
      
      const heures = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      
      return heures + (minutes / 60);
    };

    const dureeTotale = seancesFiltrees.reduce((acc, seance) => {
      return acc + convertirDureeEnHeures(seance.duree);
    }, 0);
    const derniereSemaine = seancesFiltrees.filter(seance => {
      const date = new Date(seance.dateDebut);
      const maintenant = new Date();
      const septJoursAgo = new Date(maintenant.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= septJoursAgo;
    });

    // Analyser chaque joueur
    const joueursAnalyse: { [key: string]: {
      totalJets: number;
      resultats: number[];
      moyennes: number[];
      vingt: number;
      un: number;
      typeJets: { [key: string]: number };
    } } = {};

    seancesFiltrees.forEach(seance => {
      seance.jets?.forEach((jet: any) => {
        if (!joueursAnalyse[jet.joueur]) {
          joueursAnalyse[jet.joueur] = {
            totalJets: 0,
            resultats: [],
            moyennes: [],
            vingt: 0,
            un: 0,
            typeJets: {}
          };
        }
        
        const joueur = joueursAnalyse[jet.joueur];
        joueur.totalJets++;
        joueur.resultats.push(jet.resultat);
        
        if (jet.resultat === 20) joueur.vingt++;
        if (jet.resultat === 1) joueur.un++;
        
        joueur.typeJets[jet.typeJet] = (joueur.typeJets[jet.typeJet] || 0) + 1;
      });
    });

    // Calculer les moyennes pour chaque joueur
    Object.keys(joueursAnalyse).forEach(nom => {
      const joueur = joueursAnalyse[nom];
      if (joueur.resultats.length > 0) {
        const moyenne = joueur.resultats.reduce((a, b) => a + b, 0) / joueur.resultats.length;
        joueur.moyennes.push(moyenne);
      }
    });

    // Déterminer les champions dans chaque catégorie
    const joueurs = Object.keys(joueursAnalyse);
    if (joueurs.length === 0) {
      return {
        totalJets,
        dureeTotale,
        seancesSemaine: derniereSemaine.length,
        champions: []
      };
    }

    const champions = calculateAllChampions({
      joueursAnalyse,
      joueursConfig,
      seancesFiltrees,
      getTitreGenre
    });

    return {
      totalJets,
      dureeTotale,
      seancesSemaine: derniereSemaine.length,
      champions
    };
  }, [seances, joueursConfig, filtreType, campagneSelectionnee, seanceSelectionnee]);


  // Cartes générales + champions des joueurs
  const cartesBases: StatsCard[] = [
    {
      title: 'Jets enregistrés',
      value: joueurStats.totalJets.toString(),
      icon: <span style={{ fontSize: '24px' }}>🎲</span>,
      color: '#1D3461',
      subtitle: 'Au total'
    },
    ...(filtreType !== 'seance' ? [{
      title: 'Séances jouées',
      value: getSeancesFiltrees().length.toString(),
      icon: <PlayCircleOutlined style={{ fontSize: '24px' }} />,
      color: '#48BB78',
      subtitle: filtreType === 'general' ? 'Au total' : 'Dans la sélection'
    }, {
      title: 'Durée totale',
      value: `${joueurStats.dureeTotale % 1 === 0 ? joueurStats.dureeTotale : joueurStats.dureeTotale.toFixed(1)}h`,
      icon: <span style={{ fontSize: '24px' }}>⏱️</span>,
      color: '#9F7AEA',
      subtitle: filtreType === 'general' ? 'Au total' : 'Dans la sélection'
    }] : [])
  ];

  const cartesChampions = joueurStats.champions.map(champion => ({
    title: champion.titre,
    value: champion.nom,
    icon: champion.icon,
    color: champion.color,
    subtitle: champion.valeur
  }));

  // Trouver l'index du chanceux pour diviser l'affichage (après le collectionneur de 1)
  const indexChanceux = cartesChampions.findIndex(carte => 
    carte.title.includes('chanceux') || carte.title.includes('chanceuse')
  );
  
  const championsPremieres = indexChanceux >= 0 ? cartesChampions.slice(0, indexChanceux + 1) : cartesChampions.slice(0, 6);
  const championsSuivants = indexChanceux >= 0 ? cartesChampions.slice(indexChanceux + 1) : cartesChampions.slice(6);
  
  const statsCards = [
    ...cartesBases,
    ...championsPremieres,
    ...(championsEtendus ? championsSuivants : [])
  ];

  const actionCards: ActionCard[] = [
    {
      title: 'Nouvelle séance',
      description: 'Commencer une nouvelle session de jeu',
      icon: <PlusOutlined style={{ fontSize: '32px' }} />,
      color: '#1D3461',
      path: '/seance'
    },
    {
      title: 'Séances & Statistiques',
      description: 'Analyser les performances et résultats',
      icon: <BarChartOutlined style={{ fontSize: '32px' }} />,
      color: '#48BB78',
      path: '/statistiques'
    },
    {
      title: 'Paramètres',
      description: 'Configuration générale et gestion des données',
      icon: <SettingOutlined style={{ fontSize: '32px' }} />,
      color: '#ED8936',
      path: '/config'
    }
  ];

  if (loading) {
    return (
      <PageContainer>
        <StyledCard>
          <StyledText>Chargement...</StyledText>
        </StyledCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ flexDirection: 'column', maxWidth: '1200px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <StyledTitle level={1} style={{ fontSize: '36px', marginBottom: '8px' }}>
          🎲 Dashboard des Dés
        </StyledTitle>
        <StyledText $size="lg" $color="secondary">
          Bienvenue dans votre compteur de dés personnel
        </StyledText>
      </div>

            {/* Statistiques et Champions */}
      <div style={{ marginBottom: '32px' }}>
        <div className="header-champions-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <StyledTitle level={3} style={{ margin: 0, textAlign: 'center', flex: 1 }}>
            🏆 Champions & Statistiques
          </StyledTitle>
          <button
            className="filters-btn"
            onClick={() => setFiltresVisibles(!filtresVisibles)}
            style={{
              background: filtresVisibles ? '#1D3461' : 'var(--background-secondary)',
              color: filtresVisibles ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!filtresVisibles) {
                e.currentTarget.style.background = '#f0f0f0';
              }
            }}
            onMouseOut={(e) => {
              if (!filtresVisibles) {
                e.currentTarget.style.background = 'var(--background-secondary)';
              }
            }}
          >
            {filtresVisibles ? '🔽 Masquer filtres' : '🔼 Afficher filtres'}
          </button>
        </div>
        
        {/* Interface de filtrage */}
        {filtresVisibles && (
        <div style={{ marginBottom: '24px', padding: '20px', background: 'var(--background-secondary)', borderRadius: '8px' }}>
          <FlexContainer $direction="column" $gap="16px">
            <StyledText $weight="semibold" style={{ marginBottom: '8px' }}>
              📊 Filtrer les statistiques :
            </StyledText>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <Select
                value={filtreType}
                onChange={(value) => {
                  setFiltreType(value);
                  setCampagneSelectionnee('');
                  setSeanceSelectionnee('');
                }}
                style={{ width: '150px' }}
              >
                <Option value="general">🌍 Général</Option>
                <Option value="campagne">🎭 Par campagne</Option>
                <Option value="seance">🎲 Par séance</Option>
              </Select>
              
              {filtreType === 'campagne' && (
                <Select
                  value={campagneSelectionnee}
                  onChange={setCampagneSelectionnee}
                  placeholder="Choisir une campagne"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {campagnes.map(campagne => (
                    <Option key={campagne.id} value={campagne.nom}>
                      🎭 {campagne.nom}
                    </Option>
                  ))}
                </Select>
              )}
              
              {filtreType === 'seance' && (
                <Select
                  value={seanceSelectionnee}
                  onChange={setSeanceSelectionnee}
                  placeholder="Choisir une séance"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {(() => {
                    // Grouper les séances par campagne
                    const seancesParCampagne: { [key: string]: Seance[] } = {};
                    const seancesSansCampagne: Seance[] = [];
                    
                    seances.forEach(seance => {
                      if (seance.campagne) {
                        if (!seancesParCampagne[seance.campagne]) {
                          seancesParCampagne[seance.campagne] = [];
                        }
                        seancesParCampagne[seance.campagne].push(seance);
                      } else {
                        seancesSansCampagne.push(seance);
                      }
                    });

                    // Trier les séances par épisode (alphabétique)
                    Object.keys(seancesParCampagne).forEach(campagne => {
                      seancesParCampagne[campagne].sort((a, b) => {
                        const episodeA = a.episode || '';
                        const episodeB = b.episode || '';
                        return episodeA.localeCompare(episodeB);
                      });
                    });

                    // Trier les séances sans campagne par nom
                    seancesSansCampagne.sort((a, b) => a.nom.localeCompare(b.nom));

                    return (
                      <>
                        {/* Séances avec campagne */}
                        {campagnes
                          .filter(campagne => seancesParCampagne[campagne.nom])
                          .map(campagne => (
                            <OptGroup key={campagne.id} label={`🎭 ${campagne.nom}`}>
                              {seancesParCampagne[campagne.nom].map(seance => (
                                <Option key={seance.id} value={seance.id}>
                                  🎲 {seance.nom}{seance.episode ? ` - Ep. ${seance.episode}` : ''}
                                </Option>
                              ))}
                            </OptGroup>
                          ))}
                        
                        {/* Séances sans campagne */}
                        {seancesSansCampagne.length > 0 && (
                          <OptGroup label="📂 Sans campagne">
                            {seancesSansCampagne.map(seance => (
                              <Option key={seance.id} value={seance.id}>
                                🎲 {seance.nom}
                              </Option>
                            ))}
                          </OptGroup>
                        )}
                      </>
                    );
                  })()}
                </Select>
              )}
              
              {filtreType === 'general' && (
                <StyledText $color="secondary" style={{ gridColumn: '2 / 4' }}>
                  Affichage de toutes les séances
                </StyledText>
              )}
            </div>
          </FlexContainer>
        </div>
        )}

        <GridContainer $minWidth="250px" $gap="24px">
          {statsCards.map((stat, index) => {
            return (
              <Tooltip key={index} title={getChampionTooltip(stat.title)} placement="top">
                <StyledCard style={{ textAlign: 'center', padding: '24px', cursor: 'help' }}>
                  <FlexContainer $direction="column" $align="center" $gap="12px">
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                    <div>
                      <StyledText $size="lg" $weight="bold" $block style={{ color: stat.color, fontSize: '28px' }}>
                        {stat.value}
                      </StyledText>
                      <StyledText $weight="semibold" $block>
                        {stat.title}
                      </StyledText>
                      {stat.subtitle && (
                        <StyledText $size="sm" $color="secondary" $block>
                          {stat.subtitle}
                        </StyledText>
                      )}
                    </div>
                  </FlexContainer>
                </StyledCard>
              </Tooltip>
            );
          })}
        </GridContainer>
        
        {/* Bouton voir plus/moins */}
        {championsSuivants.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => setChampionsEtendus(!championsEtendus)}
              style={{
                background: championsEtendus ? '#9F7AEA' : '#1D3461',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {championsEtendus ? 
                `🔼 Voir moins (${championsSuivants.length} masqués)` : 
                `🔽 Voir plus (${championsSuivants.length} champions)`
              }
            </button>
          </div>
        )}
      </div>



      {/* Raccourcis d'actions */}
      <div>
        <StyledTitle level={3} style={{ marginBottom: '24px', textAlign: 'center' }}>
          Actions rapides
        </StyledTitle>
        <GridContainer $minWidth="300px" $gap="24px">
          {actionCards.map((action, index) => (
            <StyledCard 
              key={index} 
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.3s ease',
                padding: '24px'
              }}
              onClick={() => navigate(action.path)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FlexContainer $direction="column" $align="center" $gap="16px">
                <div style={{ color: action.color }}>
                  {action.icon}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <StyledText $size="lg" $weight="bold" $block>
                    {action.title}
                  </StyledText>
                  <StyledText $color="secondary">
                    {action.description}
                  </StyledText>
                </div>
              </FlexContainer>
            </StyledCard>
          ))}
        </GridContainer>
      </div>
    </PageContainer>
  );
} 