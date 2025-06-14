import { useEffect, useState } from 'react';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import { FileTextOutlined, UploadOutlined, CopyOutlined } from '@ant-design/icons';
import { 
  PageContainer, 
  StyledCard, 
  StyledTitle, 
  StyledText,
  FlexContainer
} from '../styles';
import styled from 'styled-components';

const { useForm } = Form;
const { TextArea } = Input;
const { Option, OptGroup } = Select;

interface Seance {
  id: string;
  nom: string;
  campagne?: string;
  episode?: string;
  jets: Array<{
    id?: string;
    joueur: string;
    typeJet: string;
    resultat: number;
    date: string;
  }>;
  dateDebut: string;
  dateFin: string;
  nombreJets: number;
}

// Styled component pour le tableau d'aperçu
const TableauApercu = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-family: monospace;
  font-size: 14px;
  
  th, td {
    padding: 8px;
    text-align: center;
    border: 1px solid var(--border-color);
  }
  
  th {
    background: var(--background-tertiary);
    font-weight: bold;
  }

  td:first-child {
    font-weight: bold;
    background: var(--background-tertiary);
  }
`;

export default function DonneesPage() {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [importForm] = useForm();
  const [importLoading, setImportLoading] = useState(false);
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [seanceSelectionnee, setSeanceSelectionnee] = useState<Seance | null>(null);
  const [messageCopie, setMessageCopie] = useState<string>('');

  useEffect(() => {
    document.title = 'Compteur de dés - Gestion des Données';
    chargerCampagnes();
    chargerSeances();
  }, []);

  const chargerCampagnes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/campagnes');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setCampagnes(data.campagnes || []);
    } catch (error) {
      console.error('Erreur lors du chargement des campagnes:', error);
    }
  };

  const chargerSeances = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/seances');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setSeances(data.seances || []);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
    }
  };

  const parseExcelData = (textData: string, joueurs: string[], hasEmptyFirstCell: boolean = true) => {
    const jets: any[] = [];
    const lines = textData.trim().split('\n');
    let jetCounter = 1; // Compteur global pour numéroter les jets
    
    console.log('Parsing TABLEAU DE FRÉQUENCES avec joueurs:', joueurs, 'hasEmptyFirstCell:', hasEmptyFirstCell);
    
    // Ignorer la première ligne (en-têtes des joueurs)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cells = line.split('\t');
      
      // Déterminer le résultat du dé selon le format
      let resultatDe: number;
      let startCol: number;
      
      if (hasEmptyFirstCell) {
        // Format fréquence : [resultat_de, count_jules, count_ange, count_marie]
        resultatDe = parseInt(cells[0]);
        startCol = 1;
      } else {
        // Format direct : [count_jules, count_ange, count_marie] 
        // Dans ce cas, le résultat du dé correspond au numéro de ligne
        resultatDe = i;
        startCol = 0;
      }
      
      console.log(`Ligne ${i}: cells =`, cells, `resultatDe = ${resultatDe}, startCol = ${startCol}`);
      
      if (isNaN(resultatDe) || resultatDe < 1 || resultatDe > 20) continue;
      
      // Pour chaque joueur
      for (let j = startCol; j < cells.length && j - startCol < joueurs.length; j++) {
        const countStr = cells[j]?.trim();
        const joueur = joueurs[j - startCol];
        
        console.log(`  Colonne ${j}: count = "${countStr}", joueur = "${joueur}", resultatDe = ${resultatDe}`);
        
        let count: number;
        
        // Cellule vide = 0 jets
        if (!countStr || countStr === '') {
          count = 0;
          console.log(`    Cellule vide, 0 jets pour résultat ${resultatDe}`);
        } else {
          count = parseInt(countStr);
          if (isNaN(count) || count < 0) {
            console.log(`    Count invalide: ${countStr} -> ${count}`);
            continue;
          }
        }
        
        // Créer 'count' jets pour ce joueur avec ce résultat
        for (let k = 0; k < count; k++) {
          const jet = {
            joueur: joueur,
            typeJet: 'Type Inconnu',
            resultat: resultatDe,
            jetNumber: jetCounter++
          };
          console.log(`    Jet ${k + 1}/${count} ajouté:`, jet);
          jets.push(jet);
        }
      }
    }
    
    console.log('Jets finaux (tableau de fréquences):', jets);
    return jets.sort((a, b) => a.jetNumber - b.jetNumber);
  };

  const handleImportSeance = async (values: any) => {
    try {
      setImportLoading(true);
      message.loading('Import en cours...', 0);
      
      const { nomSeance, duree, donneesExcel, campagne, episode } = values;
      
      // Parser les données Excel
      const lines = donneesExcel.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('Format de données invalide');
      }
      
      // Extraire les noms des joueurs de la première ligne
      const headerLine = lines[0].trim();
      console.log('Header line:', JSON.stringify(headerLine));
      
      const headerCells = headerLine.split('\t');
      console.log('Header cells:', headerCells);
      
      // Détecter le format en analysant la première ligne de données
      const firstDataLine = lines.length > 1 ? lines[1].trim() : '';
      const firstDataCells = firstDataLine.split('\t');
      
      console.log('FirstDataLine:', JSON.stringify(firstDataLine));
      console.log('FirstDataCells:', firstDataCells);
      console.log('Header length:', headerCells.length, 'Data length:', firstDataCells.length);
      
      // Si les données ont une colonne de plus que l'en-tête, c'est qu'il y a des numéros de ligne
      let joueurs: string[];
      let hasEmptyFirstCell: boolean;
      
      if (firstDataCells.length > headerCells.length && !isNaN(parseInt(firstDataCells[0]))) {
        // Format avec numéros : en-tête = [Jules, Ange, Marie], données = [1, res_jules, res_ange, res_marie]
        joueurs = headerCells.filter((nom: string) => nom && nom.trim() !== '');
        hasEmptyFirstCell = true;
        console.log('Format détecté: en-tête sans numéro, données avec numéros');
      } else if (headerCells[0] === '' || headerCells[0].trim() === '') {
        // Format classique : en-tête = [vide, Jules, Ange, Marie], données = [1, res_jules, res_ange, res_marie]
        joueurs = headerCells.slice(1).filter((nom: string) => nom && nom.trim() !== '');
        hasEmptyFirstCell = true;
        console.log('Format détecté: en-tête avec cellule vide');
      } else {
        // Format direct : [Jules, Ange, Marie] (données directement sans numéros)
        joueurs = headerCells.filter((nom: string) => nom && nom.trim() !== '');
        hasEmptyFirstCell = false;
        console.log('Format détecté: données directes sans numéros');
      }
      console.log('Joueurs trouvés:', joueurs);
      console.log('hasEmptyFirstCell:', hasEmptyFirstCell);
      
              if (joueurs.length === 0) {
          throw new Error('Aucun joueur trouvé dans les données');
        }
        
        // Parser les jets
        const jets = parseExcelData(donneesExcel, joueurs, hasEmptyFirstCell);
      console.log('Jets parsés:', jets);
      
      if (jets.length === 0) {
        throw new Error('Aucun jet valide trouvé dans les données');
      }
      
      // Créer la séance
      const seanceData = {
        nom: nomSeance,
        dateDebut: new Date().toISOString(),
        dateFin: new Date().toISOString(),
        duree: duree || 'Non spécifiée',
        nombreJets: jets.length,
        jets: jets,
        importee: true,
        typeJetInconnu: true,
        ...(campagne && { campagne }),
        ...(episode && { episode })
      };
      
      // Sauvegarder via l'API
      const response = await fetch('http://localhost:3001/api/seances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seanceData),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      message.destroy();
      message.success(`✅ Séance "${nomSeance}" importée avec succès ! ${jets.length} jets importés pour ${joueurs.length} joueurs (${joueurs.join(', ')}) dans la campagne "${campagne}".`, 6);
      importForm.resetFields();
      
    } catch (error) {
      console.error('Erreur import:', error);
      message.destroy();
      message.error(`❌ Erreur lors de l'import : ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 8);
    } finally {
      setImportLoading(false);
    }
  };

  // Fonction pour formater le tableau de séance
  const formaterTableauSeance = (seance: Seance): string => {
    if (!seance.jets || seance.jets.length === 0) return '';

    // Obtenir tous les joueurs uniques
    const joueurs = Array.from(new Set(seance.jets.map(jet => jet.joueur)));

    // Créer l'en-tête
    let tableau = '\t' + joueurs.join('\t') + '\n';

    // Créer un compteur pour chaque résultat (1-20) et chaque joueur
    const compteurJets = new Map<number, { [joueur: string]: number }>();
    
    // Initialiser le compteur pour tous les résultats possibles (1-20)
    for (let i = 1; i <= 20; i++) {
      compteurJets.set(i, {});
      joueurs.forEach(joueur => {
        compteurJets.get(i)![joueur] = 0;
      });
    }

    // Compter les jets pour chaque joueur et chaque résultat
    seance.jets.forEach(jet => {
      const resultat = jet.resultat;
      const joueur = jet.joueur;
      if (resultat >= 1 && resultat <= 20) {
        compteurJets.get(resultat)![joueur]++;
      }
    });

    // Créer les lignes du tableau
    for (let resultat = 1; resultat <= 20; resultat++) {
      const ligne = [resultat.toString()];
      joueurs.forEach(joueur => {
        ligne.push(compteurJets.get(resultat)![joueur].toString());
      });
      tableau += ligne.join('\t') + '\n';
    }

    return tableau;
  };

  // Fonction pour copier le tableau dans le presse-papier
  const copierTableauSeance = (seance: Seance) => {
    const tableau = formaterTableauSeance(seance);
    if (tableau) {
      navigator.clipboard.writeText(tableau).then(() => {
        setMessageCopie('Tableau copié !');
        setTimeout(() => setMessageCopie(''), 2000);
      }).catch(() => {
        message.error('Erreur lors de la copie du tableau');
      });
    }
  };

  // Fonction pour générer l'aperçu du tableau
  const genererApercuTableau = (seance: Seance | null) => {
    if (!seance) return null;

    const joueurs = Array.from(new Set(seance.jets.map(jet => jet.joueur)));
    const compteurJets = new Map<number, { [joueur: string]: number }>();
    
    // Initialiser le compteur
    for (let i = 1; i <= 20; i++) {
      compteurJets.set(i, {});
      joueurs.forEach(joueur => {
        compteurJets.get(i)![joueur] = 0;
      });
    }

    // Compter les jets
    seance.jets.forEach(jet => {
      const resultat = jet.resultat;
      const joueur = jet.joueur;
      if (resultat >= 1 && resultat <= 20) {
        compteurJets.get(resultat)![joueur]++;
      }
    });

    return (
      <TableauApercu>
        <thead>
          <tr>
            <th>#</th>
            {joueurs.map(joueur => (
              <th key={joueur}>{joueur}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(resultat => (
            <tr key={resultat}>
              <td>{resultat}</td>
              {joueurs.map(joueur => (
                <td key={joueur}>{compteurJets.get(resultat)![joueur]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </TableauApercu>
    );
  };

  return (
    <PageContainer style={{ flexDirection: 'column', maxWidth: '900px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <StyledTitle level={1} style={{ fontSize: '32px', marginBottom: '8px' }}>
          💾 Gestion des Données
        </StyledTitle>
        <StyledText $size="lg" $color="secondary">
          Import, export et sauvegarde de vos séances
        </StyledText>
      </div>

      {/* Import de séance */}
      <StyledCard style={{ width: '100%', padding: '32px', marginBottom: '24px' }}>
        <FlexContainer $direction="column" $gap="24px">
          <div style={{ textAlign: 'center' }}>
            <StyledTitle level={3} style={{ marginBottom: '8px' }}>
              📊 Importer une Séance Excel
            </StyledTitle>
            <StyledText $color="secondary">
              Importez vos données depuis un tableau Excel copié
            </StyledText>
          </div>

          <Form
            form={importForm}
            layout="vertical"
            onFinish={handleImportSeance}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <Form.Item
                name="nomSeance"
                label={<StyledText $weight="semibold">Nom de la séance</StyledText>}
                rules={[{ required: true, message: 'Nom requis' }]}
              >
                <Input 
                  placeholder="Ex: Séance D&D du 15/01"
                  style={{ borderRadius: '8px', height: '40px' }}
                />
              </Form.Item>

              <Form.Item
                name="duree"
                label={<StyledText $weight="semibold">Durée</StyledText>}
                rules={[{ required: true, message: 'Durée requise' }]}
              >
                <Input 
                  placeholder="Ex: 3h30"
                  style={{ borderRadius: '8px', height: '40px' }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <Form.Item
                name="campagne"
                label={<StyledText $weight="semibold">Campagne</StyledText>}
                rules={[{ required: true, message: 'Campagne requise' }]}
              >
                <Select
                  placeholder="Choisir une campagne"
                  style={{ height: '40px' }}
                >
                  {campagnes.map(campagne => (
                    <Option key={campagne.id} value={campagne.nom}>
                      {campagne.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="episode"
                label={<StyledText $weight="semibold">Épisode</StyledText>}
                rules={[{ required: true, message: 'Épisode requis' }]}
              >
                <Input 
                  placeholder="Ex: 1, 2A, Prologue..."
                  style={{ borderRadius: '8px', height: '40px' }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="donneesExcel"
              label={<StyledText $weight="semibold">Données Excel (Copier-Coller depuis Excel)</StyledText>}
              rules={[{ required: true, message: 'Données requises' }]}
            >
              <TextArea
                placeholder={`Collez vos données Excel ici. Format attendu (TABLEAU DE FRÉQUENCES) :

	Jules	Ange	Marie
1	3	11	6     ← Jules a fait 3 fois le résultat 1
2	6	9	1     ← Jules a fait 6 fois le résultat 2
3	6	7	2     ← etc...
...`}
                rows={12}
                style={{ 
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={importLoading}
                icon={<UploadOutlined />}
                style={{
                  background: '#1D3461',
                  borderColor: '#1D3461',
                  borderRadius: '8px',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Importer la Séance
              </Button>
            </div>
          </Form>
        </FlexContainer>
      </StyledCard>

      {/* Export de séance */}
      <StyledCard style={{ width: '100%', padding: '32px', marginBottom: '24px' }}>
        <FlexContainer $direction="column" $gap="24px">
          <div style={{ textAlign: 'center' }}>
            <StyledTitle level={3} style={{ marginBottom: '8px' }}>
              📋 Exporter une Séance
            </StyledTitle>
            <StyledText $color="secondary">
              Copiez une séance au format tableau
            </StyledText>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Select
              style={{ width: '100%' }}
              placeholder="Choisir une séance"
              value={seanceSelectionnee?.id}
              onChange={(value) => {
                const seance = seances.find(s => s.id === value);
                setSeanceSelectionnee(seance || null);
              }}
            >
              {/* Séances organisées par campagne */}
              {campagnes.map(campagne => {
                const seancesCampagne = seances.filter(s => s.campagne === campagne.nom);
                if (seancesCampagne.length === 0) return null;
                
                return (
                  <OptGroup key={campagne.id} label={`🎭 ${campagne.nom}`}>
                    {seancesCampagne
                      .sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime())
                      .map(seance => (
                        <Option key={seance.id} value={seance.id}>
                          {seance.nom}
                          {seance.episode ? ` (Ép. ${seance.episode})` : ''}
                        </Option>
                      ))}
                  </OptGroup>
                );
              })}
              
              {/* Séances sans campagne */}
              {(() => {
                const seancesSansCampagne = seances.filter(s => !s.campagne);
                if (seancesSansCampagne.length === 0) return null;
                
                return (
                  <OptGroup label="📋 Séances sans campagne">
                    {seancesSansCampagne
                      .sort((a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime())
                      .map(seance => (
                        <Option key={seance.id} value={seance.id}>
                          {seance.nom}
                        </Option>
                      ))}
                  </OptGroup>
                );
              })()}
            </Select>

            {seanceSelectionnee && (
              <>
                <div style={{ 
                  background: 'var(--background-secondary)', 
                  padding: '16px', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <StyledText $weight="semibold" $block style={{ marginBottom: '8px' }}>
                    Aperçu du tableau
                  </StyledText>
                  {genererApercuTableau(seanceSelectionnee)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                  {messageCopie && (
                    <span style={{ color: 'var(--primary-color)' }}>{messageCopie}</span>
                  )}
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={() => seanceSelectionnee && copierTableauSeance(seanceSelectionnee)}
                  >
                    Copier la séance
                  </Button>
                </div>
              </>
            )}
          </div>
        </FlexContainer>
      </StyledCard>
    </PageContainer>
  );
} 