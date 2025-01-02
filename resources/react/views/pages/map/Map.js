import React, { useEffect, useState } from 'react';
import {
  CCol,
  CRow,
} from '@coreui/react';
import { getAPICall } from '../../../util/api';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useToast } from '../../common/toast/ToastContext';

const JarMap = () => {
  const [mapData, setMapData] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const { showToast } = useToast();

  const fetchMapData = async () => {
    try {
      const response = await getAPICall(`/api/googleMapData?startDate=${today}&endDate=${today}`);
      const mappedData = response.map((r) => {
        return {
          id: r.id,
          title: r.customer.name,
          deliveredItems: r.items.reduce((accumulator, item) => {
            return accumulator + item.dQty;
          }, 0),
          coordinates: { lat: r.lat, lng: r.long }
        }
      })
      setMapData(mappedData);
    } catch (error) {
      showToast('danger', 'Error occured ' + error);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  // map related settings
  const libraries = ['places'];
  const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
  };

  const [center, setCenter] = useState({
    lat: 17.491946025241727, // default latitude
    lng: 74.0336503865354, // default longitude
  });// default center of map

  useEffect(()=>{
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      var crd = pos.coords;
      console.log("Your current position is:",`Lat: ${crd.latitude}`,`Long: ${crd.longitude}`,`${crd.accuracy} meters`);
      setCenter({lat: crd.latitude, lng: crd.longitude});
    }
  
    function errors(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, errors, options);
  },[])

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBCzOqw2eGFZSkFZpo7nbvPLNPwQdpd6LY',
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <CRow>
      <CCol xs={12}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={10}
          center={center}>
          {mapData.map(data => (
            <Marker key={data.id} title={data.title + '('+data.deliveredItems+')'} position={data.coordinates} />
          ))}
        </GoogleMap>
      </CCol>
    </CRow>
  );
};

export default JarMap;
