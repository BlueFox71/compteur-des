import { useEffect, useState } from 'react';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import message from 'antd/lib/message';
import { PlusOutlined } from '@ant-design/icons';
import { useAppContext } from '../context/AppReducer';
import { 
  PageContainer, 
  StyledCard, 
  StyledTitle, 
  StyledText,
  FlexContainer 
} from '../styles';
import { API_URL } from '../utils/api';

const { useForm } = Form;
const { Option } = Select;

export default function JoueursTypesPage() {
  const { state, dispatch } = useAppContext();
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Compteur de dés - Joueurs et Types de Jets';
  }, []);

  // Initialiser le formulaire avec les données du context
  form.setFieldsValue({ joueurs: state.joueurs, typesJets: state.typesJets });

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      const data = await response.json();
      dispatch({ type: 'SET_JOUEURS', payload: data.joueurs || [] });
      dispatch({ type: 'SET_TYPES_JETS', payload: data.typesJets || [] });
      message.success('Configuration sauvegardée !');
    } catch (error) {
      message.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer style={{ flexDirection: 'column', maxWidth: '800px' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <StyledTitle level={1} style={{ fontSize: '32px', marginBottom: '8px' }}>
          🎮 Joueurs & Types de Jets
        </StyledTitle>
        <StyledText $size="lg" $color="secondary">
          Configurez qui joue et les types de jets disponibles
        </StyledText>
      </div>

      <StyledCard style={{ width: '100%', padding: '32px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ joueurs: state.joueurs, typesJets: state.typesJets }}
          onFinish={handleSave}
          style={{ width: '100%' }}
        >
          {/* Section Joueurs */}
          <div style={{ marginBottom: '48px' }}>
            <StyledTitle level={3} style={{ marginBottom: '24px', textAlign: 'left' }}>
              👥 Joueurs
            </StyledTitle>
            <Form.List name="joueurs">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <StyledCard key={field.key} style={{ marginBottom: '16px', padding: '16px' }}>
                      <FlexContainer $justify="space-between" $align="center">
                        <div style={{ flex: 1, marginRight: '16px' }}>
                          <StyledText $weight="semibold" $block style={{ marginBottom: '8px' }}>
                            Joueur {index + 1}
                          </StyledText>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'nom']}
                              rules={[{ required: true, message: 'Nom requis' }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input 
                                placeholder="Nom du joueur" 
                                style={{ borderRadius: '8px' }}
                              />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, 'sexe']}
                              initialValue="M"
                              style={{ marginBottom: 0 }}
                            >
                              <Select
                                placeholder="Sexe"
                                style={{ borderRadius: '8px' }}
                              >
                                <Option value="M">M</Option>
                                <Option value="F">F</Option>
                              </Select>
                            </Form.Item>
                          </div>
                        </div>
                        <Button 
                          type="text" 
                          onClick={() => remove(field.name)} 
                          danger
                          style={{
                            borderRadius: '8px',
                            padding: '8px 12px'
                          }}
                        >
                          Supprimer
                        </Button>
                      </FlexContainer>
                    </StyledCard>
                  ))}
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add({ sexe: 'M' })} 
                      block 
                      icon={<PlusOutlined />}
                      style={{
                        borderRadius: '8px',
                        height: '48px',
                        borderColor: '#1D3461',
                        color: '#1D3461',
                        fontWeight: '600'
                      }}
                    >
                      Ajouter un joueur
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          {/* Section Types de Jets */}
          <div style={{ marginBottom: '48px' }}>
            <StyledTitle level={3} style={{ marginBottom: '24px', textAlign: 'left' }}>
              🎲 Types de Jets
            </StyledTitle>
            <Form.List name="typesJets">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <StyledCard key={field.key} style={{ marginBottom: '16px', padding: '16px' }}>
                      <FlexContainer $justify="space-between" $align="center">
                        <div style={{ flex: 1, marginRight: '16px' }}>
                          <StyledText $weight="semibold" $block style={{ marginBottom: '8px' }}>
                            Type {index + 1}
                          </StyledText>
                          <Form.Item
                            {...field}
                            name={[field.name, 'type']}
                            rules={[{ required: true, message: 'Type requis' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="Type de jet (ex: Attaque, Sauvegarde, etc.)" 
                              style={{ borderRadius: '8px' }}
                            />
                          </Form.Item>
                        </div>
                        <Button 
                          type="text" 
                          onClick={() => remove(field.name)} 
                          danger
                          style={{
                            borderRadius: '8px',
                            padding: '8px 12px'
                          }}
                        >
                          Supprimer
                        </Button>
                      </FlexContainer>
                    </StyledCard>
                  ))}
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                      style={{
                        borderRadius: '8px',
                        height: '48px',
                        borderColor: '#1D3461',
                        color: '#1D3461',
                        fontWeight: '600'
                      }}
                    >
                      Ajouter un type de jet
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          {/* Bouton de sauvegarde */}
          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
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
              💾 Sauvegarder la configuration
            </Button>
          </Form.Item>
        </Form>
      </StyledCard>
    </PageContainer>
  );
} 