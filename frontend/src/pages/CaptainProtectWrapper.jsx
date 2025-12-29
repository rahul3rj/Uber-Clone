import React, { useEffect, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext.jsx'
import axios from 'axios';

const CaptainProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("captain")
  const navigate = useNavigate() 
  const {captain, setCaptain} = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    if (!token) {
      navigate("/captain/login")
    }
    axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then((response) => {
      if(response.status === 200){
        setCaptain(response.data);
        setIsLoading(false);
      }
    }).catch((error) => {
      console.log(error);
      localStorage.removeItem("captain");
      navigate("/captain/login");
    })
  }, [token, navigate])
  if(isLoading){
    return <div className='h-screen flex justify-center items-center poppins-medium text-xl'>Loading...</div>
  }

  return (
    <>
      {children}
    </>
  )
}

export default CaptainProtectWrapper