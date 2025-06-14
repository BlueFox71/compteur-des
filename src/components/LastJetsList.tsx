import List from 'antd/lib/list';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import InputNumber from 'antd/lib/input-number';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import Tooltip from 'antd/lib/tooltip';
import { EditOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { JetDeDes } from '../context/AppReducer';
import { useAppContext } from '../context/AppReducer';
import styled from 'styled-components';
import { API_URL } from '../utils/api';

const CommentaireText = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  margin-left: 58px;
`;

interface LastJetsListProps {
  jets: JetDeDes[];
  onFinirSeance: () => void;
}

function formatHeure(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function LastJetsList({ jets, onFinirSeance }: LastJetsListProps) {
  const { state, dispatch } = useAppContext();
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [jetEnCours, setJetEnCours] = useState<JetDeDes | null>(null);

  const handleModifierJet = (jet: JetDeDes) => {
    setJetEnCours(jet);
    form.setFieldsValue({
      joueur: jet.joueur,
      typeJet: jet.typeJet,
      resultat: jet.resultat,
      commentaire: jet.commentaire || ''
    });
    setModalVisible(true);
  };

  const handleValiderModification = async () => {
    try {
      const values = await form.validateFields();
      
      if (!jetEnCours) return;

      // Créer le jet modifié
      const jetModifie = {
        ...jetEnCours,
        joueur: values.joueur,
        typeJet: values.typeJet,
        resultat: values.resultat,
        commentaire: values.commentaire || undefined
      };

      // Sauvegarder côté serveur
      const response = await fetch(`${API_URL}/api/jets/${jetEnCours.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jetModifie),
      });
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde côté serveur');

      // Mettre à jour le jet dans le state
      dispatch({ type: 'UPDATE_JET', payload: { id: jetEnCours.id!, jet: jetModifie } });
      
      // Fermer la modale
      setModalVisible(false);
      setJetEnCours(null);
      form.resetFields();
      
      message.success('Jet modifié et sauvegardé !');
    } catch (error) {
      message.error('Erreur lors de la modification du jet');
    }
  };

  const handleAnnulerModification = () => {
    setModalVisible(false);
    setJetEnCours(null);
    form.resetFields();
  };

  return (
    <div>
      <List
        dataSource={jets.slice().reverse()}
        renderItem={(jet: JetDeDes) => (
          jet.joueur && jet.typeJet && jet.resultat ? (
            <List.Item 
              style={{ 
                border: 'none', 
                padding: '12px 0', 
                fontSize: 18, 
                color: 'var(--text-primary)', 
                background: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 600, marginRight: 12 }}>
                    {formatHeure(jet.date)}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {jet.joueur} a fait <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{jet.resultat}</span> en <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{jet.typeJet.toLowerCase()}</span>
                  </span>
                </div>
                {jet.commentaire && (
                  <Tooltip 
                    title={jet.commentaire}
                    placement="bottom"
                    overlayStyle={{
                      maxWidth: '400px',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    <CommentaireText>
                      {jet.commentaire}
                    </CommentaireText>
                  </Tooltip>
                )}
              </div>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleModifierJet(jet)}
                style={{
                  color: 'var(--primary-color)',
                  padding: '4px 8px',
                  minWidth: 'auto'
                }}
                title="Modifier ce jet"
              />
            </List.Item>
          ) : null
        )}
        locale={{ emptyText: <span style={{ color: 'var(--text-primary)', opacity: 0.7 }}>Aucun jet enregistré pour l'instant.</span> }}
        style={{ 
          background: 'none',
          minHeight: '370px',
          maxHeight: '370px',
          overflowY: 'auto',
          paddingRight: '8px',
          marginBottom: '16px'
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <Button 
          type="primary" 
          onClick={onFinirSeance}
          className={`custom-btn ${jets.length === 0 ? 'btn-disabled' : ''}`}
          style={{ width: '150px' }}
          disabled={jets.length === 0}
        >
          Finir la séance
        </Button>
      </div>

      <Modal
        title="Modifier le jet"
        open={modalVisible}
        onCancel={handleAnnulerModification}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleValiderModification}
        >
          <Form.Item
            label="Joueur"
            name="joueur"
            rules={[{ required: true, message: 'Veuillez sélectionner un joueur' }]}
          >
            <Select placeholder="Sélectionner un joueur">
              {state.joueurs.map(joueur => (
                <Select.Option key={joueur.nom} value={joueur.nom}>
                  {joueur.nom}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Type de jet"
            name="typeJet"
            rules={[{ required: true, message: 'Veuillez sélectionner un type de jet' }]}
          >
            <Select placeholder="Sélectionner un type de jet">
              {state.typesJets.map(type => (
                <Select.Option key={type.type} value={type.type}>
                  {type.type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Résultat"
            name="resultat"
            rules={[
              { required: true, message: 'Veuillez saisir le résultat' },
              { type: 'number', min: 1, max: 20, message: 'Le résultat doit être entre 1 et 20' }
            ]}
          >
            <InputNumber
              min={1}
              max={20}
              style={{ width: '100%' }}
              placeholder="Résultat du jet"
            />
          </Form.Item>

          <Form.Item
            label="Commentaire"
            name="commentaire"
          >
            <Input.TextArea
              placeholder="Décrire la situation du jet (optionnel)"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button onClick={handleAnnulerModification}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" className="custom-btn">
                Valider
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 