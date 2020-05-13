# PayPay Full Stack Developer Challenge
> Repository for PayPay Coding Challenge

Table of contents
-----
- [Setup](#setup)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
- [Technologies](#technologies)
- [Assumptions](#assumptions)

## Setup

### Dependencies
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/en/)
- [MySQL](https://yarnpkg.com/en/)

### Installation

1. Clone the project and `cd` into the project directory
    ```sh
    git clone git@github.com:jvmsangkal/FullStackEngineerChallenge.git
    cd FullStackEngineerChallenge
    ```

2. Install backend dependencies
    ```sh
    cd backend
    yarn install
    ```

3. Create `.env` file from `.dist.env`
    ```sh
    cp .dist.env .env
    ```
    Edit the `.env` file to your needs

4. Import `.sql` files in `backend/data`. `schema.sql` contains the create table statements and `seed.sql` contains some test data for this project. Connect to mysql and input the following queries.
    ```sql
    CREATE DATABASE `paypay_challenge`;
    source data/schema.sql;
    source data/seed.sql;
    ```

5. Run dev server
    ```sh
    yarn dev
    ```

6. Open a separate terminal session and cd into the frontend directory then install dependencies.
    ```sh
    cd frontend
    yarn install
    ```

7. Create `.env` file from `.dist.env`
    ```sh
    cp .dist.env .env
    ```
    Edit the `.env` file to your needs

8. Run dev server
    ```sh
    yarn dev
    ```

9. Open the app in your browser and try logging in using the following users to test out the app:
  ```
  Admin:
      email: admin@admin.com
      password: adminadmin

  Employees:
      email: naruto@konoha.com
      password: konohanumberone

      email: sasuke@konoha.com
      password: konohanumberone
  ```

10. You can also test the API by importing `backend/postman_collection.json` to PostMan App

## Technologies
- ExpressJS
    - Minimal and unopinionated web framework for NodeJS
    - Chose this because this is the framework I am most familiar with so I can get things done quickly
    - Has wide variety of libraries like `passportJS` which I used for authentication

- NuxtJS
    - Serverside Framework for VueJS
    - I use VueJS whenever I need to build a prototype quickly since it's a very easy framework to use
    - This framework has everything baked-in and provides plugins that solves common problems which allowed me code the frontend faster. Examples used in this project are:
      ```
      '@nuxtjs/axios',
      '@nuxtjs/pwa',
      '@nuxtjs/dotenv',
      '@nuxtjs/auth'
      ```
- MySQL
    - I chose MySQL as my database because I am familiar with it the most
    - Preferred this over MongoDB because it's easier to join tables and querying using SQL is just more intuitive.

- ESLint & Prettier
    - Linters and Code formatter
    - I integrated this into the project so that it will be easy for others to read the code and I will be more productive since I don't have to think about code formatting

- Vuetify
    - Component Library for VueJS that implements Material Design
    - I decided to use a component library to minimize writing of custom CSS code and also to implement features faster since most components are already implemented in the library.

## Assumptions

- Performance Reviews are consist of categories in which the users will be rated numerically with a brief explanation.
  eg.
  ```
  Possesses skills and knowledge to perform the job competently
  ```

- Users are assigned to review other users with a corresponding performance review.

- Users are allowed to submit multiple feedbacks for a performance review.

- Deleting a user won't delete previously submitted feedbacks by that user

- Deleting a performance review deletes all the feedbacks associated with it
