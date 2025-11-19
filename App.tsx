import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MarketPage } from './pages/Dashboard';
import { CoinDetail } from './pages/CoinDetail';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { AdminPanel } from './pages/AdminPanel';
import { LoginPage } from './pages/LoginPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Admin Route (No Layout) */}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Standard Routes with Layout */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={
                <MarketPage 
                  category="crypto" 
                  title="Рынок Криптовалют" 
                  subtitle="Котировки цифровых активов в реальном времени" 
                />
              } />
              <Route path="/forex" element={
                <MarketPage 
                  category="forex" 
                  title="Рынок Форекс" 
                  subtitle="Курсы мировых валют" 
                />
              } />
              <Route path="/futures" element={
                <MarketPage 
                  category="futures" 
                  title="Индексы и Фьючерсы" 
                  subtitle="Глобальные индексы, сырье и товары" 
                />
              } />
              
              <Route path="/coin/:id" element={<CoinDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;