import React, { useState } from 'react';
import './register.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    gender: 'male',
    address: '',
    addressLine2: '',
    country: '',
    city: '',
    region: '',
    postalCode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://example.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Success:', data);
      // Handle success (e.g., show a success message or redirect)
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show an error message)
    }
  };

  return (
    <section className="container">
      <header>Registration Form</header>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-box">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-box">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="column">
          <div className="input-box">
            <label>Phone Number</label>
            <input
              type="number"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-box">
            <label>Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="gender-box">
          <h3>Gender</h3>
          <div className="gender-option">
            <div className="gender">
              <input
                type="radio"
                id="check-male"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleChange}
              />
              <label htmlFor="check-male">Male</label>
            </div>
            <div className="gender">
              <input
                type="radio"
                id="check-female"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleChange}
              />
              <label htmlFor="check-female">Female</label>
            </div>
            <div className="gender">
              <input
                type="radio"
                id="check-other"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={handleChange}
              />
              <label htmlFor="check-other">Prefer not to say</label>
            </div>
          </div>
        </div>

        <div className="input-box address">
          <label>Address</label>
          <input
            type="text"
            name="address"
            placeholder="Enter street address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="addressLine2"
            placeholder="Enter street address line 2"
            value={formData.addressLine2}
            onChange={handleChange}
          />
          <div className="column">
            <div className="select-box">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option hidden>Country</option>
                <option value="America">America</option>
                <option value="Japan">Japan</option>
                <option value="India">India</option>
                <option value="Nepal">Nepal</option>
              </select>
            </div>
            <input
              type="text"
              name="city"
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="column">
            <input
              type="text"
              name="region"
              placeholder="Enter your region"
              value={formData.region}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="postalCode"
              placeholder="Enter postal code"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit">Submit</button>
      </form>
    </section>
  );
};

export default RegistrationForm;