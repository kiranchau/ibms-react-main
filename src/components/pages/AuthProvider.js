import axios from 'axios';
import { BASE_URL } from './Config';



import React, { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = React.createContext()

export const AuthProvider=({children}) =>{
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({})

    const Register = (name,email,password) =>{
      setIsLoading(true)
        axios.post(`${BASE_URL}/api/login`,{
            name,email,password,
        }).then(res =>{
        let userInfo = res.data;
        setUserInfo(userInfo);
        AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        setIsLoading(false)
        console.log(userInfo)
        }).catch(e =>{
            console.log(`register error  ${e}`)
            setIsLoading(false)
        })
    }
    
    // const Login = (email,password) =>{
    //   setIsLoading(true);

    //   axios.post( `${BASE_URL}/new`,{
    //     email,password
    //   }).then(res =>{
    //     let userInfo = res.data;
    //     console.log(userInfo)
    //     setUserInfo(userInfo)
    //     AsyncStorage.setItem('userInfo', JSON.stringify(userInfo))
    //     setIsLoading(false)
    //   })
    //   .catch(e =>{
    //     console.log(`login error ${e}`)
    //     setIsLoading(false)
    //   })
    
    // }
    const Login = async (email,password) => {
      console.log("29",email, password)
 
      let result= await fetch(`${BASE_URL}/api/login`,{
          method:'POST',
          headers:{
              "Content-Type":"application/json",
              "Accept":"application/json"
          },
          // body:JSON.stringify(item)
      });
      result =  await result.json();
      localStorage.setItem('user-info',JSON.stringify(result));
     
      }
  return (
    <AuthContext.Provider value={{isLoading,userInfo,Register,Login}}>
  {children}
    </AuthContext.Provider>
  )
}

