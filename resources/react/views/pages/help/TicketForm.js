import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "16px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    marginBottom: "4px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ccc",
    borderRadius: "8px",
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  buttonActive: {
    backgroundColor: "green",
  },
};

const TicketForm = () => {
  const [formData, setFormData] = useState({
    client_name: "",
    mobile: "",
    email: "",
    query: "",
    products_id: 2,
  });

  const [screenshots, setScreenshots] = useState([]);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = "Name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.client_name)) {
      newErrors.client_name = "Name can only contain letters and spaces.";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits and Have numbers in it.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setScreenshots([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!formData.query || !formData.products_id) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = new FormData();
    payload.append("client_name", formData.client_name);
    payload.append("mobile", formData.mobile);
    payload.append("email", formData.email);  
    payload.append("query", formData.query);
    payload.append("products_id", formData.products_id);

    for (let i = 0; i < screenshots.length; i++) {
      payload.append("screenshots[]", screenshots[i]);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/tickets",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Ticket submitted successfully!");
      navigate("/login");
    } catch (error) {
      alert("Ticket submission failed.");
      console.error("Error submitting ticket:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Raise a Ticket</h1>
      <p style={styles.subtitle}>
        If you don't find the solution in the FAQ, raise a query.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Your Name*</label>
        <input
          type="text"
          style={styles.input}
          name="client_name"
          placeholder="Enter your name"
          value={formData.client_name}
          onChange={handleInputChange}
          required
        />
        {errors.client_name && (
          <p style={{ color: "red", fontSize: "12px" }}>{errors.client_name}</p>
        )}

        <label style={styles.label}>Mobile*</label>
        <input
          type="text"
          style={styles.input}
          name="mobile"
          placeholder="Enter your mobile number"
          value={formData.mobile}
          onChange={handleInputChange}
          required
        />
        {errors.mobile && (
          <p style={{ color: "red", fontSize: "12px" }}>{errors.mobile}</p>
        )}

        <label style={styles.label}>Email (Optional)</label>
        <input
          type="email"
          style={styles.input}
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
        />

        <label style={styles.label}>Your Query*</label>
        <textarea
          rows="4"
          style={styles.input}
          name="query"
          placeholder="Describe your issue here..."
          value={formData.query}
          onChange={handleInputChange}
          required
        />

        <label style={styles.label}>Product*</label>
        <select
          name="products_id"
          style={styles.input}
          value={formData.products_id}
          onChange={handleInputChange}
          required
        >
          <option value="">Select a product</option>
          <option value="1">Dr Assist</option>
          <option value="2">Aqua Logix</option>
        </select>

        <label style={styles.label}>Upload Screenshots (Optional)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          style={styles.input}
          onChange={handleFileChange}
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(formData.query && formData.products_id
              ? styles.buttonActive
              : {}),
          }}
        >
          Raise Ticket
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
