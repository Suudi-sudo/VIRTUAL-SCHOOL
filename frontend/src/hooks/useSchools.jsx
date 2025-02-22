import { useContext } from 'react';
import { SchoolContext } from '../context/SchoolContext';

const useSchools = () => useContext(SchoolContext);

export default useSchools;
