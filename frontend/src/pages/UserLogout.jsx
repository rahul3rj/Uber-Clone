import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const UserLogout = () => {
  const token = localStorage.getItem("user")
  const navigate = useNavigate()
  axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
    headers: {
        Authorization: `Bearer ${token}`
    }
  }).then((response)=>{
    if(response.status === 200 || response.status === 201){
      localStorage.removeItem("user");
      navigate("/");
    }
  })
  return (
    <div>UserLogout</div>
  )
}

export default UserLogout