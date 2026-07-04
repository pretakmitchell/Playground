import React from 'react';
import './SignupForm.css';

const SignupForm = () => {
  return (
    <section className="signup-section" id="signup">
      <div className="signup-container">
        <h2 className="signup-title text-gold">Get updates</h2>
        
        <form 
          className="signup-form" 
          action="https://254c7d3b.sibforms.com/serve/MUIFAHW4m_vG9oHKKvnPP225Ypaz6civpMBAuFpKCJomd7xquPWTU7Px044w8DJOb4R_gv57qCVOF7veG18z-wnX7BSY3G-TTuk3ORHKnzwLCwoPFY8CqYkTxBdI8Pjy368Dg5RqU_XMLYkp_sTtIyTRpSyjr8232r7LUDSrW42mrjCEdmNk0SqG3fgv1C8ZD7hu2OJwkJwRBPajfA==" 
          method="POST" 
          target="_blank"
          data-type="subscription"
        >
          <div className="form-group">
            <label htmlFor="FIRSTNAME">Your Name</label>
            <input 
              type="text" 
              id="FIRSTNAME" 
              name="FIRSTNAME" 
              placeholder="Agent Smith" 
              className="glass-input" 
              required
            />
          </div>
          
          <div className="form-group email-group">
            <label htmlFor="EMAIL">Your Email here</label>
            <input 
              type="email" 
              id="EMAIL" 
              name="EMAIL" 
              placeholder="agent@department.gov" 
              className="glass-input" 
              required
            />
          </div>
          
          <input type="text" name="email_address_check" value="" className="input--hidden" style={{display: 'none'}} readOnly />
          <input type="hidden" name="locale" value="en" />
          
          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
        
        <p className="signup-disclaimer text-secondary">
          By signing up, you agree to receive news, product updates, and marketing emails from The Department of Mythical Detection. You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

export default SignupForm;
