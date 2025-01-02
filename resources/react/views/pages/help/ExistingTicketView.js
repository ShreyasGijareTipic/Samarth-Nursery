import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const AssignPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [comment, setComment] = useState("");
  const [commentBy, setCommentBy] = useState("");
  const [ticketHistory, setTicketHistory] = useState([]);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/tickets/assign/${id}`)
      .then((res) => {
        if (res.data?.screen_shot) {
          try {
            const parsedScreenshots = JSON.parse(res.data.screen_shot);
            res.data.screenshots = parsedScreenshots;
          } catch (error) {
            res.data.screenshots = [];
          }
        } else {
          res.data.screenshots = [];
        }
        setTicket(res.data);
        setCommentBy(res.data.client_name || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load ticket details.");
        setLoading(false);
      });
  
    axios
      .get(`http://127.0.0.1:8000/api/tickets/history/${id}`)
      .then((res) => {
        setTicketHistory(res.data || []);
      })
      .catch(() => {
        console.error("Could not fetch ticket history");
      });
  }, [id]);

  const openModal = (imageUrl) => setSelectedImage(imageUrl);
  const closeModal = () => setSelectedImage(null);

  const handleSubmit = () => {
    const ticketDetailsPayload = {
      ticket_id: id,
      query: ticket.query || "",
      comment: comment,
      comment_by: commentBy,
      status: 1, // Status set to 1 (In Process)
      comment_is_user: 2,
    };

    // First, update the ticket details
    axios
      .post("http://127.0.0.1:8000/api/ticket-details", ticketDetailsPayload)
      .then(() => {
        // Then update the ticket status to "In Process"
        return axios.post(
          `http://127.0.0.1:8000/api/tickets/update-status/${id}`,
          { status: 1 }
        );
      })
      .then(() => {
        setTicket((prev) => ({ ...prev, status: 1 }));
        alert("Ticket status updated to In Process.");
        navigate("/ExistingTicketTable");
      })
      .catch(() => {
        alert("Failed to update ticket details or status. Please try again.");
      });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  
  const getRoleName = (roleId) => {
    switch (roleId) {
      case 0:
        return "Admin";
      case 1:
        return "Support Engineer";
      case 2:
        return "User";
      default:
        return "Unknown";
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "20px", textAlign: "center" }}>
        Ticket Assignment Details
      </h1>

      <h3>Ticket Details</h3>
      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p>
          <strong>Ticket ID:</strong> {ticket?.id || "N/A"}
        </p>
        <p>
          <strong>Product ID:</strong> {ticket?.products_id || "N/A"}
        </p>
        <p>
          <strong>Client Name:</strong> {ticket?.client_name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {ticket?.email || "N/A"}
        </p>
        <p>
          <strong>Mobile:</strong> {ticket?.mobile || "N/A"}
        </p>
        <p>
          <strong>Query:</strong> {ticket?.query || "N/A"}
        </p>
        <div>
          <strong>Screenshots:</strong>
          {ticket?.screenshots?.length > 0 ? (
            ticket.screenshots.map((screenshot, index) => (
              <a
                key={index}
                href={`http://127.0.0.1:8000${screenshot}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginRight: "8px" }}
              >
                <img
                  src={`http://127.0.0.1:8000${screenshot}`}
                  alt={`screenshot ${index}`}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              </a>
            ))
          ) : (
            "No screenshots available"
          )}
        </div>
      </div>

      <h3>Add Comment and Actions</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          alignItems: "flex-start",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        />
        <input
          type="text"
          placeholder="Comment By"
          value={commentBy}
          disabled
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            gap: "10px",
          }}
        >
          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Submit
          </button>
        </div>
      </div>

      <h3>Ticket History</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Comment</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Comment By</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Date</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Role</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Assigned</th>
          </tr>
        </thead>
        <tbody>
          {ticketHistory.length > 0 ? (
            ticketHistory.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{item.comment}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{item.comment_by}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{formatDate(item.created_at)}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{getRoleName(item.comment_is_user)}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  {item.status === 1 ? "Assigned" : item.status === 2 ? "Closed" : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No History Available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignPage;
