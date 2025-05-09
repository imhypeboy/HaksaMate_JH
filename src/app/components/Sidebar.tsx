'use client';

import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Calendar, MessageSquare, Settings, X } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activePage: 'timetable' | 'community' | 'settings';
  setActivePage: (page: 'timetable' | 'community' | 'settings') => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activePage,
  setActivePage,
}: SidebarProps) {
  return (
    <ProSidebar
      collapsed={!sidebarOpen}
      width="250px"
      collapsedWidth="0px"
      className="transition-all duration-300 bg-[#f4f6fa] border-r border-gray-200 shadow-lg"
    >
      <div className="p-4 h-full flex flex-col">
        <button
          onClick={() => setSidebarOpen(false)}
          className="mb-4 flex items-center text-sm text-black-400 hover:text-blue-500"
        >
          <X size={16} className="mr-2" /> 사이드바 접기
        </button>
        <Menu className="mt-6 flex-1">
          <MenuItem
            icon={<Calendar size={18} />}
            className={`mb-2 rounded px-4 py-3 transition-colors duration-200 flex items-center justify-start space-x-3 font-semibold
              ${activePage === 'timetable'
                ? 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            onClick={() => setActivePage('timetable')}
          >
            <span className="text-base">시간표</span>
          </MenuItem>
          <MenuItem
            icon={<MessageSquare size={18} />}
            className={`mb-2 rounded px-3 py-2 transition-colors duration-200 font-semibold
              ${activePage === 'community'
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-500 hover:text-white'
                : 'text-blue-400 hover:bg-blue-100 hover:text-blue-500'
              }`}
            onClick={() => setActivePage('community')}
          >
            커뮤니티
          </MenuItem>
          <MenuItem
            icon={<Settings size={18} />}
            className={`mb-2 rounded px-3 py-2 transition-colors duration-200 font-semibold
              ${activePage === 'settings'
                ? 'bg-gray-100 text-gray-900 hover:bg-gray-500 hover:text-white'
                : 'text-blue-400 hover:bg-blue-100 hover:text-blue-500'
              }`}
            onClick={() => setActivePage('settings')}
          >
            설정
          </MenuItem>
        </Menu>
      </div>
    </ProSidebar>
  );
}
