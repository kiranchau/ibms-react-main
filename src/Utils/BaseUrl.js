import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL
})

instance.interceptors.request.use(
    config => {
        config.headers['ngrok-skip-browser-warning'] = 'true'
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods']= 'GET, POST, PATCH, DELETE';
        config.headers['Access-Control-Allow-Headers'] ='Content-Type';
        config.headers['network.cors_preflight.allow_client_cert'] ='true';
        const authToken = localStorage.getItem('token')
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
    }
);

export default instance;