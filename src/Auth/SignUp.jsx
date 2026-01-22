import React, { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import './SignUp.css'

const SignUp = () => {
  const [searchParams] = useSearchParams()
  const [selectedRole, setSelectedRole] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const roleFromUrl = searchParams.get('role')
    if (roleFromUrl && (roleFromUrl === 'merchant' || roleFromUrl === 'supplier')) {
      setSelectedRole(roleFromUrl)
    }
  }, [searchParams])

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  const handleNext = () => {
    if (selectedRole) {
      if (selectedRole === 'merchant') {
        navigate('/signup/merchant')
      } else if (selectedRole === 'supplier') {
        navigate('/signup/supplier')
      }
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Select your role to get started</p>
        </div>

        <div className="role-selection">
          <div 
            className={`role-card ${selectedRole === 'merchant' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('merchant')}
          >
            <div className="role-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9H1v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9h-2M3 9V7a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2M9 9v10M15 9v10"/>
              </svg>
            </div>
            <h4>Merchant</h4>
            <p>Purchase wholesale products</p>
          </div>

          <div 
            className={`role-card ${selectedRole === 'supplier' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('supplier')}
          >
            <div className="role-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <path d="M12 11v2"/>
              </svg>
            </div>
            <h4>Supplier</h4>
            <p>Sell your products wholesale</p>
          </div>
        </div>

        {selectedRole && (
          <button className="next-btn" onClick={handleNext}>
            Continue
          </button>
        )}

        <div className="login-link">
          <span>Already have an account? </span>
          <Link to="/login">Login</Link>
        </div>
      </div>

      <div className="signup-footer">
        <p>© 2025 MERKO Wholesale System. All rights reserved.</p>
      </div>
    </div>
  )
}

export default SignUp
