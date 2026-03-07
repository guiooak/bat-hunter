import { useContext } from 'react';
import { AuthContext } from './_auth-context-definition';

export const useAuthContext = () => useContext(AuthContext);
