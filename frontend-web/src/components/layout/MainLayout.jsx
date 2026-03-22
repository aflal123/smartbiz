// src/components/layout/MainLayout.jsx

import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography,
  IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Avatar, Menu,
  MenuItem, Divider, Tooltip, Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard, Inventory, People, LocalShipping,
  Receipt, AccountBalance, SmartToy,
  Logout, Person, Store, ChevronLeft,
  Notifications, Assessment 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 260;

// ── NAVIGATION ITEMS ─────────────────────────────────
const navItems = [
  { label: 'Dashboard',   path: '/',            icon: <Dashboard /> },
 
  { label: 'Products',    path: '/products',    icon: <Inventory /> },
  { label: 'Customers',   path: '/customers',   icon: <People /> },
  { label: 'Suppliers',   path: '/suppliers',   icon: <LocalShipping /> },
  { label: 'Sales',       path: '/sales',       icon: <Receipt /> },
  { label: 'Expenses',    path: '/expenses',    icon: <AccountBalance /> },
  { label: 'Reports', path: '/reports', icon: <Assessment /> },
  { label: 'AI Features', path: '/ai',          icon: <SmartToy /> },
];

const MainLayout = () => {
  const navigate          = useNavigate();
  const location          = useLocation();
  const { user, logout }  = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl]     = useState(null);

  // User menu open/close
  const handleMenuOpen  = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = ()  => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  // Check if current path matches nav item
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // ── SIDEBAR CONTENT ───────────────────────────────
  const DrawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Logo Area */}
      <Box sx={{
        p: 3, display: 'flex',
        alignItems: 'center', gap: 2,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Store sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" color="white" fontWeight={700} lineHeight={1}>
            SmartBiz
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            {user?.businessName}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.6)',
                backgroundColor: isActive(item.path)
                  ? 'rgba(255,255,255,0.2)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                },
                transition: 'all 0.2s',
              }}
            >
              <ListItemIcon sx={{
                color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.6)',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: isActive(item.path) ? 600 : 400 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* User Info at Bottom */}
      <Box sx={{
        p: 2, borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 2
      }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" color="white" fontWeight={600} noWrap>
            {user?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }} noWrap>
            {user?.role}
          </Typography>
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

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
            border: 'none',
          },
        }}
      >
        {DrawerContent}
      </Drawer>

      {/* ── MAIN AREA ───────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── TOPBAR ────────────────────────────────── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            color: 'text.primary',
          }}
        >
          <Toolbar>
            {/* Toggle Sidebar Button */}
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2, color: 'text.secondary' }}
            >
              {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>

            {/* Page Title */}
            <Typography variant="h6" fontWeight={600} flex={1}>
              {navItems.find(item => isActive(item.path))?.label || 'SmartBiz'}
            </Typography>

            {/* Notification Bell */}
            <IconButton sx={{ mr: 1, color: 'text.secondary' }}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Avatar Menu */}
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenuOpen}>
                <Avatar sx={{
                  width: 36, height: 36,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  fontSize: 14, fontWeight: 700
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* User Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { borderRadius: 2, minWidth: 200, mt: 1 } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleMenuClose} sx={{ gap: 1.5, py: 1.5 }}>
                <Person fontSize="small" color="action" />
                Profile
              </MenuItem>
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

        {/* ── PAGE CONTENT ──────────────────────────── */}
        <Box sx={{ flex: 1, p: 3, backgroundColor: '#f8fafc' }}>
          <Outlet />
        </Box>

      </Box>
    </Box>
  );
};

export default MainLayout;
