import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User } from 'lucide-react';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Trần Thị Kim Thoa' && password === '12345') {
            onLoginSuccess();
        } else {
            setError('Tài khoản hoặc mật khẩu không chính xác!');
        }
    };

    return (
        <div className="min-h-screen tet-gradient flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md w-full border border-red-100 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500" />

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm border-2 border-red-200">
                        🦁
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-yellow-600 font-display">
                        Đăng Nhập
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">Vui lòng đăng nhập để bắt đầu</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tài khoản
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-gray-50/50"
                                    placeholder="Nhập tên tài khoản"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-gray-50/50"
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-500 to-yellow-500 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Đăng Nhập <span className="text-xl">🧧</span>
                    </button>
                </form>
            </motion.div>
        </div>
    );
};
