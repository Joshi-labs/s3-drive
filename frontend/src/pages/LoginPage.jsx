import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../components/icons';
import Logo from '../assets/logo.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const API_BASE = "https://s3-drive.vpjoshi.in"; //'https://s3-drive.vpjoshi.in'; http://localhost:80

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // --- STRICTLY MATCHING YOUR HTML LOGIC ---
    const performLogin = async (endpoint, payload) => {
        setIsLoading(true);
        setError('');
        
        const url = `${API_BASE}${endpoint}`;

        try {
            // MATCHING HTML: No headers, just stringified body
            const res = await fetch(url, { 
                method: 'POST', 
                body: JSON.stringify(payload) 
            });

            // Handle non-JSON responses safely
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                // If response isn't JSON, throw the raw text
                throw new Error(text || 'Server Error');
            }

            if (!res.ok) {
                throw new Error(data.message || data.error || JSON.stringify(data));
            }

            // Success: Store token
            localStorage.setItem("drive_token", data.token);

            if (payload.username) {
                localStorage.setItem("user_role", "admin");
            } else {
                localStorage.setItem("user_role", "guest");
            }

            navigate('/drive');

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || "Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        performLogin('/api/login', { 
            username: formData.username, 
            password: formData.password 
        });
    };

    const handleGuestLogin = () => {
        performLogin('/api/guest-login', {});
    };

    useEffect(() => {
        if(localStorage.getItem("drive_token")) {
            navigate('/drive/root');
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="flex justify-center mb-6">
                    <img src={Logo} alt="DriveClone Logo" className="h-28 w-28" />                        
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Sign in</h2>
                <p className="text-center text-gray-500 mb-6">Use your Google Account</p>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleAdminLogin} className="space-y-5">
                    <div>
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            placeholder="Username or Email" 
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                            placeholder="Password" 
                        />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                        <a href="#" className="text-blue-600 font-medium hover:underline">Forgot password?</a>
                    </div>

                    <div className="space-y-3">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : "Sign In"}
                        </button>

                        <button 
                            type="button" 
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                            className="w-full bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                           Continue as Guest
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Dont have an id? Use Guest mode to sign in privately. <br/>
                    <a href="#" className="text-blue-600 font-medium hover:underline">Learn more</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;