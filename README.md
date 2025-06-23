# 📬 Post Scheduler API

A Node.js/Express backend that lets users create, schedule, and automatically publish posts at specific times.

---

## 🚀 Features

|                             |                                                               |
| --------------------------- | ------------------------------------------------------------- |
| 🔐 **Authentication**       | Secure sign-up and login with JWT                             |
| 📝 **Post Management**      | Create, update, delete, and schedule posts                    |
| ⏱️ **Automatic Publishing** | Agenda publishes posts at their scheduled time                |
| 📊 **Post Status**          | Check whether a post is _scheduled_, _published_, or _failed_ |
| 👑 **Admin Access**         | Admins can view and manage every post                         |
| 📧 **Email Notifications**  | Users receive an email when their post is published           |
| ♻️ **Recurring Posts**      | Daily, weekly, and other recurring schedules supported        |
| 📉 **Rate Limiting**        | Protects the API from abuse                                   |
| 🛡️ **Error Handling**       | Consistent, helpful error responses                           |
| 📚 **API Docs**             | Swagger UI available at `/api-docs`                           |

---

## ⚙️ Setup

1. **Clone the repo**

```bash
 git clone https://github.com/birhanudejen/post-scheduler-api
 cd post-scheduler-api
```

2. **Install dependencies**

```bash
npm install

```

3. **Configure environment variables**
   PORT=5000

# Local MongoDB

MONGO_URI=mongodb://localhost:27017 or your mongodb atlas URI

# JWT secrets

JWT_SECRET_SIGNIN=your_signin_secret
JWT_SECRET_VERIFY=your_verify_secret

# Password hashing strength

BCRYPT_SALT_ROUNDS=12

# Email credentials

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

```bash
npm run dev
```

4. Explore the API

Visit [`http://localhost:5000/api-docs`](http://localhost:5000/api-docs) to explore and test endpoints using Swagger UI.
🧠 Tech Stack

- **Database**: MongoDB
- **Scheduler**: Agenda
- **Authentication**: JWT
- **Email Service**: Nodemailer
- **Docs**: Swagger / OpenAPI
- **Security**: Helmet, CORS, express-rate-limit

## 📄 License

All rights reserved. This project and its source code are the intellectual property of the author and may not be used, copied, modified, or distributed without explicit permission.
