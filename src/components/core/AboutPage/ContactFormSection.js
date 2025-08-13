import React from 'react'
import ContactUsForm from "../ContactPage/ContactUsForm"


const ContactFormSection = () => {
  return (
    <div className='mx-auto'>
      <h1>
        Get in Touch
      </h1>
      <p>We would love to be here for you. Please fill out the form. </p>
      <div>
        <ContactUsForm/>
      </div>
    </div>
  )
}

export default ContactFormSection

