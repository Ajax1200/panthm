import React from "react";

const MapComponent = () => {
  const mapUrl = "https://www.google.com/maps?q=Icon%20Tower%20Baner%20Pune&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <iframe
      title="PANTHM AI Labs Office Location"
      src={mapUrl}
      width="100%"
      height="100%"
      style={{ border: 0, width: "100%", height: "100%", display: "block" }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  );
};

export default MapComponent;
