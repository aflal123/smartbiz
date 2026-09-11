// src/components/layout/MainLayout.jsx

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Avatar, Menu,
  MenuItem, Divider, Tooltip, Chip
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Business,
  Logout, ChevronLeft, AdminPanelSettings
} from '@mui/icons-material';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Dashboard',  path: '/',           icon: <Dashboard /> },
  { label: 'Businesses', path: '/businesses', icon: <Business />  },
];

const MainLayout = () => {
  const navigate          = useNavigate();
  const location          = useLocation();
  const { admin, logout } = useAdminAuth();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl]     = useState(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const DrawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Logo */}
      <Box sx={{
        p: 3, display: 'flex', alignItems: 'center', gap: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <AdminPanelSettings sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" color="white" fontWeight={700} lineHeight={1}>
            SmartBiz
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Admin Panel
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.6)',
                bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{
                color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.6)',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: isActive(item.path) ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Admin Info */}
      <Box sx={{
        p: 2, borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 2
      }}>
        <Avatar sx={{
          width: 36, height: 36,
          bgcolor: 'rgba(255,255,255,0.2)', fontSize: 14
        }}>
          {admin?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" color="white" fontWeight={600} noWrap>
            {admin?.name}
          </Typography>
          <Chip
            label={admin?.role}
            size="small"
            sx={{
              height: 16, fontSize: 10,
              bgcolor: 'rgba(255,255,255,0.2)', color: 'white'
            }}
          />
        </Box>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <Logout fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* Sidebar */}
      <Drawer
        variant="persistent" open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            background: 'linear-gradient(180deg, #1e1b4b 0%, #3730a3 50%, #4338ca 100%)',
            border: 'none',
          },
        }}
      >
        {DrawerContent}
      </Drawer>

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <AppBar
          position="sticky" elevation={0}
          sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', color: 'text.primary' }}
        >
          <Toolbar>
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2, color: 'text.secondary' }}
            >
              {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" fontWeight={600} flex={1}>
              {navItems.find(item => isActive(item.path))?.label || 'Admin Panel'}
            </Typography>
            <Chip
              label="Admin Portal"
              color="primary" size="small" sx={{ mr: 2 }}
            />
            <Tooltip title="Account">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{
                  width: 36, height: 36,
                  background: 'linear-gradient(135deg, #1e1b4b, #7c3aed)',
                  fontSize: 14, fontWeight: 700
                }}>
                  {admin?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 200, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {admin?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {admin?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{ gap: 1.5, py: 1.5, color: 'error.main' }}
              >
                <Logout fontSize="small" />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box sx={{ flex: 1, p: 3, bgcolor: '#f8fafc' }}>
          <Outlet />
        </Box>

      </Box>
    </Box>
  );
};

export default MainLayout;