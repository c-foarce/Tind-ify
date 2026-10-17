import axios from 'axios';

// Instantiate an isolated Axios channel pointing to your local Flask environment
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
