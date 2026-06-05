import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { User } from "../config/db.config.js";

export function setupAuthSockets(io) {
  io.on("connection", (socket) => {
    // console.log("A user connected via WebSocket:", socket.id);

    socket.on("forgot_password", async (data) => {
      try {
        const { email } = data || {};
        if (!email) {
          return socket.emit("forgot_password_result", {
            success: false,
            message: "Email is required.",
          });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
          // Always return success to avoid leaking whether an email exists
          return socket.emit("forgot_password_result", {
            success: true,
            message: "If the email exists, a reset token was issued.",
          });
        }

        const jwtSecret = process.env.JWT_SECRET || "dev_secret";
        const token = jwt.sign(
          { id: user.id_utilizador, purpose: "reset" },
          jwtSecret,
          { expiresIn: "1h" },
        );

        // --- NODEMAILER INTEGRATION ---
        // Create an ethereal test account on the fly
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });

        // Send mail with defined transport object
        const info = await transporter.sendMail({
          from: '"Modo Team" <noreply@modo.app>',
          to: email,
          subject: "Password Reset Request",
          text: `You requested a password reset. Your reset token is: ${token}\n\nEnter this token in the app to reset your password.`,
          html: `<p>You requested a password reset.</p><p>Your reset token is: <strong>${token}</strong></p><p>Enter this token in the app to reset your password.</p>`,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // ------------------------------

        // Emit the token to the client (for development purposes)
        socket.emit("forgot_password_result", {
          success: true,
          message: "An email has been sent with instructions to reset your password.",
          token, // returning token for development purposes
        });
      } catch (err) {
        socket.emit("forgot_password_result", {
          success: false,
          message: "An unexpected error occurred.",
        });
      }
    });

    socket.on("reset_password", async (data) => {
      try {
        const { token, password } = data || {};
        if (!token || !password) {
          return socket.emit("reset_password_result", {
            success: false,
            message: "Token and new password are required.",
          });
        }

        const jwtSecret = process.env.JWT_SECRET || "dev_secret";
        let payload;
        try {
          payload = jwt.verify(token, jwtSecret);
        } catch (err) {
          return socket.emit("reset_password_result", {
            success: false,
            message: "Invalid or expired token.",
          });
        }

        if (payload.purpose !== "reset") {
          return socket.emit("reset_password_result", {
            success: false,
            message: "Invalid token purpose.",
          });
        }

        const user = await User.findByPk(payload.id);
        if (!user) {
          return socket.emit("reset_password_result", {
            success: false,
            message: "User not found.",
          });
        }

        const hashed = await bcrypt.hash(password, 10);
        await user.update({ hashed_password: hashed });

        socket.emit("reset_password_result", {
          success: true,
          message: "Password reset successfully. You can now log in.",
        });
      } catch (err) {
        socket.emit("reset_password_result", {
          success: false,
          message: "An unexpected error occurred.",
        });
      }
    });

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });
}
