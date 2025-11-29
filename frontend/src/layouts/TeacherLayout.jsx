import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const TeacherLayout = () => {
  return (
    <div className="teacher-layout min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      <Sidebar />
      <main 
        className="dashboard-main relative overflow-x-hidden"
        style={{
          marginLeft: '260px',
          width: 'calc(100% - 260px)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default TeacherLayout;
