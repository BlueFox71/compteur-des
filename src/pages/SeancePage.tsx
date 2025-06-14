import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Typography from 'antd/lib/typography';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import Divider from 'antd/lib/divider';
import Collapse from 'antd/lib/collapse';
import { useAppContext } from '../context/AppReducer';
import { useState, useEffect, useMemo } from 'react';
import {
  PageContainer,
  StyledCard,
  StyledTitle,
  StyledText,
  StyledDivider,
  GridContainer,
} from '../styles';
import TableauJetsParResultat from '../components/TableauJetsParResultat';
import PlayerButtons from '../components/PlayerButtons';
import TypeJetButtons from '../components/TypeJetButtons';
import ResultButtons from '../components/ResultButtons';
import LastJetsList from '../components/LastJetsList';
import { API_URL } from '../utils/api';

const { useForm } = Form;
const { Panel } = Collapse;
const { Option } = Select;

function isMobile() {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 900;
  }
  return false;
}

export default function SeancePage() {
  const { state, dispatch } = useAppContext();
  const [form] = useForm();
  const [seanceForm] = useForm();
  const [selectedJoueur, setSelectedJoueur] = useState<string>();
  const [selectedTypeJet, setSelectedTypeJet] = useState<string>();
  const [selectedResultat, setSelectedResultat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(isMobile());

  useEffect(() => {
    document.title = 'Compteur de dés - Séance';
    chargerCampagnes();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(isMobile());
    window.addEventListener('resize', handleResize);
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

  // Calculer les statistiques par joueur
  const statsJoueurs = useMemo(() => {
    if (!state.jets || state.jets.length === 0) return [];
    
    const joueursStats = new Map();
    
    state.jets.forEach(jet => {
      const joueur = jet.joueur;
      if (!joueursStats.has(joueur)) {
        joueursStats.set(joueur, {
          nom: joueur,
          nombreJets: 0,
          dernierJet: null
        });
      }
      
      const stats = joueursStats.get(joueur);
      stats.nombreJets += 1;
      stats.dernierJet = jet.resultat;
    });
    
    return Array.from(joueursStats.values()).sort((a, b) => b.nombreJets - a.nombreJets);
  }, [state.jets]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/jets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      const data = await response.json();
      dispatch({ type: 'ADD_JET', payload: data.jet });
      form.resetFields();
      setSelectedJoueur(undefined);
      setSelectedResultat(null);
      form.setFieldValue('typeJet', selectedTypeJet);
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la sauvegarde du jet');
    } finally {
      setLoading(false);
    }
  };

  const handleFinirSeance = () => {
    setModalVisible(true);
  };

  const handleFinirSeanceConfirm = async () => {
    try {
      const values = await seanceForm.validateFields();
      
      // Enregistrer la séance avec tous les jets
      const seanceData = {
        nom: values.nom,
        duree: values.duree,
        campagne: values.campagne,
        episode: values.episode,
        jets: state.jets,
        dateDebut: new Date().toISOString(),
        nombreJets: state.jets.length
      };
      
      const response = await fetch(`${API_URL}/api/seances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seanceData),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde de la séance');
      
      // Réinitialiser les jets
      dispatch({ type: 'CLEAR_JETS' });
      setModalVisible(false);
      seanceForm.resetFields();
      message.success('Séance terminée et sauvegardée avec succès !');
    } catch (error) {
      console.error('Erreur complète:', error);
      message.error('Erreur lors de la sauvegarde de la séance');
    }
  };

  return (
    <PageContainer>
      <div className="seance-cards-row">
        <StyledCard $flex="0 0 70%">
          {isMobileScreen && (
            <Button type="link" onClick={() => setShowStats(s => !s)} className="supertext-link" style={{ marginBottom: 16 }}>
              {showStats ? 'Masquer les statistiques' : 'Afficher les statistiques'}
            </Button>
          )}
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <StyledTitle $level={3}>
              Séance actuelle
            </StyledTitle>
            <Form.Item
              label="Type de jet"
              name="typeJet"
              rules={[{ required: true, message: 'Veuillez sélectionner un type de jet' }]}
            >
              <TypeJetButtons
                types={state.typesJets}
                selected={selectedTypeJet}
                onSelect={type => {
                  setSelectedTypeJet(type);
                  form.setFieldValue('typeJet', type);
                }}
              />
            </Form.Item>

            <Form.Item
              label="Joueur"
              name="joueur"
              rules={[{ required: true, message: 'Veuillez sélectionner un joueur' }]}
            >
              <PlayerButtons
                joueurs={state.joueurs}
                selected={selectedJoueur}
                onSelect={nom => {
                  setSelectedJoueur(nom);
                  form.setFieldValue('joueur', nom);
                }}
              />
            </Form.Item>

            <Form.Item
              name="resultat"
              label="Résultat"
              rules={[{ required: true, message: 'Veuillez sélectionner un résultat' }]}
            >
              <ResultButtons
                selected={selectedResultat}
                onSelect={value => {
                  setSelectedResultat(value);
                  form.setFieldValue('resultat', value);
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading} 
                block 
                className={`custom-btn ${(!selectedJoueur || !selectedTypeJet || selectedResultat === null) ? 'btn-disabled' : ''}`}
                disabled={!selectedJoueur || !selectedTypeJet || selectedResultat === null}
              >
                Enregistrer le jet
              </Button>
            </Form.Item>
          </Form>

          {/* Statistiques par joueur */}
          {(isMobileScreen ? showStats : true) && statsJoueurs.length > 0 && (
            <>
              <StyledDivider />
              <StyledTitle $level={4}>
                Jets par joueur
              </StyledTitle>
              <GridContainer $minWidth="200px" $gap="12px">
                {statsJoueurs.map(joueur => (
                  <div
                    key={joueur.nom}
                    style={{
                      background: 'var(--background-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <StyledText $weight="semibold" $block>
                      {joueur.nom}
                    </StyledText>
                    <StyledText $color="primary" $size="lg" $weight="bold" $block>
                      {joueur.nombreJets} jet{joueur.nombreJets > 1 ? 's' : ''}
                    </StyledText>
                    {joueur.dernierJet && (
                      <StyledText $color="secondary" $size="xs" $block>
                        Dernier : {joueur.dernierJet}
                      </StyledText>
                    )}
                  </div>
                ))}
              </GridContainer>
              <StyledText $color="secondary" $size="sm" $block style={{ textAlign: 'center' }}>
                Total : {state.jets.length} jet{state.jets.length > 1 ? 's' : ''}
              </StyledText>
            </>
          )}

          {/* Tableau des jets par résultat */}
          {(isMobileScreen ? showStats : true) && state.jets.length > 0 && (
            <>
              <Divider style={{ borderColor: 'var(--background-tertiary)', margin: '24px 0 16px 0' }} />
              <Collapse 
                style={{ 
                  backgroundColor: 'var(--background-secondary)',
                  border: '1px solid var(--background-tertiary)'
                }}
                className="custom-collapse"
              >
                <Panel 
                  header="Tableau des jets par résultat (1-20)" 
                  key="1"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <TableauJetsParResultat jets={state.jets} />
                </Panel>
              </Collapse>
            </>
          )}
        </StyledCard>

        <StyledCard $flex="0 0 30%">
          <StyledTitle $level={3}>
            Derniers jets
          </StyledTitle>
          <LastJetsList jets={state.jets} onFinirSeance={handleFinirSeance} />
        </StyledCard>
      </div>

      <Modal
        title={<div style={{ textAlign: 'center' }}>Finir la séance</div>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={seanceForm}
          layout="vertical"
          onFinish={handleFinirSeanceConfirm}
          initialValues={{ duree: 4, nom: "" }}
        >
          <Form.Item
            label="Nom de la séance"
            name="nom"
            rules={[{ required: true, message: 'Veuillez saisir le nom de la séance' }]}
          >
            <Input placeholder="Ex: Séance du samedi soir" />
          </Form.Item>

          <Form.Item
            label="Durée de la séance (en heures)"
            name="duree"
            rules={[
              { required: true, message: 'Veuillez saisir la durée de la séance' },
              { type: 'number', min: 0.1, max: 24, message: 'La durée doit être entre 0.1 et 24 heures' }
            ]}
          >
            <InputNumber
              min={0.1}
              max={24}
              step={0.25}
              style={{ width: '100%' }}
              placeholder="2.5"
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Campagne (optionnel)"
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

            <Form.Item
              label="Épisode (optionnel)"
              name="episode"
            >
              <Input 
                placeholder="Ex: 1, 2.1, A..."
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <div style={{ 
            background: 'var(--background-secondary)', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <Typography.Text style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
              Nombre de jets enregistrés pendant cette séance : <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{state.jets.length}</span>
            </Typography.Text>
          </div>

          <Form.Item>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" className="custom-btn">
               Valider
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
} 