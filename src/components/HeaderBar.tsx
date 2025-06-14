import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import Typography from 'antd/lib/typography';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import { HomeOutlined, HistoryOutlined, BarChartOutlined, SettingOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const { Header } = Layout;
const { Title } = Typography;

export default function HeaderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, setIsAdmin } = useAdmin();
  const [modalVisible, setModalVisible] = useState(false);
  const [motDePasse, setMotDePasse] = useState('');
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const ouvrirModalConnexion = () => {
    setModalVisible(true);
    setMotDePasse('');
  };

  const fermerModal = () => {
    setModalVisible(false);
    setMotDePasse('');
  };

  const connecterAdmin = () => {
    if (motDePasse === '13351') {
      setIsAdmin(true);
      message.success('Connexion administrateur réussie !');
      fermerModal();
    } else {
      message.error('Mot de passe incorrect');
      setMotDePasse('');
    }
  };

  const deconnecterAdmin = () => {
    setIsAdmin(false);
    message.info('Déconnexion administrateur');
    navigate('/statistiques');
  };

  // Déterminer la clé sélectionnée selon la route actuelle
  const getSelectedKey = () => {
    if (location.pathname === '/') return ['accueil'];
    if (location.pathname === '/seance') return ['seance'];
    if (location.pathname === '/statistiques') return ['statistiques'];
    if (location.pathname === '/config') return ['parametres'];
    return [];
  };

  return (
    <>
      <Header 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 16px',
          position: 'relative',
          flexWrap: 'wrap'
        }}
        className="responsive-header"
      >
        {/* Titre à gauche */}
        <div style={{ cursor: 'pointer', flex: '1 1 auto' }} onClick={() => navigate('/')}>
          <Title level={3} style={{ color: 'var(--text-primary)', margin: 0, fontSize: 'clamp(16px, 4vw, 20px)' }}>
            <span className="desktop-title">Compteur de Dés</span>
            <span className="mobile-title">Compteur</span>
            {isAdmin && (
              <span style={{ fontSize: '12px', color: 'var(--primary-color)', marginLeft: '8px' }}>
                (Admin)
              </span>
            )}
          </Title>
        </div>

        {/* Menu Desktop - caché sur mobile */}
        <div className="desktop-menu" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={getSelectedKey()}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              lineHeight: '64px'
            }}
          >
            <Menu.Item 
              key="accueil" 
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Accueil
            </Menu.Item>
            
            {isAdmin && (
              <Menu.Item 
                key="seance" 
                icon={<HistoryOutlined />}
                onClick={() => navigate('/seance')}
              >
                Séance en cours
              </Menu.Item>
            )}
            
            <Menu.Item 
              key="statistiques" 
              icon={<BarChartOutlined />}
              onClick={() => navigate('/statistiques')}
            >
              Séances & Statistiques
            </Menu.Item>
            
            {isAdmin && (
              <Menu.Item 
                key="parametres" 
                icon={<SettingOutlined />}
                onClick={() => navigate('/config')}
              >
                Paramètres
              </Menu.Item>
            )}
          </Menu>
        </div>

        {/* Boutons à droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Bouton Menu Mobile */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
            className="mobile-menu-btn"
            style={{
              color: 'rgba(255, 255, 255, 0.65)',
              border: 'none',
              height: '40px',
              padding: '0 8px',
              fontSize: '16px',
              boxShadow: 'none',
              outline: 'none'
            }}
          />

          {/* Bouton Admin */}
          <Button
            type="text"
            icon={isAdmin ? <LogoutOutlined /> : <UserOutlined />}
            onClick={isAdmin ? deconnecterAdmin : ouvrirModalConnexion}
            style={{
              color: isAdmin ? '#52c41a' : 'rgba(255, 255, 255, 0.65)',
              border: 'none',
              height: '40px',
              padding: '0 8px',
              fontSize: '16px',
              boxShadow: 'none',
              outline: 'none'
            }}
            className="no-focus-border"
          />
        </div>
      </Header>

      {/* Menu Mobile Dropdown */}
      {mobileMenuVisible && (
        <div className="mobile-menu-dropdown">
          <Menu
            theme="dark"
            mode="vertical"
            selectedKeys={getSelectedKey()}
            style={{
              border: 'none',
              backgroundColor: 'var(--background-secondary)',
              width: '100%'
            }}
          >
            <Menu.Item 
              key="accueil" 
              icon={<HomeOutlined />}
              onClick={() => {
                navigate('/');
                setMobileMenuVisible(false);
              }}
            >
              Accueil
            </Menu.Item>
            
            {isAdmin && (
              <Menu.Item 
                key="seance" 
                icon={<HistoryOutlined />}
                onClick={() => {
                  navigate('/seance');
                  setMobileMenuVisible(false);
                }}
              >
                Séance en cours
              </Menu.Item>
            )}
            
            <Menu.Item 
              key="statistiques" 
              icon={<BarChartOutlined />}
              onClick={() => {
                navigate('/statistiques');
                setMobileMenuVisible(false);
              }}
            >
              Séances & Statistiques
            </Menu.Item>
            
            {isAdmin && (
              <Menu.Item 
                key="parametres" 
                icon={<SettingOutlined />}
                onClick={() => {
                  navigate('/config');
                  setMobileMenuVisible(false);
                }}
              >
                Paramètres
              </Menu.Item>
            )}
          </Menu>
        </div>
      )}

      {/* Modal de connexion */}
      <Modal
        title="Connexion Administrateur"
        open={modalVisible}
        onCancel={fermerModal}
        footer={[
          <Button key="cancel" onClick={fermerModal}>
            Annuler
          </Button>,
          <Button key="connect" type="primary" onClick={connecterAdmin}>
            Se connecter
          </Button>
        ]}
      >
        <div style={{ padding: '16px 0' }}>
          <Input.Password
            placeholder="Mot de passe administrateur"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            onPressEnter={connecterAdmin}
            autoFocus
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--primary-color)'
            }}
          />
        </div>
      </Modal>
    </>
  );
} 