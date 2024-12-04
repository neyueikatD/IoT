import Dashboard from "views/Dashboard.js";
import Profile from "views/Profile.js";
import DataSensors from "views/DataSensors";
import History from "views/History";
// import Icons from "views/Icons.js";
// import Maps from "views/Maps.js";
import Dashboard2 from "views/Dashboard2";
import Db2 from "views/Dashboard2";
// import Upgrade from "views/Upgrade.js";

const dashboardRoutes = [
  // {
  //   upgrade: true,
  //   path: "/upgrade",
  //   name: "Upgrade to PRO",
  //   icon: "nc-icon nc-alien-33",
  //   component: Upgrade,
  //   layout: "/admin"
  // },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "nc-icon nc-chart-pie-36",
    component: Dashboard,
    layout: "/admin"
  },
  {
    path: "/datasensors",
    name: "Data Sensors",
    icon: "nc-icon nc-align-center",
    component: DataSensors,
    layout: "/admin"
  },
  {
    path: "/history",
    name: "History",
    icon: "nc-icon nc-bullet-list-67",
    component: History,
    layout: "/admin"
  },
  {
    path: "/profile",
    name: "Profile",
    icon: "nc-icon nc-circle-09",
    component: Profile,
    layout: "/admin"
  },
  {
    path: "/db2",
    name: "Dashboard 2",
    icon: "nc-icon nc-bell-55",
    component: Db2,
    layout: "/admin"
  },
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "nc-icon nc-atom",
  //   component: Icons,
  //   layout: "/admin"
  // },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "nc-icon nc-pin-3",
  //   component: Maps,
  //   layout: "/admin"
  // },
  
];

export default dashboardRoutes;
