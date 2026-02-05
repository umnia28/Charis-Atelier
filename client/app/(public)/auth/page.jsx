'use client'

import { useState } from 'react'
import LoginPage from '../login/page'
import SignupPage from '../signup/page'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      {isLogin ? <LoginPage /> : <SignupPage />}

      <p className="text-sm mt-4">
        {isLogin ? (
          <>
            Don’t have an account?{' '}
            <button
              onClick={() => setIsLogin(false)}
              className="text-blue-500 underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              onClick={() => setIsLogin(true)}
              className="text-blue-500 underline"
            >
              Login
            </button>
          </>
        )}
      </p>
    </div>
  )
}
