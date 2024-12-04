import React from "react";
import { Card } from "react-bootstrap";
import './Profile.css';

function Profile() {
  return (
    
    <div className="content2">
      <Card>
        <Card.Body>
          <Card.Img 
            src={`${process.env.PUBLIC_URL}/self.JPG`} 
          />
          <Card.Text>
          <div>
              Họ và tên: <strong>Tạ Kiều Yến</strong> <br />
              Mã sinh viên: <strong>B21DCCN810</strong> <br />
              Lớp: <strong>D21HTTT04</strong> <br />
              Lớp học phần: <strong>IoT và ứng dụng - 05</strong><br />
              GitHub: <a href="https://github.com/neyueikatD/IoT.git">github</a><br />
              Resume: <a href="F:\IoT\light-mqtt\light-mqtt-FE\public\B21DCCN810-Tạ Kiều Yến.pdf">Download PDF</a>
            </div>
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;
