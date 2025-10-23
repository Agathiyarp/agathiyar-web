import React from "react";
import MenuBar from "../menumain/menubar";
import Footer from '../footer/Footer';
import ScanImage from "../../images/scan.png";
import './donate.css';

const Donate = () => {

  const handlePayment = async () => {
    const res = await fetch("https://agathiyarpyramid.org/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const order = await res.json();

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // Replace with your Test Key ID
      amount: order.amount,
      currency: order.currency,
      name: "Test Store",
      description: "Test Transaction",
      order_id: order.id,
      handler: function (response) {
        alert("Payment ID: " + response.razorpay_payment_id);
        alert("Order ID: " + response.razorpay_order_id);
        alert("Signature: " + response.razorpay_signature);
      },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        paylater: true, // ✅ enables PayLater option
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const spiritualPoints = [
    "When you do your Dharma, your own Dharma protects you",
    "Kindly do your Dharma to support Anna Prasadam & Maintenance of this Mouna Dhyana Ashram",
  ];

  return (
    <div className="outer-containers">
      <MenuBar />
      <div className="grid-containers">
        <div className="text-containers-donate">
          <h2>“Dharmo Rakshathi Rakshitaha”</h2>
          <ul>
            {spiritualPoints.map((point, index) => (
              <li className="spirtual-list" key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid-container">
        <div className="donate-image-container">
          <div className="photo-frame">
            <img className="image" src={ScanImage} alt="ScanImage" />
          </div>
        </div>
        <div className="donate-container">
          <h2 >Donate</h2>

          <h4 >Pay Via QR code / Trust Account Details</h4>
          <p >
            The Chennai Pyramid Spiritual Trust
            <br />
            Bank of Baroda, SB ACC.No: 69760100000309
            <br />
            IFSC Code: BARB0VJRAPE (5th digit is zero)
          </p>
        </div>
      </div>
      <button
        onClick={handlePayment}
        className="pay-button"
      >
        Make Payment
      </button>

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default Donate;