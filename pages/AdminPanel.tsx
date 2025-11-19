
import React, { useState, useEffect } from 'react';
import { Shield, Users, Server, Settings, AlertTriangle, Lock, BarChart2, Play, Pause, Trash2, Edit3, Save, Activity, Terminal } from 'lucide-react';
import { getAllUsers, getSystemConfig, getSystemStats, updateSystemConfig, getSystemLogs, updateUserStatus } from '../services/adminService';
import { SystemConfig, UserProfile, SystemLog } from '../types';
import { Link } from 'react-router-dom';

// Simple Password Protection Component
const LoginScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'Zeref1997') {
      onLogin();
    } else {
      setErr(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="bg-dark-card border border-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-brand-900/30 rounded-full border border-brand-500/50">
            <Shield className="w-8 h-8 text-brand-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-2">System Access</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Restricted Area. Authorization Level 5 required.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              placeholder="Enter Security Key" 
              value={pass}
              onChange={e => setPass(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-brand-500 focus:outline-none transition-all"
            />
          </div>
          {err && <p className="text-red-400 text-xs text-center">Access Denied: Invalid Key</p>}
          <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg transition-colors">
            Authenticate
          </button>
          <Link to="/" className="block text-center text-gray-500 text-xs hover:text-white mt-4">Return to Site</Link>
        </form>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const [auth, setAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'SYSTEM' | 'LOGS'>('DASHBOARD');
  const [config, setConfig] = useState<SystemConfig>(getSystemConfig());
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState(getSystemStats());

  useEffect(() => {
    if (auth) {
      // Initial load
      setUsers(getAllUsers());
      setLogs(getSystemLogs());
      
      // Live update simulation
      const interval = setInterval(() => {
        setStats(getSystemStats());
        setLogs(getSystemLogs()); // Poll logs
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [auth]);

  const handleConfigUpdate = (updates: Partial<SystemConfig>) => {
    const newConfig = updateSystemConfig(updates);
    setConfig(newConfig);
  };

  const handleUserAction = (id: string, action: 'BAN' | 'ACTIVATE') => {
    updateUserStatus(id, action === 'BAN' ? 'BANNED' : 'ACTIVE');
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: action === 'BAN' ? 'BANNED' : 'ACTIVE' } : u));
  };

  if (!auth) return <LoginScreen onLogin={() => setAuth(true)} />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 bg-black/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Shield className="w-6 h-6 text-red-500 mr-2" />
          <span className="font-bold tracking-wider">COMMAND</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'DASHBOARD' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
          >
            <Activity className="w-4 h-4" /> Dashboard
          </button>
          <button 
             onClick={() => setActiveTab('USERS')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'USERS' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
          >
            <Users className="w-4 h-4" /> User Control
          </button>
          <button 
             onClick={() => setActiveTab('SYSTEM')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'SYSTEM' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
          >
            <Settings className="w-4 h-4" /> System Config
          </button>
           <button 
             onClick={() => setActiveTab('LOGS')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'LOGS' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}
          >
            <Terminal className="w-4 h-4" /> System Logs
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs text-gray-500">System Operational</span>
          </div>
          <Link to="/" className="block mt-4 text-xs text-gray-600 hover:text-white">Exit to Main Site</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 border-b border-gray-800 bg-black/20 flex items-center justify-between px-8">
           <h1 className="font-bold text-xl">{activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}</h1>
           <div className="text-sm text-gray-400">Admin Session: {new Date().toLocaleTimeString()}</div>
        </header>

        <div className="p-8">
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8">
              <div className="grid grid-cols-4 gap-6">
                 <div className="bg-dark-card border border-gray-800 p-6 rounded-xl">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Total Volume</h3>
                    <p className="text-2xl font-bold">${(stats.totalVolume / 1e9).toFixed(2)}B</p>
                 </div>
                 <div className="bg-dark-card border border-gray-800 p-6 rounded-xl">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Active Users</h3>
                    <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                 </div>
                 <div className="bg-dark-card border border-gray-800 p-6 rounded-xl">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Server Load</h3>
                    <p className={`text-2xl font-bold ${stats.serverLoad > 80 ? 'text-red-500' : 'text-green-500'}`}>{stats.serverLoad}%</p>
                 </div>
                 <div className="bg-dark-card border border-gray-800 p-6 rounded-xl">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Market Status</h3>
                    <p className="text-2xl font-bold text-brand-400">{config.marketVolatility > 1.5 ? 'VOLATILE' : 'STABLE'}</p>
                 </div>
              </div>

              <div className="bg-dark-card border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Live System Activity</h2>
                <div className="h-64 bg-black/20 rounded-lg flex items-center justify-center border border-gray-800 border-dashed">
                   <p className="text-gray-600">Real-time Visualization Placeholder</p>
                </div>
              </div>
            </div>
          )}

          {/* USERS VIEW */}
          {activeTab === 'USERS' && (
            <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-black/20 border-b border-gray-800">
                  <tr className="text-left text-xs font-bold text-gray-500 uppercase">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Balance / Equity</th>
                    <th className="px-6 py-4">Positions</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`text-xs px-2 py-1 rounded font-bold ${
                           user.status === 'ACTIVE' ? 'bg-green-900 text-green-400' : 
                           user.status === 'BANNED' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'
                         }`}>
                           {user.status}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">${user.balance.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Eq: ${user.equity.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {user.positions.length} active
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                         {user.status !== 'BANNED' && (
                           <button 
                              onClick={() => handleUserAction(user.id!, 'BAN')}
                              className="text-red-500 hover:bg-red-500/10 p-2 rounded" title="Ban User"
                           >
                             <Lock className="w-4 h-4" />
                           </button>
                         )}
                         {user.status === 'BANNED' && (
                            <button 
                              onClick={() => handleUserAction(user.id!, 'ACTIVATE')}
                              className="text-green-500 hover:bg-green-500/10 p-2 rounded" title="Activate User"
                           >
                             <Shield className="w-4 h-4" />
                           </button>
                         )}
                         <button className="text-blue-500 hover:bg-blue-500/10 p-2 rounded" title="Edit Details">
                           <Edit3 className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SYSTEM CONFIG VIEW */}
          {activeTab === 'SYSTEM' && (
            <div className="grid grid-cols-2 gap-8">
               <div className="bg-dark-card border border-gray-800 rounded-xl p-6 space-y-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                     <BarChart2 className="w-5 h-5 text-brand-500" /> Market Control
                  </h2>
                  
                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Market Volatility (Jitter)</label>
                        <span className="font-bold">{config.marketVolatility.toFixed(1)}x</span>
                     </div>
                     <input 
                       type="range" min="0.1" max="5.0" step="0.1"
                       value={config.marketVolatility}
                       onChange={(e) => handleConfigUpdate({ marketVolatility: parseFloat(e.target.value) })}
                       className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                     />
                     <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Calm</span>
                        <span>Extreme Chaos</span>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm text-gray-400 mb-2">Market Bias</label>
                     <div className="grid grid-cols-3 gap-2">
                        {['BEARISH', 'NEUTRAL', 'BULLISH'].map((b) => (
                           <button
                             key={b}
                             onClick={() => handleConfigUpdate({ marketBias: b as any })}
                             className={`py-2 rounded text-xs font-bold transition-colors ${
                               config.marketBias === b 
                               ? 'bg-brand-600 text-white' 
                               : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                             }`}
                           >
                             {b}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="bg-dark-card border border-gray-800 rounded-xl p-6 space-y-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                     <Server className="w-5 h-5 text-brand-500" /> Platform Settings
                  </h2>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                     <div>
                        <div className="font-bold">Maintenance Mode</div>
                        <div className="text-xs text-gray-500">Disables trading and logins</div>
                     </div>
                     <button 
                       onClick={() => handleConfigUpdate({ maintenanceMode: !config.maintenanceMode })}
                       className={`w-12 h-6 rounded-full p-1 transition-colors ${config.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}
                     >
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                     <div>
                        <div className="font-bold">Allow Registrations</div>
                        <div className="text-xs text-gray-500">New user signups</div>
                     </div>
                     <button 
                       onClick={() => handleConfigUpdate({ allowRegistrations: !config.allowRegistrations })}
                       className={`w-12 h-6 rounded-full p-1 transition-colors ${config.allowRegistrations ? 'bg-green-500' : 'bg-gray-600'}`}
                     >
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${config.allowRegistrations ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* SYSTEM LOGS */}
           {activeTab === 'LOGS' && (
             <div className="bg-black border border-gray-800 rounded-xl overflow-hidden font-mono text-sm">
                <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                  <span>System Output Stream</span>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4 h-[500px] overflow-auto space-y-2">
                   {logs.length === 0 && <div className="text-gray-600 italic">No logs available.</div>}
                   {logs.map(log => (
                     <div key={log.id} className="flex gap-3">
                        <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`${
                          log.level === 'INFO' ? 'text-blue-400' :
                          log.level === 'WARNING' ? 'text-yellow-400' :
                          log.level === 'ERROR' ? 'text-red-400' : 'text-purple-400'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-gray-300">{log.message}</span>
                     </div>
                   ))}
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};
