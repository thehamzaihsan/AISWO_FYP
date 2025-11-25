# AISWO System Architecture Diagrams

## Data Flow Architecture
```mermaid
graph TB
    A[IoT Hardware] -->|Real-time Data| B[Firebase Realtime DB]
    B -->|bin1 Data| C[Backend Server]
    C -->|Weighted Data| D[Firestore]
    D -->|Bin Configs| E[Frontend Dashboard]
    C -->|API Response| E
    E -->|User Actions| F[Admin Dashboard]
    F -->|CRUD Operations| C
    C -->|Email Alerts| G[Operators]
    C -->|Weather Data| H[OpenWeather API]
    H -->|Weather Alerts| G
```

## Alert System Workflow
```mermaid
flowchart TD
    A[Bin Fill Level Check] -->|>80%| B{Alert Already Sent?}
    B -->|No| C[Get Operator Info]
    B -->|Yes| D[Skip Alert]
    C --> E[Send Email to Operator]
    E --> F[Send Backup Email to Admin]
    F --> G[Send Push Notification]
    G --> H[Mark as Notified]
    H --> I[Log Alert Action]
    
    J[Weather Check] -->|Rain Detected| K[Get All Operators]
    K --> L[Send Weather Alert]
    L --> M[Log Weather Alert]
```

## Weighted Data Generation Process
```mermaid
graph LR
    A[Real Hardware Data<br/>bin1] --> B[Weight Factor<br/>0.3, 0.5, 0.7, etc.]
    B --> C[Apply Weight<br/>weightKg × factor]
    C --> D[Add Variation<br/>±10% random]
    D --> E[Generate Status<br/>Normal/Warning/Full]
    E --> F[Create Bin Data<br/>bin2, bin3, bin4...]
    F --> G[Store in Firestore]
    G --> H[Return to Frontend]
```

## User Management Workflow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant FS as Firestore
    participant E as Email Service
    
    U->>F: Add New Operator
    F->>B: POST /operators
    B->>FS: Store Operator Data
    FS-->>B: Confirmation
    B-->>F: Success Response
    F-->>U: Operator Added
    
    U->>F: Assign Bin to Operator
    F->>B: PUT /bins/:id
    B->>FS: Update Bin Assignment
    FS-->>B: Confirmation
    B-->>F: Success Response
    F-->>U: Assignment Complete
    
    Note over B,E: When Bin Reaches 80% Fill
    B->>E: Send Alert Email
    E-->>B: Email Sent
    B->>FS: Log Alert Action
```

## System Components Overview
```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App]
        B[Admin Dashboard]
        C[Bin Dashboard]
        D[Weather Forecast]
    end
    
    subgraph "Backend Layer"
        E[Node.js Server]
        F[Express API]
        G[Email Service]
        H[Weather Service]
    end
    
    subgraph "Database Layer"
        I[Firebase Realtime DB]
        J[Firestore]
        K[FCM Service]
    end
    
    subgraph "External Services"
        L[OpenWeather API]
        M[Gmail SMTP]
        N[Firebase Services]
    end
    
    subgraph "Hardware Layer"
        O[Arduino/ESP32]
        P[Weight Sensors]
        Q[Ultrasonic Sensors]
    end
    
    A --> E
    B --> F
    C --> F
    D --> H
    E --> I
    F --> J
    G --> M
    H --> L
    O --> I
    P --> O
    Q --> O
```

## Email Notification Flow
```mermaid
sequenceDiagram
    participant H as Hardware
    participant R as Realtime DB
    participant S as Server
    participant FS as Firestore
    participant E as Email Service
    participant O as Operator
    
    H->>R: Send Bin Data
    R->>S: Fetch Data
    S->>FS: Get Operator Info
    FS-->>S: Operator Details
    
    alt Bin Fill > 80%
        S->>E: Send Alert Email
        E->>O: Deliver Email
        S->>FS: Log Alert
    else Weather Alert
        S->>E: Send Weather Alert
        E->>O: Deliver Weather Email
    end
```

## Data Processing Pipeline
```mermaid
flowchart LR
    A[Raw Sensor Data] --> B[Data Validation]
    B --> C[Apply Weight Factors]
    C --> D[Add Random Variation]
    D --> E[Calculate Fill Percentage]
    E --> F[Determine Status]
    F --> G[Store in Database]
    G --> H[Trigger Alerts]
    H --> I[Update Frontend]
```
