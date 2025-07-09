import { Outlet } from 'react-router-dom';
import Menu from './Menu';

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Menu />
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}