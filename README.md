<p align="center">
  <img src="/images/mainAppLogo.png" />
</p>

<h1 align="center"><b>Open Hand</b></h1>

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Firebase Web](https://img.shields.io/badge/Firebase_Web_SDK-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Jetpack Compose](https://img.shields.io/badge/Jetpack_Compose-4285F4?style=for-the-badge&logo=jetpackcompose&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)
![CameraX](https://img.shields.io/badge/CameraX-4285F4?style=for-the-badge&logo=android&logoColor=white)
![DataStore](https://img.shields.io/badge/DataStore-4285F4?style=for-the-badge&logo=android&logoColor=white)
![Google Play Services](https://img.shields.io/badge/Google_Play_Services-4285F4?style=for-the-badge&logo=googleplay&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-4B8BBE?style=for-the-badge&logo=python&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-FF6F00?style=for-the-badge&logo=google&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-010101?style=for-the-badge&logo=websocket&logoColor=white)
![Firebase Authentication](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firebase Storage](https://img.shields.io/badge/Firebase_Storage-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Android Emulator](https://img.shields.io/badge/Android_Emulator-3DDC84?style=for-the-badge&logo=android&logoColor=white)


</div>


<p align="center">
  A full-stack web and mobile machine learning app for learning ASL!
</p>


<div align="center">

![GitHub repo size](https://img.shields.io/github/repo-size/SandalCodez/CSC490_Capstone)
![GitHub stars](https://img.shields.io/github/stars/SandalCodez/CSC490_Capstone)
![GitHub issues](https://img.shields.io/github/issues/SandalCodez/CSC490_Capstone)
![GitHub pull requests](https://img.shields.io/github/issues-pr/SandalCodez/CSC490_Capstone)
![GitHub last commit](https://img.shields.io/github/last-commit/SandalCodez/CSC490_Capstone)

![GitHub top language](https://img.shields.io/github/languages/top/SandalCodez/CSC490_Capstone)
![Languages count](https://img.shields.io/github/languages/count/SandalCodez/CSC490_Capstone)
</div>


## 📚 Table of Contents
- [💬 Introduction](#-introduction)
- [🚀 Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [🧠 How it Works](#-how-it-works)
- [🛠️ Installation](#-installation)
- [🧪 Usage](#-usage)
- [📄 Documentation](#documentation)
- [👥 Contributors](#-contributors)
- [🙏 Acknowledgments](#-acknowledgments)

## 💬 Introduction
### Team #1 For a Reason
 Our team has developed an AI powered sign language learning application targeted towards new parents to learn 
 sign language and then teach it to their newborn/ young children. We have both a web app and android app for 
 users to use at their convenience.

[Link to Mobile App](https://github.com/d-jason32/OpenHandMobile)

## 🚀 Features
### Web and  Android App:
- User Accounts and Authentication
- On-boarding Screen, Home Page, and Splashscreen
- Social Sign on
- Learning lessons for A-Z, 0-9, and 20 phrases with GIFS
- Learning Roadmap
- XP Counter
- Leaderboard and Friends Page with statistics features
- Dashboard with User Progress
- Profile Page and Settings Page
- Email notifications
- User sessions and User Tokens
- Sign language grading with the model
- Animated Mascot Images
### Machine learning model:
- Real-time ASL prediction
- RandomForestClassifier 
- FastAPI Server
- MediaPipe Hands 21 landmarks
- of sign and probability scores
- Trained on thousands of images

## 🧰 Tech Stack
### Android Platform
- Android 13  
- Jetpack Compose  
- CameraX  
- DataStore  
- Firebase  
- Google Play Services  
- Gradle  
- Kotlin JVM  

### Web Application
- React  
- Vite  
- TailwindCSS  
- Firebase Web SDK  
- MediaPipe Hands  

### Backend + AI/ML
- FastAPI  
- Uvicorn  
- MediaPipe  
- OpenCV  
- Scikit-Learn  
- NumPy  
- WebSockets  

### Firebase Services
- Firebase Authentication  
- Firebase Firestore  
- Firebase Storage  

### Simulator
- Android Phone Emulator  

## 🧠 How it Works
Our sign language learning app combines real-time computer vision, machine learning, and interactive UI design to deliver an engaging ASL learning experience.

1. Real-Time Hand Tracking

We use MediaPipe Hands to detect and track the user’s hand through the device’s camera. MediaPipe identifies 21 key landmarks per hand, giving us precise positional data even when the hand is partially occluded or moving quickly.

2. Feature Extraction

Each frame’s hand landmarks are converted into a set of normalized numerical features. This ensures consistency across different hand sizes, lighting conditions, and camera distances.

3. Machine Learning Prediction

These features are passed into our custom-trained RandomForest classifier (model_rf_336.p).
The model outputs a predicted ASL letter based on patterns learned from thousands of training samples. To increase accuracy:

- We apply prediction smoothing over multiple frames
- We use motion gating to prevent unstable or shaky predictions
- We stabilize labels before displaying them to the user

4. Interactive Feedback & Learning Flow

Once the model confidently identifies a sign, the app:

- Displays the predicted letter
- Updates the user’s progress
- Triggers animations, congratulatory messages, or lesson advancement
- Powers mini-games designed for parents and children to learn ASL together

5. Works on Mobile & Web

Our system is implemented in both:
- Android (Jetpack Compose)

- Web platform (React + Firebase) using webcam-based inference

Both share the same model and preprocessing pipeline for consistent predictions across platforms.


## 🛠️ Installation
https://docs.google.com/document/d/1xfgEFhFzZLrOjIw7AyEoSoWsP6DjpodKba4hi3C0yEI/edit?tab=t.0

### Large Files (Models)
This repository uses [Git LFS](https://git-lfs.github.com/) to store large model files.
If you clone the repo and see `.p` pointer files instead of real models, run:

```bash
-git lfs install
-git lfs pull

```

## 🧪 Usage
Our application aims to teach parents the basics of sign language so they can pass the knowledge on to their children for better communication. We want to have documentation for users to read and become familiar with the signs as well as images and videos for them to follow along while practicing. In addition, with access to their camera they can perform the signs on camera and get live feedback from an AI model that will let them know if they are performing the sign correctly. We want to start with the alphabet A-Z and number 0-9, then continue to some of the most popular phrases and phrases that will be helpful for a baby such as hunger or bathroom. We want to track a user’s progress and display it to encourage them to return to learning more. We want to store user progress and information using firebase, have a clean UI using React/JS and use Python for our main AI algorithm and camera functionality.

## 📄Documentation
[View the Documentation](https://docs.google.com/document/d/14E25L-tC8TuxkzJVle5XWyBvrpcl_DLbF54X33djDDk/edit?usp=sharing)

## 👥 Contributors

| [<img src="https://github.com/SandalCodez.png" width="80px;"><br><sub>@Esteban Sandoval</sub>](https://github.com/SandalCodez) | [<img src="https://github.com/JderenthalCS.png" width="80px;"><br><sub>@Justin Derenthal</sub>](https://github.com/JderenthalCS) | [<img src="https://github.com/kkconaty23.png" width="80px;"><br><sub>@Kevin Conaty</sub>](https://github.com/kkconaty23) | [<img src="https://github.com/Nadir-Kutluozen.png" width="80px;"><br><sub>@Nadir Kutluozen</sub>](https://github.com/Nadir-Kutluozen) | [<img src="https://github.com/DerrickSperling.png" width="80px;"><br><sub>@Derrick Sperling Jr</sub>](https://github.com/DerrickSperling) | [<img src="https://github.com/d-jason32.png" width="80px;"><br><sub>@Jason Devaraj</sub>](https://github.com/d-jason32) |
|:------------------------------------------------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------:|:-----------------------------------------------------------------------------------------------------------------------:|

## 🙏 Acknowledgments
- Special thanks to **Dr. Lorraine Greenwald** for her guidance and support throughout the development of this project.
