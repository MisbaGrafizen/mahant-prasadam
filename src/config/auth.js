import Cookies from 'js-cookie';
const auth = {
  getToken: () => {
    return Cookies.get('authToken');
  },
  setToken: (token) => {
    Cookies.set('authToken', token, { expires: 7, secure: true });
  },
  removeToken: () => {
    Cookies.remove('authToken');
  },
};
export default auth;