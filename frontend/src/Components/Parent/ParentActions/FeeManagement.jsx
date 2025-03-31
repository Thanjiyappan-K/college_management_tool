import React from "react";
import "../ParentDashboard.css";

const FeeManagement = ({ childData }) => (
    <div className="fees-container">
      <h2>Fee Management for {childData.name}</h2>
      
      <div className="fee-summary">
        <div className="fee-card total-dues">
          <h3>Total Pending Dues</h3>
          <p className="fee-amount">${childData.stats.pendingFees}</p>
        </div>
        
        <div className="fee-breakdown">
          <h3>Fee Breakdown</h3>
          <table className="fee-table">
            <thead>
              <tr>
                <th>Fee Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tuition Fees</td>
                <td>$1500</td>
                <td><span className="status-pending">Pending</span></td>
              </tr>
              <tr>
                <td>Books & Materials</td>
                <td>$500</td>
                <td><span className="status-paid">Paid</span></td>
              </tr>
              <tr>
                <td>Miscellaneous Fees</td>
                <td>$500</td>
                <td><span className="status-pending">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="payment-actions">
        <h3>Payment Options</h3>
        <div className="payment-methods">
          <button className="payment-btn">Online Payment</button>
          <button className="payment-btn">Bank Transfer</button>
          <button className="payment-btn">Payment Plan</button>
        </div>
      </div>
      
      <div className="payment-history">
        <h3>Payment History</h3>
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jan 15, 2025</td>
              <td>Books & Materials</td>
              <td>$500</td>
              <td><span className="status-completed">Completed</span></td>
            </tr>
            <tr>
              <td>Feb 20, 2025</td>
              <td>Partial Tuition Payment</td>
              <td>$750</td>
              <td><span className="status-completed">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
  export default FeeManagement;