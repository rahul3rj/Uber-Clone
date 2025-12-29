import React, { useEffect, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext.jsx'
import axios from 'axios';

const UserProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("user")
  const navigate = useNavigate()
  const {user, setUser} = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    if (!token) {
      navigate("/user/login")
    }
    axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then((response) => {
      if(response.status === 200){
        setUser(response.data);
        setIsLoading(false);
      }
    }).catch((error) => {
      console.log(error);
      localStorage.removeItem("user");
      navigate("/user/login");
    })
  }, [token, navigate])
  if(isLoading){
    return <div className='flex justify-center items-center poppins-medium text-xl'>Loading...</div>
  }

  return <>{children}</>
}

export default UserProtectWrapper
