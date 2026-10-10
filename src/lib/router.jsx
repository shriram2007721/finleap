
import { createBrowserRouter } from 'react-router-dom';
import RootShell from '../components/RootShell';
import Home from '../pages/public/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootShell />,
    children: [
      { index: true, element: <Home /> },
      // Other routes to be implemented: /demo, /join, /login/staff, /ngo, /school, /learn
    ],
  }
]);
