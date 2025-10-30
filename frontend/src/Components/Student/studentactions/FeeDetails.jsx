import React, { useMemo, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../studentactions/StudentCss/fee.css";

const FeeDetails = () => {
  const [feeData, setFeeData] = useState({
    outstandingTotal: 500,
    feeBreakdown: [
      { id: 1, type: "Tuition", amount: 4500, status: "Paid" },
      { id: 2, type: "Library Fee", amount: 100, status: "Outstanding" },
      { id: 3, type: "Lab Fee", amount: 200, status: "Outstanding" },
    ],
  });
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingItemId, setProcessingItemId] = useState(null);

  // Calculate total, paid, and outstanding fees
  const feeSummary = useMemo(() => {
    const totalFees = feeData.feeBreakdown.reduce((sum, fee) => sum + fee.amount, 0);
    const paidFees = feeData.feeBreakdown
      .filter((fee) => fee.status === "Paid")
      .reduce((sum, fee) => sum + fee.amount, 0);
    const outstandingFees = totalFees - paidFees;
    const paidPercent = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;
    return { totalFees, paidFees, outstandingFees, paidPercent };
  }, [feeData]);

  const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`;

  // ✅ Pay for all outstanding fees
  const handlePayNow = async () => {
    try {
      setIsProcessingAll(true);
      const response = await fetch(
        "http://localhost:5000/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: feeSummary.outstandingFees,
            feeType: "Outstanding Fees",
          }),
        }
      );

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        toast.error("Failed to create Stripe session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error initiating payment. Check backend logs.");
    } finally {
      setIsProcessingAll(false);
    }
  };

  // ✅ Pay for single fee item
  const handlePaySingle = async (fee) => {
    try {
      setProcessingItemId(fee.id);
      const response = await fetch(
        "http://localhost:5000/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: fee.amount,
            feeType: fee.type,
          }),
        }
      );

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        toast.error("Failed to create Stripe session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error initiating single payment.");
    } finally {
      setProcessingItemId(null);
    }
  };

  const handlePaymentHistory = () => {
    toast.info("Showing payment history (to be implemented).");
  };

  return (
    <div className="fees-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="fees-header">
        <h2>Fee Details</h2>
        <p className="fees-subtitle">Track and manage your college fee payments in real time.</p>
      </div>

      <div className="fee-summary">
        <div className="fee-overview">
          <div className="fee-stat total-fees" aria-label="Total Fees">
            <span>Total Fees</span>
            <div className="fee-amount">{formatCurrency(feeSummary.totalFees)}</div>
          </div>
          <div className="fee-stat paid-fees" aria-label="Paid Fees">
            <span>Paid Fees</span>
            <div className="fee-amount">{formatCurrency(feeSummary.paidFees)}</div>
          </div>
          <div className="fee-stat outstanding-fees" aria-label="Outstanding Fees">
            <span>Outstanding Fees</span>
            <div className="fee-amount">{formatCurrency(feeSummary.outstandingFees)}</div>
          </div>
        </div>

        <div className="progress-card" aria-label="Payment progress">
          <div className="progress-header">
            <span>Payment Progress</span>
            <span className="progress-percent">{feeSummary.paidPercent}%</span>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={feeSummary.paidPercent}>
            <div className="progress-fill" style={{ width: `${feeSummary.paidPercent}%` }} />
          </div>
        </div>

        <div className="fee-breakdown">
          <div className="fee-breakdown-header">
            <h3>Fee Breakdown</h3>
            <span className="rows-count">{feeData.feeBreakdown.length} items</span>
          </div>
          {feeData.feeBreakdown.length === 0 ? (
            <div className="empty-state" role="status">
              <p>No fees to show right now.</p>
            </div>
          ) : (
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
                    <td>{formatCurrency(fee.amount)}</td>
                    <td>
                      <span className={`status-badge ${fee.status.toLowerCase()}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {fee.status === "Outstanding" && (
                        <button
                          className="btn-pay-single"
                          onClick={() => handlePaySingle(fee)}
                          disabled={processingItemId === fee.id || isProcessingAll}
                        >
                          {processingItemId === fee.id ? "Processing..." : "Pay"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="payment-actions">
          <button
            className="btn-primary"
            onClick={handlePayNow}
            disabled={feeSummary.outstandingFees === 0 || isProcessingAll}
          >
            {isProcessingAll ? "Processing..." : `Pay Now (${formatCurrency(feeSummary.outstandingFees)})`}
          </button>
          <button className="btn-secondary" onClick={handlePaymentHistory}>
            Payment History
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeDetails;
