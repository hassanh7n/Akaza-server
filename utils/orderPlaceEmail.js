const orderPlacedEmail = (name, order) => {
    return `
    <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #eee">
      
      <div style="background:#0f172a;color:#ffffff;padding:20px;text-align:center">
        <h2 style="margin:0">Order Confirmed 🎉</h2>
      </div>
  
      <div style="padding:20px;color:#333">
        <p>Hi <strong>${name}</strong>,</p>
  
        <p>Your order has been placed successfully. Here are the details:</p>
  
        <table style="width:100%;border-collapse:collapse;margin:15px 0">
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">Order ID</td>
            <td style="padding:8px;border-bottom:1px solid #eee"><strong>${order._id}</strong></td>
          </tr>
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">Subtotal</td>
            <td style="padding:8px;border-bottom:1px solid #eee">$${order.subtotal}</td>
          </tr>
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">Tax</td>
            <td style="padding:8px;border-bottom:1px solid #eee">$${order.tax}</td>
          </tr>
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">Shipping</td>
            <td style="padding:8px;border-bottom:1px solid #eee">$${order.shippingFee}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold">Total</td>
            <td style="padding:8px;font-weight:bold">$${order.total}</td>
          </tr>
        </table>
  
        <p style="margin-top:20px">
          📦 Your order is now being processed.  
          You’ll receive another email once it’s shipped.
        </p>
  
        <p style="margin-top:30px">
          Thanks for shopping with us ❤️  
          <br />
          <strong>Shaheen Store</strong>
        </p>
      </div>
  
      <div style="background:#f8fafc;padding:15px;text-align:center;font-size:12px;color:#777">
        © ${new Date().getFullYear()} Shaheen Store. All rights reserved.
      </div>
  
    </div>
    `;
  };
  
  module.exports = orderPlacedEmail;
  