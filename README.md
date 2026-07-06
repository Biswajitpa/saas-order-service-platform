<div align="center">

<!-- Animated typing banner -->
<a href="#">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=6366F1&center=true&vCenter=true&width=700&lines=SaaS+Order+%26+Service+Management+Platform;Real-Time+Orders+%E2%80%A2+Live+Delivery+Tracking;Role-Based+Access+%E2%80%A2+Modern+Full-Stack+SaaS" alt="Typing SVG" />
</a>

<br/>

![Made with React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br/>

<img src="https://raw.githubusercontent.com/your-username/your-repo/main/assets/dashboard.gif" width="85%" alt="Dashboard Preview" />

</div>

---

## 🌟 Overview

A **modern, full-stack SaaS platform** for managing orders and field services end-to-end — from creation and approval to live GPS-tracked delivery and archival. Built with a scalable architecture, role-based access control, and a beautifully animated UI, this system is designed to feel as good as it performs.

---

## ⚙️ Key Features

| Category | Highlights |
|---|---|
| ⚡ **Real-Time Engine** | Live order lifecycle updates across all connected clients |
| 👥 **Role-Based Access** | Admin, Manager, Staff, Client, and Delivery roles with scoped permissions |
| 📦 **Order Workflow** | `created → approved → assigned → in_progress → completed → archived` |
| 📍 **Live GPS Tracking** | Real-time delivery location + route visualization |
| 📁 **File Management** | Secure upload for PDFs, images, and attachments (Multer) |
| 📊 **Analytics Dashboard** | Interactive charts and insights powered by Recharts |
| 🔐 **Secure Auth** | JWT access + refresh token strategy |
| 🎨 **Modern UI/UX** | TailwindCSS, Framer Motion transitions, React Three Fiber 3D hero |
| 🧠 **Scalable API** | Clean, layered REST architecture (services / validators / utils) |

---

## 🧠 System Architecture

```mermaid
flowchart TD
    A["🖥️ Frontend<br/>React + Vite + TypeScript<br/>Tailwind • Framer Motion • R3F"] -->|REST API / JWT| B["🚀 Backend<br/>Node.js + Express + TypeScript"]
    B -->|SQL Queries| C[("🗄️ MySQL Database")]
    B -->|Live Location Events| D["📍 GPS & Delivery<br/>Tracking Module"]
    D -->|Real-time Updates| A
    B -->|File I/O| E["📁 Multer<br/>Upload Handler"]
    B -->|Schema Validation| F["✅ Zod<br/>Validators"]

    subgraph Roles["👥 Role-Based Access Layer"]
        R1["👑 Admin"]
        R2["🧑‍💼 Manager"]
        R3["🧑 Staff"]
        R4["🚚 Delivery"]
        R5["👤 Client"]
    end

    Roles --> A

    style A fill:#6366F1,color:#fff,stroke:#4338CA,stroke-width:2px
    style B fill:#22C55E,color:#fff,stroke:#15803D,stroke-width:2px
    style C fill:#F59E0B,color:#fff,stroke:#B45309,stroke-width:2px
    style D fill:#EC4899,color:#fff,stroke:#BE185D,stroke-width:2px
    style E fill:#0EA5E9,color:#fff,stroke:#0369A1,stroke-width:2px
    style F fill:#8B5CF6,color:#fff,stroke:#6D28D9,stroke-width:2px
```

### 🔄 Order Lifecycle Flow

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Approved: Admin Approval
    Approved --> Assigned: Assigned to Staff
    Assigned --> InProgress: Processing Starts
    InProgress --> Completed: Delivery Confirmed
    Completed --> Archived: Order Closed
    Archived --> [*]
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### 🎨 Frontend
- ⚛️ React (Vite + TypeScript)
- 💨 TailwindCSS
- 🎬 Framer Motion — smooth animations
- 🧭 React Router
- 📊 Recharts — data visualization
- 🌐 React Three Fiber — 3D landing hero

</td>
<td valign="top" width="50%">

### 🔧 Backend
- 🟢 Node.js + Express
- 🔷 TypeScript
- 🐬 MySQL (mysql2)
- 🔐 JWT Authentication
- 📤 Multer — file uploads
- ✅ Zod — schema validation

</td>
</tr>
</table>

---

## 📁 Project Structure

```
📦 saas-order-management
├── 📂 backend
│   ├── services/       # Business logic layer
│   ├── utils/          # Helper functions
│   └── validators/     # Zod schemas
└── 📂 frontend
    ├── context/         # Global state
    ├── utils/
    └── constants/
```

---

## 🌍 Live Features

- 📍 Real-time delivery GPS tracking
- 🗺️ Route visualization using maps
- 📊 Live analytics dashboard
- 🔔 Instant order status updates

---

## 🎬 UI Highlights

- ✨ Smooth page transitions
- 📊 Animated dashboard cards
- 🌐 3D landing hero (React Three Fiber)
- 📱 Responsive, mobile-first design

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| 👑 Admin | `admin@demo.com` | `Admin@123` |
| 🧑‍💼 Manager | `manager@demo.com` | `Manager@123` |
| 🧑 Staff | `staff@demo.com` | `Staff@123` |
| 🚚 Delivery | `delivery@demo.com` | `Delivery@123` |
| 👤 Client | `client@demo.com` | `Client@123` |

---

## 🚀 Roadmap / Future Enhancements

- 🤖 AI-based demand prediction
- 📱 Mobile app (React Native)
- 💬 Real-time chat between roles
- 🔔 Push notifications
- ☁️ Cloud deployment (AWS / Azure)

---

## 👨‍💻 Developer

<div align="center">

### 🧑‍💻 Biswajit Pattanaik
**Full Stack Developer — SaaS • IoT • Embedded Systems**

*The mind behind this platform's architecture, from database schema to pixel-perfect UI.*

Biswajit brings a rare combination of skills to the table — equally comfortable architecting scalable backend systems as he is fine-tuning microcontrollers on an ESP32. This project reflects that versatility: a production-grade SaaS platform engineered with clean code, thoughtful UX, and real-world reliability in mind. His attention to detail — from role-based security to buttery-smooth UI animations — is what turns a functional app into a genuinely delightful product.

`React` `Node.js` `MySQL` `ESP32` `IoT` `Cloud`

</div>

---

<div align="center">

## ⭐ Support This Project

If this project helped you or inspired your own build:

⭐ **Star** the repository &nbsp;•&nbsp; 🔁 **Share** with fellow developers &nbsp;•&nbsp; 🚀 **Contribute** improvements

<br/>

### 💡 Crafted & Maintained by **Biswajit Pattanaik**

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=18&pause=1500&color=22C55E&center=true&vCenter=true&width=500&lines=Built+with+%E2%9D%A4%EF%B8%8F+by+Biswajit+Pattanaik;Full+Stack+%7C+SaaS+%7C+IoT+%7C+Embedded+Systems" alt="Footer Typing SVG" />

</div>
