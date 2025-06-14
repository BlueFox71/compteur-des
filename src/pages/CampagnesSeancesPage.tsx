import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import List from 'antd/lib/list';
import Modal from 'antd/lib/modal';
import message from 'antd/lib/message';
import Collapse from 'antd/lib/collapse';
import Tag from 'antd/lib/tag';
import { PlusOutlined, DeleteOutlined, EditOutlined, FolderOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import {
  PageContainer,
  StyledCard,
  StyledTitle,
  StyledText,
  GridContainer,
  FlexContainer
} from '../styles';
import styled from 'styled-components';

const { Panel } = Collapse;

// Styled components personnalisés
const StyledTag = styled(Tag)`
  background: var(--background-tertiary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 4px !important;

  &.ant-tag-blue {
    background: rgba(29, 52, 97, 0.2) !important;
    color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
  }

  &.ant-tag-green {
    background: rgba(0, 128, 0, 0.2) !important;
    color: #52c41a !important;
    border-color: #52c41a !important;
  }

  &.ant-tag-orange {
    background: rgba(255, 165, 0, 0.2) !important;
    color: #fa8c16 !important;
    border-color: #fa8c16 !important;
  }
`;

const StyledCollapse = styled(Collapse)`
  background: transparent !important;
  border: none !important;

  .ant-collapse-item {
    background: transparent !important;
    border: none !important;
    margin-bottom: 8px !important;
  }

  .ant-collapse-header {
    background: var(--background-secondary) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    color: var(--text-primary) !important;
    padding: 16px 24px !important;

    &:hover {
      background: var(--background-tertiary) !important;
    }
  }

  .ant-collapse-content {
    background: var(--background-secondary) !important;
    border: 1px solid var(--border-color) !important;
    border-top: none !important;
    border-radius: 0 0 8px 8px !important;
  }

  .ant-collapse-content-box {
    padding: 20px !important;
    background: var(--background-secondary) !important;
  }

  .ant-collapse-item-active .ant-collapse-header {
    border-radius: 8px 8px 0 0 !important;
    border-bottom: none !important;
  }
`;

interface Campagne {
  id: string;
  nom: string;
  dateCreation: string;
}

interface Seance {
  id: string;
  nom: string;
  campagne?: string;
  episode?: string;
  dateDebut: string;
  dateFin: string;
  nombreJets: number;
}

export default function CampagnesSeancesPage() {
  const navigate = useNavigate();
  const [campagnes, setCampagnes] = useState<Campagne[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Compteur de dés - Campagnes & Séances';
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
      console.error('Erreur:', error);
      message.error('Erreur lors du chargement des campagnes');
    }
  };

  const chargerSeances = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/seances');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setSeances(data.seances || []);
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors du chargement des séances');
    }
  };

  const ajouterCampagne = async (values: any) => {
    try {
      setLoading(true);
      const nouvelleCampagne: Campagne = {
        id: Date.now().toString(),
        nom: values.nom,
        dateCreation: new Date().toISOString()
      };

      const nouvellesCampagnes = [...campagnes, nouvelleCampagne];
      
      const response = await fetch('http://localhost:3001/api/campagnes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campagnes: nouvellesCampagnes }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      setCampagnes(nouvellesCampagnes);
      setModalVisible(false);
      form.resetFields();
      message.success(`Campagne "${values.nom}" créée avec succès !`);
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors de la création de la campagne');
    } finally {
      setLoading(false);
    }
  };

  const supprimerCampagne = (campagneId: string) => {
    const campagne = campagnes.find(c => c.id === campagneId);
    const seancesCampagne = seances.filter(s => s.campagne === campagne?.nom);
    
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: seancesCampagne.length > 0 
        ? `Cette campagne contient ${seancesCampagne.length} séance(s). Voulez-vous vraiment la supprimer ?`
        : `Voulez-vous supprimer la campagne "${campagne?.nom}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const nouvellesCampagnes = campagnes.filter(c => c.id !== campagneId);
          
          const response = await fetch('http://localhost:3001/api/campagnes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campagnes: nouvellesCampagnes }),
          });

          if (!response.ok) throw new Error('Erreur lors de la suppression');

          setCampagnes(nouvellesCampagnes);
          message.success('Campagne supprimée avec succès !');
        } catch (error) {
          console.error('Erreur:', error);
          message.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const obtenirSeancesParCampagne = (nomCampagne: string) => {
    return seances.filter(s => s.campagne === nomCampagne);
  };

  const obtenirSeancesSansCampagne = () => {
    return seances.filter(s => !s.campagne);
  };

  const obtenirStatsCampagne = (nomCampagne: string) => {
    const seancesCampagne = obtenirSeancesParCampagne(nomCampagne);
    const totalJets = seancesCampagne.reduce((total, seance) => total + seance.nombreJets, 0);
    return {
      nombreSeances: seancesCampagne.length,
      totalJets: totalJets
    };
  };

  return (
    <PageContainer style={{ flexDirection: 'column', maxWidth: '1200px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <StyledTitle level={1} style={{ fontSize: '32px', marginBottom: '8px' }}>
          🎭 Campagnes & Séances
        </StyledTitle>
        <StyledText $size="lg" $color="secondary">
          Organisez vos aventures par campagnes et épisodes
        </StyledText>
      </div>

      {/* Bouton d'ajout */}
      <FlexContainer $justify="space-between" $align="center" style={{ marginBottom: '24px' }}>
        <StyledTitle level={3} style={{ margin: 0 }}>
          Mes Campagnes
        </StyledTitle>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          style={{
            background: '#1D3461',
            borderColor: '#1D3461',
            borderRadius: '8px',
            height: '40px',
            fontWeight: '600'
          }}
        >
          Nouvelle Campagne
        </Button>
      </FlexContainer>

      {/* Liste des campagnes */}
      <GridContainer $minWidth="300px" $gap="16px" style={{ marginBottom: '32px' }}>
        {campagnes.map(campagne => {
          const stats = obtenirStatsCampagne(campagne.nom);
          return (
            <StyledCard key={campagne.id} style={{ padding: '20px' }}>
              <FlexContainer $justify="space-between" $align="flex-start" style={{ marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <StyledTitle level={4} style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>
                    <FolderOutlined style={{ marginRight: '8px' }} />
                    {campagne.nom}
                  </StyledTitle>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => supprimerCampagne(campagne.id)}
                  style={{ padding: '4px' }}
                />
              </FlexContainer>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', padding: '12px', background: 'var(--background-tertiary)', borderRadius: '6px' }}>
                  <StyledText $weight="bold" $size="lg" $color="primary" $block>
                    {stats.nombreSeances}
                  </StyledText>
                  <StyledText $size="xs" $color="secondary">
                    Séance{stats.nombreSeances > 1 ? 's' : ''}
                  </StyledText>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: 'var(--background-tertiary)', borderRadius: '6px' }}>
                  <StyledText $weight="bold" $size="lg" $color="primary" $block>
                    {stats.totalJets}
                  </StyledText>
                  <StyledText $size="xs" $color="secondary">
                    Jets total
                  </StyledText>
                </div>
              </div>

              {stats.nombreSeances > 0 && (
                <Button 
                  type="link" 
                  style={{ padding: '10px', color: 'var(--primary-color)' }}
                  onClick={() => {
                    const element = document.getElementById(`campagne-${campagne.id}`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Voir les séances →
                </Button>
              )}
            </StyledCard>
          );
        })}
      </GridContainer>

      {/* Séances par campagne */}
      <StyledCard style={{ padding: '24px' }}>
        <StyledTitle level={3} style={{ marginBottom: '20px' }}>
          📚 Séances par Campagne
        </StyledTitle>
        
        <StyledCollapse>
          {campagnes.map(campagne => {
            const seancesCampagne = obtenirSeancesParCampagne(campagne.nom);
            return (
              <Panel
                key={campagne.id}
                header={
                  <div id={`campagne-${campagne.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '16px' }}>
                    <span>
                      <FolderOutlined style={{ marginRight: '8px', color: 'var(--primary-color)' }} />
                      {campagne.nom}
                    </span>
                    <StyledTag color="blue">{seancesCampagne.length} séance{seancesCampagne.length > 1 ? 's' : ''}</StyledTag>
                  </div>
                }
              >
                {seancesCampagne.length > 0 ? (
                  <List
                    dataSource={seancesCampagne.sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())}
                    renderItem={(seance) => (
                      <List.Item 
                        style={{ 
                          padding: '12px 16px',
                          background: 'var(--background-tertiary)', 
                          marginBottom: '8px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)'
                        }}
                        actions={[
                          <Button 
                            key="edit"
                            type="link" 
                            icon={<EyeOutlined />}
                            onClick={() => navigate('/statistiques')}
                            style={{ color: 'var(--primary-color)' }}
                          >
                            Voir la séance
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<PlayCircleOutlined style={{ fontSize: '20px', color: 'var(--primary-color)' }} />}
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{seance.nom}</span>
                              {seance.episode && (
                                <StyledTag color="green">Ép. {seance.episode}</StyledTag>
                              )}
                            </div>
                          }
                          description={
                            <div>
                              <StyledText $size="sm" $color="secondary">
                                {new Date(seance.dateDebut).toLocaleDateString('fr-FR')} • {seance.nombreJets} jets
                              </StyledText>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <StyledText $color="secondary" style={{ textAlign: 'center', padding: '20px' }}>
                    Aucune séance dans cette campagne
                  </StyledText>
                )}
              </Panel>
            );
          })}
          
          {/* Séances sans campagne */}
          {obtenirSeancesSansCampagne().length > 0 && (
            <Panel
              key="sans-campagne"
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '16px' }}>
                  <span>
                    📋 Séances sans campagne
                  </span>
                  <StyledTag color="orange">{obtenirSeancesSansCampagne().length} séance{obtenirSeancesSansCampagne().length > 1 ? 's' : ''}</StyledTag>
                </div>
              }
            >
              <List
                dataSource={obtenirSeancesSansCampagne().sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())}
                renderItem={(seance) => (
                  <List.Item 
                    style={{ 
                      padding: '12px 16px',
                      background: 'var(--background-tertiary)', 
                      marginBottom: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)'
                    }}
                    actions={[
                      <Button 
                        key="edit"
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={() => navigate('/statistiques')}
                        style={{ color: 'var(--primary-color)' }}
                      >
                        Modifier
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<PlayCircleOutlined style={{ fontSize: '20px', color: 'var(--primary-color)' }} />}
                      title={seance.nom}
                      description={
                        <StyledText $size="sm" $color="secondary">
                          {new Date(seance.dateDebut).toLocaleDateString('fr-FR')} • {seance.nombreJets} jets
                        </StyledText>
                      }
                    />
                  </List.Item>
                )}
              />
            </Panel>
          )}
        </StyledCollapse>
      </StyledCard>

      {/* Modal d'ajout de campagne */}
      <Modal
        title="Nouvelle Campagne"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={ajouterCampagne}
        >
          <Form.Item
            name="nom"
            label="Nom de la campagne"
            rules={[
              { required: true, message: 'Le nom est requis' },
              { min: 2, message: 'Le nom doit faire au moins 2 caractères' }
            ]}
          >
            <Input 
              placeholder="Ex: La Malédiction de Strahd, Waterdeep..."
              style={{ height: '40px', borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button 
              onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}
              style={{ marginRight: '8px' }}
            >
              Annuler
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{
                background: '#1D3461',
                borderColor: '#1D3461',
                borderRadius: '8px',
                height: '40px',
                fontWeight: '600'
              }}
            >
              Créer la Campagne
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
} 