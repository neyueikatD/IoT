import React, { Component } from "react";
import { useLocation, Route, Switch } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Sidebar from "components/Sidebar/Sidebar";

import routes from "routes.js";

import sidebarImage from "assets/img/sidebar-3.jpg";

function Admin() {
  // Để quản lý hình ảnh nền của side bar
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  // Để theo dõi việc thay đổi địa chỉ URL
  const location = useLocation();
  // Tham chiếu tới phần tử DOM chính của thành phần.
  const mainPanel = React.useRef(null);
  // Chỉ định các tuyến đường có layout là /admin.
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            render={(props) => <prop.component {...props} />}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  // Đặt lại vị trí cuộn của trang khi địa chỉ URL thay đổi.
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    // Đóng menu nếu kích thước màn hình nhỏ và menu đang mở.
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }
  }, [location]);
  return (
    <>
      <div className="wrapper">
        <Sidebar color={color} image={hasImage ? image : ""} routes={routes} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar />
          <div className="content">
            <Switch>{getRoutes(routes)}</Switch>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
