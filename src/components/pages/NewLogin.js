import React, { useState } from 'react';

import { login } from "../../API/authCurd";

const NewLogin = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    function loginmethod(){
        login(email, password)
        .then((result)=>{ console.log(result)})
        .catch((error) => {console.log(error)})
    }
       
  

  return (
    <>
     <div className='container'>
            <div className='d-flex justify-content-center'>
            <div>
                <h1>Login Form</h1>
                <form>
                    <input 
                    type="text" 
                    placeholder='Email'
                    onChange={(e)=>setEmail(e.target.value)} 
                    className='form-control' />
                    <br></br>
                    <input 
                    type="text" 
                    placeholder='password' 
                    onChange={(e)=>setPassword(e.target.value)} 
                    className='form-control' />
                    <br></br>
                    <div onClick={()=>{loginmethod()}} type='button'>Submit</div>
                </form>
                </div>
            </div>
     </div> 
    </>
  )
}

export default NewLogin;
