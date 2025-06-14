import { useState, useEffect, useRef } from 'react';
import Card from 'antd/lib/card';
import Table from 'antd/lib/table';
import Typography from 'antd/lib/typography';
import Select from 'antd/lib/select';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import message from 'antd/lib/message';
import Collapse from 'antd/lib/collapse';
import Tooltip from 'antd/lib/tooltip';
import Radio from 'antd/lib/radio';
import { EditOutlined, DeleteOutlined, PlusOutlined, UpOutlined, DownOutlined, CommentOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import TableauJetsParResultat from '../components/TableauJetsParResultat';
import { useAdmin } from '../contexts/AdminContext';
import styled from 'styled-components';
import Space from 'antd/lib/space';
import { API_URL } from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { useForm } = Form;
const { Panel } = Collapse;

// Styled component pour le bouton de suppression
const StyledDeleteButton = styled.button`
  background: none;
  border: none;
  color: #ff4d4f;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  height: auto;
  transition: color 0.3s ease;

  &:hover {
    color: #d32029;
    text-decoration: underline;
  }

  &:focus {
    outline: none;
    color: #d32029;
  }

  &:active {
    color: #a8071a;
  }
`;

const CommentairesContainer = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  height: 200px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CommentaireItem = styled.div`
  padding: 16px;
  margin: 8px;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background: var(--background-primary);
  overflow-y: auto;
  max-height: 120px;
  position: relative;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background-primary);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 2px;
  }

  .titre {
    color: var(--text-primary);
    margin-bottom: 8px;
    position: relative;
  }

  .pourcentage {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: var(--text-secondary) !important;
    font-size: 0.8em;
  }

  .commentaire {
    color: var(--text-secondary);
    font-style: italic;
    font-size: 0.9em;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
`;

const NavButton = styled(Button)`
  &.ant-btn {
    background: var(--background-primary);
    border-color: var(--primary-color);
    color: var(--primary-color);
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .anticon {
      font-size: 14px;
    }
    
    &:hover {
      background: var(--primary-color);
      color: white;
    }
  }
`;

interface Seance {
  id: string;
  nom: string;
  duree: number;
  campagne?: string;
  episode?: string;
  jets: Array<{
    id?: string;
    joueur: string;
    typeJet: string;
    resultat: number;
    date: string;
    commentaire?: string;
  }>;
  dateDebut: string;
  dateFin: string;
  nombreJets: number;
}

interface JoueurStats {
  nom: string;
  nombreJets: number;
  moyenne: number;
  jetPlusFrequent: number;
  score: number;
}

const StyledCard = styled(Card)`
  width: 100%;
  padding: 32px;
`;

const StyledTitle = styled(Title)`
  color: var(--primary-color);
`;

const StyledText = styled(Text)`
  color: ${props => props.color};
`;

const PageContainer = styled.div`
  padding: 24px;
`;

const FlexContainer = styled.div<{ $direction: string; $gap: string }>`
  display: flex;
  flex-direction: ${props => props.$direction};
  gap: ${props => props.$gap};
`;

const StyledRadioGroup = styled(Radio.Group)`
  .ant-radio-button-wrapper {
    background: var(--background-primary);
    color: var(--text-primary);
    border-color: var(--border-color);
    
    &:hover {
      color: var(--primary-color);
    }
    
    &-checked {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      
      &:hover {
        color: white;
      }
    }
  }
`;

export default function StatistiquesPage() {
  const { isAdmin } = useAdmin();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [seanceSelectionnee, setSeanceSelectionnee] = useState<Seance | null>(null);
  const [statsJoueurs, setStatsJoueurs] = useState<JoueurStats[]>([]);
  const [modalEditionVisible, setModalEditionVisible] = useState(false);
  const [modalSuppressionVisible, setModalSuppressionVisible] = useState(false);
  const [seanceEnEdition, setSeanceEnEdition] = useState<Seance | null>(null);
  const [jetsEdites, setJetsEdites] = useState<any[]>([]);
  const [form] = useForm();
  const [joueurs, setJoueurs] = useState<string[]>([]);
  const [typesJets, setTypesJets] = useState<string[]>([]);
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [activePanels, setActivePanels] = useState<string[]>(['1', '2', '3']);
  
  // Nouveaux états pour la vue globale
  const [typeVue, setTypeVue] = useState<'seance' | 'toutes' | 'campagne'>('seance');
  const [campagneSelectionnee, setCampagneSelectionnee] = useState<string>('');
  const [donneesGraphiques, setDonneesGraphiques] = useState<{
    distributionResultats: any[];
    repartitionJoueurs: any[];
    distributionParJoueur: any[];
  }>({
    distributionResultats: [],
    repartitionJoueurs: [],
    distributionParJoueur: []
  });

  const [indexCommentaireActuel, setIndexCommentaireActuel] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollInterval = useRef<number | null>(null);

  const [modalCommentaireVisible, setModalCommentaireVisible] = useState(false);
  const [jetEnEdition, setJetEnEdition] = useState<any>(null);
  const [formCommentaire] = Form.useForm();

  // Palette de couleurs pour les graphiques
  const COULEURS_GRAPHIQUES = [
    '#ff69b4', // primary-color
    '#c1407c', // primary-dark
    '#1d3461', // background-tertiary
    '#8892b0', // text-secondary
    '#4a90e2', // bleu
    '#7b68ee', // violet
    '#ffa500', // orange
    '#32cd32', // vert
    '#ff6347', // rouge
    '#40e0d0'  // turquoise
  ];

  // Fonction pour obtenir les jets selon le type de vue
  const obtenirJetsSelectionnes = (): any[] => {
    switch (typeVue) {
      case 'seance':
        return seanceSelectionnee?.jets || [];
      case 'toutes':
        return seances.flatMap(seance => seance.jets || []);
      case 'campagne':
        return seances
          .filter(seance => seance.campagne === campagneSelectionnee)
          .flatMap(seance => seance.jets || []);
      default:
        return [];
    }
  };

  const obtenirCommentaires = () => {
    const jets = obtenirJetsSelectionnes();
    return jets
      .filter(jet => jet.commentaire)
      .map(jet => ({
        joueur: jet.joueur,
        commentaire: jet.commentaire || '',
        seance: seances.find(s => s.id === jet.seanceId),
        campagne: jet.campagne
      }))
      .sort((a, b) => {
        const dateA = a.seance?.dateFin ? new Date(a.seance.dateFin).getTime() : 0;
        const dateB = b.seance?.dateFin ? new Date(b.seance.dateFin).getTime() : 0;
        return dateB - dateA;
      });
  };

  const commentaires = obtenirCommentaires();

  useEffect(() => {
    document.title = 'Compteur de dés - Séances & Statistiques';
    chargerSeances();
    chargerConfiguration();
    chargerCampagnes();
  }, []);

  useEffect(() => {
    // Réinitialiser l'index et l'auto-scroll quand la vue change
    setIndexCommentaireActuel(0);
    setAutoScroll(true);
  }, [typeVue, campagneSelectionnee, seanceSelectionnee]);

  useEffect(() => {
    if (autoScroll && commentaires.length > 0) {
      autoScrollInterval.current = window.setInterval(() => {
        setIndexCommentaireActuel(prev => 
          prev === commentaires.length - 1 ? 0 : prev + 1
        );
      }, 6000); // Change de commentaire toutes les 6 secondes
    }

    return () => {
      if (typeof autoScrollInterval.current === 'number') {
        window.clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    };
  }, [autoScroll, commentaires.length]);

  useEffect(() => {
    // Vérifier la taille de l'écran et ajuster les panneaux actifs
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setActivePanels([]); // Fermer tous les panneaux sur mobile
      } else {
        setActivePanels(['1', '2', '3']); // Ouvrir tous les panneaux sur desktop
      }
    };

    // Appliquer au chargement initial
    handleResize();

    // Ajouter l'écouteur d'événement
    window.addEventListener('resize', handleResize);

    // Nettoyer l'écouteur d'événement
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chargerCampagnes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/campagnes`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setCampagnes(data.campagnes || []);
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error);
    }
  };

  const chargerConfiguration = async () => {
    try {
      const response = await fetch(`${API_URL}/api/config`);
      if (!response.ok) throw new Error('Erreur lors du chargement de la configuration');
      const data = await response.json();
      setJoueurs(data.joueurs?.map((j: any) => j.nom) || []);
      setTypesJets(data.typesJets?.map((t: any) => t.type) || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const chargerSeances = async () => {
    try {
      const response = await fetch(`${API_URL}/api/seances`);
      if (!response.ok) throw new Error('Erreur lors du chargement des séances');
      const data = await response.json();
      setSeances(data.seances || []);
      if (data.seances && data.seances.length > 0) {
        setSeanceSelectionnee(data.seances[data.seances.length - 1]); // Dernière séance par défaut
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  useEffect(() => {
    if (typeVue === 'seance' && seanceSelectionnee) {
      calculerStatistiques();
      calculerDonneesGraphiques();
    } else if (typeVue === 'toutes' && seances.length > 0) {
      calculerStatistiques();
      calculerDonneesGraphiques();
    } else if (typeVue === 'campagne' && campagneSelectionnee && seances.length > 0) {
      calculerStatistiques();
      calculerDonneesGraphiques();
    }
  }, [seanceSelectionnee, typeVue, campagneSelectionnee, seances]);

  // Fonction pour obtenir le titre selon le type de vue
  const obtenirTitreVue = (): string => {
    switch (typeVue) {
      case 'seance':
        return seanceSelectionnee?.nom || '';
      case 'toutes':
        return 'Toutes les séances';
      case 'campagne':
        return `Campagne : ${campagneSelectionnee}`;
      default:
        return '';
    }
  };

  const calculerStatistiques = () => {
    const jets = obtenirJetsSelectionnes();
    if (jets.length === 0) return;
    const joueurs = [...new Set(jets.map(jet => jet.joueur))];

    // Calculer le tableau des jets par joueur et résultat
    const tableau = [];
    for (let resultat = 1; resultat <= 20; resultat++) {
      const ligne: any = { resultat };
      joueurs.forEach(joueur => {
        const count = jets.filter(jet => jet.joueur === joueur && jet.resultat === resultat).length;
        ligne[joueur] = count || 0;
      });
      tableau.push(ligne);
    }

    // Calculer les statistiques par joueur
    const stats: JoueurStats[] = joueurs.map(joueur => {
      const jetsJoueur = jets.filter(jet => jet.joueur === joueur);
      const nombreJets = jetsJoueur.length;
      
      if (nombreJets === 0) {
        return {
          nom: joueur,
          nombreJets: 0,
          moyenne: 0,
          jetPlusFrequent: 0,
          score: 0
        };
      }

      const somme = jetsJoueur.reduce((acc, jet) => acc + jet.resultat, 0);
      const moyenne = somme / nombreJets;

      // Trouver le jet le plus fréquent
      const frequences: { [key: number]: number } = {};
      jetsJoueur.forEach(jet => {
        frequences[jet.resultat] = (frequences[jet.resultat] || 0) + 1;
      });
      const jetPlusFrequent = parseInt(Object.keys(frequences).reduce((a, b) => 
        frequences[parseInt(a)] > frequences[parseInt(b)] ? a : b
      ));

      // Calcul du score (peut être ajusté selon vos critères)
      const score = Math.round((moyenne * nombreJets) / 10);

      return {
        nom: joueur,
        nombreJets,
        moyenne: Math.round(moyenne * 100) / 100,
        jetPlusFrequent,
        score
      };
    });

    setStatsJoueurs(stats);
  };

  const calculerDonneesGraphiques = () => {
    const jets = obtenirJetsSelectionnes();
    if (jets.length === 0) return;
    const joueursUniques = [...new Set(jets.map(jet => jet.joueur))];

    // 1. Distribution des résultats (1-20)
    const distributionResultats = [];
    for (let resultat = 1; resultat <= 20; resultat++) {
      const count = jets.filter(jet => jet.resultat === resultat).length;
      distributionResultats.push({
        resultat: `${resultat}`,
        nombre: count
      });
    }

    // 2. Répartition par joueur (pie chart)
    const repartitionJoueurs = joueursUniques.map(joueur => {
      const jetsJoueur = jets.filter(jet => jet.joueur === joueur);
      return {
        nom: joueur,
        nombre: jetsJoueur.length,
        pourcentage: Math.round((jetsJoueur.length / jets.length) * 100)
      };
    });

    // 3. Distribution des résultats par joueur (multi-series bar chart)
    const distributionParJoueur = [];
    for (let resultat = 1; resultat <= 20; resultat++) {
      const donneesResultat: any = { resultat: `${resultat}` };
      joueursUniques.forEach(joueur => {
        const count = jets.filter(jet => jet.joueur === joueur && jet.resultat === resultat).length;
        donneesResultat[joueur] = count;
      });
      distributionParJoueur.push(donneesResultat);
    }

    setDonneesGraphiques({
      distributionResultats,
      repartitionJoueurs,
      distributionParJoueur
    });
  };

  const colonnesStats = [
    {
      title: 'Joueur',
      dataIndex: 'nom',
      key: 'nom',
      render: (nom: string) => <strong style={{ color: 'var(--text-primary)' }}>{nom}</strong>
    },
    {
      title: 'Nombre de jets',
      dataIndex: 'nombreJets',
      key: 'nombreJets',
    },
    {
      title: 'Moyenne',
      dataIndex: 'moyenne',
      key: 'moyenne',
      render: (moyenne: number) => moyenne.toFixed(2)
    },
    {
      title: 'Jet le plus fréquent',
      dataIndex: 'jetPlusFrequent',
      key: 'jetPlusFrequent',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <strong >{score}</strong>
    }
  ];

  const ouvrirModalEdition = () => {
    if (!seanceSelectionnee) return;
    setSeanceEnEdition({ ...seanceSelectionnee });
    setJetsEdites(seanceSelectionnee.jets.map((jet, index) => ({ ...jet, id: jet.id || index.toString() })));
    form.setFieldsValue({
      nom: seanceSelectionnee.nom,
      duree: seanceSelectionnee.duree,
      campagne: seanceSelectionnee.campagne,
      episode: seanceSelectionnee.episode
    });
    setModalEditionVisible(true);
  };

  const modifierJet = (jetId: string, champ: string, valeur: any) => {
    setJetsEdites(prev => prev.map(jet => 
      jet.id === jetId ? { ...jet, [champ]: valeur } : jet
    ));
  };

  const supprimerJet = (jetId: string) => {
    setJetsEdites(prev => prev.filter(jet => jet.id !== jetId));
  };

  const ajouterJet = () => {
    const nouveauJet = {
      id: `nouveau_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      joueur: '', // Vide pour forcer l'utilisateur à choisir
      typeJet: '', // Vide pour forcer l'utilisateur à choisir
      resultat: 1, // Valeur minimale
      date: new Date().toISOString()
    };
    
    setJetsEdites(prev => [nouveauJet, ...prev]); // Ajouter au début de la liste
  };

  const sauvegarderModifications = async () => {
    try {
      const valeurs = await form.validateFields();
      const seanceModifiee = {
        ...seanceEnEdition,
        nom: valeurs.nom,
        duree: valeurs.duree,
        campagne: valeurs.campagne,
        episode: valeurs.episode,
        jets: jetsEdites.map(jet => ({
          joueur: jet.joueur,
          typeJet: jet.typeJet,
          resultat: jet.resultat,
          date: jet.date,
          commentaire: jet.commentaire
        })),
        nombreJets: jetsEdites.length
      };

      const response = await fetch(`${API_URL}/api/seances/${seanceEnEdition?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seanceModifiee),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      message.success('Séance modifiée avec succès !');
      setModalEditionVisible(false);
      
      // Recharger les séances et mettre à jour la séance sélectionnée
      await chargerSeances();
      const seancesMisesAJour = await fetch(`${API_URL}/api/seances`).then(res => res.json());
      const seanceTrouvee = seancesMisesAJour.seances.find((s: Seance) => s.id === seanceEnEdition?.id);
      if (seanceTrouvee) {
        setSeanceSelectionnee(seanceTrouvee);
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la sauvegarde');
    }
  };

  const ouvrirModalSuppression = () => {
    console.log('🗑️ Ouverture du modal de suppression');
    setModalSuppressionVisible(true);
  };

  const confirmerSuppression = async () => {
    console.log('✅ Confirmation de suppression');
    
    if (!seanceEnEdition) {
      console.log('❌ Aucune séance en édition');
      return;
    }

    try {
      console.log(`🌐 Appel API DELETE pour séance ID: ${seanceEnEdition.id}`);
      
      const response = await fetch(`${API_URL}/api/seances/${seanceEnEdition.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('📡 Réponse serveur:', response.status, response.statusText);

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      message.success('Séance supprimée avec succès !');
      setModalSuppressionVisible(false);
      setModalEditionVisible(false);
      setSeanceSelectionnee(null);
      
      console.log('🔄 Rechargement des séances...');
      await chargerSeances();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      message.error('Erreur lors de la suppression de la séance');
    }
  };

  const obtenirTitreCommentaire = (commentaire: { joueur: string; commentaire: string; seance?: Seance; campagne?: string }) => {
    const jets = obtenirJetsSelectionnes();
    const jet = jets.find(jet => 
      jet.joueur === commentaire.joueur && 
      jet.commentaire === commentaire.commentaire
    );
    
    const indexCommentaire = jet ? jets.indexOf(jet) : -1;
    const pourcentageParcours = indexCommentaire !== -1 
      ? Math.round(((indexCommentaire + 1) / jets.length) * 100)
      : 0;

    const titreJet = jet ? `${jet.joueur} a fait un ${jet.resultat} en ${jet.typeJet}` : '';

    // Trouver la séance correspondante
    const seance = seances.find(s => s.jets.some(j => 
      j.joueur === commentaire.joueur && 
      j.commentaire === commentaire.commentaire
    ));

    let titre = '';
    switch (typeVue) {
      case 'campagne':
        titre = `<strong>${seance?.nom || ''}</strong> - ${titreJet}`;
        break;
      case 'seance':
        titre = titreJet;
        break;
      case 'toutes':
      default:
        titre = `${seance?.campagne || ''} / <strong>${seance?.nom || ''}</strong> - ${titreJet}`;
    }

    return {
      titre,
      pourcentage: `${pourcentageParcours}%`
    };
  };

  const commentairePrecedent = () => {
    setAutoScroll(false);
    if (typeof autoScrollInterval.current === 'number') {
      window.clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    setIndexCommentaireActuel(prev => 
      prev === 0 ? commentaires.length - 1 : prev - 1
    );
  };

  const commentaireSuivant = () => {
    setAutoScroll(false);
    if (typeof autoScrollInterval.current === 'number') {
      window.clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
    setIndexCommentaireActuel(prev => 
      prev === commentaires.length - 1 ? 0 : prev + 1
    );
  };

  const ouvrirModalCommentaire = (jet: any) => {
    // S'assurer que le jet a un ID
    const jetAvecId = {
      ...jet,
      id: jet.id || `jet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setJetEnEdition(jetAvecId);
    formCommentaire.setFieldsValue({
      commentaire: jet.commentaire || ''
    });
    setModalCommentaireVisible(true);
  };

  const validerCommentaire = async () => {
    try {
      const values = await formCommentaire.validateFields();
      if (!jetEnEdition || !seanceSelectionnee) return;

      // Mettre à jour le jet dans la séance
      const seanceModifiee: Seance = {
        ...seanceSelectionnee,
        jets: seanceSelectionnee.jets.map((jet: any) => 
          jet.id === jetEnEdition.id 
            ? { ...jet, commentaire: values.commentaire || undefined }
            : jet
        )
      };

      // Mettre à jour les jets édités
      setJetsEdites(prev => prev.map(jet => 
        jet.id === jetEnEdition.id 
          ? { ...jet, commentaire: values.commentaire || undefined }
          : jet
      ));

      // Mettre à jour le state
      setSeanceSelectionnee(seanceModifiee);

      // Mettre à jour la séance dans le tableau des séances
      const seancesModifiees = seances.map(seance => 
        seance.id === seanceSelectionnee.id ? seanceModifiee : seance
      );
      setSeances(seancesModifiees);

      // Sauvegarder les modifications sur le serveur
      const response = await fetch(`${API_URL}/api/seances/${seanceSelectionnee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seanceModifiee),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      message.success('Commentaire enregistré avec succès');
      setModalCommentaireVisible(false);
      setJetEnEdition(null);
      formCommentaire.resetFields();
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la sauvegarde du commentaire');
    }
  };

  return (
    <PageContainer>
      <StyledCard style={{ width: '100%', padding: '32px' }}>
        <FlexContainer $direction="column" $gap="24px">
          <div style={{ textAlign: 'center' }}>
            <StyledTitle level={3} style={{ marginBottom: '8px' }}>
              📊 Statistiques
            </StyledTitle>
            <StyledText color="var(--text-secondary)">
              {obtenirTitreVue()}
            </StyledText>
          </div>

          <Row gutter={24}>
            <Col span={12}>
              <div style={{ 
                background: 'var(--background-secondary)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)'
              }}>
                <Form.Item
                  label="Type de vue"
                  style={{ marginBottom: 0 }}
                >
                  <StyledRadioGroup 
                    value={typeVue} 
                    onChange={e => setTypeVue(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <Radio.Button value="toutes" style={{ width: '33.33%', textAlign: 'center' }}>
                      Toutes
                    </Radio.Button>
                    <Radio.Button value="campagne" style={{ width: '33.33%', textAlign: 'center' }}>
                      Campagne
                    </Radio.Button>
                    <Radio.Button value="seance" style={{ width: '33.33%', textAlign: 'center' }}>
                      Séance
                    </Radio.Button>
                  </StyledRadioGroup>
                </Form.Item>

                {typeVue === 'campagne' && (
                  <Form.Item
                    label="Campagne"
                    style={{ marginTop: '16px', marginBottom: 0 }}
                  >
                    <Select
                      value={campagneSelectionnee}
                      onChange={setCampagneSelectionnee}
                      style={{ width: '100%' }}
                      placeholder="Sélectionner une campagne"
                    >
                      {campagnes.map(campagne => (
                        <Option key={campagne.id} value={campagne.nom}>
                          {campagne.nom}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                {typeVue === 'seance' && (
                  <Form.Item
                    label="Séance"
                    style={{ marginTop: '16px', marginBottom: 0 }}
                  >
                    <Select
                      value={seanceSelectionnee?.id}
                      onChange={value => {
                        const seance = seances.find(s => s.id === value);
                        setSeanceSelectionnee(seance || null);
                      }}
                      style={{ width: '100%' }}
                      placeholder="Sélectionner une séance"
                    >
                      {seances.map(seance => (
                        <Option key={seance.id} value={seance.id}>
                          {seance.nom}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </div>
            </Col>
            <Col span={12}>
              {commentaires.length > 0 && (
                <CommentairesContainer>
                  <CommentaireItem>
                    <div className="titre" dangerouslySetInnerHTML={{ __html: obtenirTitreCommentaire(commentaires[indexCommentaireActuel]).titre }} />
                    <div className="commentaire">{commentaires[indexCommentaireActuel].commentaire}</div>
                    <Tooltip title={`Le jet a été fait à ${obtenirTitreCommentaire(commentaires[indexCommentaireActuel]).pourcentage} du projet`}>
                      <div className="pourcentage">{obtenirTitreCommentaire(commentaires[indexCommentaireActuel]).pourcentage}</div>
                    </Tooltip>
                  </CommentaireItem>
                  <NavigationButtons>
                    <NavButton 
                      icon={<UpOutlined />} 
                      onClick={commentairePrecedent}
                      title="Commentaire précédent"
                    />
                    <NavButton 
                      icon={<DownOutlined />} 
                      onClick={commentaireSuivant}
                      title="Commentaire suivant"
                    />
                  </NavigationButtons>
                </CommentairesContainer>
              )}
            </Col>
          </Row>

          <div style={{ 
            background: 'var(--background-secondary)', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid var(--border-color)'
          }} className="total-jets-card">
            <Typography.Text style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
              Nombre total de jets : <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{obtenirJetsSelectionnes().length}</span>
            </Typography.Text>
          </div>

          <Collapse 
            activeKey={activePanels}
            onChange={(keys) => setActivePanels(Array.isArray(keys) ? keys : [keys])}
            style={{ 
              marginBottom: '32px',
              backgroundColor: 'var(--background-secondary)',
              border: '1px solid var(--background-tertiary)'
            }}
            className="custom-collapse"
          >
            <Panel 
              header="Tableau des jets par résultat" 
              key="1"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <TableauJetsParResultat jets={obtenirJetsSelectionnes()} />
            </Panel>

            <Panel 
              header="Statistiques par joueur" 
              key="2"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <Table
                columns={colonnesStats}
                dataSource={statsJoueurs}
                pagination={false}
                rowKey="nom"
              />
            </Panel>

            <Panel 
              header="Graphiques et visualisations" 
              key="3"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <Row gutter={[16, 16]}>
                {/* Graphique distribution des résultats */}
                <Col span={12}>
                  <Card 
                    title="Distribution des résultats (1-20)" 
                    size="small"
                    style={{ height: '400px' }}
                    className="stat-card"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={donneesGraphiques.distributionResultats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--background-tertiary)" />
                        <XAxis 
                          dataKey="resultat" 
                          tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                          axisLine={{ stroke: 'var(--text-secondary)' }}
                        />
                        <YAxis 
                          tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                          axisLine={{ stroke: 'var(--text-secondary)' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'var(--background-tertiary)',
                            border: '1px solid var(--primary-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <Bar dataKey="nombre" fill="var(--primary-color)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                {/* Graphique répartition par joueur */}
                <Col span={12}>
                  <Card 
                    title="Répartition des jets par joueur" 
                    size="small"
                    style={{ height: '400px' }}
                    className="stat-card"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={donneesGraphiques.repartitionJoueurs}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="nombre"
                          label={({ nom, pourcentage }) => `${nom} (${pourcentage}%)`}
                        >
                          {donneesGraphiques.repartitionJoueurs.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COULEURS_GRAPHIQUES[index % COULEURS_GRAPHIQUES.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'var(--background-tertiary)',
                            border: '1px solid var(--primary-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

                {/* Graphique distribution par joueur */}
                <Col span={24}>
                  <Card 
                    title="Distribution des résultats par joueur" 
                    size="small"
                    style={{ height: '500px' }}
                    className="stat-card stat-card-full"
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={donneesGraphiques.distributionParJoueur} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--background-tertiary)" />
                        <XAxis 
                          dataKey="resultat" 
                          tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                          axisLine={{ stroke: 'var(--text-secondary)' }}
                        />
                        <YAxis 
                          tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                          axisLine={{ stroke: 'var(--text-secondary)' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'var(--background-tertiary)',
                            border: '1px solid var(--primary-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <Legend />
                        {[...new Set(seanceSelectionnee?.jets.map(jet => jet.joueur) || [])].map((joueur, index) => (
                          <Bar 
                            key={joueur} 
                            dataKey={joueur} 
                            fill={COULEURS_GRAPHIQUES[index % COULEURS_GRAPHIQUES.length]} 
                            name={joueur}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>

              </Row>
            </Panel>
          </Collapse>
        </FlexContainer>
      </StyledCard>

      {typeVue === 'seance' && seanceSelectionnee && isAdmin && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={ouvrirModalEdition}
            size="large"
          >
            Modifier la séance "{seanceSelectionnee.nom}"
          </Button>
        </div>
      )}

      <Modal
        title={`Modifier la séance "${seanceEnEdition?.nom}"`}
        open={modalEditionVisible}
        onCancel={() => setModalEditionVisible(false)}
        width={1000}
        footer={[
          <div key="footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <StyledDeleteButton onClick={ouvrirModalSuppression}>
              Supprimer la séance
            </StyledDeleteButton>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button key="cancel" onClick={() => setModalEditionVisible(false)}>
                Annuler
              </Button>
              <Button key="save" type="primary" onClick={sauvegarderModifications}>
                Enregistrer les données
              </Button>
            </div>
          </div>
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nom de la séance"
                name="nom"
                rules={[{ required: true, message: 'Le nom est requis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Durée (heures)"
                name="duree"
                rules={[{ required: true, message: 'La durée est requise' }]}
              >
                <InputNumber
                  min={0.25}
                  max={24}
                  step={0.25}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Campagne"
                name="campagne"
              >
                <Select
                  placeholder="Sélectionner une campagne"
                  allowClear
                  style={{ width: '100%' }}
                >
                  {campagnes.map(campagne => (
                    <Option key={campagne.id} value={campagne.nom}>
                      {campagne.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Épisode"
                name="episode"
              >
                <Input 
                  placeholder="Ex: 1, 2.1, A..."
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>Jets de la séance</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={ajouterJet}
            >
              Ajouter un jet
            </Button>
          </div>
          <Table
            columns={[
              {
                title: 'Joueur',
                dataIndex: 'joueur',
                key: 'joueur',
                render: (joueur: string, record: any) => (
                  <Select
                    value={joueur || undefined}
                    onChange={(valeur) => modifierJet(record.id, 'joueur', valeur)}
                    style={{ width: '100%' }}
                    placeholder="Choisir un joueur"
                    allowClear
                  >
                    {joueurs.map(j => (
                      <Option key={j} value={j}>{j}</Option>
                    ))}
                  </Select>
                ),
              },
              {
                title: 'Type de jet',
                dataIndex: 'typeJet',
                key: 'typeJet',
                render: (typeJet: string, record: any) => (
                  <Select
                    value={typeJet || undefined}
                    onChange={(valeur) => modifierJet(record.id, 'typeJet', valeur)}
                    style={{ width: '100%' }}
                    placeholder="Choisir un type"
                    allowClear
                  >
                    {typesJets.map(t => (
                      <Option key={t} value={t}>{t}</Option>
                    ))}
                  </Select>
                ),
              },
              {
                title: 'Résultat',
                dataIndex: 'resultat',
                key: 'resultat',
                render: (resultat: number, record: any) => (
                  <InputNumber
                    value={resultat}
                    onChange={(valeur) => modifierJet(record.id, 'resultat', valeur || 1)}
                    min={1}
                    max={20}
                    style={{ width: '100%' }}
                  />
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                width: 80,
                render: (_: any, record: any) => (
                  <Space>
                    {record.commentaire ? (
                      <Tooltip title={record.commentaire}>
                        <Button
                          type="text"
                          icon={<CommentOutlined />}
                          onClick={() => ouvrirModalCommentaire(record)}
                          style={{
                            color: 'var(--primary-color)',
                            padding: '4px 8px',
                            minWidth: 'auto'
                          }}
                          title="Modifier le commentaire"
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Ajouter un commentaire">
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => ouvrirModalCommentaire(record)}
                          style={{
                            color: 'var(--primary-color)',
                            padding: '4px 8px',
                            minWidth: 'auto'
                          }}
                          title="Ajouter un commentaire"
                        />
                      </Tooltip>
                    )}
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => supprimerJet(record.id)}
                      style={{
                        padding: '4px 8px',
                        minWidth: 'auto'
                      }}
                      title="Supprimer ce jet"
                    />
                  </Space>
                )
              },
            ]}
            dataSource={jetsEdites}
            pagination={{ pageSize: 10 }}
            size="small"
            rowKey="id"
          />
        </div>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal
        title="Confirmer la suppression"
        open={modalSuppressionVisible}
        onCancel={() => setModalSuppressionVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalSuppressionVisible(false)}>
            Annuler
          </Button>,
          <Button key="confirm" type="primary" danger onClick={confirmerSuppression}>
            Supprimer
          </Button>,
        ]}
      >
        <p>
          Êtes-vous sûr de vouloir supprimer définitivement la séance "<strong>{seanceEnEdition?.nom}</strong>" ?
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Cette action est irréversible.
        </p>
      </Modal>

      <Modal
        title={jetEnEdition?.commentaire ? "Modifier le commentaire" : "Ajouter un commentaire"}
        open={modalCommentaireVisible}
        onCancel={() => {
          setModalCommentaireVisible(false);
          setJetEnEdition(null);
          formCommentaire.resetFields();
        }}
        onOk={validerCommentaire}
        okText="Valider"
        cancelText="Annuler"
        destroyOnClose
      >
        <Form
          form={formCommentaire}
          layout="vertical"
        >
          <Form.Item
            name="commentaire"
            label="Commentaire"
          >
            <Input.TextArea
              rows={4}
              placeholder="Entrez votre commentaire..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
} 