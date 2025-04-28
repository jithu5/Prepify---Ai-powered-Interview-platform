export const EMAIL_VERIFY_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <style>
    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background-color: #ffffff;
      padding: 0;
      margin: 0;
      color: #111111;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 40px;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      background-color: #ffffff;
    }

    h1 {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 24px;
    }

    p {
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
    }

    .otp {
      display: inline-block;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 4px;
      padding: 12px 20px;
      background-color: #f2f2f2;
      border: 1px solid #000000;
      color: #000000;
      text-align: center;
      margin: 20px 0;
      border-radius: 4px;
    }

    .footer {
      margin-top: 40px;
      font-size: 13px;
      color: #555555;
      text-align: center;
      border-top: 1px solid #eeeeee;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Verification</h1>
    <p>Hello,</p>
    <p>Thank you for signing up for our interview system. Please use the following One-Time Password (OTP) to verify your account:</p>

    <div class="otp">{{otp}}</div>

    <p>This OTP is valid for only 5 minutes.</p>
    <p>If you did not request this email, you can safely ignore it.</p>

    <div class="footer">
      <p>Need help? Contact our support team anytime.</p>
      <p>— The Interview System Team</p>
    </div>
  </div>
</body>
</html>`;
