import React, { useState } from "react";
import "../studentactions/StudentCss/fee.css";

const FeeDetails = () => {
  // Sample initial state with fee data
  const [feeData, setFeeData] = useState({
    outstandingTotal: 500,
    feeBreakdown: [
      { id: 1, type: "Tuition", amount: 4500, status: "Paid" },
      { id: 2, type: "Library Fee", amount: 100, status: "Outstanding" },
      { id: 3, type: "Lab Fee", amount: 200, status: "Outstanding" }
    ]
  });

  // Calculate total fees and paid/outstanding amounts
  const calculateFeeSummary = () => {
    const totalFees = feeData.feeBreakdown.reduce((sum, fee) => sum + fee.amount, 0);
    const paidFees = feeData.feeBreakdown
      .filter(fee => fee.status === "Paid")
      .reduce((sum, fee) => sum + fee.amount, 0);
    
    return {
      totalFees,
      paidFees,
      outstandingFees: totalFees - paidFees
    };
  };

  const feeSummary = calculateFeeSummary();

  // Handler for pay now button
  const handlePayNow = () => {
    // Implement payment logic or redirect to payment page
    alert("Redirecting to payment gateway...");
  };

  // Handler for payment history
  const handlePaymentHistory = () => {
    // Implement payment history view
    alert("Showing payment history...");
  };

  return (
    <div className="fees-container">
      <h2>Fee Details</h2>
      <div className="fee-summary">
        <div className="fee-overview">
          <div className="fee-stat total-fees">
            <span>Total Fees</span>
            <div className="fee-amount">${feeSummary.totalFees}</div>
          </div>
          <div className="fee-stat paid-fees">
            <span>Paid Fees</span>
            <div className="fee-amount">${feeSummary.paidFees}</div>
          </div>
          <div className="fee-stat outstanding-fees">
            <span>Outstanding Fees</span>
            <div className="fee-amount">${feeSummary.outstandingFees}</div>
          </div>
        </div>
        
        <div className="fee-breakdown">
          <h3>Fee Breakdown</h3>
          <table className="fees-table">
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feeData.feeBreakdown.map((fee) => (
                <tr key={fee.id} className={fee.status.toLowerCase()}>
                  <td>{fee.type}</td>
                  <td>${fee.amount}</td>
                  <td>
                    <span className={`status-badge ${fee.status.toLowerCase()}`}>
                      {fee.status}
                    </span>
                  </td>
                  <td>
                    {fee.status === "Outstanding" && (
                      <button 
                        className="btn-pay-single"
                        onClick={() => alert(`Paying ${fee.type} fee...`)}
                      >
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="payment-actions">
          <button 
            className="btn-primary" 
            onClick={handlePayNow}
            disabled={feeSummary.outstandingFees === 0}
          >
            Pay Now
          </button>
          <button 
            className="btn-secondary" 
            onClick={handlePaymentHistory}
          >
            Payment History
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeDetails;