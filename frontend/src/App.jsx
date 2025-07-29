import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import OrderPage from './components/OrderPage'
import MenuPage from './components/MenuPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantUrlName, setRestaurantUrlName] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);

  useEffect(() => {
    // Verificar se é uma página de pedidos ou cardápio baseada na URL
    const path = window.location.pathname;
    
    // Verificar se é uma URL de cardápio digital (/menu/restaurante/mesa)
    const menuMatch = path.match(/^\/menu\/([^\/]+)\/(\d+)$/);
    if (menuMatch) {
      const [, urlName, tableNumber] = menuMatch;
      setRestaurantUrlName(urlName);
      setTableNumber(parseInt(tableNumber));
      setCurrentPage('menu');
      return;
    }
    
    // Verificar se é uma URL de pedido (/order/restaurante ou /restaurante)
    if (path !== '/' && path !== '/login' && path !== '/dashboard') {
      let urlName;
      if (path.startsWith('/order/')) {
        urlName = path.substring(7); // Remove '/order/'
      } else {
        urlName = path.substring(1); // Remove a barra inicial
      }
      setRestaurantUrlName(urlName);
      setCurrentPage('order');
      return;
    }

    // Verificar se há dados de restaurante salvos no localStorage
    const savedRestaurant = localStorage.getItem('restaurant');
    const savedToken = localStorage.getItem("token");

    console.log("App.jsx - useEffect: savedRestaurant", savedRestaurant);
    console.log("App.jsx - useEffect: savedToken", savedToken);

    if (savedRestaurant && savedToken) {
      try {
        const restaurantData = JSON.parse(savedRestaurant);
        console.log("App.jsx - useEffect: Parsed restaurantData", restaurantData);
        setRestaurant(restaurantData);
        setCurrentPage("dashboard");
      } catch (error) {
        console.error("Erro ao carregar dados salvos:", error);
        localStorage.removeItem("restaurant");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLoginClick = () => {
    setCurrentPage("login");
    window.history.pushState({}, "", "/login");
  };

  const handleBackToHome = () => {
    setCurrentPage("landing");
    window.history.pushState({}, "", "/");
  };

  const handleLoginSuccess = (restaurantData) => {
    console.log("App.jsx - handleLoginSuccess: restaurantData", restaurantData);
    setRestaurant(restaurantData);
    setCurrentPage("dashboard");
    window.history.pushState({}, "", "/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurant');
    localStorage.removeItem('token');
    setRestaurant(null);
    setCurrentPage('landing');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="App">
      {currentPage === 'landing' && (
        <LandingPage onLoginClick={handleLoginClick} />
      )}
      
      {currentPage === 'login' && (
        <LoginPage 
          onBackToHome={handleBackToHome}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {currentPage === 'dashboard' && restaurant && (
        <Dashboard 
          restaurant={restaurant}
          onLogout={handleLogout}
        />
      )}

      {currentPage === 'order' && restaurantUrlName && (
        <OrderPage restaurantUrlName={restaurantUrlName} />
      )}

      {currentPage === 'menu' && restaurantUrlName && tableNumber && (
        <MenuPage restaurantUrlName={restaurantUrlName} tableNumber={tableNumber} />
      )}
    </div>
  );
}

export default App;

