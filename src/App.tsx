import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppReducer';
import { AdminProvider } from './contexts/AdminContext';
import AppRoutes from './routes/AppRoutes';
import HeaderBar from './components/HeaderBar';
import './App.css';
import './styles/responsive.css';

function App() {
  return (
    <AdminProvider>
      <AppProvider>
        <div className="layout">
          <BrowserRouter>
            <HeaderBar />
            <div className="site-layout-content" style={{ width: '100%', margin: '0 auto',  }}>
              <AppRoutes />
            </div>
          </BrowserRouter>
        </div>
      </AppProvider>
    </AdminProvider>
  );
}

export default App;
