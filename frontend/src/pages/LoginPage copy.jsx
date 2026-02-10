import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../components/icons';

const LoginPagae = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            navigate('/drive');
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="flex justify-center mb-6">
                    <Icons.Logo />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Sign in</h2>
                <p className="text-center text-gray-500 mb-8">Use your Google Account</p>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            placeholder="Email or phone" 
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            placeholder="Password" 
                        />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <a href="#" className="text-blue-600 font-medium hover:underline">Forgot password?</a>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : "Next"}
                    </button>
                </form>
                <div className="mt-8 text-center text-sm text-gray-600">
                    Not your computer? Use Guest mode to sign in privately. <br/>
                    <a href="#" className="text-blue-600 font-medium hover:underline">Learn more</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;